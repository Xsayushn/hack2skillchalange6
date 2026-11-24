import React from 'react';
import { RoutineItem } from '../types/aqi';
import { CheckCircle2, Circle, Leaf, Shield, AlertCircle, Info } from 'lucide-react';

interface RoutinePlannerProps {
  routines: RoutineItem[];
  onToggleRoutine: (routineId: string) => void;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({ routines, onToggleRoutine }) => {
  return (
    <section
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 card-surface"
      aria-labelledby="routine-planner-heading"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Actionable Optimization Engine
          </span>
          <h2 id="routine-planner-heading" className="text-2xl font-black text-slate-900 mt-2">
            Low-Emission Daily Routines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Toggle defensible behavioral substitutions to calculate your modeled particulate
            exposure and CO₂ transport delta.
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-6" role="list" aria-label="Available daily routine adjustments">
        {routines.map((routine) => {
          const toggleId = `routine-btn-${routine.id}`;
          const descId = `routine-desc-${routine.id}`;

          return (
            <div
              key={routine.id}
              role="listitem"
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                routine.isAdopted
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Single clear accessible toggle control */}
                  <button
                    type="button"
                    id={toggleId}
                    aria-pressed={routine.isAdopted}
                    aria-describedby={descId}
                    onClick={() => onToggleRoutine(routine.id)}
                    className="mt-1 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-full p-0.5"
                    title={routine.isAdopted ? 'Mark routine as unadopted' : 'Adopt this routine'}
                  >
                    {routine.isAdopted ? (
                      <CheckCircle2
                        className="w-6 h-6 fill-emerald-600 text-white"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="w-6 h-6 text-slate-400 hover:text-emerald-500"
                        aria-hidden="true"
                      />
                    )}
                    <span className="sr-only">
                      {routine.isAdopted ? `Unadopt ${routine.title}` : `Adopt ${routine.title}`}
                    </span>
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        {routine.timeSlot}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {routine.title}
                      </h3>
                      {routine.isAdopted && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                          Adopted Today
                        </span>
                      )}
                    </div>

                    {/* Before vs After comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs" id={descId}>
                      <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900">
                        <div className="font-bold flex items-center gap-1 text-rose-800 mb-1">
                          <AlertCircle
                            className="w-3.5 h-3.5 text-rose-600 shrink-0"
                            aria-hidden="true"
                          />
                          <span>Conventional Baseline:</span>
                        </div>
                        <p className="text-slate-700">{routine.originalAction}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950">
                        <div className="font-bold flex items-center gap-1 text-emerald-800 mb-1">
                          <Leaf
                            className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                            aria-hidden="true"
                          />
                          <span>Clean Air Alternative:</span>
                        </div>
                        <p className="text-slate-800 font-medium">{routine.ecoCleanAction}</p>
                      </div>
                    </div>

                    {/* Health impact rationale */}
                    <p className="text-xs text-slate-600 mt-2.5 flex items-start gap-1.5">
                      <Shield
                        className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong>Biological Mechanism:</strong> {routine.healthBenefit}
                      </span>
                    </p>

                    {/* Explicit mathematical assumptions */}
                    <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1.5 bg-slate-100/80 p-2 rounded-lg border border-slate-200">
                      <Info
                        className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>
                        <strong>Assumptions:</strong> {routine.assumptions}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Quantified impact badge */}
                <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
                  {routine.emissionSavedKgCo2 > 0 && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">
                      -{routine.emissionSavedKgCo2} kg CO₂
                    </span>
                  )}
                  {routine.exposureAvoidedPm25Ug > 0 && (
                    <span className="text-xs font-semibold text-slate-700 mt-1">
                      -{routine.exposureAvoidedPm25Ug} µg PM2.5
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
