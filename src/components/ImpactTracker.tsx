import React from 'react';
import { UserImpactMetrics } from '../types/aqi';
import { Award, Leaf, Sparkles, TrendingUp, Heart } from 'lucide-react';

interface ImpactTrackerProps {
  metrics: UserImpactMetrics;
}

export const ImpactTracker: React.FC<ImpactTrackerProps> = ({ metrics }) => {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl card-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Community Smog Reduction Impact
            </span>
          </div>
          <h2 className="text-2xl font-black mt-2">
            Your Personal & Ecological Footprint Saved
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Quantified contribution to urban emissions reduction and family health protection.
          </p>
        </div>

        {/* Community Percentile Pill */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
          <Award className="w-6 h-6 text-yellow-400 animate-bounce" />
          <div>
            <div className="text-xs text-slate-300 font-medium">Community Impact Tier (Model Estimate)</div>
            <div className="text-sm font-extrabold text-white">Top {100 - metrics.communityRankPercentile}% Clean Living Tier</div>
          </div>
        </div>
      </div>

      {/* 4-Tile High Impact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Metric 1: PM2.5 Inhalation Avoided */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>PM2.5 Exposure Avoided</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {metrics.totalPm25AvoidedUg.toLocaleString()} <span className="text-xs font-normal text-slate-400">µg</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Modeled via EPA minute ventilation (0.6 - 2.1 m³/hr) & N95 filtration.
          </p>
        </div>

        {/* Metric 2: CO2 Saved */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>CO₂ Emissions Prevented</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {metrics.totalCo2SavedKg} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Based on EPA passenger car factor (0.192 kg CO2/km vs 0.038 kg metro).
          </p>
        </div>

        {/* Metric 3: Trees equivalent */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Urban Tree Equivalent</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            {metrics.equivalentTreesPlanted} <span className="text-xs font-normal text-slate-400">tree-days</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Equated to mature tree absorption (~21.8 kg CO2/yr).
          </p>
        </div>

        {/* Metric 4: Clean Air Hours Gained */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Clean Air Hours Gained</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
            +{metrics.cleanAirHoursGained} <span className="text-xs font-normal text-slate-400">hrs/day</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Hours living in safe PM2.5 baseline air (&lt;25 µg/m³ WHO target).
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Scientific References: WHO Global Air Quality Guidelines (2021) • US-EPA AP-42 Emission Factors</span>
        <span>Model Version 2.1</span>
      </div>
    </section>
  );
};
