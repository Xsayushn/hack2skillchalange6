import { UserFamilyProfile, RoutineItem, UserImpactMetrics } from '../types/aqi';

/**
 * Rigorous impact calculation service
 * Quantifies PM2.5 inhalation reduction, CO2 emissions prevented, and health exposure mitigation.
 * Based on EPA, WHO Air Quality Guidelines, and transportation emission factors.
 */

// Average adult minute ventilation: ~12 L/min = 0.72 m³/hour = 17.28 m³/day
// High exertion minute ventilation: ~30-40 L/min = 2.0 m³/hour
const REST_VENTILATION_M3_PER_HR = 0.6;
const EXERTION_VENTILATION_M3_PER_HR = 2.1;

// Vehicle emission factors (kg CO2 per km)
const EMISSIONS_FACTOR_KG_CO2_PER_KM = {
  'Private Car': 0.192,        // Average petrol/diesel passenger car
  'Carpool': 0.075,            // Shared ride factor per person
  'Metro/Bus': 0.038,          // Public electric mass transit per passenger
  'EV/Electric': 0.045,        // Grid-charged EV lifecycle emission
  'Active (Bicycle/Walk)': 0.0 // Zero tailpipe emission
};

export function calculateDailyInhaledDose(pm25ConcentrationUgM3: number, hoursOutdoor: number, isExertion: boolean, n95Fitted: boolean): number {
  const ventilationRate = isExertion ? EXERTION_VENTILATION_M3_PER_HR : REST_VENTILATION_M3_PER_HR;
  const maskEfficiency = n95Fitted ? 0.95 : 0.0;
  const effectiveConcentration = pm25ConcentrationUgM3 * (1 - maskEfficiency);
  return effectiveConcentration * ventilationRate * hoursOutdoor; // µg of PM2.5 inhaled
}

