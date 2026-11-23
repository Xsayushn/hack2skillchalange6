import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendChatMessage,
  generateHeuristicResponse,
  buildSystemPrompt,
  GEMINI_MODEL_ID,
} from '../services/geminiService';
import { AssistantContext } from '../types/assistant';

describe('Gemini 3.8 Flash & Heuristic Intelligence Service', () => {
  const dummyContext: AssistantContext = {
    cityName: 'Delhi NCR',
    currentAqi: 320,
    aqiCategory: 'Very Unhealthy',
    pm25: 240,
    estimatedStagnationRisk: 'High',
    vulnerabilities: ['Infant/Child', 'Respiratory/Asthma'],
    hasPurifier: true,
    commuteMode: 'Private Car',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds system prompt conforming strictly to environmental science and medical safety rules', () => {
    const prompt = buildSystemPrompt(dummyContext);

    expect(prompt).toContain('Delhi NCR');
    expect(prompt).toContain('320 (Very Unhealthy)');
    // Must contain scientific disclaimers:
    expect(prompt).toContain('NO UNIVERSAL TIME WINDOWS');
    expect(prompt).toContain('NO MEDICAL DIAGNOSIS');
    expect(prompt).toContain('indoor air quality is not directly measured');
    expect(prompt).not.toContain('temperature');
  });

  it('sends API key via x-goog-api-key HTTP header and excludes unsupported generationConfig parameters', async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: Record<string, unknown> = {};

    global.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      capturedBody = JSON.parse((init?.body as string) || '{}');

      return Promise.resolve({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Here is your scientifically sound air quality advice.' }],
              },
            },
          ],
        }),
      } as Response);
    });

    const testKey = 'AIzaSyTestValidKey12345678901234567890123';
    const response = await sendChatMessage(
      [],
      'How do I protect my child today?',
      dummyContext,
      testKey
    );

    // Verify header authentication:
    expect(capturedHeaders['x-goog-api-key']).toBe(testKey);
    expect(capturedHeaders['Content-Type']).toBe('application/json');

    // Verify generationConfig does NOT include deprecated temperature, topK, or topP:
    const genConfig = (capturedBody.generationConfig as Record<string, unknown>) || {};
    expect(genConfig).toBeDefined();
    expect(genConfig.temperature).toBeUndefined();
    expect(genConfig.topK).toBeUndefined();
    expect(genConfig.topP).toBeUndefined();
    expect(genConfig.maxOutputTokens).toBe(1024);

    expect(response.role).toBe('assistant');
    expect(response.content).toContain('scientifically sound');
    expect(response.impactHighlight?.value).toContain(GEMINI_MODEL_ID);
  });

  it('gracefully handles 400 invalid-key error with informative fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'API key not valid' } }),
    } as Response);

    const response = await sendChatMessage(
      [],
      'What should I do during high smog?',
      dummyContext,
      'AIzaSyInvalidKey1234567890123456789012'
    );

    expect(response.content).toBeDefined();
    expect(response.impactHighlight?.label).toBe('Engine Status');
    expect(response.impactHighlight?.value).toContain('invalid');
  });

  it('gracefully handles 429 quota error with informative fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: 'Resource has been exhausted (e.g. check quota).' } }),
    } as Response);

    const response = await sendChatMessage(
      [],
      'How to ventilate?',
      dummyContext,
      'AIzaSyValidKey12345678901234567890123'
    );

    expect(response.impactHighlight?.value).toContain('rate limit');
  });

  it('handles empty response or blocked safety triggers cleanly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [] }),
    } as Response);

    const response = await sendChatMessage(
      [],
      'Is air bad?',
      dummyContext,
      'AIzaSyValidKey12345678901234567890123'
    );

    expect(response.content).toBeDefined();
    expect(response.impactHighlight?.value).toContain('empty response');
  });

  it('operates via offline heuristic engine with zero setup when no key is provided', async () => {
    const response = await sendChatMessage(
      [],
      'Tell me about the Corsi-Rosenthal box',
      dummyContext,
      ''
    );

    expect(response.role).toBe('assistant');
    expect(response.content).toContain('Corsi-Rosenthal');
    expect(response.content).toContain('MERV-13');
    expect(response.suggestedActions?.length).toBeGreaterThan(0);
  });

  it('heuristic engine warns against natural ventilation when AQI is elevated', () => {
    const unhealthyContext: AssistantContext = {
      ...dummyContext,
      currentAqi: 220,
    };
    const response = generateHeuristicResponse('Can I open the windows today?', unhealthyContext);

    expect(response.content).toContain('Natural Ventilation Not Recommended');
    expect(response.content).toContain('Combustion Safety Warning');
  });
});
