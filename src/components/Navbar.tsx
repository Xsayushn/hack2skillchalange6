import React from 'react';
import { Wind, Sparkles, Key, Eye } from 'lucide-react';

interface NavbarProps {
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
  highContrast: boolean;
  toggleHighContrast: () => void;
  activeTab: 'dashboard' | 'routines' | 'iaq' | 'chat';
  setActiveTab: (tab: 'dashboard' | 'routines' | 'iaq' | 'chat') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenApiKeyModal,
  hasCustomKey,
  highContrast,
  toggleHighContrast,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20" aria-hidden="true">
              <Wind className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 bg-clip-text text-transparent">
                  AeroGuardian
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  GenAI Urban Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Winter Smog & Indoor Air Quality Intelligence</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              AQI & Forecast
            </button>
            <button
              onClick={() => setActiveTab('routines')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'routines'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Eco Routines & Impact
            </button>
            <button
              onClick={() => setActiveTab('iaq')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'iaq'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Indoor Air Hacks
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500 group-hover:text-white" />
              GenAI Assistant
            </button>
          </nav>

          {/* Utilities & Controls */}
          <div className="flex items-center gap-2">
            {/* Accessibility High Contrast Switch */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-1.5 ${
                highContrast 
                  ? 'bg-black text-yellow-300 border-yellow-300' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Toggle High Contrast for Accessibility (WCAG 2.1 AA)"
              aria-label="Toggle High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">High Contrast</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={onOpenApiKeyModal}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                hasCustomKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
              title="Configure Google Gemini API Key"
              aria-label="API Settings"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">
                {hasCustomKey ? 'Gemini 1.5 Active' : 'Offline / Heuristic AI'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 justify-around text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2 rounded font-medium ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('routines')}
            className={`py-1 px-2 rounded font-medium ${activeTab === 'routines' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
          >
            Routines
          </button>
          <button
            onClick={() => setActiveTab('iaq')}
            className={`py-1 px-2 rounded font-medium ${activeTab === 'iaq' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
          >
            IAQ Hacks
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1 px-2 rounded font-medium flex items-center gap-1 ${activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
          >
            <Sparkles className="w-3 h-3 text-emerald-500" />
            AI Chat
          </button>
        </div>
      </div>
    </header>
  );
};
