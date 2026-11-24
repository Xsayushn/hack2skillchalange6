import {
  CityData,
  AqiCategory,
  UserFamilyProfile,
  VulnerabilityLevel,
  CommuteMode,
} from '../types/aqi';

/**
 * Illustrative offline demo presets.
 * Note: These presets represent historical winter smog baseline examples for demonstration
 * purposes when offline. They are NOT live physical sensor measurements.
 */
const OFFLINE_CITY_PRESETS: CityData[] = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    country: 'India',
    currentAqi: 382,
    category: 'Very Unhealthy',
    pollutants: {
      pm25: 295,
      pm10: 420,
      no2: 84,
      o3: 35,
      co: 2.8,
      so2: 18,
    },
    temperatureC: 16,
    humidityPct: 78,
    estimatedStagnationRisk: 'High',
    stagnationExplanation:
      'Regional meteorological stagnation and shallow boundary layer trapping combustion exhaust and dust (historical baseline example).',
    hourlyForecast: [
      {
        time: '2026-11-23T06:00',
        hour: '06:00',
        aqi: 425,
        pm25: 340,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation:
          'Severe smog accumulation. Natural ventilation not viable. Rely on mechanical indoor filtration.',
      },
      {
        time: '2026-11-23T09:00',
        hour: '09:00',
        aqi: 395,
        pm25: 305,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Morning commuter traffic exhaust. Keep windows closed.',
      },
      {
        time: '2026-11-23T12:00',
        hour: '12:00',
        aqi: 320,
        pm25: 240,
        stagnationRisk: 'Medium',
        ventilationViable: false,
        recommendation:
          'Solar convection slightly improves boundary mixing, but ambient particulate remains hazardous.',
      },
      {
        time: '2026-11-23T14:00',
        hour: '14:00',
        aqi: 285,
        pm25: 210,
        stagnationRisk: 'Medium',
        ventilationViable: false,
        recommendation: 'Ambient AQI > 200. Natural ventilation not viable; keep windows sealed.',
      },
      {
        time: '2026-11-23T17:00',
        hour: '17:00',
        aqi: 340,
        pm25: 260,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Evening temperature drop increases surface-layer stagnation.',
      },
      {
        time: '2026-11-23T20:00',
        hour: '20:00',
        aqi: 410,
        pm25: 325,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Dense evening particulate accumulation. Avoid outdoor activities.',
      },
    ],
    sourceType: 'offline_preset',
    isWeatherEstimated: true,
    attribution: 'Illustrative offline demo preset (Historical winter baseline)',
    lat: 28.6139,
    lon: 77.209,
  },
  {
    id: 'lahore',
    name: 'Lahore',
    country: 'Pakistan',
    currentAqi: 415,
    category: 'Hazardous',
    pollutants: {
      pm25: 330,
      pm10: 490,
      no2: 92,
      o3: 28,
      co: 3.2,
      so2: 24,
    },
    temperatureC: 15,
    humidityPct: 82,
    estimatedStagnationRisk: 'High',
    stagnationExplanation:
      'Low surface wind velocity and transboundary agricultural aerosol trapping (historical baseline example).',
    hourlyForecast: [
      {
        time: '2026-11-23T06:00',
        hour: '06:00',
        aqi: 440,
        pm25: 360,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Hazardous particulate levels. Windows strictly locked.',
      },
      {
        time: '2026-11-23T12:00',
        hour: '12:00',
        aqi: 360,
        pm25: 280,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Severe pollution. Airing not recommended.',
      },
      {
        time: '2026-11-23T15:00',
        hour: '15:00',
        aqi: 310,
        pm25: 230,
        stagnationRisk: 'Medium',
        ventilationViable: false,
        recommendation: 'Pollution remains severe despite afternoon solar heating.',
      },
      {
        time: '2026-11-23T20:00',
        hour: '20:00',
        aqi: 435,
        pm25: 350,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Surface-layer nocturnal stagnation.',
      },
    ],
    sourceType: 'offline_preset',
    isWeatherEstimated: true,
    attribution: 'Illustrative offline demo preset (Historical winter baseline)',
    lat: 31.5204,
    lon: 74.3587,
  },
  {
    id: 'beijing',
    name: 'Beijing',
    country: 'China',
    currentAqi: 158,
    category: 'Unhealthy',
    pollutants: {
      pm25: 68,
      pm10: 110,
      no2: 45,
      o3: 40,
      co: 1.1,
      so2: 9,
    },
    temperatureC: 4,
    humidityPct: 45,
    estimatedStagnationRisk: 'Medium',
    stagnationExplanation:
      'Basin orography with northern mountain containment of industrial emissions (historical baseline example).',
    hourlyForecast: [
      {
        time: '2026-11-23T06:00',
        hour: '06:00',
        aqi: 175,
        pm25: 80,
        stagnationRisk: 'Medium',
        ventilationViable: false,
        recommendation: 'Cold morning air. Wear N95 respirator during outdoor transit.',
      },
      {
        time: '2026-11-23T12:00',
        hour: '12:00',
        aqi: 140,
        pm25: 55,
        stagnationRisk: 'Low',
        ventilationViable: false,
        recommendation: 'AQI > 100: Sensitive individuals maintain indoor filtration.',
      },
      {
        time: '2026-11-23T18:00',
        hour: '18:00',
        aqi: 165,
        pm25: 72,
        stagnationRisk: 'Medium',
        ventilationViable: false,
        recommendation: 'Evening heating emissions rising.',
      },
    ],
    sourceType: 'offline_preset',
    isWeatherEstimated: true,
    attribution: 'Illustrative offline demo preset (Historical winter baseline)',
    lat: 39.9042,
    lon: 116.4074,
  },
  {
    id: 'milan',
    name: 'Milan (Po Valley)',
    country: 'Italy',
    currentAqi: 122,
    category: 'Unhealthy for Sensitive Groups',
    pollutants: {
      pm25: 44,
      pm10: 68,
      no2: 52,
      o3: 20,
      co: 0.9,
      so2: 5,
    },
    temperatureC: 7,
    humidityPct: 88,
    estimatedStagnationRisk: 'Medium',
    stagnationExplanation:
      'Topographic bowl effect of Po Valley trapping biomass heating and vehicular emissions (historical baseline example).',
    hourlyForecast: [
      {
        time: '2026-11-23T07:00',
        hour: '07:00',
        aqi: 145,
        pm25: 54,
        stagnationRisk: 'High',
        ventilationViable: false,
        recommendation: 'Valley radiation fog trapping pollutants. Keep windows closed.',
      },
      {
        time: '2026-11-23T13:00',
        hour: '13:00',
        aqi: 95,
        pm25: 32,
        stagnationRisk: 'Low',
        ventilationViable: true,
        recommendation:
          'Midday convective mixing reduces local concentration. Brief 15m aeration viable.',
      },
      {
        time: '2026-11-23T19:00',
        hour: '19:00',
        aqi: 135,
        pm25: 48,
        stagnationRisk: 'Medium',
        ventilationViable: false,
        recommendation: 'Nocturnal boundary layer lowering.',
      },
    ],
    sourceType: 'offline_preset',
    isWeatherEstimated: true,
    attribution: 'Illustrative offline demo preset (Historical winter baseline)',
    lat: 45.4642,
    lon: 9.19,
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'USA',
    currentAqi: 78,
    category: 'Moderate',
    pollutants: {
      pm25: 25,
      pm10: 42,
      no2: 38,
      o3: 65,
      co: 0.7,
      so2: 2,
    },
    temperatureC: 19,
    humidityPct: 55,
    estimatedStagnationRisk: 'Low',
    stagnationExplanation:
      'Coastal sea-breeze dispersion with localized highway corridor emission (historical baseline example).',
    hourlyForecast: [
      {
        time: '2026-11-23T08:00',
        hour: '08:00',
        aqi: 65,
        pm25: 18,
        stagnationRisk: 'Low',
        ventilationViable: true,
        recommendation: 'Moderate ambient air. Natural ventilation viable.',
      },
      {
        time: '2026-11-23T14:00',
        hour: '14:00',
        aqi: 92,
        pm25: 30,
        stagnationRisk: 'Low',
        ventilationViable: true,
        recommendation: 'Midday photochemical ozone rise. Sensitive groups monitor symptoms.',
      },
      {
        time: '2026-11-23T20:00',
        hour: '20:00',
        aqi: 70,
        pm25: 22,
        stagnationRisk: 'Low',
        ventilationViable: true,
        recommendation: 'Clean evening onshore breeze.',
      },
    ],
    sourceType: 'offline_preset',
    isWeatherEstimated: true,
    attribution: 'Illustrative offline demo preset (Historical winter baseline)',
    lat: 34.0522,
    lon: -118.2437,
  },
];

