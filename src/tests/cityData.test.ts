import { describe, it, expect } from 'vitest';
import {
  CITIES_DATA,
  createCustomCity,
  getAqiCategory,
  validateHouseholdProfile,
} from '../data/cityDefaults';

describe('City Defaults, Offline Presets & Profile Validation', () => {
  it('marks all built-in city presets as offline demo presets', () => {
    expect(CITIES_DATA.length).toBe(5);
    CITIES_DATA.forEach((city) => {
      expect(city.sourceType).toBe('offline_preset');
      expect(city.attribution).toContain('offline demo preset');
      expect(city.estimatedStagnationRisk).toBeDefined();
    });
  });

  it('categorizes AQI correctly across EPA break-points', () => {
    expect(getAqiCategory(30).category).toBe('Good');
    expect(getAqiCategory(75).category).toBe('Moderate');
    expect(getAqiCategory(125).category).toBe('Unhealthy for Sensitive Groups');
    expect(getAqiCategory(175).category).toBe('Unhealthy');
    expect(getAqiCategory(250).category).toBe('Very Unhealthy');
    expect(getAqiCategory(350).category).toBe('Hazardous');
    expect(getAqiCategory(null).category).toBe('Unknown');
  });

  it('creates custom cities WITHOUT calculating fake pollutant speciation or fake forecasts', () => {
    const custom = createCustomCity('Kanpur', 280, 'India');

    expect(custom.name).toBe('Kanpur');
    expect(custom.currentAqi).toBe(280);
    expect(custom.sourceType).toBe('manual_estimate');
    expect(custom.isCustomCity).toBe(true);

    // CRITICAL SCIENTIFIC INTEGRITY:
    // Individual pollutant readings MUST be null when only AQI is entered manually!
    expect(custom.pollutants.pm25).toBeNull();
    expect(custom.pollutants.pm10).toBeNull();
    expect(custom.pollutants.no2).toBeNull();
    expect(custom.pollutants.o3).toBeNull();
    expect(custom.pollutants.co).toBeNull();
    expect(custom.pollutants.so2).toBeNull();

    // Hourly forecast MUST be empty, not synthetic
    expect(custom.hourlyForecast).toEqual([]);
    expect(custom.temperatureC).toBeNull();
    expect(custom.humidityPct).toBeNull();
  });

  it('validates and sanitizes household profiles loaded from untrusted storage', () => {
    const corruptedPayload = {
      name: '  Overly Long Name That Should Be Sanitized Properly   ',
      cityId: 'delhi',
      vulnerabilities: ['Infant/Child', 'NonExistentVulnerability', 'Respiratory/Asthma'],
      dailyCommuteMode: 'Spaceship', // Invalid enum
      commuteDistanceKm: -50, // Invalid negative
      hasAirPurifier: 'not-a-boolean',
      childrenCount: 25, // Clamped to 10
      elderlyCount: -2,
    };

    const sanitized = validateHouseholdProfile(corruptedPayload);

    expect(sanitized.name).toBe('Overly Long Name That Should Be Sanitized Properly');
    expect(sanitized.vulnerabilities).toEqual(['Infant/Child', 'Respiratory/Asthma']);
    expect(sanitized.dailyCommuteMode).toBe('Private Car'); // Falls back to valid enum
    expect(sanitized.commuteDistanceKm).toBeGreaterThanOrEqual(0.5);
    expect(sanitized.childrenCount).toBe(10); // Clamped
    expect(sanitized.elderlyCount).toBe(0);
  });

  it('returns default profile when storage payload is empty or invalid', () => {
    const fallback = validateHouseholdProfile(null);
    expect(fallback.name).toBe('My Household');
    expect(fallback.cityId).toBe('delhi');
    expect(fallback.dailyCommuteMode).toBe('Private Car');
  });
});
