import React from 'react';
import { UserFamilyProfile, VulnerabilityLevel, CommuteMode } from '../types/aqi';
import { Users, Baby, HeartPulse, UserCheck, Car, Shield } from 'lucide-react';

interface ProfileSelectorProps {
  profile: UserFamilyProfile;
  onChange: (updated: UserFamilyProfile) => void;
}

const VULNERABILITY_OPTIONS: {
  id: VulnerabilityLevel;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    id: 'Infant/Child',
    label: 'Infants / Toddlers',
    icon: <Baby className="w-4 h-4 text-pink-600" aria-hidden="true" />,
    desc: 'Breathes more air per kg of body weight; developing lung alveoli',
  },
  {
    id: 'Respiratory/Asthma',
    label: 'Asthma / Bronchitis',
    icon: <HeartPulse className="w-4 h-4 text-rose-600" aria-hidden="true" />,
    desc: 'Bronchial reactivity triggered by particulate soot and NO2',
  },
  {
    id: 'Elderly',
    label: 'Elderly (65+)',
    icon: <UserCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />,
    desc: 'Heightened cardiovascular and systemic inflammatory risk',
  },
  {
    id: 'Pregnant',
    label: 'Maternal / Pregnancy',
    icon: <Users className="w-4 h-4 text-purple-600" aria-hidden="true" />,
    desc: 'Fine particulate exposure linked to placental and fetal stress',
  },
  {
    id: 'Outdoor Worker',
    label: 'Active Commuter / Worker',
    icon: <Car className="w-4 h-4 text-blue-600" aria-hidden="true" />,
    desc: 'Prolonged ambient roadway exposure during peak diurnal smog',
  },
];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profile, onChange }) => {
  const toggleVulnerability = (vuln: VulnerabilityLevel) => {
    const exists = profile.vulnerabilities.includes(vuln);
    const updated = exists
      ? profile.vulnerabilities.filter((v) => v !== vuln)
      : [...profile.vulnerabilities, vuln];
    onChange({ ...profile, vulnerabilities: updated });
  };

  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 card-surface"
      aria-labelledby="profile-heading"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800" aria-hidden="true">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 id="profile-heading" className="text-lg font-bold text-slate-800">
              Household Vulnerability & Commute Profile
            </h2>
            <p className="text-xs text-slate-500">
              Tailors contextual guidance and calculation parameters based on reported biological
              sensitivities.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {/* Vulnerability Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Sensitive Household Members:
          </label>
          <div className="space-y-2" role="group" aria-label="Household vulnerability selection">
            {VULNERABILITY_OPTIONS.map((opt) => {
              const isSelected = profile.vulnerabilities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleVulnerability(opt.id)}
                  aria-pressed={isSelected}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-700">Active Alert</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Commute & Home Structure Settings */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="commute-mode-select"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Daily Commute Mode:
            </label>
            <select
              id="commute-mode-select"
              value={profile.dailyCommuteMode}
              onChange={(e) =>
                onChange({ ...profile, dailyCommuteMode: e.target.value as CommuteMode })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-xs text-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
            >
              <option value="Private Car">Private Car (Petrol / Diesel Solo)</option>
              <option value="Carpool">Carpool / Shared Cab</option>
              <option value="Metro/Bus">Metro Rail / Electric City Bus</option>
              <option value="EV/Electric">Electric Two-Wheeler / EV Car</option>
              <option value="Active (Bicycle/Walk)">Bicycle / Walking Commute</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="commute-dist-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Average One-Way Distance:
              </label>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {profile.commuteDistanceKm} km ({profile.commuteDistanceKm * 2} km round-trip)
              </span>
            </div>
            <input
              id="commute-dist-input"
              type="range"
              min="1"
              max="60"
              step="1"
              value={profile.commuteDistanceKm}
              onChange={(e) => onChange({ ...profile, commuteDistanceKm: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Purifier & Children / Senior Counts */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onChange({ ...profile, hasAirPurifier: !profile.hasAirPurifier })}
              aria-pressed={profile.hasAirPurifier}
              className={`p-3 rounded-xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                profile.hasAirPurifier
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 font-medium'
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-600" aria-hidden="true" />
              <div className="text-xs">Mechanical Air Purifier</div>
              <div className="text-[10px] text-slate-500">
                {profile.hasAirPurifier ? 'Operating Indoors' : 'No Purifier (Need DIY)'}
              </div>
            </button>

            <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 flex flex-col justify-center text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Household Composition
              </span>
              <div className="flex items-center justify-between mt-1 text-slate-700">
                <span>Children:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  aria-label="Number of children in household"
                  value={profile.childrenCount}
                  onChange={(e) =>
                    onChange({
                      ...profile,
                      childrenCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className="w-12 text-center py-0.5 border border-slate-300 rounded font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-slate-700">
                <span>Seniors (65+):</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  aria-label="Number of seniors (65+) in household"
                  value={profile.elderlyCount}
                  onChange={(e) =>
                    onChange({
                      ...profile,
                      elderlyCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className="w-12 text-center py-0.5 border border-slate-300 rounded font-bold text-slate-900 focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
