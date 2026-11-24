import { UserFamilyProfile, RoutineItem, UserImpactMetrics, CommuteMode } from '../types/aqi';

/**
 * Rigorous Impact Calculation Service
 *
 * Provides defensible, transparent calculations for:
 * 1. Estimated inhaled PM2.5 mass reduction (µg) across behavioral routine adjustments.
 * 2. Transportation CO2 emission deltas (kg CO2) based on EPA & DEFRA conversion factors.
 *
 * Scientific Disclaimers:
 * - Inhaled PM2.5 mass estimates the quantity of ambient particulate drawn into the respiratory tract.
 *   It does NOT represent a clinical lung-deposited dose (which depends on particle aerodynamic diameter,
 *   hygroscopic growth, airway geometry, and individual lung clearance).
 * - N95 respirator calculations assume a sealed, leak-free continuous perimeter fit achieving ~95%
 *   particulate filtration. Real-world poorly fitted respirators or cloth masks achieve significantly
 *   lower filtration efficiencies.
 * - Transportation calculations model the direct tailpipe/operational CO2 emission delta between
 *   the user's reported commute mode and electrified mass transit over the reported round-trip distance.
 */

// Adult minute ventilation rates based on US EPA Exposure Factors Handbook (2011):
// Resting/light activity: ~10 L/min = 0.60 m³/hr
// Moderate exertion / brisk walk: ~35 L/min = 2.10 m³/hr
export const VENTILATION_RATES = {
  REST_M3_HR: 0.6,
  EXERTION_M3_HR: 2.1,
};

// Passenger vehicle operational emission factors (kg CO2 per passenger-km)
// Sources: US EPA Emission Factors for Greenhouse Gas Inventories & UK DEFRA Conversion Factors
export const EMISSIONS_FACTOR_KG_CO2_PER_KM: Record<CommuteMode, number> = {
  'Private Car': 0.192, // Average petrol/diesel passenger car (single occupant)
  Carpool: 0.075, // Shared passenger car (assumed average 2.5 occupants)
  'Metro/Bus': 0.038, // Electrified mass transit per passenger-km
  'EV/Electric': 0.045, // Grid-charged battery electric vehicle (average grid intensity)
  'Active (Bicycle/Walk)': 0.0, // Zero operational tailpipe emissions
};

/**
 * Calculates estimated inhaled PM2.5 mass in micrograms (µg).
 */
export function calculateDailyInhaledDose(
  pm25ConcentrationUgM3: number | null,
  hoursOutdoor: number,
  isExertion: boolean,
  isN95Fitted: boolean
): number {
  if (pm25ConcentrationUgM3 === null || pm25ConcentrationUgM3 <= 0 || hoursOutdoor <= 0) {
    return 0;
  }
  const ventilationRate = isExertion
    ? VENTILATION_RATES.EXERTION_M3_HR
    : VENTILATION_RATES.REST_M3_HR;
  const penetrationFraction = isN95Fitted ? 0.05 : 1.0;
  return Number(
    (pm25ConcentrationUgM3 * ventilationRate * hoursOutdoor * penetrationFraction).toFixed(1)
  );
}

// Backwards-compatible alias for backward compatibility with existing tests
export const calculateEstimatedInhaledMass = calculateDailyInhaledDose;

/**
 * Calculates round-trip commute CO2 delta against electrified mass transit.
 */
export function calculateCommuteCo2Delta(
  currentMode: CommuteMode,
  oneWayDistanceKm: number
): { savedCo2Kg: number; baselineFactor: number; transitFactor: number; roundTripKm: number } {
  const roundTripKm = Math.max(0, oneWayDistanceKm * 2);
  const baselineFactor = EMISSIONS_FACTOR_KG_CO2_PER_KM[currentMode] ?? 0.192;
  const transitFactor = EMISSIONS_FACTOR_KG_CO2_PER_KM['Metro/Bus'];
  const saved = Math.max(0, roundTripKm * (baselineFactor - transitFactor));
  return {
    savedCo2Kg: Number(saved.toFixed(2)),
    baselineFactor,
    transitFactor,
    roundTripKm,
  };
}

