import { describe, it, expect } from 'vitest';
import { sanitizeInput, maskApiKey, validateApiKey, SimpleRateLimiter } from '../services/security';

describe('Security Utilities', () => {
  it('sanitizes malicious script and HTML inputs to prevent XSS', () => {
    const malicious = '<script>alert("hacked")</script><img src=x onerror=alert(1)>';
    const clean = sanitizeInput(malicious);

    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
    expect(clean).toContain('&lt;img');
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
