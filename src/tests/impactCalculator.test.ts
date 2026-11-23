import { describe, it, expect } from 'vitest';
import { calculateDailyInhaledDose, generateDailyRoutines, computeOverallImpact } from '../services/impactCalculator';
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
    
    const commuteRoutine = routines.find(r => r.id === 'routine-commute');
    expect(commuteRoutine).toBeDefined();
    expect(commuteRoutine?.emissionSavedKgCo2).toBeGreaterThan(0);
    expect(commuteRoutine?.exposureAvoidedPm25Ug).toBeGreaterThan(0);
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
});
