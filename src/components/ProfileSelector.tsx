import React from 'react';
import { UserFamilyProfile, VulnerabilityLevel } from '../types/aqi';
import { Users, Baby, HeartPulse, UserCheck, Car, Shield } from 'lucide-react';

interface ProfileSelectorProps {
  profile: UserFamilyProfile;
  onChange: (updated: UserFamilyProfile) => void;
}

const VULNERABILITY_OPTIONS: { id: VulnerabilityLevel; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'Infant/Child', label: 'Infants / Toddlers', icon: <Baby className="w-4 h-4 text-pink-600" />, desc: 'Breathes 50% more air per kg; immature lung alveoli' },
  { id: 'Respiratory/Asthma', label: 'Asthma / Bronchitis', icon: <HeartPulse className="w-4 h-4 text-rose-600" />, desc: 'Bronchial spasms triggered by NO2 and PM2.5' },
  { id: 'Elderly', label: 'Elderly (65+)', icon: <UserCheck className="w-4 h-4 text-amber-600" />, desc: 'Higher risk of cardiovascular strain and stroke' },
  { id: 'Pregnant', label: 'Maternal / Pregnancy', icon: <Users className="w-4 h-4 text-purple-600" />, desc: 'Particulate exposure linked to fetal development stress' },
  { id: 'Outdoor Worker', label: 'Active Commuter / Worker', icon: <Car className="w-4 h-4 text-blue-600" />, desc: 'Continuous ambient exposure during daylight hours' },
];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profile, onChange }) => {
  const toggleVulnerability = (vuln: VulnerabilityLevel) => {
    const exists = profile.vulnerabilities.includes(vuln);
    const updated = exists
      ? profile.vulnerabilities.filter(v => v !== vuln)
      : [...profile.vulnerabilities, vuln];
    onChange({ ...profile, vulnerabilities: updated });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 card-surface">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Family & Household Persona</h2>
            <p className="text-xs text-slate-500">Personalize AI suggestions based on your household's biological vulnerability.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {/* Vulnerability Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Sensitive Household Members:
          </label>
          <div className="space-y-2">
            {VULNERABILITY_OPTIONS.map((opt) => {
              const isSelected = profile.vulnerabilities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleVulnerability(opt.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>{opt.label}</span>
                      {isSelected && <span className="text-[10px] font-bold text-emerald-700">Active Alert</span>}
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
            <label htmlFor="commute-mode-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Daily Commute Mode:
            </label>
            <select
              id="commute-mode-select"
              value={profile.dailyCommuteMode}
              onChange={(e) => onChange({ ...profile, dailyCommuteMode: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Private Car">Private Car (Petrol / Diesel Solo)</option>
              <option value="Carpool">Carpool / Shared Cab</option>
              <option value="Metro/Bus">Metro Rail / Electric City Bus</option>
              <option value="EV/Electric">Electric Two-Wheeler / EV Car</option>
              <option value="Active (Bicycle/Walk)">Bicycle / Walking Commute</option>
            </select>
          </div>

          <div>
            <label htmlFor="commute-dist-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Average One-Way Distance: {profile.commuteDistanceKm} km
            </label>
            <input
              id="commute-dist-input"
              type="range"
              min="2"
              max="50"
              step="1"
              value={profile.commuteDistanceKm}
              onChange={(e) => onChange({ ...profile, commuteDistanceKm: Number(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Purifier & Home Type */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onChange({ ...profile, hasAirPurifier: !profile.hasAirPurifier })}
              className={`p-3 rounded-xl border text-center transition-all ${
                profile.hasAirPurifier
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 font-medium'
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
              <div className="text-xs">Indoor HEPA Purifier</div>
              <div className="text-[10px] text-slate-500">{profile.hasAirPurifier ? 'Installed & Running' : 'No Purifier (Need DIY)'}</div>
            </button>

            <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Household Size</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-700">Total Members:</span>
                <span className="text-sm font-black text-slate-900">
                  {1 + profile.childrenCount + profile.elderlyCount} people
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
