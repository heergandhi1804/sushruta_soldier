import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';
import { RealityLayer } from '../../types/simulation';

interface LeechOption {
  id: 'left' | 'right';
  texture: string;
  movement: string;
  color: string;
  head: string;
  category: 'medicinal' | 'poisonous';
}

const leeches: LeechOption[] = [
  {
    id: 'left',
    texture: 'smooth with subtle banding',
    movement: 'steady pulse with gentle undulation',
    color: 'mottled olive and amber',
    head: 'tapered with rounded ridge',
    category: 'medicinal'
  },
  {
    id: 'right',
    texture: 'rough with visible segments',
    movement: 'sharp jerks and restless twisting',
    color: 'darker red-brown',
    head: 'broad flat edge',
    category: 'poisonous'
  }
];

const fragment = manuscriptFragments.find((item) => item.id === 'stage1-observe');

export default function Stage1() {
  const { realityLayer, updateScroll, updateConsequences, addHistory } = useSimulation();
  const [selectedLeech, setSelectedLeech] = useState<LeechOption | null>(null);
  const [attached, setAttached] = useState(false);
  const [timer, setTimer] = useState(0);
  const [outcome, setOutcome] = useState<string>('Select the leech that matches the wound and observe the swelling before attachment.');
  const [isComplete, setIsComplete] = useState(false);
  const [consequenceSummary, setConsequenceSummary] = useState<string>('');

  const availableLeeches = useMemo(() => leeches, []);

  useEffect(() => {
    if (!attached) return;
    if (timer >= 6) {
      setOutcome('The leech remained too long and the patient began to lose healthy blood.');
      setIsComplete(true);
      updateConsequences({ bloodLoss: 18, pain: 10, inflammation: 6, trust: -8, permanentDamage: 4 });
      addHistory('Stage 1: missed the removal window, resulting in excess blood loss.');
    }
  }, [attached, timer, updateConsequences, addHistory]);

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
    setOutcome('You selected a leech. Attach it to begin monitoring swelling, pressure, and color change.');
    updateScroll({ observation: 4, precision: 2 });
    addHistory(`Stage 1: selected the ${option.category} leech.`);
  }

  function handleAttach() {
    if (!selectedLeech || attached) return;
    setAttached(true);
    setTimer(0);
    setOutcome('The leech is attached. Observe the body expansion, pulsation, and swelling change before removal.');
    addHistory('Stage 1: leech attached, entering timing window.');
  }

  function handleRemove() {
    if (!attached || isComplete) return;
    const correctWindow = timer >= 4 && timer <= 5;
    const wasWrongLeech = selectedLeech?.category === 'poisonous';
    let summary = '';

    if (wasWrongLeech) {
      summary = 'The poison leech caused distress and infection risk despite correct timing.';
      updateConsequences({ pain: 14, inflammation: 10, infection: 8, trust: -12 });
      updateScroll({ ethics: -4 });
    } else if (!correctWindow) {
      summary = timer < 4 ? 'Removal was too early. Drainage was insufficient and swelling remains.' : 'Removal was too late and healthy blood was lost.';
      updateConsequences({ bloodLoss: timer < 4 ? 4 : 12, pain: 8, trust: -6 });
      updateScroll({ precision: -3 });
    } else {
      summary = 'Excellent timing. The wound drained appropriately and swelling began to ease.';
      updateConsequences({ inflammation: -18, pain: -12, bloodLoss: -8, trust: 6, recovery: 8 });
      updateScroll({ observation: 6, precision: 6, surgicalControl: 4 });
    }

    setOutcome(summary);
    setIsComplete(true);
    setConsequenceSummary(summary);
    addHistory(`Stage 1: removal outcome - ${summary}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4 rounded-3xl border border-indigo/10 bg-parchment/80 p-5 shadow-parchment">
        <h3 className="text-xl font-semibold">The Pressure Test</h3>
        <p className="text-sm leading-6 text-indigo/75">
          The royal guard arrives with a swollen wound. Study the two leeches before choosing one. Observe texture, movement, color, and head shape.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {availableLeeches.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleLeechSelection(option)}
              className={`rounded-3xl border p-4 text-left transition ${
                selectedLeech?.id === option.id
                  ? 'border-indigo bg-indigo/10'
                  : 'border-indigo/10 bg-white/80 hover:border-indigo/80'
              }`}
              aria-label={`Select ${option.id} leech`}
            >
              <p className="text-base font-semibold text-indigo">Leech {option.id === 'left' ? 'A' : 'B'}</p>
              <ul className="mt-3 space-y-2 text-sm text-indigo/70">
                <li><strong>Texture</strong>: {option.texture}</li>
                <li><strong>Movement</strong>: {option.movement}</li>
                <li><strong>Body color</strong>: {option.color}</li>
                <li><strong>Head shape</strong>: {option.head}</li>
              </ul>
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-indigo/10 bg-white/90 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-indigo">Attachment timing and observation</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAttach}
                disabled={!selectedLeech || attached}
                className="rounded-full bg-herbal px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Attach
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={!attached || isComplete}
                className="rounded-full border border-indigo/10 bg-parchment px-4 py-2 text-sm font-semibold text-indigo disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Remove
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatusMeter label="Inflammation" value={selectedLeech ? 72 - timer * 3 : 72} color="amber" />
            <StatusMeter label="Blood Health" value={selectedLeech ? 44 + timer * 2 : 44} color="herbal" />
            <StatusMeter label="Pain" value={selectedLeech ? 58 - timer * 2 : 58} color="danger" />
          </div>
          <div className="mt-4 rounded-3xl bg-indigo/5 p-4 text-sm text-indigo/80">
            <p className="font-semibold">Observation Window</p>
            <p>{attached ? `Attachment timer: ${timer} seconds` : 'Start attachment to begin the live timing window.'}</p>
          </div>
        </div>
      </section>
      <aside className="space-y-4 rounded-3xl border border-indigo/10 bg-white/90 p-5 shadow-parchment">
        <div className="rounded-3xl bg-indigo/5 p-4">
          <p className="text-sm uppercase tracking-[0.35em] text-amber">Patient state</p>
          <div className="mt-4 space-y-3 text-sm text-indigo/75">
            <p><strong>Status:</strong> Royal guard with swelling, redness, and fluid buildup.</p>
            <p><strong>Outcome:</strong> {outcome}</p>
            {consequenceSummary && <p><strong>Result note:</strong> {consequenceSummary}</p>}
          </div>
        </div>
        <div className="rounded-3xl bg-parchment/90 p-4">
          <p className="text-sm font-semibold text-indigo">Manuscript fragment</p>
          <p className="mt-3 text-sm leading-6 text-indigo/80">{activeFragment}</p>
        </div>
      </aside>
    </div>
  );
}

function StatusMeter({ label, value, color }: { label: string; value: number; color: 'herbal' | 'amber' | 'danger' }) {
  const colorClass = color === 'herbal' ? 'bg-herbal' : color === 'amber' ? 'bg-amber' : 'bg-danger';
  return (
    <div className="rounded-3xl border border-indigo/10 bg-white p-4">
      <div className="flex items-center justify-between text-sm font-medium text-indigo">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-indigo/10">
        <div className={`${colorClass} h-full rounded-full transition-all`} style={{ width: `${Math.min(Math.max(value, 4), 100)}%` }} />
      </div>
    </div>
  );
}
