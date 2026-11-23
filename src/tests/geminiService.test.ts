import { describe, it, expect } from 'vitest';
import { sendChatMessage } from '../services/geminiService';
import { AssistantContext } from '../types/assistant';

describe('Gemini and Heuristic Reasoning Engine', () => {
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
});
