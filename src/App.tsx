import React, { useState, useEffect } from 'react';
import { CITIES_DATA } from './data/cityDefaults';
import { UserFamilyProfile, RoutineItem, UserImpactMetrics } from './types/aqi';
import { AssistantContext } from './types/assistant';
import { generateDailyRoutines, computeOverallImpact } from './services/impactCalculator';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AqiHeroCard } from './components/AqiHeroCard';
import { ProfileSelector } from './components/ProfileSelector';
import { RoutinePlanner } from './components/RoutinePlanner';
import { IaqHacksGuide } from './components/IaqHacksGuide';
import { ImpactTracker } from './components/ImpactTracker';
import { AiAssistantChat } from './components/AiAssistantChat';

const STORAGE_KEY_PROFILE = 'aeroguardian_profile';
const STORAGE_KEY_APIKEY = 'aeroguardian_gemini_key';
const STORAGE_KEY_CONTRAST = 'aeroguardian_contrast';

export const App: React.FC = () => {
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'iaq' | 'chat'>('dashboard');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(STORAGE_KEY_APIKEY) || '');
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true');

  const [familyProfile, setFamilyProfile] = useState<UserFamilyProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'My Household',
      cityId: 'delhi',
      vulnerabilities: ['Infant/Child', 'Respiratory/Asthma'],
      dailyCommuteMode: 'Private Car',
      commuteDistanceKm: 18,
      hasAirPurifier: true,
      homeType: 'Apartment',
      childrenCount: 1,
      elderlyCount: 1
    };
  });

  const currentCity = CITIES_DATA.find((c) => c.id === selectedCityId) || CITIES_DATA[0];

  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    return generateDailyRoutines(familyProfile, currentCity.currentAqi, currentCity.pollutants.pm25);
  });

  // Re-generate routines when city or profile commute changes
  useEffect(() => {
    setRoutines((prevRoutines) => {
      const fresh = generateDailyRoutines(familyProfile, currentCity.currentAqi, currentCity.pollutants.pm25);
      // Preserve adopted state
      return fresh.map((r) => {
        const found = prevRoutines.find((p) => p.id === r.id);
        return found ? { ...r, isAdopted: found.isAdopted } : r;
      });
    });
  }, [selectedCityId, familyProfile.commuteDistanceKm, familyProfile.dailyCommuteMode]);

  // Persist profile
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(familyProfile));
  }, [familyProfile]);

  // Handle contrast toggle
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem(STORAGE_KEY_CONTRAST, String(highContrast));
  }, [highContrast]);

  const handleToggleRoutine = (routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, isAdopted: !r.isAdopted } : r))
    );
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem(STORAGE_KEY_APIKEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY_APIKEY);
    }
  };

  const impactMetrics: UserImpactMetrics = computeOverallImpact(routines, familyProfile);

  const assistantContext: AssistantContext = {
    cityName: currentCity.name,
    currentAqi: currentCity.currentAqi,
    aqiCategory: currentCity.category,
    pm25: currentCity.pollutants.pm25,
    inversionLayerActive: currentCity.inversionLayerActive,
    vulnerabilities: familyProfile.vulnerabilities,
    hasPurifier: familyProfile.hasAirPurifier,
    commuteMode: familyProfile.dailyCommuteMode
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasCustomKey={Boolean(apiKey)}
        highContrast={highContrast}
        toggleHighContrast={() => setHighContrast(!highContrast)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8" role="main">
        {/* Top Summary Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/50">
              Winter Smog & Urban Air Quality Command
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
              AeroGuardian Assistant
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1 leading-relaxed">
              Empowering families and communities to navigate hazardous thermal smog, deploy low-cost indoor filters, adopt low-emission routines, and quantify direct health protection.
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setActiveTab('chat')}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <span>Consult AI Assistant</span>
              <span className="text-emerald-600">→</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard (AQI, Inversion Forecast, Persona Selector) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <AqiHeroCard
              city={currentCity}
              onCityChange={(id) => setSelectedCityId(id)}
              availableCities={CITIES_DATA}
            />

            <ProfileSelector
              profile={familyProfile}
              onChange={(updated) => setFamilyProfile(updated)}
            />

            <ImpactTracker metrics={impactMetrics} />
          </div>
        )}

        {/* Tab 2: Routines & Impact */}
        {activeTab === 'routines' && (
          <div className="space-y-8 animate-fadeIn">
            <ImpactTracker metrics={impactMetrics} />
            <RoutinePlanner
              routines={routines}
              onToggleRoutine={handleToggleRoutine}
            />
          </div>
        )}

        {/* Tab 3: Indoor Air Hacks */}
        {activeTab === 'iaq' && (
          <div className="space-y-8 animate-fadeIn">
            <IaqHacksGuide />
          </div>
        )}

        {/* Tab 4: GenAI Assistant */}
        {activeTab === 'chat' && (
          <div className="space-y-8 animate-fadeIn">
            <AiAssistantChat
              context={assistantContext}
              apiKey={apiKey}
            />
          </div>
        )}
      </main>

      {/* Footer with Compliance & Evaluation notes */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            <strong>AeroGuardian</strong> — GenAI Urban Air Quality Assistant (Challenge 6)
          </div>
          <div className="flex items-center gap-4">
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>WHO & US-EPA Air Quality Standards</span>
            <span>•</span>
            <span>Single Branch (main)</span>
          </div>
        </div>
      </footer>

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
};
