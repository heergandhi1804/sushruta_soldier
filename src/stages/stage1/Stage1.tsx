import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';

interface LeechOption {
  id: 'left' | 'right';
  name: string;
  texture: string;
  movement: string;
  color: string;
  head: string;
  category: 'medicinal' | 'poisonous';
  description: string;
}

const leeches: LeechOption[] = [
  {
    id: 'left',
    name: 'Jalauka (Medicinal)',
    texture: 'Smooth skin with fine emerald stripes',
    movement: 'Steady, rhythmic pulse with smooth undulations',
    color: 'Mottled olive and warm amber underbelly',
    head: 'Tapered, fine tip with rounded suction ridge',
    category: 'medicinal',
    description: 'Found in clean, slow-flowing forest streams under lotus pads.'
  },
  {
    id: 'right',
    name: 'Savisha (Poisonous)',
    texture: 'Rough, bumpy skin with raised black segments',
    movement: 'Sharp, jerky twists and hyperactive writhing',
    color: 'Dark reddish-brown with dusty grey spots',
    head: 'Broad, flat suction cup with jagged margins',
    category: 'poisonous',
    description: 'Found in stagnant mud pools near decaying vegetation.'
  }
];

const fragment = manuscriptFragments.find((item) => item.id === 'stage1-observe');

