/**
 * Security and sanitization utility functions
 * Provides prompt sanitization, rate limiting, and safe credential handling.
 */

/**
 * Sanitizes input text before passing to GenAI prompts:
 * - Trims excessive whitespace
 * - Strips ASCII control and null characters
 * - Enforces safe maximum character length (2048 chars)
 * Note: Does NOT HTML-escape characters so slashes and quotes remain natural for the LLM.
 */
export function sanitizePrompt(input: string, maxLength: number = 2048): string {
  if (!input) return '';
  return input
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .slice(0, maxLength)
    .trim();
}

/**
 * Basic HTML escaping for safe string rendering when React JSX is bypassed.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
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
  if (!key) return false;
  const trimmed = key.trim();
  // Standard AI Studio / Gemini API key format (usually starts with AIza and >= 35 chars)
  return trimmed.startsWith('AIza') && trimmed.length >= 35;
}

export class SimpleRateLimiter {
  private timestamps: number[] = [];
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    if (this.timestamps.length >= this.limit) {
      return false;
    }
    this.timestamps.push(now);
    return true;
  }

  getRemaining(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
    return Math.max(0, this.limit - this.timestamps.length);
  }

  reset(): void {
    this.timestamps = [];
  }
}

// Shared rate limiter instance for chat requests (15 requests per minute)
export const chatRateLimiter = new SimpleRateLimiter(15, 60000);
