export type AqiCategory = 
  | 'Good' 
  | 'Moderate' 
  | 'Unhealthy for Sensitive Groups' 
  | 'Unhealthy' 
  | 'Very Unhealthy' 
  | 'Hazardous';

export interface PollutantValues {
  pm25: number;   // µg/m³
  pm10: number;   // µg/m³
  no2: number;    // ppb
  o3: number;     // ppb
  co: number;     // ppm
  so2: number;    // ppb
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
}

export type VulnerabilityLevel = 'Infant/Child' | 'Elderly' | 'Respiratory/Asthma' | 'Pregnant' | 'Outdoor Worker' | 'General';

export interface UserFamilyProfile {
  name: string;
  cityId: string;
  vulnerabilities: VulnerabilityLevel[];
  dailyCommuteMode: 'Private Car' | 'Carpool' | 'Metro/Bus' | 'EV/Electric' | 'Active (Bicycle/Walk)';
  commuteDistanceKm: number;
  hasAirPurifier: boolean;
  homeType: 'Apartment' | 'Independent House';
  childrenCount: number;
  elderlyCount: number;
}

export interface RoutineItem {
  id: string;
  timeSlot: string; // e.g., "07:00 - 08:30"
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
