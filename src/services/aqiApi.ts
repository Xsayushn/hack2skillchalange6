import {
  CityData,
  HourlyForecast,
  PollutantValues,
  StagnationRiskLevel,
  DataSourceType,
} from '../types/aqi';
import { getAqiCategory } from '../data/cityDefaults';

export interface CityCoordinates {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const KNOWN_CITY_COORDINATES: CityCoordinates[] = [
  { id: 'delhi', name: 'Delhi NCR', country: 'India', lat: 28.6139, lon: 77.209 },
  { id: 'lahore', name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { id: 'milan', name: 'Milan (Po Valley)', country: 'Italy', lat: 45.4642, lon: 9.19 },
  { id: 'los-angeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
];

export interface LiveAqiResult {
  cityData: CityData;
  source: DataSourceType;
  timestamp: string;
  isCached: boolean;
}

// 15-minute coordinate-based cache
const CACHE_TTL_MS = 15 * 60 * 1000;
interface CacheEntry {
  data: LiveAqiResult;
  timestamp: number;
}
const aqiCache = new Map<string, CacheEntry>();

export function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export function clearAqiCache(): void {
  aqiCache.clear();
}

export function getCachedAqi(lat: number, lon: number): LiveAqiResult | null {
  const key = getCacheKey(lat, lon);
  const entry = aqiCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return {
      ...entry.data,
      source: 'cached_cams_model',
      isCached: true,
    };
  }
  return null;
}

/**
 * Validates whether a value is a valid finite number.
 * Note: 0 is a completely valid reading.
 */
export function parseValidNumber(val: unknown): number | null {
  if (typeof val === 'number') {
    return isFinite(val) && !isNaN(val) ? val : null;
  }
  if (typeof val === 'string' && val.trim() !== '') {
    const num = Number(val);
    return isFinite(num) && !isNaN(num) ? num : null;
  }
  return null;
}

/**
 * Evaluates whether natural ventilation is biologically safe based on predicted AQI.
 * Does NOT declare an afternoon hour safe solely because it is afternoon.
 * When AQI is missing or > 100, natural ventilation is not recommended.
 */
export function evaluateVentilationSafety(aqi: number | null): {
  viable: boolean | null;
  advice: string;
} {
  if (aqi === null || typeof aqi !== 'number' || isNaN(aqi)) {
    return { viable: null, advice: 'Forecast data unavailable to evaluate ventilation viability.' };
  }

  if (aqi <= 50) {
    return {
      viable: true,
      advice: 'Ambient air is clean (AQI <= 50). Safe for cross-ventilation.',
    };
  }
  if (aqi <= 100) {
    return {
      viable: true,
      advice:
        'Moderate ambient air (AQI 51–100). Safe for short 15–20m aeration; sensitive individuals monitor air quality.',
    };
  }
  if (aqi <= 150) {
    return {
      viable: false,
      advice:
        'Unhealthy for Sensitive Groups (AQI 101–150). Natural ventilation not recommended; use indoor filtration.',
    };
  }
  return {
    viable: false,
    advice:
      'Elevated particulate pollution (AQI > 150). Windows strictly sealed; operate mechanical indoor filtration.',
  };
}

/**
 * Estimates stagnation risk level using atmospheric pollutant concentration.
 * Clearly framed as a ground-level stagnation risk, not a verified physical thermal inversion.
 */
export function estimateStagnationRisk(
  aqi: number | null,
  pm25: number | null
): StagnationRiskLevel {
  if (aqi === null && pm25 === null) return 'Unknown';
  if ((aqi !== null && aqi >= 250) || (pm25 !== null && pm25 >= 180)) return 'High';
  if ((aqi !== null && aqi >= 101) || (pm25 !== null && pm25 >= 60)) return 'Medium';
  return 'Low';
}

export interface FetchLiveAqiOptions {
  bypassCache?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Fetches real-time numerical model forecast telemetry from Open-Meteo & Copernicus CAMS.
 *
 * Integrity features:
 * - Compares full ISO timestamps (never truncates 14:15 to 14:00).
 * - Selects first forecast at or after current timestamp; never falls back to index 0 if in the past.
 * - Never fabricates fake forecast entries if no valid forecast was returned.
 * - Preserves zero as a valid reading (never uses || fallback for numeric readings).
 * - Validates schema, types, and parallel array lengths.
 * - Correctly parses units (converts CO from µg/m³ to mg/m³).
 * - Distinguishes live model vs cached model vs offline presets vs manual estimates.
 * - Coordinates-based cache with manual bypass and abort timeout.
 */
export async function fetchLiveAqi(
  city: CityCoordinates,
  options?: FetchLiveAqiOptions
): Promise<LiveAqiResult> {
  // Check coordinate-based cache
  if (!options?.bypassCache) {
    const cached = getCachedAqi(city.lat, city.lon);
    if (cached) {
      return cached;
    }
  }

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&hourly=us_aqi,pm2_5&timezone=auto&forecast_days=2`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`;

  // Timeout controller that covers both fetch and json parsing
  const timeoutMs = options?.timeoutMs ?? 8000;
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

  // Link caller signal if provided
  const callerSignal = options?.signal;
  const abortHandler = () => timeoutController.abort();
  if (callerSignal) {
    if (callerSignal.aborted) {
      clearTimeout(timer);
      throw new DOMException('Request was aborted by caller', 'AbortError');
    }
    callerSignal.addEventListener('abort', abortHandler);
  }

  try {
    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl, { signal: timeoutController.signal }),
      fetch(weatherUrl, { signal: timeoutController.signal }).catch(() => null),
    ]);

    if (!aqiRes.ok) {
      throw new Error(`Open-Meteo CAMS API responded with HTTP status ${aqiRes.status}`);
    }

    const aqiData = await aqiRes.json();
    clearTimeout(timer);

    // Validate top-level payload
    if (!aqiData || typeof aqiData !== 'object') {
      throw new Error('Invalid JSON payload received from Open-Meteo API');
    }

    const current = aqiData.current && typeof aqiData.current === 'object' ? aqiData.current : null;
    const hourly = aqiData.hourly && typeof aqiData.hourly === 'object' ? aqiData.hourly : null;

    if (!current) {
      throw new Error('Missing "current" telemetry block in Open-Meteo response');
    }

    // Extract time and timezone
    const timezone: string = typeof aqiData.timezone === 'string' ? aqiData.timezone : 'UTC';
    const utcOffsetSeconds: number =
      typeof aqiData.utc_offset_seconds === 'number' ? aqiData.utc_offset_seconds : 0;
    const currentTimestamp: string | null =
      typeof current.time === 'string' && current.time ? current.time : null;

    // Parse current pollutant values with zero-preservation
    const rawAqi = parseValidNumber(current.us_aqi);
    const currentAqi = rawAqi !== null ? Math.round(rawAqi) : null;
    const { category } = getAqiCategory(currentAqi);

    const rawPm25 = parseValidNumber(current.pm2_5);
    const pm25 = rawPm25 !== null ? Math.round(rawPm25) : null;

    const rawPm10 = parseValidNumber(current.pm10);
    const pm10 = rawPm10 !== null ? Math.round(rawPm10) : null;

    const rawNo2 = parseValidNumber(current.nitrogen_dioxide);
    const no2 = rawNo2 !== null ? Math.round(rawNo2) : null;

    const rawO3 = parseValidNumber(current.ozone);
    const o3 = rawO3 !== null ? Math.round(rawO3) : null;

    // Open-Meteo CAMS returns CO in µg/m³. Convert to mg/m³ (1 mg = 1000 µg).
    const rawCo = parseValidNumber(current.carbon_monoxide);
    const co = rawCo !== null ? Number((rawCo / 1000).toFixed(2)) : null;

    const rawSo2 = parseValidNumber(current.sulphur_dioxide);
    const so2 = rawSo2 !== null ? Math.round(rawSo2) : null;

    const pollutants: PollutantValues = { pm25, pm10, no2, o3, co, so2 };

    // Weather parsing
    let temperatureC: number | null = null;
    let humidityPct: number | null = null;
    let isWeatherEstimated = true;

    if (weatherRes && weatherRes.ok) {
      try {
        const wData = await weatherRes.json();
        const rawTemp = parseValidNumber(wData?.current?.temperature_2m);
        const rawHumidity = parseValidNumber(wData?.current?.relative_humidity_2m);
        if (rawTemp !== null) {
          temperatureC = Math.round(rawTemp);
          isWeatherEstimated = false;
        }
        if (rawHumidity !== null) {
          humidityPct = Math.round(rawHumidity);
        }
      } catch {
        // Leave weather as null / estimated
      }
    }

    // Ground-level stagnation risk
    const stagnationRisk = estimateStagnationRisk(currentAqi, pm25);
    const stagnationExplanation =
      stagnationRisk === 'High'
        ? 'Numerical model indicates surface particulate buildup consistent with stagnant boundary conditions. Actual thermal inversion layers require vertical atmospheric sounding data.'
        : stagnationRisk === 'Medium'
          ? 'Moderate surface accumulation modeled. Regional ventilation varies by terrain.'
          : 'Model predicts active boundary mixing and dispersion.';

    // Forecast processing: Compare full ISO timestamp; never truncate 14:15 to 14:00.
    const hourlyForecast: HourlyForecast[] = [];
    if (
      hourly &&
      Array.isArray(hourly.time) &&
      Array.isArray(hourly.us_aqi) &&
      Array.isArray(hourly.pm2_5)
    ) {
      // Parallel array length guard
      const safeLen = Math.min(hourly.time.length, hourly.us_aqi.length, hourly.pm2_5.length);

      // Find first forecast timestamp at or after current timestamp
      let startIndex = -1;
      if (currentTimestamp) {
        startIndex = hourly.time.findIndex((t: unknown, idx: number) => {
          if (idx >= safeLen || typeof t !== 'string') return false;
          // Full ISO comparison: e.g. "2026-11-23T14:00" >= "2026-11-23T14:15"
          return t >= currentTimestamp;
        });
      }

      // CRITICAL: Never fall back to index 0 if no future match is available!
      // If startIndex is -1, it means the API payload contains only past timestamps; do NOT show past as future!
      if (startIndex !== -1) {
        for (let i = startIndex; i < safeLen && hourlyForecast.length < 7; i++) {
          const rawTime = hourly.time[i];
          if (typeof rawTime !== 'string') continue;

          const timeStr = rawTime.includes('T') ? rawTime.split('T')[1].slice(0, 5) : rawTime;
          const fAqi = parseValidNumber(hourly.us_aqi[i]);
          const roundedAqi = fAqi !== null ? Math.round(fAqi) : null;
          const fPm25 = parseValidNumber(hourly.pm2_5[i]);
          const roundedPm25 = fPm25 !== null ? Math.round(fPm25) : null;

          const { viable: ventilationViable, advice: recommendation } =
            evaluateVentilationSafety(roundedAqi);
          const fRisk = estimateStagnationRisk(roundedAqi, roundedPm25);

          hourlyForecast.push({
            time: rawTime,
            hour: timeStr,
            aqi: roundedAqi,
            pm25: roundedPm25,
            stagnationRisk: fRisk,
            ventilationViable,
            recommendation,
          });
        }
      }
    }

    const cityData: CityData = {
      id: city.id,
      name: city.name,
      country: city.country,
      currentAqi,
      category,
      pollutants,
      temperatureC,
      humidityPct,
      estimatedStagnationRisk: stagnationRisk,
      stagnationExplanation,
      hourlyForecast, // Empty if no valid future forecast; never fake!
      sourceType: 'live_cams_model',
      isWeatherEstimated,
      attribution:
        'Copernicus Atmosphere Monitoring Service (CAMS) & Open-Meteo numerical model forecast',
      lastUpdatedTime: currentTimestamp || new Date().toISOString(),
      timezone,
      utcOffsetSeconds,
      lat: city.lat,
      lon: city.lon,
    };

    const result: LiveAqiResult = {
      cityData,
      source: 'live_cams_model',
      timestamp: currentTimestamp ? currentTimestamp.replace('T', ' ') : 'Live model update',
      isCached: false,
    };

    // Store in coordinate cache
    aqiCache.set(getCacheKey(city.lat, city.lon), {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  } finally {
    if (callerSignal) {
      callerSignal.removeEventListener('abort', abortHandler);
    }
  }
}