export default function Stage1() {
  const { realityLayer, updateScroll, updateConsequences, addHistory, setSushrutaDialogue } = useSimulation();
  const [selectedLeech, setSelectedLeech] = useState<LeechOption | null>(null);
  const [attached, setAttached] = useState(false);
  const [timer, setTimer] = useState(0);
  const [outcome, setOutcome] = useState<string>('Examine the leeches in the clay bowls. Select the one matching the classical teachings before starting therapy.');
  const [isComplete, setIsComplete] = useState(false);
  const [patientStatus, setPatientStatus] = useState({
    breathing: 'Calm, shallow breaths',
    skinColor: 'Dark purplish-red swelling',
    pulse: 'Rapid and hard (Pitta-Vata)'
  });

  const availableLeeches = useMemo(() => leeches, []);

  // Monitor leech attachment and time
  useEffect(() => {
    if (!attached) return;

    // Update patient states dynamically based on attachment time
    if (timer < 3) {
      setPatientStatus({
        breathing: 'Slightly deep, sighing breaths',
        skinColor: 'Dull red, swelling begins to tighten',
        pulse: 'Slightly bounding pulse'
      });
    } else if (timer >= 3 && timer <= 5) {
      setPatientStatus({
        breathing: 'Relieved, relaxed breathing',
        skinColor: 'Bright healthy red, swelling visibly reduced',
        pulse: 'Stable and soft pulse'
      });
    } else if (timer > 5) {
      setPatientStatus({
        breathing: 'Rapid, shallow gasps',
        skinColor: 'Pale, cold skin surrounding the wound',
        pulse: 'Weak, thready pulse (Prana fading)'
      });
    }

    if (timer >= 6) {
      setOutcome('The leech was left attached for too long. It began draining the guard\'s vital blood (Ojas).');
      setIsComplete(true);
      updateConsequences({ bloodLoss: 20, pain: 12, inflammation: 5, trust: -10, permanentDamage: 5 });
      addHistory('Stage 1: Missed the removal window, resulting in severe patient blood loss.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Alas, you failed to observe the patient! The leech drew beyond the stagnant blood, weakening the guard\'s life force. This is a severe lesson.',
        expression: 'concerned'
      });
    }
  }, [attached, timer, updateConsequences, addHistory, setSushrutaDialogue]);

  useEffect(() => {
    let interval: number | undefined;
    if (attached && timer < 6 && !isComplete) {
      interval = window.setInterval(() => setTimer((current) => current + 1), 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [attached, timer, isComplete]);

  const activeFragment = fragment ? fragment[realityLayer] : '';

  function handleLeechSelection(option: LeechOption) {
    if (attached) return;
    setSelectedLeech(option);

    if (option.category === 'medicinal') {
      setOutcome('You have chosen the Jalauka. Place it on the guard\'s swollen leg near the stagnant blood vessel.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Indeed. The olive skin and steady pulse denote the medicinal leech. It will suck only the impure humors. Proceed with the application.',
        expression: 'calm'
      });
    } else {
      setOutcome('Warning: This leech displays poisonous traits. Applying it will cause toxic fever.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Halt, disciple! Notice the rough black segments and hyperactive twists. That is a poisonous Savisha leech. Look at the scriptures before you harm a guard of Kashi.',
        expression: 'concerned'
      });
    }

    updateScroll({ observation: 4 });
  }

  function handleAttach() {
    if (!selectedLeech || attached) return;
    setAttached(true);
    setTimer(0);
    setOutcome('The leech is attached and begins to pulse. Monitor the swelling height and the guard\'s breathing closely.');
    addHistory('Stage 1: Leech attached, starting therapy timer.');
    setSushrutaDialogue({
      speaker: 'Acharya Sushruta',
      text: 'It is drawing. Watch the movement of its neck and the color of the skin. Be ready to apply honey or turmeric to release it at the exact moment.',
      expression: 'thoughtful'
    });
  }

  function handleRemove() {
    if (!attached || isComplete) return;
    const correctWindow = timer >= 4 && timer <= 5;
    const wasWrongLeech = selectedLeech?.category === 'poisonous';
    let summary = '';

    if (wasWrongLeech) {
      summary = 'The poisonous Savisha leech injected toxic humors. The guard developed a burning fever and heavy localized inflammation.';
      updateConsequences({ pain: 20, inflammation: 15, infection: 18, trust: -15 });
      updateScroll({ ethics: -6, precision: -2 });
      addHistory('Stage 1: Used a poisonous leech, causing fever.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'A dangerous mistake! You ignored the visual warnings of the Savisha leech. Apply a cooling paste of sandalwood immediately to save his leg.',
        expression: 'concerned'
      });
    } else if (!correctWindow) {
      if (timer < 4) {
        summary = 'Released too early. The impure blood was not fully drained, leaving the swelling and pain unresolved.';
        updateConsequences({ pain: 6, inflammation: 8, trust: -4 });
        updateScroll({ precision: -2 });
        setSushrutaDialogue({
          speaker: 'Acharya Sushruta',
          text: 'You panicked and removed it too early. A healer must possess the patience of the earth. The humors are still blockaded.',
          expression: 'thoughtful'
        });
      } else {
        summary = 'Released too late. The leech finished the bad blood and drew healthy blood, leaving the patient pale and weak.';
        updateConsequences({ bloodLoss: 15, pain: 8, trust: -6 });
        updateScroll({ precision: -4 });
        setSushrutaDialogue({
          speaker: 'Acharya Sushruta',
          text: 'Too late! You allowed the creature to gorge on his vital strength. Observe the guard\'s pale skin next time.',
          expression: 'concerned'
        });
      }
      addHistory(`Stage 1: Leech removed at ${timer} seconds (incorrect window).`);
    } else {
      summary = 'Perfect release! The swelling collapsed, the color returned to normal, and the guard thanked you with a deep breath of relief.';
      updateConsequences({ inflammation: -25, pain: -18, bloodLoss: -10, trust: 15, recovery: 15 });
      updateScroll({ observation: 8, precision: 8, surgicalControl: 6 });
      addHistory('Stage 1: Perfect timing. Swelling resolved.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Splendidly done, my disciple! You timed the release perfectly as the swelling receded. You have taken your first true step as a surgeon.',
        expression: 'approving'
      });
    }

    setOutcome(summary);
    setIsComplete(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Simulation Workspace */}
      <section className="space-y-6 rounded-[32px] border border-amber/15 bg-white/70 p-6 shadow-parchment relative">
        <div className="border-b border-indigo/15 pb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Chapter 1</span>
          <h3 className="font-serif text-2xl font-bold text-indigo">The Pressure Test</h3>
          <p className="mt-1 text-sm text-indigo/70">
            A royal guard of Kashi lies in the courtyard with a severely swollen military wound. Choose the medicinal leech and monitor the blood-letting.
          </p>
        </div>

        {/* The Bamboo Bed (Patient Visuals) */}
        <div className="relative overflow-hidden rounded-[24px] border border-amber/20 bg-gradient-to-br from-amber-100/40 via-parchment/60 to-amber-200/20 p-6 shadow-inner">
          {/* Bamboo Woven Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b36b32_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="rounded-full bg-indigo/5 border border-indigo/10 px-3 py-1 text-xs font-semibold text-indigo">
                Patient: Kashi Royal Guard
              </span>
              <div className="mt-4 space-y-2 text-sm text-indigo/80">
                <p><strong>Respiration:</strong> {patientStatus.breathing}</p>
                <p><strong>Skin Appearance:</strong> {patientStatus.skinColor}</p>
                <p><strong>Pulse Rate:</strong> {patientStatus.pulse}</p>
              </div>
            </div>

            {/* Swelling Visual Meter */}
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/60 p-4 border border-indigo/5 w-40">
              <span className="text-xs font-bold text-indigo/70 uppercase">Wound Swelling</span>
              <div className="relative w-8 h-28 rounded-full bg-indigo/5 border border-indigo/10 overflow-hidden">
                <motion.div
                  animate={{
                    height: attached ? `${Math.max(10, 100 - timer * 15)}%` : '100%'
                  }}
                  transition={{ duration: 0.8 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-danger to-amber-600 rounded-b-full"
                />
              </div>
              <span className="text-xs font-bold text-danger">
                {attached ? `${Math.max(10, 100 - timer * 15)}% Height` : '100% Height'}
              </span>
            </div>
          </div>
        </div>

        {/* Leech Clay Containers */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-indigo uppercase tracking-wider">Leech Vessels (Clay Jars)</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {availableLeeches.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleLeechSelection(option)}
                className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition-all ${
                  selectedLeech?.id === option.id
                    ? 'border-amber bg-amber/10 shadow-md'
                    : 'border-indigo/10 bg-white/90 hover:border-amber/40 hover:bg-parchment/30'
                }`}
                disabled={attached}
              >
                <div className="flex justify-between items-center border-b border-indigo/5 pb-2">
                  <span className="font-serif font-bold text-indigo text-base">{option.name}</span>
                  <span className="text-xs text-amber font-bold uppercase tracking-wider">{option.category}</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-indigo/70">
                  <li><strong>Skin:</strong> {option.texture}</li>
                  <li><strong>Pulse:</strong> {option.movement}</li>
                  <li><strong>Color:</strong> {option.color}</li>
                  <li><strong>Mouth:</strong> {option.head}</li>
                </ul>
                <p className="mt-3 text-[11px] italic text-indigo/60 border-t border-indigo/5 pt-2">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-indigo/10 pt-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAttach}
              disabled={!selectedLeech || attached}
              className="rounded-full bg-gradient-to-r from-herbal to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-400 disabled:opacity-50"
            >
              Attach Leech
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={!attached || isComplete}
              className="rounded-full border border-indigo/10 bg-parchment px-6 py-3 text-sm font-bold text-indigo shadow-sm hover:bg-indigo/5 active:scale-95 disabled:cursor-not-allowed disabled:text-slate-400 disabled:opacity-50"
            >
              Release with Honey
            </button>
          </div>

          <div className="rounded-2xl bg-indigo/5 px-4 py-3 text-sm font-semibold text-indigo">
            {attached ? (
              <span className="text-amber animate-pulse">
                ⏳ Drawing Blood: {timer} seconds
              </span>
            ) : (
              <span>⌛ Start therapy to trigger timing</span>
            )}
          </div>
        </div>
      </section>

      {/* Narrative & Scroll Panels */}
      <aside className="space-y-6">
        {/* Outcome Box */}
        <div className="rounded-[32px] border border-amber/15 bg-amber-50/50 p-5 shadow-parchment">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Observations</span>
          <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/5 pb-2">Therapy Narrative</h4>
          <p className="mt-3 text-sm leading-6 text-indigo/80">
            {outcome}
          </p>
        </div>

        {/* Epistemology Manuscript Scroll */}
        <div className="rounded-[32px] border border-indigo/15 bg-parchment-scroll p-6 shadow-parchment relative">
          <div className="absolute top-0 bottom-0 left-4 w-[1px] bg-amber-700/10" />
          <div className="pl-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Epistemological Source</span>
            <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/10 pb-2">
              Manuscript Fragment
            </h4>
            <p className="mt-4 text-sm leading-7 text-indigo/80 italic font-light">
              {activeFragment}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
