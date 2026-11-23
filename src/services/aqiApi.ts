import { CityData, HourlyForecast, PollutantValues } from '../types/aqi';
import { getAqiCategory } from '../data/cityDefaults';

export interface CityCoordinates {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const KNOWN_CITY_COORDINATES: CityCoordinates[] = [
  { id: 'delhi', name: 'Delhi NCR', country: 'India', lat: 28.6139, lon: 77.2090 },
  { id: 'lahore', name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { id: 'milan', name: 'Milan (Po Valley)', country: 'Italy', lat: 45.4642, lon: 9.1900 },
  { id: 'los-angeles', name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 }
];

export interface LiveAqiResult {
  cityData: CityData;
  source: 'Open-Meteo CAMS Model' | 'Offline Backup Preset';
  timestamp: string;
}

/**
 * Evaluates whether natural ventilation is biologically safe based on strict WHO & EPA standards:
 * - AQI <= 50 (Good): Safe
 * - AQI 51 - 100 (Moderate): Safe during afternoon solar convective mixing (13:00 - 15:30)
 * - AQI 101 - 150 (Sensitive Groups): Only brief 10m aeration permitted; sensitive members isolated
 * - AQI > 150 (Unhealthy / Hazardous): UNSAFE. Windows strictly locked; rely on indoor filtration.
 */
export function evaluateVentilationSafety(aqi: number, hourNum: number): { safe: boolean; advice: string } {
  const isSolarConvectiveWindow = hourNum >= 13 && hourNum <= 15;

  if (aqi <= 50) {
    return { safe: true, advice: 'Clean ambient air. Safe for natural cross-ventilation.' };
  }
  if (aqi <= 100) {
    if (isSolarConvectiveWindow) {
      return { safe: true, advice: 'Solar convective mixing lifts boundary layer. Safe for 20-30m aeration.' };
    }
    return { safe: false, advice: 'Morning/evening ground cooling traps moderate particulates. Postpone airing to midday.' };
  }
  if (aqi <= 150) {
    if (isSolarConvectiveWindow) {
      return { safe: false, advice: 'Marginal solar window. Brief 10m aeration only if indoor CO2 is high; sensitive individuals stay in filtered room.' };
    }
    return { safe: false, advice: 'Stagnant boundary air. Keep windows closed.' };
  }
  return {
    safe: false,
    advice: 'Severe smog alert. Unsafe to ventilate. Keep windows sealed; run Corsi-Rosenthal / HEPA air cleaners.'
  };
}

/**
 * Fetches real air quality & meteorological telemetry concurrently via Promise.all
 * from Open-Meteo & Copernicus Atmosphere Monitoring Service (CAMS).
 * Uses city local timestamps from the API to guarantee timezone-accurate forecast slicing.
 */
export async function fetchLiveAqi(city: CityCoordinates): Promise<LiveAqiResult> {
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&hourly=us_aqi,pm2_5&timezone=auto&forecast_days=2`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`;

  try {
    // Parallel fetch: Air quality and weather concurrently
    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl),
      fetch(weatherUrl).catch(() => null)
    ]);

    if (!aqiRes.ok) {
      throw new Error(`Open-Meteo CAMS API responded with HTTP ${aqiRes.status}`);
    }

    const aqiData = await aqiRes.json();
    const current = aqiData.current;
    const hourly = aqiData.hourly;

    // Telemetry parsing
    const currentAqi = Math.round(current?.us_aqi ?? 150);
    const { category } = getAqiCategory(currentAqi);
    const pm25 = Math.round(current?.pm2_5 ?? 60);
    const pm10 = Math.round(current?.pm10 ?? 90);
    const no2 = Math.round(current?.nitrogen_dioxide ?? 40);
    const o3 = Math.round(current?.ozone ?? 30);
    const co = Number(((current?.carbon_monoxide ?? 500) / 1000).toFixed(1));
    const so2 = Math.round(current?.sulphur_dioxide ?? 10);