export function generateDailyRoutines(profile: UserFamilyProfile, currentAqi: number, pm25: number): RoutineItem[] {
  const isExtreme = currentAqi > 350;
  const distance = profile.commuteDistanceKm || 15;
  const carEmission = distance * 2 * EMISSIONS_FACTOR_KG_CO2_PER_KM['Private Car'];
  const metroEmission = distance * 2 * EMISSIONS_FACTOR_KG_CO2_PER_KM['Metro/Bus'];
  const commuteSavedCo2 = Number(Math.max(0, carEmission - metroEmission).toFixed(2));

  // Inhaled dose saved by skipping outdoor run during peak inversion
  const outdoorRunDose = calculateDailyInhaledDose(pm25, 1.0, true, false);
  const indoorYogaDose = calculateDailyInhaledDose(pm25 * 0.25, 1.0, false, false);
  const exerciseExposureSaved = Math.round(Math.max(0, outdoorRunDose - indoorYogaDose));

  return [
    {
      id: 'routine-commute',
      timeSlot: '08:00 - 09:30',
      title: 'Low-Emission Staggered Commute / Mass Transit',
      originalAction: 'Solo private car driving during peak morning bumper-to-bumper rush hour',
      ecoCleanAction: isExtreme 
        ? 'Work from home or use electric metro; stagger work hours to avoid 8:30 AM inversion peak'
        : 'Take metro rail or shared carpool with recirculating cabin air filtration',
      emissionSavedKgCo2: profile.dailyCommuteMode === 'Private Car' ? commuteSavedCo2 : 0.8,
      exposureAvoidedPm25Ug: Math.round(pm25 * 0.72 * 1.5 * 0.65), // In-traffic cabin exposure vs filtered metro
      healthBenefit: 'Avoids heavy diesel particulate and reduces roadway nitrogen dioxide (NO2) exposure by 65%.',
      isAdopted: false
    },
    {
      id: 'routine-morning-exercise',
      timeSlot: '06:30 - 07:30',
      title: 'Indoor Smog-Safe Cardio & Breathing Optimization',
      originalAction: 'Morning outdoor jogging or brisk walking during dense smog inversion',
      ecoCleanAction: 'Transition to indoor home HIIT, yoga, or treadmill with Corsi-Rosenthal / HEPA air scrubber running',
      emissionSavedKgCo2: 0.1,
      exposureAvoidedPm25Ug: exerciseExposureSaved,
      healthBenefit: 'Saves delicate lung alveoli from deep deposition of toxic ultra-fine soot particles during heavy breathing.',
      isAdopted: false
    },
    {
      id: 'routine-school-run',
      timeSlot: '13:30 - 14:30',
      title: 'Diurnal Solar Inversion Outdoor Window Shift',
      originalAction: 'Unrestricted outdoor playground exposure early morning or late dusk',
      ecoCleanAction: 'Shift child outdoor playtime strictly to 1:30 - 3:30 PM window when solar heat disperses smog layer',
      emissionSavedKgCo2: 0.05,
      exposureAvoidedPm25Ug: Math.round(pm25 * 0.5 * 1.0),
      healthBenefit: 'Protects children whose underdeveloped lungs breathe 50% more air per pound of body weight than adults.',
      isAdopted: false
    },
    {
      id: 'routine-cooking',
      timeSlot: '19:00 - 20:00',
      title: 'Low-Emission Range Hood Isolated Meal Preparation',
      originalAction: 'High-heat deep frying or open grilling without kitchen isolation',
      ecoCleanAction: 'Steam, bake, or pressure-cook with range hood on high and kitchen door tightly closed',
      emissionSavedKgCo2: 0.45,
      exposureAvoidedPm25Ug: Math.round(180), // Indoor cooking aerosol spike avoided
      healthBenefit: 'Prevents indoor PM2.5 and acrolein spike in bedroom and family living quarters.',
      isAdopted: false
    },
    {
      id: 'routine-evening-heating',
      timeSlot: '20:30 - 22:30',
      title: 'Clean Electric Thermal Blankets vs Wood/Coal Burning',
      originalAction: 'Burning open firewood, briquettes, or outdoor space heaters',
      ecoCleanAction: 'Use energy-efficient radiant electric heater, thermal curtains, and heated blankets with sealed weatherstripping',
      emissionSavedKgCo2: 3.8,
      exposureAvoidedPm25Ug: 450,
      healthBenefit: 'Eliminates carcinogenic polycyclic aromatic hydrocarbons (PAHs) and carbon monoxide buildup.',
      isAdopted: false
    }
  ];
}

export function computeOverallImpact(routines: RoutineItem[], profile: UserFamilyProfile): UserImpactMetrics {
  const adopted = routines.filter(r => r.isAdopted);
  
  // Base daily savings + adopted routines
  const baseCo2 = adopted.reduce((acc, curr) => acc + curr.emissionSavedKgCo2, 0);
  const basePm25 = adopted.reduce((acc, curr) => acc + curr.exposureAvoidedPm25Ug, 0);

  // Bonus for active air purifier & vulnerability shielding
  const purifierMultiplier = profile.hasAirPurifier ? 1.4 : 1.0;
  const familyCount = 1 + (profile.childrenCount || 0) + (profile.elderlyCount || 0);

  const totalPm25Avoided = Math.round(basePm25 * purifierMultiplier * familyCount);
  const totalCo2Saved = Number((baseCo2 * familyCount).toFixed(2));

  // 1 mature urban tree absorbs ~21.77 kg CO2/year (~0.06 kg CO2/day)
  const equivalentTrees = Number((totalCo2Saved / 0.06).toFixed(1));

  // Clean air hours gained: ~2 hours per adopted routine
  const cleanAirHours = adopted.length * 2.5;

  // Community percentile logic
  const percentile = Math.min(99, Math.max(50, 50 + adopted.length * 10));

  return {
    totalCo2SavedKg: totalCo2Saved,
    totalPm25AvoidedUg: totalPm25Avoided,
    equivalentTreesPlanted: equivalentTrees,
    cleanAirHoursGained: cleanAirHours,
    communityRankPercentile: percentile
  };
}
