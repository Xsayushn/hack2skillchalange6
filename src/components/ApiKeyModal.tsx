import React, { useState, useEffect, useRef } from 'react';
import { Key, AlertCircle, X, ExternalLink, ShieldAlert } from 'lucide-react';
import { maskApiKey, validateApiKey } from '../services/security';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
}) => {
  const [inputVal, setInputVal] = useState(currentKey);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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

        // Focus trap
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
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      onSaveKey('');
      onClose();
      return;
    }
    if (!validateApiKey(trimmed)) {
      setError(
        'Key appears invalid. A valid Google Gemini API key starts with "AIza..." and contains at least 35 characters.'
      );
      return;
    }
    setError(null);
    onSaveKey(trimmed);
    onClose();
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            <h2 id="api-modal-title" className="text-lg font-bold text-slate-800">
              Gemini API Key (Memory-Only Storage)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            aria-label="Close API Key dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600 leading-relaxed">
            AeroGuardian runs a zero-setup{' '}
            <strong>Offline Heuristic Environmental Intelligence Engine</strong> by default. You may
            optionally supply a Google Gemini API key for live conversational reasoning.
          </p>

          {/* Memory-Only Storage Security Disclosure */}
          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>Session Memory-Only Credential Handling</span>
            </div>
            <p className="leading-relaxed">
              For security, the API key is <strong>never written to browser localStorage</strong>.
              It resides purely in volatile browser memory for the active tab session and is cleared
              when the tab closes or on reload.
            </p>
          </div>

          <div>
            <label
              htmlFor="gemini-key-input"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm text-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            />
            {currentKey && (
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Active in memory: {maskApiKey(currentKey)}
              </p>
            )}
            {error && (
              <p
                className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium"
                role="alert"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pt-1 text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 font-medium underline focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded"
            >
              Get a free Google AI Studio Key{' '}
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <span className="text-[11px] text-slate-500">
              Transmitted via HTTPS header <code>x-goog-api-key</code>
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none rounded-lg text-center"
          >
            Clear Active Key
          </button>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              Apply Key to Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
