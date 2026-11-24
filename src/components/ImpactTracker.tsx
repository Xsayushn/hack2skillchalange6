import React from 'react';
import { UserImpactMetrics } from '../types/aqi';
import { Leaf, Heart, CheckCircle2, Info } from 'lucide-react';

interface ImpactTrackerProps {
  metrics: UserImpactMetrics;
}

export const ImpactTracker: React.FC<ImpactTrackerProps> = ({ metrics }) => {
  const { calculationAssumptions: ca } = metrics;

  return (
    <section
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl card-surface"
      role="region"
      aria-label="Household Modeled Exposure and Transportation Impact Tracker"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Defensible Exposure & Transportation Math
          </span>
          <h2 className="text-2xl font-black mt-2">Modeled Exposure & Emission Savings</h2>
          <p className="text-xs text-slate-300 mt-1">
            Empirical calculations based on EPA Exposure Factors and AP-42 vehicle emission
            conversion factors.
          </p>
        </div>

        {/* Adopted count badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <div>
            <div className="text-xs text-slate-300 font-medium">Adopted Actions</div>
            <div className="text-sm font-extrabold text-white">
              {metrics.adoptedRoutinesCount} of 4 Selected
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Metric 1: Inhaled PM2.5 Mass Reduction */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
            <Heart className="w-4 h-4 text-rose-400" aria-hidden="true" />
            <span>Estimated Inhaled PM2.5 Mass Reduction</span>
          </div>
          <div className="text-3xl font-black mt-2 text-white">
            {metrics.estimatedInhaledMassSavedUg.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-400">µg PM2.5</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Estimates ambient fine particulate mass kept out of the upper respiratory tract via
            behavioral substitution and fitted N95 filtration.
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-200">
            * Disclaimer: Inhaled mass represents aerosol intake; it is not a clinical
            lung-deposited dose.
          </div>
        </div>

        {/* Metric 2: Transportation CO2 Delta */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Transportation CO₂ Operational Delta</span>
          </div>
          <div className="text-3xl font-black mt-2 text-white">
            {metrics.transportCo2SavedKg}{' '}
            <span className="text-sm font-normal text-slate-300">kg CO₂ / round-trip</span>
          </div>
          <p className="text-xs text-slate-200 mt-2 leading-relaxed">
            Direct operational emission difference between reported baseline commute (
            {ca.commuteMode}) and electrified public transit over {ca.commuteDistanceKm * 2} km.
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-200">
            * If existing commute is walking, cycling, or mass transit, zero additional delta is
            claimed.
          </div>
        </div>
      </div>

      {/* Transparent Calculation Assumptions Box */}
      <div className="mt-6 p-4 rounded-2xl bg-black/30 border border-white/10 text-xs text-slate-200 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Active Calculation Assumptions & Scientific Benchmarks:</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-200 pt-1">
          <li>
            • <strong>Resting Minute Ventilation:</strong> {ca.adultRestVentilationM3Hr} m³/hr (~10
            L/min, EPA 2011)
          </li>
          <li>
            • <strong>Exertion Minute Ventilation:</strong> {ca.adultExertionVentilationM3Hr} m³/hr
            (~35 L/min, EPA 2011)
          </li>
          <li>
            • <strong>N95 Respirator Fit:</strong> {ca.n95FiltrationEfficiencyPct}% (assumes
            leak-free continuous perimeter seal)
          </li>
          <li>
            • <strong>Baseline Commute Factor:</strong> {ca.baselineEmissionFactorKgKm} kg CO₂/km (
            {ca.commuteMode})
          </li>
          <li>
            • <strong>Mass Transit Factor:</strong> {ca.cleanTransitEmissionFactorKgKm} kg CO₂/km
            (Electrified Metro/Bus)
          </li>
          <li>
            • <strong>Round-Trip Distance:</strong> {ca.commuteDistanceKm * 2} km (
            {ca.commuteDistanceKm} km one-way)
          </li>
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <span>
          Scientific References: US EPA Exposure Factors Handbook (2011) • US EPA AP-42 • UK DEFRA
          (2023)
        </span>
        <span>All metrics are empirical mathematical models based on user inputs.</span>
      </div>
    </section>
  );
};
