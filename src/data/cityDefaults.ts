import { CityData } from '../types/aqi';

export const CITIES_DATA: CityData[] = [
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
    inversionLayerActive: true,
    primarySmogSource: 'Thermal inversion trapping stubble smoke, vehicular exhaust & dust',
    hourlyForecast: [
      { hour: '06:00', aqi: 425, pm25: 340, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Severe smog peak. Keep windows locked. Run purifiers at maximum.' },
      { hour: '09:00', aqi: 395, pm25: 305, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Rush hour smog. Work from home or wear N95 if traveling.' },
      { hour: '12:00', aqi: 320, pm25: 240, inversionRisk: 'Medium', ventilationSafe: false, recommendation: 'Solar heating slightly lifts boundary layer. Moderate outdoor restriction.' },
      { hour: '14:00', aqi: 285, pm25: 210, inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Lowest diurnal smog window (15-min cross-ventilation acceptable if needed).' },
      { hour: '17:00', aqi: 340, pm25: 260, inversionRisk: 'Medium', ventilationSafe: false, recommendation: 'Evening temperature inversion settling in. Seal entryways.' },
      { hour: '20:00', aqi: 410, pm25: 325, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Dense winter ground smog. Avoid all outdoor exertion.' },
      { hour: '23:00', aqi: 430, pm25: 350, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Night inversion peak. Ensure bedroom purifiers are sealed and running.' }
    ]
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
    inversionLayerActive: true,
    primarySmogSource: 'Low wind speeds, industrial emissions & seasonal agricultural burn',
    hourlyForecast: [
      { hour: '06:00', aqi: 440, pm25: 360, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Hazardous conditions. Keep children and seniors indoors.' },
      { hour: '12:00', aqi: 360, pm25: 280, inversionRisk: 'Medium', ventilationSafe: false, recommendation: 'Slight boundary layer dispersion, but AQI remains hazardous.' },
      { hour: '15:00', aqi: 310, pm25: 230, inversionRisk: 'Low', ventilationSafe: false, recommendation: 'Best relative afternoon hour; outdoor activities still discouraged.' },
      { hour: '20:00', aqi: 435, pm25: 350, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Severe night smog trap. Utilize DIY Corsi-Rosenthal filtration.' }
    ]
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
    inversionLayerActive: false,
    primarySmogSource: 'Regional coal heating, northern basin topography & vehicle emissions',
    hourlyForecast: [
      { hour: '06:00', aqi: 175, pm25: 80, inversionRisk: 'Medium', ventilationSafe: false, recommendation: 'Cold morning inversion. Wear N95 for commute.' },
      { hour: '12:00', aqi: 140, pm25: 55, inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Moderate breeze improving dispersion. Quick ventilation allowed.' },
      { hour: '18:00', aqi: 165, pm25: 72, inversionRisk: 'Medium', ventilationSafe: false, recommendation: 'Evening heating increase. Turn on indoor filtration.' }
    ]
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
    inversionLayerActive: true,
    primarySmogSource: 'Po Valley topographic bowl trapping biomass boilers & traffic NO2',
    hourlyForecast: [
      { hour: '07:00', aqi: 145, pm25: 54, inversionRisk: 'High', ventilationSafe: false, recommendation: 'Valley fog trapping pollutants. Vulnerable individuals stay indoor.' },
      { hour: '13:00', aqi: 95, pm25: 32, inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Sunny midday window. Safe to ventilate rooms for 20 mins.' },
      { hour: '19:00', aqi: 135, pm25: 48, inversionRisk: 'Medium', ventilationSafe: false, recommendation: 'Evening biomass heating spikes particulate levels.' }
    ]
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
    inversionLayerActive: false,
    primarySmogSource: 'Photochemical ozone formation & highway corridor diesel particulate',
    hourlyForecast: [
      { hour: '08:00', aqi: 65, pm25: 18, inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Good morning air. Safe for outdoor exercise.' },
      { hour: '14:00', aqi: 92, pm25: 30, inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Ozone peak during peak sunshine. Sensitive groups take breaks.' },
      { hour: '20:00', aqi: 70, pm25: 22, inversionRisk: 'Low', ventilationSafe: true, recommendation: 'Evenings clear. Clean outdoor ventilation.' }
    ]
  }
];

export function getAqiCategory(aqi: number): { category: CityData['category']; color: string; advice: string } {
  if (aqi <= 50) return { category: 'Good', color: '#10B981', advice: 'Air quality is satisfactory and poses little or no risk.' };
  if (aqi <= 100) return { category: 'Moderate', color: '#F59E0B', advice: 'Acceptable air quality; sensitive people should monitor symptoms.' };
  if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: '#F97316', advice: 'Children, elderly, and respiratory patients should reduce exertion.' };
  if (aqi <= 200) return { category: 'Unhealthy', color: '#EF4444', advice: 'Everyone may begin to experience health effects; wear N95 outdoors.' };
  if (aqi <= 300) return { category: 'Very Unhealthy', color: '#8B5CF6', advice: 'Health alert: serious risk. Run purifiers; strictly avoid outdoor sports.' };
  return { category: 'Hazardous', color: '#7F1D1D', advice: 'Emergency health warning: entire population affected. Stay indoors, seal rooms.' };
}

export function createCustomCity(name: string, aqi: number, country: string = 'Custom'): CityData {
  const { category } = getAqiCategory(aqi);
  const pm25 = Math.round(aqi * 0.77);
  const pm10 = Math.round(aqi * 1.15);
  const isInversion = aqi > 200;
  return {
    id: `custom-${name.toLowerCase().replace(/\s+/g, '-') || 'city'}`,
    name: name || 'My City',
    country,
    currentAqi: aqi,
    category,
    pollutants: {
      pm25,
      pm10,
      no2: Math.round(aqi * 0.22),
      o3: Math.round(Math.max(10, 60 - aqi * 0.1)),
      co: Number((aqi * 0.008).toFixed(1)),
      so2: Math.round(aqi * 0.05),
    },
    temperatureC: 15,
    humidityPct: 70,
    inversionLayerActive: isInversion,
    primarySmogSource: isInversion
      ? 'Thermal inversion trapping local vehicular exhaust, dust & biomass burning'
      : 'Local urban traffic and ambient industrial dispersion',
    hourlyForecast: [
      { hour: '06:00', aqi: Math.round(aqi * 1.15), pm25: Math.round(pm25 * 1.15), inversionRisk: isInversion ? 'High' : 'Medium', ventilationSafe: false, recommendation: 'Early morning cold inversion peak. Keep windows closed.' },
      { hour: '10:00', aqi, pm25, inversionRisk: isInversion ? 'Medium' : 'Low', ventilationSafe: false, recommendation: 'Morning rush hour activity.' },
      { hour: '14:00', aqi: Math.round(aqi * 0.75), pm25: Math.round(pm25 * 0.75), inversionRisk: 'Low', ventilationSafe: aqi < 300, recommendation: 'Solar heating lifts boundary layer. Best relative ventilation window.' },
      { hour: '18:00', aqi: Math.round(aqi * 0.95), pm25: Math.round(pm25 * 0.95), inversionRisk: isInversion ? 'Medium' : 'Low', ventilationSafe: false, recommendation: 'Evening traffic and temperature dropping.' },
      { hour: '22:00', aqi: Math.round(aqi * 1.1), pm25: Math.round(pm25 * 1.1), inversionRisk: isInversion ? 'High' : 'Low', ventilationSafe: false, recommendation: 'Nocturnal cooling traps emissions.' }
    ]
  };
}
