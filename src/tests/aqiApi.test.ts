import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchLiveAqi,
  KNOWN_CITY_COORDINATES,
  evaluateVentilationSafety,
  clearAqiCache,
  getCachedAqi
} from '../services/aqiApi';

describe('Live Open-Meteo Air Quality Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAqiCache();
  });

  it('contains verified geographic coordinates for all core cities', () => {
    expect(KNOWN_CITY_COORDINATES.length).toBe(5);
    const delhi = KNOWN_CITY_COORDINATES.find((c) => c.id === 'delhi');
    expect(delhi?.lat).toBeCloseTo(28.61, 1);
    expect(delhi?.lon).toBeCloseTo(77.20, 1);
  });

  it('evaluates ventilation safety strictly according to WHO and EPA guidelines', () => {
    // Good air (AQI <= 50): always safe
    expect(evaluateVentilationSafety(30, 8).safe).toBe(true);
    expect(evaluateVentilationSafety(50, 14).safe).toBe(true);

    // Moderate air (AQI 51 - 100): safe in afternoon solar window (13-15), unsafe in morning/night
    expect(evaluateVentilationSafety(80, 14).safe).toBe(true);
    expect(evaluateVentilationSafety(80, 8).safe).toBe(false);
    expect(evaluateVentilationSafety(100, 15).safe).toBe(true);
    expect(evaluateVentilationSafety(100, 20).safe).toBe(false);

    // Unhealthy for Sensitive (AQI 101 - 150): unsafe (marginal advice only)
    expect(evaluateVentilationSafety(120, 14).safe).toBe(false);
    expect(evaluateVentilationSafety(150, 8).safe).toBe(false);

    // Very Unhealthy / Hazardous air (AQI > 150): strictly unsafe even during afternoon window
    expect(evaluateVentilationSafety(151, 14).safe).toBe(false);
    expect(evaluateVentilationSafety(220, 14).safe).toBe(false);
    expect(evaluateVentilationSafety(350, 14).safe).toBe(false);
  });

  it('accurately locates current local hour and extracts consecutive forecast hours', async () => {
    const mockApiResponse = {
      current: {
        time: '2026-11-23T14:00',
        us_aqi: 95,
        pm2_5: 35,
        pm10: 55,
        nitrogen_dioxide: 28,
        ozone: 45,
        carbon_monoxide: 600,
        sulphur_dioxide: 8
      },
      hourly: {
        time: [
          '2026-11-23T10:00',
          '2026-11-23T12:00',
          '2026-11-23T14:00',
          '2026-11-23T15:00',
          '2026-11-23T16:00',
          '2026-11-23T17:00'
        ],
        us_aqi: [140, 120, 95, 90, 110, 130],
        pm2_5: [55, 45, 35, 32, 40, 50]
      }
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 19, relative_humidity_2m: 55 } })
      } as Response);
    });

    const delhi = KNOWN_CITY_COORDINATES[0];
    const result = await fetchLiveAqi(delhi);

    // Must start at local time 14:00, not past 10:00 or 12:00
    expect(result.cityData.hourlyForecast.length).toBeGreaterThanOrEqual(4);
    expect(result.cityData.hourlyForecast[0].hour).toBe('14:00');
    expect(result.cityData.hourlyForecast[1].hour).toBe('15:00');
    expect(result.cityData.hourlyForecast[2].hour).toBe('16:00');
  });

  it('correctly maps live Open-Meteo JSON into structured CityData via parallel fetch', async () => {
    const mockApiResponse = {
      current: {
        time: '2026-11-23T06:00',
        us_aqi: 285,
        pm2_5: 215,
        pm10: 310,
        nitrogen_dioxide: 68,
        ozone: 24,
        carbon_monoxide: 1800,
        sulphur_dioxide: 16
      },
      hourly: {
        time: ['2026-11-23T06:00', '2026-11-23T07:00', '2026-11-23T08:00', '2026-11-23T09:00'],
        us_aqi: [285, 300, 310, 290],
        pm2_5: [215, 230, 240, 220]
      }
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 17, relative_humidity_2m: 65 } })
      } as Response);
    });

    const delhi = KNOWN_CITY_COORDINATES[0];
    const result = await fetchLiveAqi(delhi);

    expect(result.source).toBe('Open-Meteo CAMS Model');
    expect(result.cityData.currentAqi).toBe(285);
    expect(result.cityData.category).toBe('Very Unhealthy');
    expect(result.cityData.pollutants.pm25).toBe(215);
    expect(result.cityData.pollutants.co).toBe(1.8); // 1800 / 1000
    expect(result.cityData.temperatureC).toBe(17);
    expect(result.cityData.humidityPct).toBe(65);
    expect(result.cityData.hourlyForecast.length).toBeGreaterThanOrEqual(3);
  });

  it('uses in-memory cache to prevent duplicate requests within TTL', async () => {
    const mockApiResponse = {
      current: { time: '2026-11-23T12:00', us_aqi: 110, pm2_5: 42 },
      hourly: { time: ['2026-11-23T12:00'], us_aqi: [110], pm2_5: [42] }
    };

    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes('air-quality')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockApiResponse
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ current: { temperature_2m: 20, relative_humidity_2m: 50 } })
      } as Response);
    });
    global.fetch = fetchSpy;

    const lahore = KNOWN_CITY_COORDINATES[1];
    
    // First call triggers network
    const firstCall = await fetchLiveAqi(lahore);
    expect(fetchSpy).toHaveBeenCalled();
    const callCountAfterFirst = fetchSpy.mock.calls.length;

    // Second call serves directly from cache without hitting network again
    const secondCall = await fetchLiveAqi(lahore);
    expect(fetchSpy.mock.calls.length).toBe(callCountAfterFirst);
    expect(secondCall.cityData.currentAqi).toBe(firstCall.cityData.currentAqi);

    // Cache lookup returns data
    expect(getCachedAqi(lahore.id)).not.toBeNull();

    // Cache clearing allows fresh fetch
    clearAqiCache();
    expect(getCachedAqi(lahore.id)).toBeNull();
  });

  it('throws when network fails so callers can trigger offline fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const delhi = KNOWN_CITY_COORDINATES[0];
    await expect(fetchLiveAqi(delhi, { bypassCache: true })).rejects.toThrow('Network error');
  });
});
