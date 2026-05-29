import { RealityLayer } from '../types/simulation';

export interface ManuscriptFragment {
  id: string;
  title: string;
  pratyaksha: string; // Observation
  shastra: string;     // Scriptural Teachings
  anumana: string;     // Causal Inference
}

export const manuscriptFragments: ManuscriptFragment[] = [
  {
    id: 'stage1-observe',
    title: 'Observation and Timing (Leech Therapy)',
    pratyaksha: 'Observe the guard\'s swollen leg: the skin color is dark red, the pulse is irregular, and the fluid is congested. The medicinal leech moves steadily with a gentle undulation.',
    shastra: 'Sushruta Samhita, Sutrasthana, Chapter 13: "If the leech is of the medicinal variety, it is tapered, mottled olive and amber. It must be applied to remove the impure blood first before healthy tissue is affected."',
    anumana: 'Inference: Swelling pressure decreases by 3% every second the medicinal leech drains the wound. Exceeding 5 seconds causes pain and blood loss to spike as healthy blood is drawn.'
  },
  {
    id: 'stage2-marma',
    title: 'Marma Sensitivity (Vital Junctions)',
    pratyaksha: 'Direct sight shows three critical nerve and vessel centers: Janu (knee joint), Manya (neck cluster), and Sira (deep vessel line). Touch reveals high temperature and throbbing near the joint.',
    shastra: 'Sushruta Samhita, Sharirasthana, Chapter 6: "Marma points are the junctions of organic structures, vessels, ligaments, bones, and muscles where the vital breath (Prana) resides. Striking them leads to heavy blood loss, nerve paralysis, or death."',
    anumana: 'Inference: Placing the treatment tool inside a 20-30px radius of these vital centers risks severing the flow of Prana. Safe regions exist only in the superficial outer muscle margins.'
  },
  {
    id: 'stage3-triage',
    title: 'Triage and Care (Storm of Kashi)',
    pratyaksha: 'Six patients lie on woven mats, shivering as the rain lashes the recovery hall. A child cries softly clutching a head wound; a soldier bleeds from a deep slice; a farmer groans from a broken limb.',
    shastra: 'Sushruta Samhita, Sutrasthana, Chapter 25: "A physician must treat patients based on the severity of their suffering, prioritizing those whose breath is failing, for neglecting them is a violation of the sacred duty of healing (Dharma)."',
    anumana: 'Inference: Triage delay increases infection risk by 1% per second for critical cases. Higher urgency patients experience double the rate of trust decay and pain increase if left waiting.'
  },
  {
    id: 'stage4-forge',
    title: 'Tools as Systems (Shastra-Yantra)',
    pratyaksha: 'Observe the copper plates, the steel jaws, and the animal beak patterns. Each shape dictates how the tool grips, probes, or extracts.',
    shastra: 'Sushruta Samhita, Sutrasthana, Chapter 7: "The mouth of a crow, an eagle, or a heron represents the shapes that nature has perfected for gripping. A surgeon\'s hand extensions must mimic these animal jaws to grip tissue with precision and strength."',
    anumana: 'Inference: A shorter handle decreases extraction time but increases risk by 2% due to restricted visibility. Heavy jaw weights increase grip strength but lower precision.'
  }
];

export const realityLabels: Record<RealityLayer, string> = {
  pratyaksha: 'Pratyaksha (Direct Observation)',
  shastra: 'Shastra (Ayurvedic Scripture)',
  anumana: 'Anumana (Causal Inference)'
};