// Offline examples contain pollutant and AQI values only. Do not infer a
// meteorological stagnation risk or repeat historical causal claims as current data.
export const CITIES_DATA: CityData[] = OFFLINE_CITY_PRESETS.map((city) => ({
  ...city,
  estimatedStagnationRisk: 'Unknown',
  stagnationExplanation:
    'Surface stagnation is not assessed: this offline example has no current wind or vertical-profile data.',
  hourlyForecast: city.hourlyForecast.map((hour) => ({
    ...hour,
    stagnationRisk: 'Unknown',
    recommendation:
      hour.ventilationViable === null
        ? 'Ventilation guidance is unavailable because forecast AQI is missing.'
        : hour.ventilationViable
          ? `Illustrative preset only: AQI ${hour.aqi ?? 'unavailable'} is within this app’s brief-ventilation guidance threshold.`
          : `Illustrative preset only: AQI ${hour.aqi ?? 'unavailable'} exceeds this app’s ventilation guidance threshold.`,
  })),
}));

export function getAqiCategory(aqi: number | null): {
  category: AqiCategory;
  color: string;
  advice: string;
} {
  if (aqi === null || typeof aqi !== 'number' || isNaN(aqi)) {
    return {
      category: 'Unknown',
      color: '#64748B',
      advice: 'Air quality data is currently unavailable.',
    };
  }
  if (aqi <= 50)
    return {
      category: 'Good',
      color: '#10B981',
      advice: 'Air quality is satisfactory based on US-EPA benchmarks.',
    };
  if (aqi <= 100)
    return {
      category: 'Moderate',
      color: '#F59E0B',
      advice: 'Acceptable ambient air; unusually sensitive individuals should monitor symptoms.',
    };
  if (aqi <= 150)
    return {
      category: 'Unhealthy for Sensitive Groups',
      color: '#F97316',
      advice:
        'Children, elderly, and respiratory patients should reduce prolonged outdoor exertion.',
    };
  if (aqi <= 200)
    return {
      category: 'Unhealthy',
      color: '#EF4444',
      advice:
        'Increased likelihood of adverse effects; general public should avoid strenuous outdoor exertion.',
    };
  if (aqi <= 300)
    return {
      category: 'Very Unhealthy',
      color: '#8B5CF6',
      advice: 'Health alert: significant health risk for all occupants. Rely on indoor filtration.',
    };
  return {
    category: 'Hazardous',
    color: '#7F1D1D',
    advice:
      'Health warning of emergency conditions: entire population is likely to be affected. Keep indoor air sealed.',
  };
}

