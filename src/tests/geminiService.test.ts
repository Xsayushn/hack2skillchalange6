import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessage } from '../services/geminiService';
import { AssistantContext, ChatMessage } from '../types/assistant';
import { chatRateLimiter } from '../services/security';

describe('Gemini and Heuristic Reasoning Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    chatRateLimiter.reset();
  });

  const context: AssistantContext = {
    cityName: 'Delhi NCR',
    currentAqi: 385,
    aqiCategory: 'Very Unhealthy',
    pm25: 290,
    inversionLayerActive: true,
    vulnerabilities: ['Infant/Child', 'Respiratory/Asthma'],
    hasPurifier: false,
    commuteMode: 'Private Car'
  };

  it('generates heuristic response with inversion details when asked about smog or weather', async () => {
    const response = await sendChatMessage([], 'When will the winter smog clear and is thermal inversion happening?', context);

    expect(response.role).toBe('assistant');
    expect(response.content).toContain('Thermal Inversion');
    expect(response.content).toContain('Delhi NCR');
    expect(response.suggestedActions?.length).toBeGreaterThan(0);
  });

  it('generates DIY air purifier recommendations when asked about low-cost filters', async () => {
    const response = await sendChatMessage([], 'How do I build a low cost air purifier?', context);

    expect(response.content).toContain('Corsi-Rosenthal');
    expect(response.content).toContain('MERV 13');
  });

  it('protects vulnerable groups with customized advice', async () => {
    const response = await sendChatMessage([], 'How do I protect my toddler and grandmother with asthma?', context);

    expect(response.content).toContain('Child');
    expect(response.content).toContain('Sanctuary');
  });

  it('authenticates via x-goog-api-key header and includes chat history', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Live AI response generated.' }] } }]
      })
    } as Response);
    global.fetch = fetchMock;

    const history: ChatMessage[] = [
      { id: '1', role: 'user', content: 'What is AQI?', timestamp: '10:00' },
      { id: '2', role: 'assistant', content: 'AQI measures air pollution.', timestamp: '10:01' }
    ];

    const result = await sendChatMessage(
      history,
      'Can my baby go outside?',
      context,
      'AIzaSyDummyKeyForTestingPurposes123456789'
    );

    expect(result.content).toBe('Live AI response generated.');
    expect(result.impactHighlight?.label).toBe('Live AI Active');
    expect(result.impactHighlight?.value).toContain('gemini-2.5-flash');
    
    // Verify header was passed
    expect(fetchMock).toHaveBeenCalled();
    const [calledUrl, options] = fetchMock.mock.calls[0];
    expect(calledUrl).not.toContain('?key='); // Verified: NO key in URL!
    expect(options.headers['x-goog-api-key']).toBe('AIzaSyDummyKeyForTestingPurposes123456789');

    // Verify conversation history was serialized
    const requestBody = JSON.parse(options.body);
    expect(requestBody.contents.length).toBe(3); // 2 history items + 1 new prompt
  });

  it('gracefully handles live API errors with informative fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: { message: 'API key expired' } })
    } as Response);

    const result = await sendChatMessage([], 'What should I do?', context, 'AIzaSyBadKey');

    expect(result.role).toBe('assistant');
    expect(result.impactHighlight?.label).toBe('Engine Status');
    expect(result.impactHighlight?.value).toContain('API key expired');
  });

  it('throttles excessive requests via chatRateLimiter', async () => {
    // Fill up the limiter (limit is 15)
    for (let i = 0; i < 15; i++) {
      chatRateLimiter.canProceed();
    }

    const throttledResult = await sendChatMessage([], 'Spam prompt', context);
    expect(throttledResult.content).toContain('Rate Limit Notice');
    expect(throttledResult.impactHighlight?.label).toBe('Rate Limiter');
  });
});