    // Weather telemetry parsing
    let temperatureC = 16;
    let humidityPct = 65;
    if (weatherRes && weatherRes.ok) {
      try {
        const wData = await weatherRes.json();
        if (typeof wData.current?.temperature_2m === 'number') {
          temperatureC = Math.round(wData.current.temperature_2m);
        }
        if (typeof wData.current?.relative_humidity_2m === 'number') {
          humidityPct = Math.round(wData.current.relative_humidity_2m);
        }
      } catch {
        // Fallback to estimated regional defaults
      }
    }

    // Timezone-accurate local hour from Open-Meteo's own local timestamp (e.g. "2026-11-23T14:15")
    const localTimeStr: string = current?.time || '';
    const localHour = localTimeStr.includes('T') 
      ? parseInt(localTimeStr.split('T')[1].slice(0, 2), 10) 
      : new Date().getHours();

    const isInversion = currentAqi > 200 || (pm25 > 100 && (localHour < 10 || localHour > 18));

    // Dynamic timeline: Accurately locate the current/next upcoming hour in the local timeline
    // and grab 7 consecutive forecast hours
    const hourlyForecast: HourlyForecast[] = [];
    if (hourly?.time && hourly?.us_aqi && hourly?.pm2_5) {
      // Find index matching or immediately following the city's local time
      const targetPrefix = localTimeStr.includes('T') ? localTimeStr.slice(0, 13) : '';
      let startIndex = targetPrefix ? hourly.time.findIndex((t: string) => t >= targetPrefix) : -1;
      if (startIndex === -1) startIndex = 0;

      // Extract consecutive upcoming hours
      for (let i = startIndex; i < hourly.time.length && hourlyForecast.length < 7; i++) {
        const rawTime = hourly.time[i];
        const timeStr = rawTime.includes('T') ? rawTime.split('T')[1].slice(0, 5) : `${i}:00`;
        const aqiVal = Math.round(hourly.us_aqi[i]);
        const pmVal = Math.round(hourly.pm2_5[i]);
        const hourNum = parseInt(timeStr.slice(0, 2), 10);

        const { safe: ventilationSafe, advice: recommendation } = evaluateVentilationSafety(aqiVal, hourNum);
        const invRisk = aqiVal > 250 ? 'High' : aqiVal > 120 ? 'Medium' : 'Low';

        hourlyForecast.push({
          hour: timeStr,
          aqi: aqiVal,
          pm25: pmVal,
          inversionRisk: invRisk,
          ventilationSafe,
          recommendation
        });
      }
    }

    const pollutants: PollutantValues = { pm25, pm10, no2, o3, co, so2 };

    const cityData: CityData = {
      id: city.id,
      name: city.name,
      country: city.country,
      currentAqi,
      category,
      pollutants,
      temperatureC,
      humidityPct,
      inversionLayerActive: isInversion,
      primarySmogSource: isInversion
        ? 'Thermal boundary inversion trapping ground aerosols & vehicle exhaust (CAMS model)'
        : 'Ambient regional aerosol dispersion (Copernicus CAMS atmospheric model)',
      hourlyForecast: hourlyForecast.length > 0 ? hourlyForecast : [
        { hour: '08:00', aqi: Math.round(currentAqi * 1.15), pm25: Math.round(pm25 * 1.15), inversionRisk: 'High', ventilationSafe: false, recommendation: 'Morning cold inversion peak.' },
        { hour: '14:00', aqi: Math.round(currentAqi * 0.8), pm25: Math.round(pm25 * 0.8), inversionRisk: 'Low', ventilationSafe: currentAqi <= 100, recommendation: 'Solar mixing window.' },
        { hour: '20:00', aqi: currentAqi, pm25: pm25, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Evening smog accumulation.' }
      ]
    };

    return {
      cityData,
      source: 'Open-Meteo CAMS Model',
      timestamp: localTimeStr.includes('T') 
        ? localTimeStr.split('T')[1].slice(0, 5) 
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    console.warn(`Failed to fetch live AQI for ${city.name}, falling back to preset data:`, err);
    throw err;
  }
}
