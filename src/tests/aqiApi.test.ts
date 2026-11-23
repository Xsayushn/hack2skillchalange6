import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchLiveAqi,
  KNOWN_CITY_COORDINATES,
  evaluateVentilationSafety,
  estimateStagnationRisk,
  clearAqiCache,
  parseValidNumber,
} from '../services/aqiApi';

describe('Live Open-Meteo & Copernicus CAMS Telemetry Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAqiCache();
  });

  it('contains verified geographic coordinates for all core cities', () => {
    expect(KNOWN_CITY_COORDINATES.length).toBe(5);
    const delhi = KNOWN_CITY_COORDINATES.find((c) => c.id === 'delhi');
    expect(delhi?.lat).toBeCloseTo(28.61, 1);
    expect(delhi?.lon).toBeCloseTo(77.2, 1);
  });

  it('parses valid numbers while preserving zero as a valid reading', () => {
    expect(parseValidNumber(0)).toBe(0);
    expect(parseValidNumber('0')).toBe(0);
    expect(parseValidNumber(42.5)).toBe(42.5);
    expect(parseValidNumber('100')).toBe(100);
    expect(parseValidNumber(null)).toBeNull();
    expect(parseValidNumber(undefined)).toBeNull();
    expect(parseValidNumber(NaN)).toBeNull();
    expect(parseValidNumber(Infinity)).toBeNull();
    expect(parseValidNumber('not-a-number')).toBeNull();
  });

  it('evaluates ventilation safety based on predicted AQI without assuming afternoon is automatically safe', () => {
    // Clean ambient air (AQI <= 50): viable
    expect(evaluateVentilationSafety(30).viable).toBe(true);
    expect(evaluateVentilationSafety(50).viable).toBe(true);

    // Moderate ambient air (51 - 100): viable with advisory
    expect(evaluateVentilationSafety(80).viable).toBe(true);
    expect(evaluateVentilationSafety(100).viable).toBe(true);

    // Unhealthy for Sensitive Groups (101 - 150): not recommended
    expect(evaluateVentilationSafety(125).viable).toBe(false);

    // Unhealthy / Hazardous (> 150): strictly not recommended
    expect(evaluateVentilationSafety(200).viable).toBe(false);
    expect(evaluateVentilationSafety(400).viable).toBe(false);

    // Missing / null data: returns null viability (never pretends safe)
    expect(evaluateVentilationSafety(null).viable).toBeNull();
  });

  it('estimates ground stagnation risk level with appropriate caution', () => {
    expect(estimateStagnationRisk(300, 220)).toBe('High');
    expect(estimateStagnationRisk(150, 80)).toBe('Medium');
    expect(estimateStagnationRisk(40, 12)).toBe('Low');
    expect(estimateStagnationRisk(null, null)).toBe('Unknown');
  });

  it('compares full ISO timestamps and never truncates 14:15 to 14:00', async () => {
    const mockApiResponse = {
      timezone: 'Asia/Kolkata',
      utc_offset_seconds: 19800,
      current: {
        time: '2026-11-23T14:15', // Current time is 14:15
        us_aqi: 180,
        pm2_5: 95,
      },
      hourly: {
        time: [
          '2026-11-23T13:00',
          '2026-11-23T14:00', // 14:00 is in the past relative to 14:15
          '2026-11-23T15:00', // First future timestamp
          '2026-11-23T16:00',
          '2026-11-23T17:00',
        ],
        us_aqi: [160, 175, 185, 195, 210],
        pm2_5: [80, 90, 100, 110, 120],
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 22, relative_humidity_2m: 50 } }),
      } as Response);
    });

    const delhi = KNOWN_CITY_COORDINATES[0];
    const result = await fetchLiveAqi(delhi);

    // Must start at 15:00, NOT 14:00 or past hours
    expect(result.cityData.hourlyForecast.length).toBe(3);
    expect(result.cityData.hourlyForecast[0].hour).toBe('15:00');
    expect(result.cityData.hourlyForecast[0].time).toBe('2026-11-23T15:00');
    expect(result.cityData.hourlyForecast[1].hour).toBe('16:00');
  });

  it('never falls back to forecast index 0 when all forecast timestamps are in the past', async () => {
    const mockApiResponse = {
      timezone: 'Asia/Kolkata',
      current: {
        time: '2026-11-23T22:30',
        us_aqi: 300,
        pm2_5: 200,
      },
      hourly: {
        // All hourly data precedes current time
        time: ['2026-11-23T18:00', '2026-11-23T19:00', '2026-11-23T20:00'],
        us_aqi: [250, 270, 290],
        pm2_5: [150, 170, 190],
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 16 } }),
      } as Response);
    });

    const delhi = KNOWN_CITY_COORDINATES[0];
    const result = await fetchLiveAqi(delhi);

    // Must be empty array, NOT fallback to index 0 (18:00)
    expect(result.cityData.hourlyForecast).toEqual([]);
  });

  it('handles zero as a valid pollutant concentration and converts CO from µg/m³ to mg/m³', async () => {
    const mockApiResponse = {
      timezone: 'America/Los_Angeles',
      utc_offset_seconds: -28800,
      current: {
        time: '2026-11-23T10:00',
        us_aqi: 25,
        pm2_5: 0, // Zero is valid
        pm10: 5,
        nitrogen_dioxide: 10,
        ozone: 30,
        carbon_monoxide: 450, // 450 µg/m³ -> 0.45 mg/m³
        sulphur_dioxide: 0, // Zero is valid
      },
      hourly: {
        time: ['2026-11-23T10:00'],
        us_aqi: [25],
        pm2_5: [0],
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 18, relative_humidity_2m: 40 } }),
      } as Response);
    });

    const la = KNOWN_CITY_COORDINATES[4];
    const result = await fetchLiveAqi(la);

    expect(result.cityData.pollutants.pm25).toBe(0);
    expect(result.cityData.pollutants.so2).toBe(0);
    expect(result.cityData.pollutants.co).toBe(0.45); // Converted from 450 µg/m³ to mg/m³
    expect(result.cityData.timezone).toBe('America/Los_Angeles');
    expect(result.cityData.utcOffsetSeconds).toBe(-28800);
  });

  it('guards against mismatched parallel array lengths in forecast payload', async () => {
    const mockApiResponse = {
      current: { time: '2026-11-23T10:00', us_aqi: 50, pm2_5: 15 },
      hourly: {
        time: ['2026-11-23T10:00', '2026-11-23T11:00', '2026-11-23T12:00'],
        us_aqi: [50, 55], // Length 2
        pm2_5: [15, 18, 20, 22], // Length 4
      },
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 15 } }),
      } as Response);
    });

    const result = await fetchLiveAqi(KNOWN_CITY_COORDINATES[0]);
    // Should safely take minimum length (2) without indexing undefined
    expect(result.cityData.hourlyForecast.length).toBe(2);
  });

  it('isolates cache by geographic coordinates and marks cached responses', async () => {
    const mockApiResponse = {
      current: { time: '2026-11-23T12:00', us_aqi: 110, pm2_5: 45 },
      hourly: { time: ['2026-11-23T12:00'], us_aqi: [110], pm2_5: [45] },
    };

    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 20 } }),
      } as Response);
    });
    global.fetch = fetchSpy;

    const city1 = KNOWN_CITY_COORDINATES[0];
    const city2 = KNOWN_CITY_COORDINATES[1];

    // First call triggers network
    const res1 = await fetchLiveAqi(city1);
    expect(res1.source).toBe('live_cams_model');
    expect(res1.isCached).toBe(false);

    // Second call to same coordinates serves from cache
    const resCached = await fetchLiveAqi(city1);
    expect(resCached.source).toBe('cached_cams_model');
    expect(resCached.isCached).toBe(true);

    // Call to different coordinates triggers separate network call
    const res2 = await fetchLiveAqi(city2);
    expect(res2.source).toBe('live_cams_model');

    // Manual refresh with bypassCache triggers fresh network fetch
    const resBypass = await fetchLiveAqi(city1, { bypassCache: true });
    expect(resBypass.source).toBe('live_cams_model');
    expect(resBypass.isCached).toBe(false);
  });

  it('falls back to estimated weather when weather API fails without breaking air quality data', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            current: { time: '2026-11-23T08:00', us_aqi: 90, pm2_5: 35 },
            hourly: { time: ['2026-11-23T08:00'], us_aqi: [90], pm2_5: [35] },
          }),
        } as Response);
      }
      // Weather API fails
      return Promise.reject(new Error('Weather service 503'));
    });

    const result = await fetchLiveAqi(KNOWN_CITY_COORDINATES[0]);
    expect(result.cityData.currentAqi).toBe(90);
    expect(result.cityData.temperatureC).toBeNull();
    expect(result.cityData.humidityPct).toBeNull();
    expect(result.cityData.isWeatherEstimated).toBe(true);
  });

  it('aborts when external signal is triggered', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchLiveAqi(KNOWN_CITY_COORDINATES[0], { signal: controller.signal })
    ).rejects.toThrow();
  });
});
