export type GameMode = 'menu' | 'play' | 'play-active' | 'sandbox' | 'settings';

export type RealityLayer = 'pratyaksha' | 'shastra' | 'anumana';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface ScrollMetrics {
  observation: number;
  precision: number;
  diagnosis: number;
  ethics: number;
  surgicalControl: number;
  innovation: number;
}

export interface ConsequenceMetrics {
  pain: number;
  bloodLoss: number;
  inflammation: number;
  infection: number;
  recovery: number;
  trust: number;
  permanentDamage: number;
}

export interface PatientProfile {
  id: string;
  name: string;
  occupation: string;
  age: number;
  weight: number;
  condition: string;
  story: string;
  painLevel: number;
  infectionRisk: number;
  urgency: number;
  status: 'waiting' | 'treated' | 'critical' | 'recovered';
  visualId: string;
  waitTime: number;
}

export interface SandboxElement {
  id: string;
  type: 'swelling' | 'vein' | 'marma' | 'foreign_body' | 'fracture';
  x: number; // percentage width
  y: number; // percentage height
  size: number;
}

export interface ToolOption {
  id: string;
  label: string;
  precision: number;
  gripStrength: number;
  speed: number;
  risk: number;
}

export interface MarmaPoint {
  id: string;
  name: string;
  dangerLevel: number;
  radius: number;
  effect: string;
  visible: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: string;
}

export interface SushrutaDialogueState {
  speaker: string;
  text: string;
  expression: 'calm' | 'thoughtful' | 'concerned' | 'approving' | 'storytelling';
}

export interface SavePayload {
  stage: number;
  scroll: ScrollMetrics;
  consequences: ConsequenceMetrics;
  history: string[];
}


