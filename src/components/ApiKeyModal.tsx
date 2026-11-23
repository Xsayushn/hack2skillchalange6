import React, { useState, useEffect, useRef } from 'react';
import { Key, AlertCircle, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { maskApiKey, validateApiKey } from '../services/security';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string, isEphemeral?: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey
}) => {
  const [inputVal, setInputVal] = useState(currentKey);
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Keep latest onClose in a ref so it doesn't cause effect re-runs
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus trap, Escape handling, and focus restoration
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setInputVal(currentKey);
      setError(null);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCloseRef.current();
          return;
        }

        // Focus trap logic
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus?.();
      };
    }
  }, [isOpen]); // Only re-run when modal opens or closes!

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      onSaveKey('', false);
      onClose();
      return;
    }
    if (!validateApiKey(trimmed)) {
      setError('Key appears invalid. A valid Gemini API key starts with "AIza..." and contains at least 35 characters.');
      return;
    }
    setError(null);
    onSaveKey(trimmed, isEphemeral);
    onClose();
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey('', false);
    setError(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            <h2 id="modal-title" className="text-lg font-bold text-slate-800">
              Gemini API & Security Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close API Key dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AeroGuardian runs a zero-setup <strong>Offline Heuristic Environmental Intelligence Engine</strong> by default. You may optionally supply a Google Gemini API key for live conversational reasoning.
          </p>

          {/* Security architecture banner */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Production Security Architecture Advisory</span>
            </div>
            <p className="leading-relaxed">
              Browser <code>localStorage</code> is vulnerable to client-side XSS. For prototype testing, use <strong>In-Memory Ephemeral Storage</strong> (cleared on tab close). For enterprise production, a server-side authenticated proxy should manage credentials.
            </p>
          </div>

          <div>
            <label htmlFor="gemini-key-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Gemini API Key
            </label>
            <input
              ref={inputRef}
              id="gemini-key-input"
              type="password"
              placeholder="AIzaSy..."
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs sm:text-sm text-slate-800"
            />
            {currentKey && (
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Current active key: {maskApiKey(currentKey)}
              </p>
            )}
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Ephemeral vs Persistent Storage Selector */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isEphemeral}
                onChange={(e) => setIsEphemeral(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold block text-slate-800">
                  Ephemeral In-Memory Only (Recommended for Security)
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Keep key in browser memory only; do not persist to localStorage. Key will be cleared when the tab is closed.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 font-medium underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              Get a free Google AI Studio Key <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[11px] text-slate-500">Transmitted via HTTP header <code>x-goog-api-key</code></span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-lg text-center"
          >
            Clear Key (Offline Engine)
          </button>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
