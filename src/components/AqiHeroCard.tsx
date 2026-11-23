import React, { useState } from 'react';
import { getAqiCategory, createCustomCity } from '../data/cityDefaults';
import { CityData, HourlyForecast } from '../types/aqi';
import {
  AlertTriangle,
  Droplets,
  Thermometer,
  Wind,
  Clock,
  PlusCircle,
  RotateCw,
  MapPin,
  Info,
} from 'lucide-react';

interface AqiHeroCardProps {
  city: CityData;
  onCityChange: (cityId: string) => void;
  availableCities: CityData[];
  onAddCustomCity: (newCity: CityData) => void;
  dataSourceLabel?: string;
  isLiveLoading?: boolean;
  onRefreshLive?: () => void;
  onDetectLocation?: () => void;
}

export const AqiHeroCard: React.FC<AqiHeroCardProps> = ({
  city,
  onCityChange,
  availableCities,
  onAddCustomCity,
  dataSourceLabel = 'Numerical Model Forecast',
  isLiveLoading = false,
  onRefreshLive,
  onDetectLocation,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAqi, setCustomAqi] = useState<number>(150);

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const created = createCustomCity(customName.trim(), Number(customAqi));
    onAddCustomCity(created);
    setShowCustomModal(false);
    setCustomName('');
  };

  const { category, advice } = getAqiCategory(city.currentAqi);

  const getAqiBadgeStyle = (aqi: number | null) => {
    if (aqi === null) return 'bg-slate-600 text-white border-slate-700';
    if (aqi <= 50) return 'bg-emerald-500 text-white border-emerald-600';
    if (aqi <= 100) return 'bg-amber-500 text-white border-amber-600';
    if (aqi <= 150) return 'bg-orange-500 text-white border-orange-600';
    if (aqi <= 200) return 'bg-rose-500 text-white border-rose-600';
    if (aqi <= 300) return 'bg-purple-600 text-white border-purple-700';
    return 'bg-red-950 text-white border-red-900';
  };

  const getSourceBadge = () => {
    switch (city.sourceType) {
      case 'live_cams_model':
        return {
          label: 'Live CAMS Model',
          style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'cached_cams_model':
        return { label: 'Cached CAMS Model', style: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'offline_preset':
        return {
          label: 'Offline Demo Preset',
          style: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'manual_estimate':
        return {
          label: 'Manual User Estimate',
          style: 'bg-purple-100 text-purple-900 border-purple-300',
        };
      default:
        return { label: dataSourceLabel, style: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const sourceBadge = getSourceBadge();

  return (
    <section
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 card-surface transition-all"
      aria-labelledby="hero-location-heading"
    >
      {/* Top Header: City Selector & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sourceBadge.style}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {sourceBadge.label}
            </span>

            {city.estimatedStagnationRisk !== 'Unknown' && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                  city.estimatedStagnationRisk === 'High'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : city.estimatedStagnationRisk === 'Medium'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}
              >
                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                <span>Surface Stagnation Risk: {city.estimatedStagnationRisk}</span>
              </span>
            )}

            {onRefreshLive && (
              <button
                type="button"
                onClick={onRefreshLive}
                disabled={isLiveLoading || city.isCustomCity}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 flex items-center gap-1 transition-all disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                title={
                  city.isCustomCity
                    ? 'Manual estimates have no external coordinates to refresh from CAMS'
                    : 'Fetch latest forecast telemetry from Open-Meteo & CAMS (bypasses cache)'
                }
              >
                <RotateCw
                  className={`w-3 h-3 ${isLiveLoading ? 'animate-spin text-emerald-600' : ''}`}
                  aria-hidden="true"
                />
                <span>{isLiveLoading ? 'Syncing...' : 'Sync CAMS Data'}</span>
              </button>
            )}

            {onDetectLocation && (
              <button
                type="button"
                onClick={onDetectLocation}
                disabled={isLiveLoading}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-300 flex items-center gap-1 transition-all focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none disabled:opacity-50"
                title="Query Open-Meteo at your approximate GPS coordinates"
              >
                <MapPin className="w-3 h-3 text-cyan-600" aria-hidden="true" />
                <span>GPS Location Forecast</span>
              </button>
            )}
          </div>

          <h1
            id="hero-location-heading"
            className="text-2xl sm:text-3xl font-black text-slate-900 mt-2"
          >
            {city.name}, <span className="text-slate-500 font-semibold">{city.country}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {city.stagnationExplanation}
          </p>
        </div>

        {/* City Dropdown Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <label
              htmlFor="city-select"
              className="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              Location:
            </label>
            <select
              id="city-select"
              value={city.id}
              onChange={(e) => onCityChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-xs sm:text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
            >
              {availableCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.country}) {c.currentAqi !== null ? `- AQI ${c.currentAqi}` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomModal(!showCustomModal)}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
            title="Enter a manual AQI estimate for an unlisted location"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Custom Estimate</span>
          </button>
        </div>
      </div>

      {/* Custom City Quick Creator Inline Card */}
      {showCustomModal && (
        <form
          onSubmit={handleCreateCustom}
          className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center gap-3 text-xs"
          aria-label="Create custom location estimate"
        >
          <div className="flex-1 w-full">
            <label
              htmlFor="custom-city-name-input"
              className="block text-xs font-bold text-emerald-900 mb-1"
            >
              Custom Location Name:
            </label>
            <input
              id="custom-city-name-input"
              type="text"
              required
              placeholder="e.g. Kanpur, New York, Patna, Leeds..."
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="w-full sm:w-48">
            <label
              htmlFor="custom-city-aqi-slider"
              className="block text-xs font-bold text-emerald-900 mb-1"
            >
              Estimated AQI ({customAqi}):
            </label>
            <input
              id="custom-city-aqi-slider"
              type="range"
              min="10"
              max="500"
              value={customAqi}
              onChange={(e) => setCustomAqi(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
            >
              Add Entry
            </button>
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
        {/* Left Hero Card: AQI Score Dial */}
        <div className="lg:col-span-5 rounded-2xl p-6 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
            <span>Atmospheric Model Forecast</span>
            <span className="font-mono text-[11px]">{city.timezone || 'UTC'}</span>
          </div>

          <div className="my-6">
            <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
              Air Quality Index (US-EPA)
            </div>
            <div className="text-6xl sm:text-7xl font-black tracking-tight text-white">
              {city.currentAqi !== null ? city.currentAqi : '--'}
            </div>
            <div className="mt-3">
              <span
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getAqiBadgeStyle(city.currentAqi)}`}
              >
                {category}
              </span>
            </div>
          </div>

          {/* Health impact alert bar */}
          <div className="w-full p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs leading-relaxed text-slate-200">
            <strong>Advisory:</strong> {advice}
          </div>

          {/* Temperature & Humidity bar */}
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-white/10 w-full text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>
                {city.temperatureC !== null ? `${city.temperatureC}°C` : '--'}
                {city.isWeatherEstimated ? ' (Est)' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>{city.humidityPct !== null ? `${city.humidityPct}% Humidity` : '--'}</span>
            </div>
          </div>
        </div>

        {/* Right: Pollutants Speciation Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Chemical & Particulate Speciation (Model Telemetry)
            </h2>
            <span className="text-[11px] text-slate-500">
              WHO 2021 Reference: 15 µg/m³ (24-hr avg)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* PM2.5 */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800">PM2.5 (Fine Particulate)</span>
                {city.pollutants.pm25 !== null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                    {Math.round(city.pollutants.pm25 / 15)}x WHO 24h
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-rose-950 mt-1">
                {city.pollutants.pm25 !== null ? city.pollutants.pm25 : '--'}{' '}
                <span className="text-xs font-normal text-rose-700">µg/m³</span>
              </div>
              <p className="text-xs text-rose-700 mt-1">Hourly model prediction</p>
            </div>

            {/* PM10 */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800">PM10 (Coarse Dust)</span>
                {city.pollutants.pm10 !== null && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    {Math.round(city.pollutants.pm10 / 45)}x WHO 24h
                  </span>
                )}
              </div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {city.pollutants.pm10 !== null ? city.pollutants.pm10 : '--'}{' '}
                <span className="text-xs font-normal text-amber-700">µg/m³</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">Coarse inhalable particulate</p>
            </div>

            {/* NO2 */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">NO₂ (Combustion Gas)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.no2 !== null ? city.pollutants.no2 : '--'}{' '}
                <span className="text-xs font-normal text-slate-600">µg/m³</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Roadway exhaust marker</p>
            </div>

            {/* Ozone O3 */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">O₃ (Ground Ozone)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.o3 !== null ? city.pollutants.o3 : '--'}{' '}
                <span className="text-xs font-normal text-slate-600">µg/m³</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Photochemical oxidant</p>
            </div>

            {/* CO */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">CO (Carbon Monoxide)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.co !== null ? city.pollutants.co : '--'}{' '}
                <span className="text-xs font-normal text-slate-600">mg/m³</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Incomplete combustion</p>
            </div>

            {/* SO2 */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
              <span className="text-xs font-bold text-slate-800">SO₂ (Sulfur Dioxide)</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {city.pollutants.so2 !== null ? city.pollutants.so2 : '--'}{' '}
                <span className="text-xs font-normal text-slate-600">µg/m³</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Industrial & fuel emissions</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Scientific Note on Units:</strong> Particulate matter (PM2.5, PM10) and gases
              (NO2, O3, SO2) are reported in µg/m³. Carbon monoxide is reported in mg/m³ (1 mg =
              1000 µg). Hourly values reflect instantaneous model outputs, whereas WHO guidelines
              evaluate 24-hour and annual exposure periods.
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Diurnal Forecast Bar */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Diurnal Model Forecast Timeline (Upcoming Hours)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Natural aeration viable only when predicted AQI &le; 100.
          </span>
        </div>

        {city.hourlyForecast.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {city.hourlyForecast.map((hourData: HourlyForecast, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between text-xs transition-all ${
                  hourData.ventilationViable
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>{hourData.hour}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      hourData.stagnationRisk === 'High'
                        ? 'bg-rose-200 text-rose-900'
                        : hourData.stagnationRisk === 'Medium'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {hourData.stagnationRisk} Risk
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-lg font-black text-slate-900">
                    {hourData.aqi !== null ? `AQI ${hourData.aqi}` : 'AQI --'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {hourData.pm25 !== null ? `${hourData.pm25} µg/m³ PM2.5` : 'PM2.5 --'}
                  </div>
                </div>

                <div
                  className={`text-xs font-semibold py-1 px-1.5 rounded text-center ${
                    hourData.ventilationViable
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {hourData.ventilationViable ? '✓ Aeration Viable' : '🔒 Windows Closed'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            Hourly forecast timeline is currently unavailable for this entry.
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>{city.attribution}</span>
          <span>US-EPA AQI Standard</span>
        </div>
      </div>
    </section>
  );
};