/**
 * Generates transparent daily routines based on current model PM2.5 readings, AQI,
 * and user profile parameters without fabricating unsubstantiated constants.
 */
export function generateDailyRoutines(
  profile: UserFamilyProfile,
  _currentAqi: number | null,
  pm25: number | null
): RoutineItem[] {
  const distance = Number.isFinite(profile.commuteDistanceKm)
    ? Math.max(0, profile.commuteDistanceKm)
    : 15;
  const currentMode = profile.dailyCommuteMode || 'Private Car';
  const { savedCo2Kg, baselineFactor, transitFactor, roundTripKm } = calculateCommuteCo2Delta(
    currentMode,
    distance
  );

  const hasPm25 = pm25 !== null && Number.isFinite(pm25) && pm25 >= 0;
  const modeledPm25 = hasPm25 ? pm25 : null;

  // Indoor PM2.5 and filtration performance are not measured, so exercise savings are not quantified.
  const exerciseExposureSaved = 0;

  // Commute exposure saved: In-traffic unmasked commute (~1 hr at 1.0 m³/hr) vs filtered mass transit with N95
  const commuteInhaledOutdoor = calculateDailyInhaledDose(modeledPm25, 1.0, false, false);
  const commuteInhaledProtected = calculateDailyInhaledDose(modeledPm25, 1.0, false, true);
  const commuteExposureSaved = Math.round(
    Math.max(0, commuteInhaledOutdoor - commuteInhaledProtected)
  );
  const commuteExposureAssumption = hasPm25
    ? `Exposure estimate assumes one hour at modeled ambient PM2.5 (${pm25} µg/m³), resting ventilation, and a continuously fitted N95; it is not an in-vehicle or route measurement.`
    : 'No commute exposure estimate: ambient PM2.5 is unavailable.';

  const commuteActionText =
    currentMode === 'Active (Bicycle/Walk)'
      ? 'Maintain zero-emission active travel, but wear a sealed N95 respirator during high-pollution periods to prevent particulate inhalation.'
      : currentMode === 'Metro/Bus'
        ? 'Continue using electrified mass transit. Board away from diesel engine exhausts and platform brake-dust zones.'
        : 'Transition round-trip commute from solo private vehicle to electrified mass transit (or carpool with cabin air recirculation).';

  return [
    {
      id: 'routine-commute',
      timeSlot: '08:00 - 09:30',
      title: 'Low-Emission Commute Optimization',
      originalAction:
        currentMode === 'Private Car'
          ? `Solo driving (${roundTripKm} km round-trip) emitting ~${(roundTripKm * baselineFactor).toFixed(2)} kg CO2`
          : `${currentMode} transit (${roundTripKm} km round-trip)`,
      ecoCleanAction: commuteActionText,
      emissionSavedKgCo2: savedCo2Kg,
      exposureAvoidedPm25Ug: commuteExposureSaved,
      healthBenefit:
        'Reduces direct roadway nitrogen dioxide (NO2) and diesel particulate exposure.',
      isAdopted: false,
      assumptions: `CO₂ estimate: ${baselineFactor} kg/km (${currentMode}) vs ${transitFactor} kg/km (Metro/Bus) over ${roundTripKm} km round-trip. ${commuteExposureAssumption}`,
    },
    {
      id: 'routine-morning-exercise',
      timeSlot: '06:30 - 07:30',
      title: 'Indoor Smog-Safe Cardio Substitution',
      originalAction: 'Outdoor aerobic jogging/cycling during peak surface-layer stagnation hours',
      ecoCleanAction:
        'Shift aerobic cardio indoors with mechanical air filtration running; avoid outdoor heavy breathing.',
      emissionSavedKgCo2: 0.0,
      exposureAvoidedPm25Ug: exerciseExposureSaved,
      healthBenefit:
        'Prevents high-volume inhalation of coarse and fine soot during heavy aerobic minute ventilation (2.1 m³/hr).',
      isAdopted: false,
      assumptions:
        'Indoor PM2.5 concentration and filtration performance are not measured, so avoided inhaled mass is not quantified.',
    },
    {
      id: 'routine-cooking',
      timeSlot: '19:00 - 20:00',
      title: 'Kitchen Source Isolation & Range Hood Ventilation',
      originalAction: 'Unventilated frying or high-heat oil cooking with open interior doors',
      ecoCleanAction:
        'Operate ducted range hood on high; isolate kitchen from living and sleeping quarters.',
      emissionSavedKgCo2: 0.0,
      exposureAvoidedPm25Ug: 0,
      healthBenefit:
        'Mitigates indoor concentration spikes of acrolein, ultrafine oil droplets, and carbon monoxide.',
      isAdopted: false,
      assumptions:
        'Indoor cooking PM2.5 before and after range-hood use is not measured, so avoided inhaled mass is not quantified.',
    },
    {
      id: 'routine-heating',
      timeSlot: '20:30 - 22:30',
      title: 'Clean Radiant Heating vs Solid Fuel Combustion',
      originalAction: 'Open fireplace, wood stove, or unvented fuel burner',
      ecoCleanAction:
        'Use sealed electric radiant heating, draft-proof exterior doors, and thermal window curtains.',
      emissionSavedKgCo2: 0,
      exposureAvoidedPm25Ug: 0,
      healthBenefit:
        'Eliminates household generation of toxic polycyclic aromatic hydrocarbons (PAHs) and carbon monoxide.',
      isAdopted: false,
      assumptions:
        'Heating fuel use, local electricity emissions, and indoor PM2.5 are not measured, so CO₂ and exposure savings are not quantified.',
    },
  ];
}

