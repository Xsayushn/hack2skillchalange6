import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef } from 'react';
import { CITIES_DATA, validateHouseholdProfile } from './data/cityDefaults';
import { UserFamilyProfile, RoutineItem, UserImpactMetrics, CityData } from './types/aqi';
import { AssistantContext } from './types/assistant';
import { generateDailyRoutines, computeOverallImpact } from './services/impactCalculator';
import { fetchLiveAqi, KNOWN_CITY_COORDINATES, CityCoordinates } from './services/aqiApi';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AqiHeroCard } from './components/AqiHeroCard';
import { ProfileSelector } from './components/ProfileSelector';
import { ImpactTracker } from './components/ImpactTracker';
import { RefreshCw, AlertCircle } from 'lucide-react';

// Code splitting & lazy-loaded route tabs for minimal initial bundle
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
const STORAGE_KEY_CONTRAST = 'aeroguardian_contrast';

const TabLoadingFallback: React.FC = () => (
  <div
    className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200 shadow-sm"
    role="status"
    aria-live="polite"
  >
    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" aria-hidden="true" />
    <span className="text-sm font-medium text-slate-600">Loading module...</span>
  </div>
);

export const App: React.FC = () => {
  const [citiesList, setCitiesList] = useState<CityData[]>(CITIES_DATA);
  const [selectedCityId, setSelectedCityId] = useState<string>('delhi');
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('Numerical Model Forecast');
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routines' | 'iaq' | 'chat'>(
    'dashboard'
  );
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Security rule: Memory-only key handling by default (never persisted to localStorage)
  const [apiKey, setApiKey] = useState<string>('');

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true';
  });

  // Track request sequence to prevent out-of-order race conditions
  const requestSeqRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Runtime-validated profile
  const [familyProfile, setFamilyProfile] = useState<UserFamilyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        return validateHouseholdProfile(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return validateHouseholdProfile(null);
  });

  const currentCity = useMemo(() => {
    return citiesList.find((c) => c.id === selectedCityId) || citiesList[0];
  }, [citiesList, selectedCityId]);

  // Load telemetry with coordinate caching, sequence validation, and cancellation
  const loadLiveAqi = useCallback(
    async (cityId: string, bypassCache: boolean = false) => {
      // If it's a custom manual estimate with no coordinates, don't query external API
      const foundCity = citiesList.find((c) => c.id === cityId);
      if (foundCity?.isCustomCity) {
        setDataSourceLabel('Manual User Estimate');
        setTelemetryError(null);
        return;
      }

      const coords =
        KNOWN_CITY_COORDINATES.find((c) => c.id === cityId) ||
        (foundCity?.lat && foundCity?.lon
          ? {
              id: foundCity.id,
              name: foundCity.name,
              country: foundCity.country,
              lat: foundCity.lat,
              lon: foundCity.lon,
            }
          : null);

      if (!coords) return;

      // Abort any obsolete in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const currentSeq = ++requestSeqRef.current;
      setIsLiveLoading(true);
      setTelemetryError(null);

      try {
        const result = await fetchLiveAqi(coords, {
          bypassCache,
          signal: controller.signal,
        });

        // Guard against race conditions
        if (currentSeq !== requestSeqRef.current) {
          return;
        }

        setCitiesList((prev) => prev.map((c) => (c.id === cityId ? result.cityData : c)));
        setDataSourceLabel(result.isCached ? 'Cached CAMS Model' : 'Live CAMS Model');
        setTelemetryError(null);
      } catch (err: unknown) {
        if (currentSeq !== requestSeqRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const msg = err instanceof Error ? err.message : 'Network error';
        setTelemetryError(`Could not refresh telemetry (${msg}). Displaying offline baseline.`);
        setDataSourceLabel('Offline Demo Preset');
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setIsLiveLoading(false);
        }
      }
    },
    [citiesList]
  );

  useEffect(() => {
    loadLiveAqi(selectedCityId, false);
  }, [selectedCityId, loadLiveAqi]);

  const handleRefreshLive = useCallback(() => {
    loadLiveAqi(selectedCityId, true);
  }, [selectedCityId, loadLiveAqi]);

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setTelemetryError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLiveLoading(true);
    setTelemetryError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const gpsId = `gps-${lat.toFixed(2)}-${lon.toFixed(2)}`;

        const gpsCityCoords: CityCoordinates = {
          id: gpsId,
          name: 'Your GPS Location',
          country: 'Local Coordinates',
          lat,
          lon,
        };

        try {
          const result = await fetchLiveAqi(gpsCityCoords, { bypassCache: true });
          setCitiesList((prev) => {
            const filtered = prev.filter((c) => c.id !== gpsId);
            return [result.cityData, ...filtered];
          });
          setSelectedCityId(gpsId);
          setDataSourceLabel('Live CAMS Model (GPS)');
          setTelemetryError(null);
        } catch {
          setTelemetryError('Failed to fetch atmospheric model for your GPS coordinates.');
        } finally {
          setIsLiveLoading(false);
        }
      },
      () => {
        setIsLiveLoading(false);
        setTelemetryError('Location permission denied. Please select a city from the list.');
      },
      { timeout: 10000 }
    );
  }, []);

  const handleAddCustomCity = useCallback((newCity: CityData) => {
    setCitiesList((prev) => [newCity, ...prev]);
    setSelectedCityId(newCity.id);
    setDataSourceLabel('Manual User Estimate');
    setTelemetryError(null);
  }, []);

  // Routines state
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    return generateDailyRoutines(
      familyProfile,
      currentCity.currentAqi,
      currentCity.pollutants.pm25
    );
  });

  // Re-generate routines when city or commute mode changes
  useEffect(() => {
    setRoutines((prevRoutines) => {
      const fresh = generateDailyRoutines(
        familyProfile,
        currentCity.currentAqi,
        currentCity.pollutants.pm25
      );
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
    familyProfile.dailyCommuteMode,
  ]);

  // Persist household profile safely
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(familyProfile));
    } catch {
      // Storage unavailable
    }
  }, [familyProfile]);

  // Handle high contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    try {
      localStorage.setItem(STORAGE_KEY_CONTRAST, String(highContrast));
    } catch {
      // Storage unavailable
    }
  }, [highContrast]);

  const handleToggleRoutine = useCallback((routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, isAdopted: !r.isAdopted } : r))
    );
  }, []);

  // API key stored purely in memory
  const handleSaveApiKey = useCallback((key: string) => {
    setApiKey(key.trim());
  }, []);

  // Memoized impact metrics without artificial multipliers
  const impactMetrics: UserImpactMetrics = useMemo(() => {
    return computeOverallImpact(routines, familyProfile);
  }, [routines, familyProfile]);

  // Memoized assistant context with stagnation risk
  const assistantContext: AssistantContext = useMemo(() => {
    return {
      cityName: currentCity.name,
      currentAqi: currentCity.currentAqi,
      aqiCategory: currentCity.category,
      pm25: currentCity.pollutants.pm25,
      estimatedStagnationRisk: currentCity.estimatedStagnationRisk,
      vulnerabilities: familyProfile.vulnerabilities,
      hasPurifier: familyProfile.hasAirPurifier,
      commuteMode: familyProfile.dailyCommuteMode,
    };
  }, [
    currentCity.name,
    currentCity.currentAqi,
    currentCity.category,
    currentCity.pollutants.pm25,
    currentCity.estimatedStagnationRisk,
    familyProfile.vulnerabilities,
    familyProfile.hasAirPurifier,
    familyProfile.dailyCommuteMode,
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

      {/* Accessible Inline Notification Banner */}
      {telemetryError && (
        <div
          className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between"
          role="alert"
          aria-live="polite"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2 w-full">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>{telemetryError}</span>
            <button
              type="button"
              onClick={() => loadLiveAqi(selectedCityId, true)}
              className="ml-auto underline font-bold hover:text-amber-950 focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <AqiHeroCard
              city={currentCity}
              onCityChange={(id) => setSelectedCityId(id)}
              availableCities={citiesList}
              onAddCustomCity={handleAddCustomCity}
              dataSourceLabel={dataSourceLabel}
              isLiveLoading={isLiveLoading}
              onRefreshLive={handleRefreshLive}
              onDetectLocation={handleDetectLocation}
            />

            <ProfileSelector profile={familyProfile} onChange={setFamilyProfile} />

            <ImpactTracker metrics={impactMetrics} />
          </div>
        )}

        {/* Tab 2: Routines & Impact */}
        {activeTab === 'routines' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <div className="space-y-8">
              <RoutinePlanner routines={routines} onToggleRoutine={handleToggleRoutine} />
              <ImpactTracker metrics={impactMetrics} />
            </div>
          </Suspense>
        )}

        {/* Tab 3: IAQ Hacks */}
        {activeTab === 'iaq' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <IaqHacksGuide />
          </Suspense>
        )}

        {/* Tab 4: AI Chat */}
        {activeTab === 'chat' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <AiAssistantChat context={assistantContext} apiKey={apiKey} />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      <footer
        className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-700">
              AeroGuardian — GenAI Urban Air Quality Assistant
            </p>
            <p className="text-[11px] mt-0.5">
              Atmospheric numerical forecast telemetry powered by Copernicus Atmosphere Monitoring
              Service (CAMS) & Open-Meteo.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>WHO Air Quality Guidelines (2021)</span>
            <span>•</span>
            <span>US-EPA AP-42</span>
          </div>
        </div>
      </footer>

      {/* In-Memory Api Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
};
