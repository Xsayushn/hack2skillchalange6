import { describe, it, expect } from 'vitest';
import {
  sanitizePrompt,
  sanitizeHtml,
  maskApiKey,
  validateApiKey,
  SimpleRateLimiter,
  setEphemeralApiKey,
  getEphemeralApiKey,
  clearEphemeralApiKey,
} from '../services/security';

describe('Security & Credential Sanitization Utilities', () => {
  it('manages ephemeral API key strictly in memory without touching localStorage', () => {
    clearEphemeralApiKey();
    expect(getEphemeralApiKey()).toBeNull();

    setEphemeralApiKey('AIzaSyTestEphemeralKey1234567890123456789');
    expect(getEphemeralApiKey()).toBe('AIzaSyTestEphemeralKey1234567890123456789');

    // Verify localStorage was NOT modified
    expect(localStorage.getItem('aeroguardian_gemini_key')).toBeNull();

    clearEphemeralApiKey();
    expect(getEphemeralApiKey()).toBeNull();
  });

  it('sanitizes prompt text without mangling natural slashes, math, or quotes', () => {
    const raw = 'How do I clean PM2.5 / PM10 in 1/2 hr? "Test" \u0000\u0007\u001F';
    const clean = sanitizePrompt(raw);

    expect(clean).toContain('/');
    expect(clean).toContain('"Test"');
    expect(clean).not.toContain('\u0000');
    expect(clean).not.toContain('\u0007');
    expect(clean).not.toContain('\u001F');
    expect(clean).not.toContain('&#x2F;'); // No artificial HTML escaping in LLM prompt
  });

  it('enforces maximum character length limit on prompts', () => {
    const longInput = 'A'.repeat(3000);
    const sanitized = sanitizePrompt(longInput, 500);

    expect(sanitized.length).toBe(500);
  });

  it('escapes HTML tags when safe DOM string rendering is required', () => {
    const malicious = '<script>alert("xss")</script>&"\'';
    const escaped = sanitizeHtml(malicious);

    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
    expect(escaped).toContain('&quot;');
  });

  it('masks API keys securely showing only 4-char prefix and suffix', () => {
    const key = 'AIzaSyDemoSecretKeyForGoogleGeminiApi123';
    const masked = maskApiKey(key);

    expect(masked.startsWith('AIza')).toBe(true);
    expect(masked.endsWith('i123')).toBe(true);
    expect(masked).toContain('••••••••');
  });

  it('validates Google Gemini API key format correctly', () => {
    expect(validateApiKey('AIzaSyAbcdefghijklmnopqrstuvwxyz1234567')).toBe(true);
    expect(validateApiKey('invalid-key-too-short')).toBe(false);
    expect(validateApiKey('NotAIzaSyAbcdefghijklmnopqrstuvwxyz1234567')).toBe(false);
    expect(validateApiKey('')).toBe(false);
  });

  it('enforces client-side rate limiting sliding window', () => {
    const limiter = new SimpleRateLimiter(3, 5000); // 3 calls per 5s
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false); // 4th blocked
    expect(limiter.getRemaining()).toBe(0);

    limiter.reset();
    expect(limiter.canProceed()).toBe(true);
  });
});
