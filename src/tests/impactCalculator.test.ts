import { describe, it, expect } from 'vitest';
import {
  calculateDailyInhaledDose,
  calculateCommuteCo2Delta,
  generateDailyRoutines,
  computeOverallImpact,
} from '../services/impactCalculator';
import { UserFamilyProfile } from '../types/aqi';

describe('Scientific Impact Calculator', () => {
  const dummyProfile: UserFamilyProfile = {
    name: 'Test Family',
    cityId: 'delhi',
    vulnerabilities: ['Infant/Child', 'Respiratory/Asthma'],
    dailyCommuteMode: 'Private Car',
    commuteDistanceKm: 20,
    hasAirPurifier: true,
    homeType: 'Apartment',
    childrenCount: 2,
    elderlyCount: 1,
  };

  it('calculates estimated inhaled PM2.5 mass with EPA minute ventilation and N95 assumptions', () => {
    // 200 µg/m³ * 0.60 m³/hr * 1 hr * 1.0 (unmasked) = 120 µg
    const unmaskedMass = calculateDailyInhaledDose(200, 1.0, false, false);
    // 200 µg/m³ * 0.60 m³/hr * 1 hr * 0.05 (95% fitted N95) = 6 µg
    const maskedMass = calculateDailyInhaledDose(200, 1.0, false, true);

    expect(unmaskedMass).toBe(120);
    expect(maskedMass).toBeCloseTo(6, 1);
    expect(maskedMass).toBeLessThan(unmaskedMass);
  });

  it('uses higher ventilation rates for aerobic exertion (2.10 m³/hr vs 0.60 m³/hr)', () => {
    const rest = calculateDailyInhaledDose(150, 1.0, false, false);
    const exertion = calculateDailyInhaledDose(150, 1.0, true, false);

    expect(rest).toBe(90); // 150 * 0.60 * 1 = 90 µg
    expect(exertion).toBe(315); // 150 * 2.10 * 1 = 315 µg
    expect(exertion / rest).toBeCloseTo(2.1 / 0.6, 2);
  });

  it('handles zero, negative, or null PM2.5 concentrations safely', () => {
    expect(calculateDailyInhaledDose(0, 1.0, false, false)).toBe(0);
    expect(calculateDailyInhaledDose(-50, 1.0, false, false)).toBe(0);
    expect(calculateDailyInhaledDose(null, 1.0, false, false)).toBe(0);
    expect(calculateDailyInhaledDose(100, 0, false, false)).toBe(0);
  });

  it('calculates round-trip commute CO2 delta against electrified public transit', () => {
    // Private Car (0.192) vs Metro (0.038) over 20km one-way (40km round-trip)
    // 40 * (0.192 - 0.038) = 6.16 kg CO2
    const carDelta = calculateCommuteCo2Delta('Private Car', 20);
    expect(carDelta.savedCo2Kg).toBeCloseTo(6.16, 2);
    expect(carDelta.roundTripKm).toBe(40);

    // Carpool (0.075) vs Metro (0.038) over 20km one-way (40km round-trip)
    // 40 * (0.075 - 0.038) = 1.48 kg CO2
    const carpoolDelta = calculateCommuteCo2Delta('Carpool', 20);
    expect(carpoolDelta.savedCo2Kg).toBeCloseTo(1.48, 2);
  });

  it('claims 0 kg CO2 delta when user already walks, cycles, or takes public transit', () => {
    const walkDelta = calculateCommuteCo2Delta('Active (Bicycle/Walk)', 15);
    const metroDelta = calculateCommuteCo2Delta('Metro/Bus', 15);

    expect(walkDelta.savedCo2Kg).toBe(0);
    expect(metroDelta.savedCo2Kg).toBe(0);
  });

  it('generates defensible routines with assumptions clearly documented', () => {
    const routines = generateDailyRoutines(dummyProfile, 280, 210);
    expect(routines.length).toBe(4);

    routines.forEach((r) => {
      expect(r.title).toBeDefined();
      expect(r.assumptions).toBeDefined();
      expect(r.assumptions.length).toBeGreaterThan(10);
      expect(r.emissionSavedKgCo2).toBeGreaterThanOrEqual(0);
      expect(r.exposureAvoidedPm25Ug).toBeGreaterThanOrEqual(0);
    });
  });

  it('does not report unmeasured indoor exposure or heating savings as invented values', () => {
    const routines = generateDailyRoutines(dummyProfile, 280, null);
    const byId = Object.fromEntries(routines.map((routine) => [routine.id, routine]));

    expect(byId['routine-morning-exercise'].exposureAvoidedPm25Ug).toBe(0);
    expect(byId['routine-cooking'].exposureAvoidedPm25Ug).toBe(0);
    expect(byId['routine-heating'].exposureAvoidedPm25Ug).toBe(0);
    expect(byId['routine-heating'].emissionSavedKgCo2).toBe(0);
    expect(byId['routine-cooking'].assumptions).toContain('not measured');
    expect(byId['routine-heating'].assumptions).toContain('not measured');

    const measuredAmbientRoutines = generateDailyRoutines(dummyProfile, 280, 210);
    expect(
      measuredAmbientRoutines.find((r) => r.id === 'routine-cooking')?.exposureAvoidedPm25Ug
    ).toBe(0);
    expect(
      measuredAmbientRoutines.find((r) => r.id === 'routine-heating')?.emissionSavedKgCo2
    ).toBe(0);
  });

  it('does NOT apply artificial purifier multipliers or family-size multipliers', () => {
    const routines = generateDailyRoutines(dummyProfile, 250, 180);
    routines[0].isAdopted = true;
    routines[1].isAdopted = true;

    const singleProfile: UserFamilyProfile = {
      ...dummyProfile,
      hasAirPurifier: false,
      childrenCount: 0,
      elderlyCount: 0,
    };

    const familyProfileWithPurifier: UserFamilyProfile = {
      ...dummyProfile,
      hasAirPurifier: true,
      childrenCount: 3,
      elderlyCount: 2,
    };

    const singleMetrics = computeOverallImpact(routines, singleProfile);
    const familyMetrics = computeOverallImpact(routines, familyProfileWithPurifier);

    // The calculated per-routine inhaled mass saved and commute CO2 delta
    // must NOT be multiplied by an arbitrary purifier factor (like 1.4) or family member count!
    expect(familyMetrics.estimatedInhaledMassSavedUg).toBe(
      singleMetrics.estimatedInhaledMassSavedUg
    );
    expect(familyMetrics.transportCo2SavedKg).toBe(singleMetrics.transportCo2SavedKg);
    expect(familyMetrics.adoptedRoutinesCount).toBe(2);
    expect(familyMetrics.calculationAssumptions).toBeDefined();
    expect(familyMetrics.calculationAssumptions.adultRestVentilationM3Hr).toBe(0.6);
    expect(familyMetrics.calculationAssumptions.n95FiltrationEfficiencyPct).toBe(95);
  });
});
