import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toolsData from '../../data/tools.json';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';
import { ToolOption } from '../../types/simulation';

const fragment = manuscriptFragments.find((item) => item.id === 'stage4-forge');

const jawOptions = ['Crow Beak', 'Eagle Pinch', 'Crocodile Clamp', 'Heron Probe'] as const;
const handleOptions = ['Short', 'Medium', 'Long'] as const;
const weightOptions = ['Light', 'Balanced', 'Heavy'] as const;
const tipOptions = ['Fine', 'Blunt', 'Curved'] as const;

export default function Stage4() {
  const { realityLayer, updateScroll, updateConsequences, addHistory, setSushrutaDialogue } = useSimulation();
  const [jawType, setJawType] = useState<typeof jawOptions[number]>('Crow Beak');
  const [handleLength, setHandleLength] = useState<typeof handleOptions[number]>('Medium');
  const [weight, setWeight] = useState<typeof weightOptions[number]>('Balanced');
  const [tipShape, setTipShape] = useState<typeof tipOptions[number]>('Fine');
  const [challengeCode, setChallengeCode] = useState('');
  const [importText, setImportText] = useState('');
  const [challengeResult, setChallengeResult] = useState('Select options from the copper engravings below and forge your instrument.');

  const activeFragment = fragment ? fragment[realityLayer] : '';

  // Calculate tool stats with modifiers
  const stats = useMemo(() => {
    const base = (toolsData as ToolOption[]).find((entry: ToolOption) => entry.label === jawType) ?? (toolsData as ToolOption[])[0];
    const lengthModifier = handleLength === 'Short' ? -5 : handleLength === 'Long' ? 5 : 0;
    const weightModifier = weight === 'Light' ? -4 : weight === 'Heavy' ? 4 : 0;
    const tipModifier = tipShape === 'Fine' ? 6 : tipShape === 'Blunt' ? -2 : 2;
    return {
      precision: clamp(base.precision + lengthModifier + tipModifier, 0, 100),
      gripStrength: clamp(base.gripStrength + weightModifier, 0, 100),
      speed: clamp(base.speed + (handleLength === 'Short' ? 8 : handleLength === 'Long' ? -3 : 0), 0, 100),
      risk: clamp(base.risk + (tipShape === 'Blunt' ? 2 : tipShape === 'Fine' ? -1 : 0), 0, 100)
    };
  }, [jawType, handleLength, weight, tipShape]);

  // Sushruta comments on design changes in real time
  useEffect(() => {
    if (jawType === 'Crow Beak') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The Kaka-Mukha (Crow Beak) design. Straight, simple, and excellent for grabbing foreign bodies near the surface of the skin.',
        expression: 'calm'
      });
    } else if (jawType === 'Crocodile Clamp') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The Nakra-Mukha (Crocodile Clamp). High grip strength, modeled after the lock-jaw of the river beast to hold thick bone fragments.',
        expression: 'thoughtful'
      });
    } else if (jawType === 'Heron Probe') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The Kanka-Mukha (Heron Probe). Remarkably narrow, mimicking the slim beak that extracts what is hidden deep in the crevices.',
        expression: 'storytelling'
      });
    } else if (jawType === 'Eagle Pinch') {
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The Shyena-Mukha (Eagle Pinch). Strong, curved claws designed to grip tissue margins with great leverage.',
        expression: 'calm'
      });
    }
  }, [jawType, setSushrutaDialogue]);

  function generateChallenge() {
    const payload = {
      tool: { jawType, handleLength, weight, tipShape },
      limit: { bloodLoss: 25, time: 180, pain: 45, mistakes: 2 }
    };
    const code = btoa(JSON.stringify(payload));
    setChallengeCode(code);
    setChallengeResult('Sutra-Yantra forged! Challenge code generated. Copy and share it with other disciples.');
    addHistory('Stage 4: Forged a custom tool and generated a challenge code.');
    setSushrutaDialogue({
      speaker: 'Acharya Sushruta',
      text: 'You have forged a unique tool code. Teach other students to copy this design so they may test their speed and precision in Kashi.',
      expression: 'storytelling'
    });
  }

  function importChallenge() {
    try {
      const parsed = JSON.parse(atob(importText.trim()));
      setJawType(parsed.tool.jawType);
      setHandleLength(parsed.tool.handleLength);
      setWeight(parsed.tool.weight);
      setTipShape(parsed.tool.tipShape);
      setChallengeResult('Imported tool design successfully. Adjust options or refit the parameters as needed.');
      addHistory('Stage 4: Imported a shared tool code.');
      updateScroll({ innovation: 8, precision: 4 });
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'A foreign instrument design from another Gurukul disciple. Let us test its grip and weight properties on our anvil.',
        expression: 'approving'
      });
    } catch {
      setChallengeResult('Failed to read the code. Ensure the string is copied exactly from another disciple.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'This script is garbled, disciple. Make sure you copy the characters of the scroll exactly.',
        expression: 'concerned'
      });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      {/* Forging Workshop */}
      <section className="rounded-[32px] border border-amber/15 bg-white/70 p-6 shadow-parchment">
        <div className="border-b border-indigo/15 pb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Chapter 4</span>
          <h3 className="font-serif text-2xl font-bold text-indigo">Gurukul Master Builder</h3>
          <p className="mt-1 text-sm text-indigo/70">
            You are now a master healer of Kashi. Step into the tool forge and craft specialized copper instruments (Yantras) inspired by the organic forms of nature.
          </p>
        </div>

        {/* Forge Ember Ambience Visual */}
        <div className="relative overflow-hidden rounded-[24px] border border-copper bg-gradient-to-br from-amber-950 via-copper-950 to-orange-950 p-6 shadow-2xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ff5500_2px,transparent_2px)] [background-size:16px_16px]" />
          
          <div className="space-y-2 relative z-10">
            <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-400">
              Active Copper Forge (Loha-Sala)
            </span>
            <p className="text-sm text-parchment/80 font-light mt-3">
              Heat the copper and shape the jaws. The current configuration mimics a <strong>{jawType}</strong> with a <strong>{handleLength}</strong> handle, forged as a <strong>{weight}</strong> weight instrument with a <strong>{tipShape}</strong> tip.
            </p>
          </div>

          {/* Animated Embers / Fire representation */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/30 bg-black/60 shadow-xl shadow-orange-500/10 relative overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 0.9, 1.1, 1],
                backgroundColor: ['#ff3300', '#ffaa00', '#ff3300']
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-8 h-8 rounded-full blur-[4px]"
            />
            <span className="absolute text-xs font-bold text-parchment uppercase tracking-widest">FORGING</span>
          </div>
        </div>

        {/* Custom selectors designed like copper slates */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <OptionPanel label="Jaw Type (Yantra-Mukha)" options={jawOptions} value={jawType} onChange={(v) => setJawType(v)} />
          <OptionPanel label="Handle Length (Yantra-Danda)" options={handleOptions} value={handleLength} onChange={(v) => setHandleLength(v)} />
          <OptionPanel label="Forge Weight (Gaurava)" options={weightOptions} value={weight} onChange={(v) => setWeight(v)} />
          <OptionPanel label="Tip Shape (Yantra-Agra)" options={tipOptions} value={tipShape} onChange={(v) => setTipShape(v)} />
        </div>

        {/* Forge stats display */}
        <div className="mt-6 rounded-[24px] border border-indigo/10 bg-white/90 p-5 shadow-sm">
          <h4 className="text-xs font-bold text-indigo uppercase tracking-wider mb-4">Instrument Properties</h4>
          <div className="grid gap-3 sm:grid-cols-4">
            <StatPanel label="Precision" value={stats.precision} color="herbal" />
            <StatPanel label="Grip Strength" value={stats.gripStrength} color="amber" />
            <StatPanel label="Speed" value={stats.speed} color="indigo" />
            <StatPanel label="Surgical Risk" value={stats.risk} color="danger" />
          </div>
        </div>
      </section>

      {/* Side Narrative & Code panels */}
      <aside className="space-y-6">
        {/* Outcome Box */}
        <div className="rounded-[32px] border border-amber/15 bg-amber-50/50 p-5 shadow-parchment">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Forge Diagnostics</span>
          <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/5 pb-2">Status Output</h4>
          <p className="mt-3 text-sm leading-6 text-indigo/80">
            {challengeResult}
          </p>
        </div>

        {/* Import/Export Codes */}
        <div className="rounded-[32px] border border-indigo/15 bg-white p-5 shadow-parchment space-y-4">
          <div>
            <button
              type="button"
              onClick={generateChallenge}
              className="w-full rounded-full bg-gradient-to-r from-amber to-copper py-3 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95"
            >
              Forge & Export Design Scroll
            </button>
            <textarea
              value={challengeCode}
              readOnly
              className="mt-3 min-h-[90px] w-full rounded-2xl border border-indigo/10 bg-parchment/30 p-3 text-xs text-indigo/80 font-mono focus:outline-none"
              placeholder="Your forged design scroll code will appear here"
            />
          </div>

          <div className="border-t border-indigo/5 pt-3">
            <label className="text-xs font-bold text-indigo uppercase tracking-wider block mb-2">Import Design Scroll</label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full min-h-[90px] rounded-2xl border border-indigo/10 bg-white p-3 text-xs text-indigo/80 font-mono focus:outline-none focus:border-amber"
              placeholder="Paste a shared design scroll code here"
            />
            <button
              type="button"
              onClick={importChallenge}
              className="mt-3 w-full rounded-full bg-gradient-to-r from-herbal to-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 active:scale-95"
            >
              Examine & Forged Pattern
            </button>
          </div>
        </div>

        {/* Epistemological Fragment scroll */}
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

function OptionPanel<T extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="rounded-[24px] border border-indigo/10 bg-white/90 p-4">
      <p className="font-semibold text-indigo text-xs uppercase tracking-wider mb-3">{label}</p>
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all ${
              value === option ? 'border-herbal bg-herbal/10 text-herbal' : 'border-indigo/5 bg-parchment/40 hover:border-indigo/20'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatPanel({ label, value, color }: { label: string; value: number; color: 'herbal' | 'amber' | 'indigo' | 'danger' }) {
  const barColors = {
    herbal: 'bg-herbal',
    amber: 'bg-amber',
    indigo: 'bg-indigo',
    danger: 'bg-danger'
  };

  return (
    <div className="rounded-2xl border border-indigo/5 bg-parchment/30 p-3 text-sm text-indigo">
      <span className="text-[10px] font-bold text-indigo/60 uppercase">{label}</span>
      <p className="mt-2 text-2xl font-bold font-serif text-indigo">{value}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo/5">
        <div className={`${barColors[color]} h-full rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
