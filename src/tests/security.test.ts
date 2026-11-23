import { describe, it, expect } from 'vitest';
import { sanitizePrompt, sanitizeHtml, maskApiKey, validateApiKey, SimpleRateLimiter } from '../services/security';

describe('Security Utilities', () => {
  it('sanitizes prompt text without mutilating slashes or quotes', () => {
    const raw = 'How do I clean PM2.5 / PM10 in 1/2 hour? \u0000\u0007';
    const clean = sanitizePrompt(raw);

    expect(clean).toContain('/');
    expect(clean).not.toContain('\u0000');
    expect(clean).not.toContain('&#x2F;'); // Confirmed: no artificial HTML entity inside LLM prompt
  });

  it('escapes HTML tags for safe DOM insertion when needed', () => {
    const malicious = '<script>alert("xss")</script>';
    const escaped = sanitizeHtml(malicious);

    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;');
  });

  it('masks API keys securely showing only prefix and suffix', () => {
    const key = 'AIzaSyDemoSecretKeyForGoogleGeminiApi123';
    const masked = maskApiKey(key);

    expect(masked.startsWith('AIza')).toBe(true);
    expect(masked.endsWith('i123')).toBe(true);
    expect(masked).toContain('••••••••');
  });

  it('validates Gemini API key format correctly', () => {
    expect(validateApiKey('AIzaSyAbcdefghijklmnopqrstuvwxyz1234567')).toBe(true);
    expect(validateApiKey('invalid-key')).toBe(false);
    expect(validateApiKey('')).toBe(false);
  });

  it('enforces rate limiting window correctly', () => {
    const limiter = new SimpleRateLimiter(3, 5000); // 3 calls per 5s
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(true);
    expect(limiter.canProceed()).toBe(false); // 4th blocked
  });
});
