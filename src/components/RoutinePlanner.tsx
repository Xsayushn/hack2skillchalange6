import React from 'react';
import { RoutineItem } from '../types/aqi';
import { CheckCircle2, Circle, Leaf, Shield, AlertCircle } from 'lucide-react';

interface RoutinePlannerProps {
  routines: RoutineItem[];
  onToggleRoutine: (routineId: string) => void;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({
  routines,
  onToggleRoutine
}) => {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 card-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Actionable Optimization Engine
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Low-Emission Daily Routines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toggle eco-actions below to see your immediate reduction in toxic PM2.5 inhalation and CO₂ footprint.
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {routines.map((routine) => (
          <div
            key={routine.id}
            onClick={() => onToggleRoutine(routine.id)}
            className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all ${
              routine.isAdopted
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleRoutine(routine.id);
              }
            }}
            aria-pressed={routine.isAdopted}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <button
                  type="button"
                  className="mt-1 text-emerald-600 focus:outline-none"
                  aria-label={routine.isAdopted ? 'Mark routine as unadopted' : 'Adopt routine'}
                >
                  {routine.isAdopted ? (
                    <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400 hover:text-emerald-500" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {routine.timeSlot}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {routine.title}
                    </h3>
                  </div>

                  {/* Before vs After comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900">
                      <div className="font-bold flex items-center gap-1 text-rose-800 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Conventional Habit:
                      </div>
                      <p className="text-slate-700">{routine.originalAction}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950">
                      <div className="font-bold flex items-center gap-1 text-emerald-800 mb-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        Clean Air Alternative:
                      </div>
                      <p className="text-slate-800 font-medium">{routine.ecoCleanAction}</p>
                    </div>
                  </div>

                  {/* Health impact rationale */}
                  <p className="text-xs text-slate-600 mt-2.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Biological Mechanism:</strong> {routine.healthBenefit}</span>
                  </p>
                </div>
              </div>

              {/* Quantified impact badge */}
              <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                  -{routine.emissionSavedKgCo2} kg CO₂
                </span>
                <span className="text-[11px] font-semibold text-slate-600 mt-1">
                  -{routine.exposureAvoidedPm25Ug} µg PM2.5 saved
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {routine.isAdopted ? '✓ Active Today' : 'Click to adopt'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
