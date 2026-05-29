import { ScrollMetrics } from '../types/simulation';

export const initialScrollMetrics: ScrollMetrics = {
  observation: 28,
  precision: 24,
  diagnosis: 22,
  ethics: 26,
  surgicalControl: 18,
  innovation: 16
};

export function adjustScrollMetrics(metrics: ScrollMetrics, changes: Partial<ScrollMetrics>): ScrollMetrics {
  return {
    observation: clamp(metrics.observation + (changes.observation ?? 0), 0, 100),
    precision: clamp(metrics.precision + (changes.precision ?? 0), 0, 100),
    diagnosis: clamp(metrics.diagnosis + (changes.diagnosis ?? 0), 0, 100),
    ethics: clamp(metrics.ethics + (changes.ethics ?? 0), 0, 100),
    surgicalControl: clamp(metrics.surgicalControl + (changes.surgicalControl ?? 0), 0, 100),
    innovation: clamp(metrics.innovation + (changes.innovation ?? 0), 0, 100)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
