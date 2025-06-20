export interface VoicevoxRequest {
  text: string;
  speaker: number;      // Speaker ID (0-46 available)
  speedScale?: number;  // 0.5-2.0, default 1.0
  pitchScale?: number;  // 0.0-2.0, default 0.0
  intonationScale?: number; // 0.0-2.0, default 1.0
  volumeScale?: number; // 0.0-2.0, default 1.0
}

export interface VoicevoxResponse {
  audioBuffer: ArrayBuffer;
  duration: number;
}

export interface VoicevoxSpeaker {
  id: number;
  name: string;
  styles: VoicevoxStyle[];
}

export interface VoicevoxStyle {
  id: number;
  name: string;
  type?: 'talk' | 'happy' | 'sad' | 'angry';
}

export interface AudioSynthesisRequest {
  text: string;
  speakerId?: number;
  emotion?: 'neutral' | 'happy' | 'excited' | 'satisfied';
}

export interface AudioSynthesisResponse {
  audioUrl: string;
  duration: number;
  text: string;
}