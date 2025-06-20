import { EmotionMarker, EmotionType } from './emotion';

export interface VRMController {
  loadVRM(url: string): Promise<VRM>;
  setExpression(emotion: EmotionType, intensity: number): void;
  playEmotionSequence(markers: EmotionMarker[]): void;
  reset(): void;
}

export interface VRMLoadOptions {
  url: string;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
}

export interface VRMExpressionPreset {
  neutral: string;
  joy: string;
  surprised: string;
  satisfied: string;
}

export interface VRMCharacter {
  id: string;
  name: string;
  modelUrl: string;
  expressions: VRMExpressionPreset;
  defaultPosition: { x: number; y: number; z: number };
}

// Re-export VRM from @pixiv/three-vrm when available
export interface VRM {
  scene: any; // THREE.Object3D
  expressionManager?: any;
  lookAt?: any;
  humanoid?: any;
}