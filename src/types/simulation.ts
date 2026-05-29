export type RealityLayer = 'history' | 'ayurveda' | 'simulation';

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
  age: number;
  weight: number;
  condition: string;
  painLevel: number;
  infectionRisk: number;
  urgency: number;
  status: 'waiting' | 'treated' | 'critical' | 'recovered';
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

export interface SavePayload {
  stage: number;
  scroll: ScrollMetrics;
  consequences: ConsequenceMetrics;
  history: string[];
}