/**
 * Validates and converts an unknown value to a finite number, preserving zero.
 */
export const num = (v: unknown, d: number): number =>
  typeof v === 'number' && Number.isFinite(v)
    ? v
    : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))
      ? Number(v)
      : d;

/**
 * Creates a custom city entry from user manual input.
 * CRITICAL SCIENTIFIC INTEGRITY: Does NOT fabricate speciation (PM2.5, PM10, NO2, O3, CO, SO2)
 * or hourly forecast curves from a single scalar AQI value. Those fields remain unavailable.
 */
export function createCustomCity(
  name: string,
  aqi: number,
  country: string = 'Manual Entry'
): CityData {
  const safeAqi = Math.max(0, Math.min(500, Math.round(num(aqi, 100))));
  const { category } = getAqiCategory(safeAqi);

  return {
    id: `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'city'}-${Date.now()}`,
    name: name.trim() || 'Custom Location',
    country: country.trim() || 'Manual Entry',
    currentAqi: safeAqi,
    category,
    pollutants: {
      pm25: null,
      pm10: null,
      no2: null,
      o3: null,
      co: null,
      so2: null,
    },
    temperatureC: null,
    humidityPct: null,
    estimatedStagnationRisk: 'Unknown',
    stagnationExplanation:
      'Manually entered AQI value. Meteorological telemetry, vertical atmospheric sounding, and individual chemical pollutant speciations are not available for this custom entry.',
    hourlyForecast: [],
    sourceType: 'manual_estimate',
    isWeatherEstimated: true,
    attribution: 'User manual estimate (No external API coordinates attached)',
    isCustomCity: true,
  };
}

