import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchLiveAqi, KNOWN_CITY_COORDINATES } from '../services/aqiApi';

describe('Live Open-Meteo Air Quality Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('contains verified geographic coordinates for all core cities', () => {
    expect(KNOWN_CITY_COORDINATES.length).toBe(5);
    const delhi = KNOWN_CITY_COORDINATES.find(c => c.id === 'delhi');
    expect(delhi?.lat).toBeCloseTo(28.61, 1);
    expect(delhi?.lon).toBeCloseTo(77.20, 1);
  });

  it('correctly maps live Open-Meteo JSON into structured CityData', async () => {
    const mockApiResponse = {
      current: {
        us_aqi: 285,
        pm2_5: 215,
        pm10: 310,
        nitrogen_dioxide: 68,
        ozone: 24,
        carbon_monoxide: 1800,
        sulphur_dioxide: 16
      },
      hourly: {
        time: ['2026-11-23T06:00', '2026-11-23T14:00', '2026-11-23T20:00'],
        us_aqi: [320, 180, 290],
        pm2_5: [260, 120, 230]
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    } as Response);

    const delhi = KNOWN_CITY_COORDINATES[0];
    const result = await fetchLiveAqi(delhi);

    expect(result.source).toBe('Live Open-Meteo / CAMS');
    expect(result.cityData.currentAqi).toBe(285);
    expect(result.cityData.category).toBe('Very Unhealthy');
    expect(result.cityData.pollutants.pm25).toBe(215);
    expect(result.cityData.pollutants.co).toBe(1.8); // 1800 / 1000
    expect(result.cityData.hourlyForecast.length).toBeGreaterThanOrEqual(3);
  });

  it('throws when network fails so callers can trigger offline fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const delhi = KNOWN_CITY_COORDINATES[0];
    await expect(fetchLiveAqi(delhi)).rejects.toThrow('Network error');
  });
});
