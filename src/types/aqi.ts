export type AqiCategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface PollutantValues {
  pm25: number;   // µg/m³ (WHO 2021 Guideline: 15 µg/m³ 24-hr)
  pm10: number;   // µg/m³ (WHO 2021 Guideline: 45 µg/m³ 24-hr)
  no2: number;    // µg/m³ (WHO 2021 Guideline: 25 µg/m³ 24-hr)
  o3: number;     // µg/m³ (WHO 2021 Guideline: 100 µg/m³ 8-hr peak)
  co: number;     // mg/m³ (WHO 2021 Guideline: 4 mg/m³ 24-hr)
  so2: number;    // µg/m³ (WHO 2021 Guideline: 40 µg/m³ 24-hr)
}

export interface HourlyForecast {
  hour: string; // e.g. "06:00"
  aqi: number;
  pm25: number;
  inversionRisk: 'High' | 'Medium' | 'Low';
  ventilationSafe: boolean;
  recommendation: string;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  currentAqi: number;
  category: AqiCategory;
  pollutants: PollutantValues;
  temperatureC: number;
  humidityPct: number;
  inversionLayerActive: boolean;
  primarySmogSource: string;
  hourlyForecast: HourlyForecast[];
  isLiveModel?: boolean;
  isWeatherEstimated?: boolean;
  attribution?: string;
  lastUpdatedTime?: string;
}

export type VulnerabilityLevel = 'Infant/Child' | 'Elderly' | 'Respiratory/Asthma' | 'Pregnant' | 'Outdoor Worker' | 'General';

export type CommuteMode = 'Private Car' | 'Carpool' | 'Metro/Bus' | 'EV/Electric' | 'Active (Bicycle/Walk)';

export interface UserFamilyProfile {
  name: string;
  cityId: string;
  vulnerabilities: VulnerabilityLevel[];
  dailyCommuteMode: CommuteMode;
  commuteDistanceKm: number;
  hasAirPurifier: boolean;
  homeType: 'Apartment' | 'Independent House';
  childrenCount: number;
  elderlyCount: number;
}

export interface RoutineItem {
  id: string;
  timeSlot: string; // e.g., "08:00 - 09:30"
  title: string;
  originalAction: string;
  ecoCleanAction: string;
  emissionSavedKgCo2: number;
  exposureAvoidedPm25Ug: number;
  healthBenefit: string;
  isAdopted: boolean;
}

export interface UserImpactMetrics {
  totalCo2SavedKg: number;
  totalPm25AvoidedUg: number;
  equivalentTreesPlanted: number;
  cleanAirHoursGained: number;
  communityRankPercentile: number;
}
