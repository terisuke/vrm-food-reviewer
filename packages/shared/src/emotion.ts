export interface EmotionMarker {
  timestamp: number;           // Milliseconds from start
  emotion: 'joy' | 'surprised' | 'satisfied' | 'neutral';
  intensity: number;           // 0.0 - 1.0
  duration?: number;           // Optional duration in ms
}

export interface EmotionSequence {
  markers: EmotionMarker[];
  totalDuration: number;
}

export type EmotionType = 'joy' | 'surprised' | 'satisfied' | 'neutral';