import React, { useState, useEffect, useRef } from 'react';
import { Key, ShieldCheck, AlertCircle, X, ExternalLink } from 'lucide-react';
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
  onSaveKey
}) => {
  const [inputVal, setInputVal] = useState(currentKey);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Auto-focus input, handle Escape key, and return focus upon modal close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setInputVal(currentKey);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        previousActiveElement.current?.focus?.();
      };
    }
  }, [isOpen, currentKey, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) {
      onSaveKey('');
      onClose();
      return;
    }
    if (!validateApiKey(trimmed)) {
      setError('Key appears invalid. A valid Gemini API key usually starts with "AIzaSy..."');
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
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-600" />
            <h2 id="modal-title" className="text-lg font-bold text-slate-800">
              Gemini API Settings
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
          <p className="text-sm text-slate-600 leading-relaxed">
            AeroGuardian includes a built-in <strong>Offline Heuristic Environmental Intelligence Engine</strong> that works out of the box with zero setup.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Optionally, you can connect your own <strong>Google Gemini API Key</strong> for live conversational reasoning (using header-authenticated `x-goog-api-key`).
          </p>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Client-Side Isolated Storage:</strong> Stored strictly in your browser’s local storage and transmitted directly to Google’s API via HTTPS headers. Never sent to our servers.
            </span>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm text-slate-800"
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

          <div className="pt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 font-medium underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
            >
              Get a free Google AI Studio Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 rounded-lg"
          >
            Clear Key (Use Offline Engine)
          </button>
          <div className="flex gap-2">
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
