export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Unknown';

export type DataSourceType =
  'live_cams_model' | 'cached_cams_model' | 'offline_preset' | 'manual_estimate';

export type StagnationRiskLevel = 'Low' | 'Medium' | 'High' | 'Unknown';

/**
 * Pollutant concentrations with strict nullability.
 * Measurements are reported in standard atmospheric units:
 * PM2.5, PM10, NO2, O3, SO2: µg/m³
 * CO: mg/m³ (converted from API's µg/m³ where 1 mg = 1000 µg)
 */
export interface PollutantValues {
  pm25: number | null; // µg/m³
  pm10: number | null; // µg/m³
  no2: number | null; // µg/m³
  o3: number | null; // µg/m³
  co: number | null; // mg/m³
  so2: number | null; // µg/m³
}

export interface HourlyForecast {
  time: string; // Full ISO/API timestamp (e.g., "2026-11-23T15:00")
  hour: string; // Formatted time display (e.g., "15:00")
  aqi: number | null;
  pm25: number | null; // µg/m³ hourly model prediction
  stagnationRisk: StagnationRiskLevel;
  ventilationViable: boolean | null;
  recommendation: string;
}

export interface CityData {
  id: string;
  name: string;
  country: string;
  currentAqi: number | null;
  category: AqiCategory;
  pollutants: PollutantValues;
  temperatureC: number | null;
  humidityPct: number | null;
  estimatedStagnationRisk: StagnationRiskLevel;
  stagnationExplanation: string;
  hourlyForecast: HourlyForecast[];
  sourceType: DataSourceType;
  isWeatherEstimated: boolean;
  attribution: string;
  lastUpdatedTime?: string;
  timezone?: string;
  utcOffsetSeconds?: number;
  isCustomCity?: boolean;
  lat?: number;
  lon?: number;
}

export type VulnerabilityLevel =
  'Infant/Child' | 'Elderly' | 'Respiratory/Asthma' | 'Pregnant' | 'Outdoor Worker' | 'General';

export type CommuteMode =
  'Private Car' | 'Carpool' | 'Metro/Bus' | 'EV/Electric' | 'Active (Bicycle/Walk)';

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
  timeSlot: string;
  title: string;
  originalAction: string;
  ecoCleanAction: string;
  emissionSavedKgCo2: number;
  exposureAvoidedPm25Ug: number;
  healthBenefit: string;
  isAdopted: boolean;
  assumptions: string;
}

export interface UserImpactMetrics {
  estimatedInhaledMassSavedUg: number; // Inhaled PM2.5 mass reduction (µg)
  transportCo2SavedKg: number; // Commute round-trip CO2 delta (kg)
  adoptedRoutinesCount: number;
  calculationAssumptions: {
    adultRestVentilationM3Hr: number;
    adultExertionVentilationM3Hr: number;
    n95FiltrationEfficiencyPct: number;
    commuteDistanceKm: number;
    commuteMode: CommuteMode;
    baselineEmissionFactorKgKm: number;
    cleanTransitEmissionFactorKgKm: number;
  };
}
