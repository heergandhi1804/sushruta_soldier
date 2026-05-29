import { RealityLayer } from '../types/simulation';

export interface ManuscriptFragment {
  id: string;
  title: string;
  history: string;
  ayurveda: string;
  simulation: string;
}

export const manuscriptFragments: ManuscriptFragment[] = [
  {
    id: 'stage1-observe',
    title: 'Observation and Timing',
    history: 'Sushruta recorded how watching the pulse and swelling guided treatment decisions.',
    ayurveda: 'Ayurveda teaches that balance and observation are the first tools of a physician.',
    simulation: 'The simulation exaggerates color shifts and pressure meters so students can learn timing clearly.'
  },
  {
    id: 'stage2-marma',
    title: 'Marma Sensitivity',
    history: 'Ancient surgeons avoided vital points to prevent lasting harm.',
    ayurveda: 'Marma points are described as junctions of life force, vessels, and organs.',
    simulation: 'Points glow and show danger radius to support spatial reasoning without fantasy magic.'
  },
  {
    id: 'stage3-triage',
    title: 'Triage and Care',
    history: 'Early clinics used waiting order by severity to reduce risk for the most vulnerable.',
    ayurveda: 'Herbal anesthesia and postoperative herbs were documented to support recovery.',
    simulation: 'The decision chain is shown directly to connect choices with patient outcomes.'
  },
  {
    id: 'stage4-forge',
    title: 'Tools as Systems',
    history: 'Surgeons created tools adapted to anatomy and materials available locally.',
    ayurveda: 'Classical texts describe instrument function in terms of grip, weight, and precision.',
    simulation: 'Tool behavior is abstracted into measurable physics stats for design practice.'
  }
];

export const realityLabels: Record<RealityLayer, string> = {
  history: 'What historians know',
  ayurveda: 'What Ayurveda teaches',
  simulation: 'What the simulation exaggerates'
};
