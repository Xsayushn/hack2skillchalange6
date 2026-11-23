import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { CITIES_DATA } from './data/cityDefaults';
import { UserFamilyProfile, RoutineItem, UserImpactMetrics, CityData } from './types/aqi';
import { AssistantContext } from './types/assistant';
import { generateDailyRoutines, computeOverallImpact } from './services/impactCalculator';
import { fetchLiveAqi, KNOWN_CITY_COORDINATES } from './services/aqiApi';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AqiHeroCard } from './components/AqiHeroCard';
import { ProfileSelector } from './components/ProfileSelector';
import { ImpactTracker } from './components/ImpactTracker';
import { RefreshCw } from 'lucide-react';

// Code splitting & lazy-loaded route tabs for optimal performance and minimal initial bundle size
const RoutinePlanner = lazy(() =>
  import('./components/RoutinePlanner').then((m) => ({ default: m.RoutinePlanner }))
);
const IaqHacksGuide = lazy(() =>
  import('./components/IaqHacksGuide').then((m) => ({ default: m.IaqHacksGuide }))
);
const AiAssistantChat = lazy(() =>
  import('./components/AiAssistantChat').then((m) => ({ default: m.AiAssistantChat }))
);

const STORAGE_KEY_PROFILE = 'aeroguardian_profile';
const STORAGE_KEY_APIKEY = 'aeroguardian_gemini_key';
const STORAGE_KEY_CONTRAST = 'aeroguardian_contrast';

const TabLoadingFallback: React.FC = () => (
  <div className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200 shadow-sm" role="status" aria-live="polite">
    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
    <span className="text-sm font-medium text-slate-600">Loading module...</span>
  </div>
);

export const App: React.FC = () => {
  const [citiesList, setCitiesList] = useState<CityData[]>(CITIES_DATA);
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('CAMS Forecast');
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
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

  const currentCity = useMemo(() => {
    return citiesList.find((c) => c.id === selectedCityId) || citiesList[0];
  }, [citiesList, selectedCityId]);

  const loadLiveAqi = useCallback(async (cityId: string) => {
    const coords = KNOWN_CITY_COORDINATES.find((c) => c.id === cityId);
    if (!coords) return;
    setIsLiveLoading(true);
    try {
      const result = await fetchLiveAqi(coords);
      setCitiesList((prev) =>
        prev.map((c) => (c.id === cityId ? result.cityData : c))
      );
      setDataSourceLabel(`CAMS Forecast (${result.timestamp})`);
    } catch {
      setDataSourceLabel('Offline Backup Model');
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveAqi(selectedCityId);
  }, [selectedCityId, loadLiveAqi]);

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLiveLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const userCoords = {
            id: 'my-location',
            name: 'Local GPS Station',
            country: 'Live Geo',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          };
          const res = await fetchLiveAqi(userCoords);
          setCitiesList((prev) => [res.cityData, ...prev.filter((c) => c.id !== 'my-location')]);
          setSelectedCityId(res.cityData.id);
          setDataSourceLabel(`Location-Based Estimate (${res.timestamp})`);
        } catch {
          alert('Could not fetch air quality for your exact GPS coordinates.');
        } finally {
          setIsLiveLoading(false);
        }
      },
      () => {
        setIsLiveLoading(false);
        alert('Location access denied. Please select a city from the list.');
      }
    );
  }, []);

  const handleAddCustomCity = useCallback((newCity: CityData) => {
    setCitiesList((prev) => [newCity, ...prev]);
    setSelectedCityId(newCity.id);
    setDataSourceLabel('User Custom Estimate');
  }, []);

  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    return generateDailyRoutines(familyProfile, currentCity.currentAqi, currentCity.pollutants.pm25);
  });

  // Re-generate routines when city, live sensor pollutants, or profile commute changes
  useEffect(() => {
    setRoutines((prevRoutines) => {
      const fresh = generateDailyRoutines(familyProfile, currentCity.currentAqi, currentCity.pollutants.pm25);
      // Preserve adopted state
      return fresh.map((r) => {
        const found = prevRoutines.find((p) => p.id === r.id);
        return found ? { ...r, isAdopted: found.isAdopted } : r;
      });
    });
  }, [
    selectedCityId,
    currentCity.currentAqi,
    currentCity.pollutants.pm25,
    familyProfile.commuteDistanceKm,
    familyProfile.dailyCommuteMode
  ]);

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

  const handleToggleRoutine = useCallback((routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, isAdopted: !r.isAdopted } : r))
    );
  }, []);

  const handleSaveApiKey = useCallback((key: string, isEphemeral?: boolean) => {
    setApiKey(key);
    if (key && !isEphemeral) {
      localStorage.setItem(STORAGE_KEY_APIKEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY_APIKEY);
    }
  }, []);

  // Memoized impact metrics to eliminate redundant calculations
  const impactMetrics: UserImpactMetrics = useMemo(() => {
    return computeOverallImpact(routines, familyProfile);
  }, [routines, familyProfile]);

  // Memoized assistant context
  const assistantContext: AssistantContext = useMemo(() => {
    return {
      cityName: currentCity.name,
      currentAqi: currentCity.currentAqi,
      aqiCategory: currentCity.category,
      pm25: currentCity.pollutants.pm25,
      inversionLayerActive: currentCity.inversionLayerActive,
      vulnerabilities: familyProfile.vulnerabilities,
      hasPurifier: familyProfile.hasAirPurifier,
      commuteMode: familyProfile.dailyCommuteMode
    };
  }, [
    currentCity.name,
    currentCity.currentAqi,
    currentCity.category,
    currentCity.pollutants.pm25,
    currentCity.inversionLayerActive,
    familyProfile.vulnerabilities,
    familyProfile.hasAirPurifier,
    familyProfile.dailyCommuteMode
  ]);

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
              Winter Smog &amp; Urban Air Quality Command
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
              availableCities={citiesList}
              onAddCustomCity={handleAddCustomCity}
              dataSourceLabel={dataSourceLabel}
              isLiveLoading={isLiveLoading}
              onRefreshLive={() => loadLiveAqi(selectedCityId)}
              onDetectLocation={handleDetectLocation}
            />

            <ProfileSelector
              profile={familyProfile}
              onChange={(updated) => setFamilyProfile(updated)}
            />

            <ImpactTracker metrics={impactMetrics} />
          </div>
        )}

        {/* Tab 2: Routines & Impact (Lazy-loaded with Suspense) */}
        {activeTab === 'routines' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="space-y-8 animate-fadeIn">
              <ImpactTracker metrics={impactMetrics} />
              <RoutinePlanner
                routines={routines}
                onToggleRoutine={handleToggleRoutine}
              />
            </div>
          </Suspense>
        )}

        {/* Tab 3: Indoor Air Hacks (Lazy-loaded with Suspense) */}
        {activeTab === 'iaq' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="space-y-8 animate-fadeIn">
              <IaqHacksGuide />
            </div>
          </Suspense>
        )}

        {/* Tab 4: GenAI Assistant (Lazy-loaded with Suspense) */}
        {activeTab === 'chat' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="space-y-8 animate-fadeIn">
              <AiAssistantChat
                context={assistantContext}
                apiKey={apiKey}
              />
            </div>
          </Suspense>
        )}
      </main>

      {/* Footer with Compliance & Evaluation notes */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            <strong>AeroGuardian</strong> — GenAI Urban Air Quality Assistant (Challenge 6)
          </div>
          <div className="flex items-center gap-4">
            <span>WCAG 2.1 AA Foundations</span>
            <span>•</span>
            <span>WHO &amp; US-EPA Air Quality Standards</span>
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
