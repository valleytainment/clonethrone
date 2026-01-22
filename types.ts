
export enum View {
  DASHBOARD = 'DASHBOARD',
  REFINERY = 'REFINERY',
  STUDIO = 'STUDIO',
  ARCHIVE = 'ARCHIVE',
  SETTINGS = 'SETTINGS'
}

export enum VoiceEngine {
  KOKORO = 'Kokoro-82M',
  F5_TTS = 'F5-TTS',
  GEMINI_TTS = 'Gemini-TTS'
}

export interface Script {
  id: string;
  originalText: string;
  refinedText: string;
  sourceUrl?: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  scriptId: string;
  voiceEngine: VoiceEngine;
  sourceImage?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  audioUrl?: string;
  log: string[];
  createdAt: number;
}
