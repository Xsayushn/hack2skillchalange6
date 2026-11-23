import { AqiCategory, VulnerabilityLevel } from './aqi';

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
  currentAqi: number;
  aqiCategory: AqiCategory;
  pm25: number;
  inversionLayerActive: boolean;
  vulnerabilities: VulnerabilityLevel[];
  hasPurifier: boolean;
  commuteMode: string;
}
