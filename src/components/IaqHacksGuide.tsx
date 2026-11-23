import React, { useState } from 'react';
import { IAQ_HACKS } from '../data/iaqHacks';
import { Wrench, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export const IaqHacksGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedHackId, setExpandedHackId] = useState<string>('corsi-rosenthal-box');

  const categories = ['All', 'DIY Filtration', 'Ventilation Timing', 'Indoor Source Control', 'Botanical & Natural'];

  const filteredHacks = selectedCategory === 'All'
    ? IAQ_HACKS
    : IAQ_HACKS.filter(h => h.category === selectedCategory);

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 card-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Household Science & Low-Cost Engineering
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            Indoor Air Quality (IAQ) Hacks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Proven DIY techniques to clean indoor air, avoid particulate resuspension, and minimize toxic infiltration.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {filteredHacks.map((hack) => {
          const isExpanded = expandedHackId === hack.id;
          return (
            <div
              key={hack.id}
              className={`rounded-2xl border transition-all ${
                isExpanded ? 'bg-teal-50/40 border-teal-300 ring-2 ring-teal-500/20' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setExpandedHackId(isExpanded ? '' : hack.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {hack.title}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        {hack.efficacyScore}% Efficacy
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{hack.category}</span>
                      <span>•</span>
                      <span>{hack.costLevel}</span>
                      <span>•</span>
                      <span>{hack.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Accordion Expanded Body */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-teal-100 space-y-4 text-xs sm:text-sm">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {hack.summary}
                  </p>

                  {/* Materials list if applicable */}
                  {hack.materialsNeeded && (
                    <div className="p-3.5 rounded-xl bg-white border border-teal-200">
                      <h4 className="font-bold text-xs text-teal-900 uppercase tracking-wider mb-2">
                        Materials Required:
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                        {hack.materialsNeeded.map((mat, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-teal-600 font-bold">•</span>
                            <span>{mat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Step by step instructions */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                      Step-by-Step Execution:
                    </h4>
                    <ol className="space-y-2">
                      {hack.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Scientific Principle */}
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">🔬 Scientific Principle:</strong> {hack.scientificMechanism}
                  </div>

                  {/* Caution note if any */}
                  {hack.cautionNotice && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span><strong>Safety Note:</strong> {hack.cautionNotice}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
