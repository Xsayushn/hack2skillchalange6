import { AqiCategory, VulnerabilityLevel, StagnationRiskLevel } from './aqi';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  impactHighlight?: {
    label: string;
    value: string;
    type: 'positive' | 'warning' | 'info';
  };
}

export interface AssistantContext {
  cityName: string;
  currentAqi: number | null;
  aqiCategory: AqiCategory;
  pm25: number | null;
  estimatedStagnationRisk: StagnationRiskLevel;
  vulnerabilities: VulnerabilityLevel[];
  hasPurifier: boolean;
  commuteMode: string;
}
