import { describe, it, expect } from 'vitest';
import { CITIES_DATA, getAqiCategory, createCustomCity } from '../data/cityDefaults';
import { IAQ_HACKS } from '../data/iaqHacks';

describe('City and IAQ Static Knowledge Integrity', () => {
  it('creates custom dynamic city with accurate speciation and inversion flags', () => {
    const custom = createCustomCity('Patna', 320, 'India');
    expect(custom.name).toBe('Patna');
    expect(custom.currentAqi).toBe(320);
    expect(custom.category).toBe('Hazardous');
    expect(custom.inversionLayerActive).toBe(true);
    expect(custom.pollutants.pm25).toBeGreaterThan(200);
    expect(custom.hourlyForecast.length).toBe(5);
  });
  it('contains valid city datasets with comprehensive hourly diurnal forecasts', () => {
    expect(CITIES_DATA.length).toBeGreaterThanOrEqual(4);
    for (const city of CITIES_DATA) {
      expect(city.name).toBeDefined();
      expect(city.currentAqi).toBeGreaterThan(0);
      expect(city.pollutants.pm25).toBeGreaterThan(0);
      expect(city.hourlyForecast.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('maps AQI indices to standard WHO/EPA categories', () => {
    expect(getAqiCategory(35).category).toBe('Good');
    expect(getAqiCategory(75).category).toBe('Moderate');
    expect(getAqiCategory(130).category).toBe('Unhealthy for Sensitive Groups');
    expect(getAqiCategory(180).category).toBe('Unhealthy');
    expect(getAqiCategory(250).category).toBe('Very Unhealthy');
    expect(getAqiCategory(420).category).toBe('Hazardous');
  });

  it('includes Corsi-Rosenthal box and diurnal inversion hacks with scientific principles', () => {
    const corsi = IAQ_HACKS.find(h => h.id === 'corsi-rosenthal-box');
    expect(corsi).toBeDefined();
    expect(corsi?.efficacyScore).toBeGreaterThanOrEqual(90);
    expect(corsi?.scientificMechanism).toBeDefined();
    expect(corsi?.steps.length).toBeGreaterThanOrEqual(4);
  });
});
