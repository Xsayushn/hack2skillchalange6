import React from 'react';
import { getAqiCategory } from '../data/cityDefaults';
import { CityData, HourlyForecast } from '../types/aqi';
import { AlertTriangle, Droplets, Thermometer, Wind, Clock } from 'lucide-react';

interface AqiHeroCardProps {
  city: CityData;
  onCityChange: (cityId: string) => void;
  availableCities: CityData[];
}

export const AqiHeroCard: React.FC<AqiHeroCardProps> = ({
  city,
  onCityChange,
  availableCities
}) => {
  const { category, advice } = getAqiCategory(city.currentAqi);

  const getAqiBadgeStyle = (aqi: number) => {
    if (aqi <= 50) return 'bg-emerald-500 text-white border-emerald-600';
    if (aqi <= 100) return 'bg-amber-500 text-white border-amber-600';
    if (aqi <= 150) return 'bg-orange-500 text-white border-orange-600';
    if (aqi <= 200) return 'bg-rose-500 text-white border-rose-600';
    if (aqi <= 300) return 'bg-purple-600 text-white border-purple-700';
    return 'bg-red-950 text-white border-red-900';
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 card-surface transition-all">
      {/* Top Header: City Selector & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              Live Winter Smog Station
            </span>
            {city.inversionLayerActive && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                <AlertTriangle className="w-3 h-3 text-amber-700" />
                Thermal Inversion Cap Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {city.name}, <span className="text-slate-500 font-semibold">{city.country}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {city.primarySmogSource}
          </p>
        </div>

        {/* City Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="city-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Location:
          </label>
          <select
            id="city-select"
            value={city.id}
            onChange={(e) => onCityChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {availableCities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.country}) - AQI {c.currentAqi}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main AQI Meter & Core Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-center">
        {/* Giant AQI Dial Card */}
        <div className="lg:col-span-5 flex flex-col items-center sm:items-start justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              US-EPA Air Quality Index
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide border ${getAqiBadgeStyle(city.currentAqi)}`}>
              {category}
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-4">
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-white">
              {city.currentAqi}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 500 AQI</span>
          </div>

          {/* Health impact alert bar */}
          <div className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs leading-relaxed text-slate-200">
            <strong>Impact:</strong> {advice}
          </div>

          {/* Temperature & Humidity sub-bar */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10 w-full text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-emerald-400" />
              <span>{city.temperatureC}°C Winter Temp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>{city.humidityPct}% Humidity</span>
            </div>
          </div>
        </div>

        {/* Pollutants Breakdown Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-600" />
              Critical Particulate & Gas Speciation
            </h3>
            <span className="text-xs text-slate-400">WHO Guideline: PM2.5 &lt; 15 µg/m³</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* PM2.5 */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">PM2.5 (Fine Soot)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                  {Math.round(city.pollutants.pm25 / 15)}x WHO
                </span>
              </div>
              <div className="text-2xl font-black text-rose-950 mt-1">
                {city.pollutants.pm25} <span className="text-xs font-normal text-rose-700">µg/m³</span>
              </div>
              <p className="text-[11px] text-rose-700 mt-1">Crosses blood-brain barrier & lungs</p>
            </div>

            {/* PM10 */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">PM10 (Dust)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  {Math.round(city.pollutants.pm10 / 45)}x WHO
                </span>
              </div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {city.pollutants.pm10} <span className="text-xs font-normal text-amber-700">µg/m³</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Upper respiratory irritant</p>
            </div>

            {/* NO2 */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">NO₂ (Vehicle Gas)</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.no2} <span className="text-xs font-normal text-slate-600">ppb</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Diesel and combustion exhaust</p>
            </div>

            {/* Ozone O3 */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">O₃ (Ground Ozone)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.o3} <span className="text-xs font-normal text-slate-600">ppb</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Photochemical smog oxidant</p>
            </div>

            {/* CO */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">CO (Monoxide)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.co} <span className="text-xs font-normal text-slate-600">ppm</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Incomplete fuel combustion</p>
            </div>

            {/* SO2 */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">SO₂ (Sulfur)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.so2} <span className="text-xs font-normal text-slate-600">ppb</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Industrial and coal emissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Diurnal Forecast Bar: Safe ventilation window indicator */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Diurnal Smog & Thermal Inversion Timeline
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Green badges indicate safe solar mixing windows (reduced smog concentration).
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {city.hourlyForecast.map((hourData: HourlyForecast, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                hourData.ventilationSafe
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>{hourData.hour}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  hourData.inversionRisk === 'High' ? 'bg-rose-200 text-rose-900' :
                  hourData.inversionRisk === 'Medium' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {hourData.inversionRisk} Inv
                </span>
              </div>

              <div className="my-2">
                <div className="text-lg font-black text-slate-900">AQI {hourData.aqi}</div>
                <div className="text-[11px] text-slate-500">{hourData.pm25} µg/m³ PM2.5</div>
              </div>

              <div className={`text-[10px] font-semibold py-1 px-1.5 rounded text-center ${
                hourData.ventilationSafe 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {hourData.ventilationSafe ? '✓ Safe Airing Window' : '🔒 Windows Locked'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