/**
 * Computes defensible aggregate impact metrics based strictly on adopted routines.
 *
 * Integrity constraints:
 * - NO artificial purifier multipliers (e.g. 1.4).
 * - NO arbitrary family-count multipliers.
 * - NO invented tree absorption formulas.
 * - NO artificial clean-air hours or community percentiles.
 * - All calculation assumptions are explicitly returned for transparent display.
 */
export function computeOverallImpact(
  routines: RoutineItem[],
  profile: UserFamilyProfile
): UserImpactMetrics {
  const adopted = routines.filter((r) => r.isAdopted);

  const totalInhaledMassSaved = adopted.reduce((acc, curr) => acc + curr.exposureAvoidedPm25Ug, 0);
  const totalCo2Saved = adopted.reduce((acc, curr) => acc + curr.emissionSavedKgCo2, 0);

  const commuteDistance = Math.max(0, profile.commuteDistanceKm || 0);
  const baselineFactor = EMISSIONS_FACTOR_KG_CO2_PER_KM[profile.dailyCommuteMode] ?? 0.192;
  const cleanTransitFactor = EMISSIONS_FACTOR_KG_CO2_PER_KM['Metro/Bus'];

  return {
    estimatedInhaledMassSavedUg: Math.round(totalInhaledMassSaved),
    transportCo2SavedKg: Number(totalCo2Saved.toFixed(2)),
    adoptedRoutinesCount: adopted.length,
    calculationAssumptions: {
      adultRestVentilationM3Hr: VENTILATION_RATES.REST_M3_HR,
      adultExertionVentilationM3Hr: VENTILATION_RATES.EXERTION_M3_HR,
      n95FiltrationEfficiencyPct: 95,
      commuteDistanceKm: commuteDistance,
      commuteMode: profile.dailyCommuteMode,
      baselineEmissionFactorKgKm: baselineFactor,
      cleanTransitEmissionFactorKgKm: cleanTransitFactor,
    },
  };
}
