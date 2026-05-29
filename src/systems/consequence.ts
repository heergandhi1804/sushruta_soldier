import { ConsequenceMetrics } from '../types/simulation';

export const initialConsequences: ConsequenceMetrics = {
  pain: 45,
  bloodLoss: 40,
  inflammation: 52,
  infection: 12,
  recovery: 35,
  trust: 60,
  permanentDamage: 0
};

export function adjustConsequences(metrics: ConsequenceMetrics, changes: Partial<ConsequenceMetrics>): ConsequenceMetrics {
  return {
    pain: clamp(metrics.pain + (changes.pain ?? 0), 0, 100),
    bloodLoss: clamp(metrics.bloodLoss + (changes.bloodLoss ?? 0), 0, 100),
    inflammation: clamp(metrics.inflammation + (changes.inflammation ?? 0), 0, 100),
    infection: clamp(metrics.infection + (changes.infection ?? 0), 0, 100),
    recovery: clamp(metrics.recovery + (changes.recovery ?? 0), 0, 100),
    trust: clamp(metrics.trust + (changes.trust ?? 0), 0, 100),
    permanentDamage: clamp(metrics.permanentDamage + (changes.permanentDamage ?? 0), 0, 100)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
