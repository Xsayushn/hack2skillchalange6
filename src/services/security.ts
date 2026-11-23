/**
 * Security and sanitization utility functions
 *
 * Implements:
 * 1. Ephemeral memory-only API key handling (never persists keys to localStorage).
 * 2. Prompt sanitization against control and null bytes.
 * 3. Client-side sliding-window rate limiter (UI-level throttle).
 * 4. Key masking and format validation.
 *
 * Production Security Notice:
 * Client-side API key transmission via HTTP headers protects against accidental URL log leakage.
 * However, because code runs in the browser, any client-held credential is fundamentally exposed
 * to the user and local extensions. For production enterprise deployments, a backend proxy with
 * token rotation and server-side rate limiting should always be implemented.
 */

// Ephemeral in-memory key storage for the active session (cleared on page reload or tab close)
let memoryApiKey: string | null = null;

export function setEphemeralApiKey(key: string | null): void {
  if (!key) {
    memoryApiKey = null;
    return;
  }
  memoryApiKey = key.trim();
}

export function getEphemeralApiKey(): string | null {
  return memoryApiKey;
}

export function clearEphemeralApiKey(): void {
  memoryApiKey = null;
}

/**
 * Sanitizes input text before passing to GenAI prompts:
 * - Strips ASCII control and null characters.
 * - Trims excessive whitespace.
 * - Enforces safe maximum character length.
 * Note: Does NOT HTML-escape characters so slashes, quotes, and punctuation remain natural for the LLM.
 */
export function sanitizePrompt(input: string, maxLength: number = 2048): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, maxLength)
    .trim();
}

/**
 * Basic HTML escaping for safe string rendering when React JSX is bypassed.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

// Backwards-compatible alias
export const sanitizeInput = sanitizePrompt;

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}••••••••${end}`;
}

export function validateApiKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  // Standard AI Studio / Gemini API key format (starts with AIza and >= 35 chars)
  return trimmed.startsWith('AIza') && trimmed.length >= 35;
}

/**
 * Client-Side Sliding-Window Rate Limiter
 *
 * Provides a UI-level throttle to prevent unintended double-submits and loop flooding.
 * Note: Can be bypassed by modifying client state; authoritative throttling must reside on a server proxy.
 */
export class SimpleRateLimiter {
  private timestamps: number[] = [];
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 15, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.limit) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }

  getRemaining(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.limit - this.timestamps.length);
  }

  reset(): void {
    this.timestamps = [];
  }
}

// Shared rate limiter instance for chat requests (15 requests per minute)
export const chatRateLimiter = new SimpleRateLimiter(15, 60000);
