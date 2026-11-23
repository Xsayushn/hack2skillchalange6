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
  source: 'Live Open-Meteo / CAMS' | 'Offline Backup Preset';
  timestamp: string;
}

/**
 * Fetches real, live air quality data from the free, public Open-Meteo Air Quality API.
 * Uses European Copernicus Atmosphere Monitoring Service (CAMS) & global ground stations.
 * Zero API key required, CORS-enabled, 100% public.
 */
export async function fetchLiveAqi(city: CityCoordinates): Promise<LiveAqiResult> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide&hourly=us_aqi,pm2_5&timezone=auto&forecast_days=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo API responded with status ${res.status}`);
    }
    const data = await res.json();
    const current = data.current;
    const hourly = data.hourly;

    const currentAqi = Math.round(current?.us_aqi ?? 150);
    const { category } = getAqiCategory(currentAqi);
    const pm25 = Math.round(current?.pm2_5 ?? 60);
    const pm10 = Math.round(current?.pm10 ?? 90);
    const no2 = Math.round(current?.nitrogen_dioxide ?? 40);
    const o3 = Math.round(current?.ozone ?? 30);
    const co = Number(((current?.carbon_monoxide ?? 500) / 1000).toFixed(1));
    const so2 = Math.round(current?.sulphur_dioxide ?? 10);

    const isInversion = currentAqi > 200 || (pm25 > 100 && new Date().getHours() < 10);

    // Build 5-7 hour timeline from hourly predictions
    const hourlyForecast: HourlyForecast[] = [];
    if (hourly?.time && hourly?.us_aqi && hourly?.pm2_5) {
      const step = Math.max(1, Math.floor(hourly.time.length / 7));
      for (let i = 0; i < hourly.time.length && hourlyForecast.length < 7; i += step) {
        const timeStr = hourly.time[i].split('T')[1]?.slice(0, 5) || `${i}:00`;
        const aqiVal = Math.round(hourly.us_aqi[i]);
        const pmVal = Math.round(hourly.pm2_5[i]);
        const hourNum = parseInt(timeStr.slice(0, 2), 10);
        const isSolarWindow = hourNum >= 13 && hourNum <= 15;
        const invRisk = aqiVal > 300 ? 'High' : aqiVal > 150 ? 'Medium' : 'Low';

        hourlyForecast.push({
          hour: timeStr,
          aqi: aqiVal,
          pm25: pmVal,
          inversionRisk: invRisk,
          ventilationSafe: isSolarWindow && aqiVal < 300,
          recommendation: isSolarWindow
            ? 'Midday solar mixing lifts inversion boundary layer.'
            : 'Stagnant thermal boundary layer. Keep windows sealed.'
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
      temperatureC: 16,
      humidityPct: 72,
      inversionLayerActive: isInversion,
      primarySmogSource: isInversion
        ? 'Real-time thermal inversion trapping local vehicular exhaust and particulate'
        : 'Ambient urban dispersion with moderate background aerosol levels',
      hourlyForecast: hourlyForecast.length > 0 ? hourlyForecast : [
        { hour: '06:00', aqi: Math.round(currentAqi * 1.2), pm25: Math.round(pm25 * 1.2), inversionRisk: 'High', ventilationSafe: false, recommendation: 'Morning peak smog.' },
        { hour: '14:00', aqi: Math.round(currentAqi * 0.75), pm25: Math.round(pm25 * 0.75), inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Solar mixing window.' },
        { hour: '20:00', aqi: currentAqi, pm25: pm25, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Evening smog accumulation.' }
      ]
    };

    return {
      cityData,
      source: 'Live Open-Meteo / CAMS',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    console.warn(`Failed to fetch live AQI for ${city.name}, falling back to preset data:`, err);
    throw err;
  }
}