const VALID_VULNERABILITIES: VulnerabilityLevel[] = [
  'Infant/Child',
  'Elderly',
  'Respiratory/Asthma',
  'Pregnant',
  'Outdoor Worker',
  'General',
];

const VALID_COMMUTE_MODES: CommuteMode[] = [
  'Private Car',
  'Carpool',
  'Metro/Bus',
  'EV/Electric',
  'Active (Bicycle/Walk)',
];

/**
 * Validates household profile data retrieved from untrusted storage (e.g. localStorage).
 */
export function validateHouseholdProfile(data: unknown): UserFamilyProfile {
  const fallback: UserFamilyProfile = {
    name: 'My Household',
    cityId: 'delhi',
    vulnerabilities: ['Infant/Child', 'Respiratory/Asthma'],
    dailyCommuteMode: 'Private Car',
    commuteDistanceKm: 18,
    hasAirPurifier: true,
    homeType: 'Apartment',
    childrenCount: 1,
    elderlyCount: 1,
  };

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const p = data as Record<string, unknown>;

  const name =
    typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 50) : fallback.name;
  const cityId =
    typeof p.cityId === 'string' && p.cityId.trim() ? p.cityId.trim() : fallback.cityId;

  const vulnerabilities: VulnerabilityLevel[] = Array.isArray(p.vulnerabilities)
    ? p.vulnerabilities.filter((v): v is VulnerabilityLevel =>
        VALID_VULNERABILITIES.includes(v as VulnerabilityLevel)
      )
    : fallback.vulnerabilities;

  const dailyCommuteMode: CommuteMode = VALID_COMMUTE_MODES.includes(
    p.dailyCommuteMode as CommuteMode
  )
    ? (p.dailyCommuteMode as CommuteMode)
    : fallback.dailyCommuteMode;

  const rawDistance = Number(p.commuteDistanceKm);
  const commuteDistanceKm =
    !isNaN(rawDistance) && isFinite(rawDistance)
      ? Math.max(0.5, Math.min(200, rawDistance))
      : fallback.commuteDistanceKm;

  const hasAirPurifier =
    typeof p.hasAirPurifier === 'boolean' ? p.hasAirPurifier : fallback.hasAirPurifier;
  const homeType = p.homeType === 'Independent House' ? 'Independent House' : 'Apartment';

  const rawChildren = Number(p.childrenCount);
  const childrenCount =
    !isNaN(rawChildren) && isFinite(rawChildren)
      ? Math.max(0, Math.min(10, Math.floor(rawChildren)))
      : fallback.childrenCount;

  const rawElderly = Number(p.elderlyCount);
  const elderlyCount =
    !isNaN(rawElderly) && isFinite(rawElderly)
      ? Math.max(0, Math.min(10, Math.floor(rawElderly)))
      : fallback.elderlyCount;

  return {
    name,
    cityId,
    vulnerabilities,
    dailyCommuteMode,
    commuteDistanceKm,
    hasAirPurifier,
    homeType,
    childrenCount,
    elderlyCount,
  };
}
