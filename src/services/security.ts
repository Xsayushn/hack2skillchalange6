/**
 * Security and sanitization utility functions
 * Provides XSS protection, rate limiting, and safe credential handling.
 */

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}••••••••${end}`;
}

export function validateApiKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  // Standard AI Studio / Gemini API key format (typically AIzaSy... 39 chars)
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
}
