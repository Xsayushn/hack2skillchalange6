import { describe, it, expect } from 'vitest';
import {
  calculateDailyInhaledDose,
  generateDailyRoutines,
  computeOverallImpact
} from '../services/impactCalculator';
import { UserFamilyProfile } from '../types/aqi';

describe('Impact Calculator Service', () => {
  const dummyProfile: UserFamilyProfile = {
    name: 'Test Family',
    cityId: 'delhi',
    vulnerabilities: ['Infant/Child', 'Respiratory/Asthma'],
    dailyCommuteMode: 'Private Car',
    commuteDistanceKm: 20,
    hasAirPurifier: true,
    homeType: 'Apartment',
    childrenCount: 1,
    elderlyCount: 1
  };

  it('calculates inhaled dose correctly with and without N95 mask', () => {
    const unmaskedDose = calculateDailyInhaledDose(200, 1.0, false, false);
    const maskedDose = calculateDailyInhaledDose(200, 1.0, false, true);

    expect(unmaskedDose).toBe(120); // 200 µg/m³ * 0.6 m³/hr * 1 hr
    expect(maskedDose).toBeCloseTo(6, 1); // 95% reduction
    expect(maskedDose).toBeLessThan(unmaskedDose);
  });

  it('calculates higher dose during exertion', () => {
    const restDose = calculateDailyInhaledDose(300, 1.0, false, false);
    const exertionDose = calculateDailyInhaledDose(300, 1.0, true, false);

    expect(exertionDose).toBeGreaterThan(restDose);
  });

  it('generates appropriate daily routines for severe smog conditions', () => {
    const routines = generateDailyRoutines(dummyProfile, 400, 320);
    expect(routines.length).toBeGreaterThanOrEqual(4);
    
    const commuteRoutine = routines.find((r) => r.id === 'routine-commute');
    expect(commuteRoutine).toBeDefined();
    expect(commuteRoutine?.emissionSavedKgCo2).toBeGreaterThan(0);
    expect(commuteRoutine?.exposureAvoidedPm25Ug).toBeGreaterThan(0);
  });

  it('honestly reports 0 kg CO2 saved when user already uses clean mass transit or active walking/cycling', () => {
    const metroProfile: UserFamilyProfile = {
      ...dummyProfile,
      dailyCommuteMode: 'Metro/Bus'
    };
    const walkingProfile: UserFamilyProfile = {
      ...dummyProfile,
      dailyCommuteMode: 'Active (Bicycle/Walk)'
    };

    const metroRoutines = generateDailyRoutines(metroProfile, 250, 180);
    const walkingRoutines = generateDailyRoutines(walkingProfile, 250, 180);

    const metroCommute = metroRoutines.find((r) => r.id === 'routine-commute');
    const walkingCommute = walkingRoutines.find((r) => r.id === 'routine-commute');

    expect(metroCommute?.emissionSavedKgCo2).toBe(0);
    expect(walkingCommute?.emissionSavedKgCo2).toBe(0);
    expect(walkingCommute?.ecoCleanAction).toContain('N95 respirator');
  });

  it('correctly calculates emission delta for Carpool and EV vs Metro', () => {
    const carpoolProfile: UserFamilyProfile = {
      ...dummyProfile,
      dailyCommuteMode: 'Carpool',
      commuteDistanceKm: 20
    };
    const evProfile: UserFamilyProfile = {
      ...dummyProfile,
      dailyCommuteMode: 'EV/Electric',
      commuteDistanceKm: 20
    };

    const carpoolRoutines = generateDailyRoutines(carpoolProfile, 200, 120);
    const evRoutines = generateDailyRoutines(evProfile, 200, 120);

    const carpoolCommute = carpoolRoutines.find((r) => r.id === 'routine-commute');
    const evCommute = evRoutines.find((r) => r.id === 'routine-commute');

    // Carpool: 20km * 2 * (0.075 - 0.038) = 1.48 kg CO2
    expect(carpoolCommute?.emissionSavedKgCo2).toBeCloseTo(1.48, 1);
    // EV: 20km * 2 * (0.045 - 0.038) = 0.28 kg CO2
    expect(evCommute?.emissionSavedKgCo2).toBeCloseTo(0.28, 1);
  });

  it('computes overall impact accurately when routines are adopted', () => {
    const routines = generateDailyRoutines(dummyProfile, 350, 280);
    // Mark first two as adopted
    routines[0].isAdopted = true;
    routines[1].isAdopted = true;

    const metrics = computeOverallImpact(routines, dummyProfile);
    expect(metrics.totalCo2SavedKg).toBeGreaterThan(0);
    expect(metrics.totalPm25AvoidedUg).toBeGreaterThan(0);
    expect(metrics.equivalentTreesPlanted).toBeGreaterThan(0);
    expect(metrics.cleanAirHoursGained).toBe(5);
    expect(metrics.communityRankPercentile).toBeGreaterThan(50);
  });

  it('applies air purifier multiplier and family count bonuses', () => {
    const baseRoutines = generateDailyRoutines(dummyProfile, 200, 100);
    baseRoutines[0].isAdopted = true;

    const singleNoPurifier: UserFamilyProfile = {
      ...dummyProfile,
      hasAirPurifier: false,
      childrenCount: 0,
      elderlyCount: 0
    };

    const familyWithPurifier: UserFamilyProfile = {
      ...dummyProfile,
      hasAirPurifier: true,
      childrenCount: 2,
      elderlyCount: 1 // familyCount = 4
    };

    const baseMetrics = computeOverallImpact(baseRoutines, singleNoPurifier);
    const boostedMetrics = computeOverallImpact(baseRoutines, familyWithPurifier);

    expect(boostedMetrics.totalPm25AvoidedUg).toBeGreaterThan(baseMetrics.totalPm25AvoidedUg);
    expect(boostedMetrics.totalCo2SavedKg).toBeGreaterThan(baseMetrics.totalCo2SavedKg);
  });
});
