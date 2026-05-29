import { useMemo, useState } from 'react';
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
  const { realityLayer, updateScroll, updateConsequences, addHistory } = useSimulation();
  const [jawType, setJawType] = useState<typeof jawOptions[number]>('Crow Beak');
  const [handleLength, setHandleLength] = useState<typeof handleOptions[number]>('Medium');
  const [weight, setWeight] = useState<typeof weightOptions[number]>('Balanced');
  const [tipShape, setTipShape] = useState<typeof tipOptions[number]>('Fine');
  const [challengeCode, setChallengeCode] = useState('');
  const [importText, setImportText] = useState('');
  const [challengeResult, setChallengeResult] = useState('Select options and generate a challenge code for sharing.');

  const activeFragment = fragment ? fragment[realityLayer] : '';

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

  function generateChallenge() {
    const payload = {
      tool: { jawType, handleLength, weight, tipShape },
      limit: { bloodLoss: 25, time: 180, pain: 45, mistakes: 2 }
    };
    const code = btoa(JSON.stringify(payload));
    setChallengeCode(code);
    setChallengeResult('Challenge code generated. Students can import it to load the same sandbox map.');
    addHistory('Stage 4: generated a shared challenge code.');
  }

  function importChallenge() {
    try {
      const parsed = JSON.parse(atob(importText.trim()));
      setJawType(parsed.tool.jawType);
      setHandleLength(parsed.tool.handleLength);
      setWeight(parsed.tool.weight);
      setTipShape(parsed.tool.tipShape);
      setChallengeResult('Imported challenge successfully. Adjust the map rules or tool as needed.');
      addHistory('Stage 4: imported a shared challenge code.');
      updateScroll({ innovation: 5, precision: 3 });
    } catch {
      setChallengeResult('Invalid code. Please use a properly generated challenge string.');
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-3xl border border-indigo/10 bg-parchment/80 p-5 shadow-parchment">
        <h3 className="text-xl font-semibold text-indigo">Gurukul Master Builder</h3>
        <p className="mt-2 text-sm leading-6 text-indigo/75">
          Build an instrument using ancient-inspired options and create a sandbox challenge with blood loss, time, and pain limits.
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <OptionPanel label="Jaw Type" options={jawOptions} value={jawType} onChange={(value) => setJawType(value)} />
          <OptionPanel label="Handle Length" options={handleOptions} value={handleLength} onChange={(value) => setHandleLength(value)} />
          <OptionPanel label="Weight" options={weightOptions} value={weight} onChange={(value) => setWeight(value)} />
          <OptionPanel label="Tip Shape" options={tipOptions} value={tipShape} onChange={(value) => setTipShape(value)} />
        </div>
        <div className="mt-6 rounded-3xl border border-indigo/10 bg-white/90 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPanel label="Precision" value={stats.precision} />
            <StatPanel label="Grip Strength" value={stats.gripStrength} />
            <StatPanel label="Speed" value={stats.speed} />
            <StatPanel label="Risk" value={stats.risk} />
          </div>
          <p className="mt-4 text-sm leading-6 text-indigo/80">
            The tool builder translates animal-inspired forms into measurable performance. Use this design to understand how parts interact.
          </p>
        </div>
      </section>
      <aside className="space-y-4 rounded-3xl border border-indigo/10 bg-white/90 p-5 shadow-parchment">
        <div className="rounded-3xl bg-parchment/95 p-4">
          <button
            type="button"
            onClick={generateChallenge}
            className="w-full rounded-3xl bg-indigo px-4 py-3 text-sm font-semibold text-white"
          >
            Generate Challenge Code
          </button>
          <textarea
            value={challengeCode}
            readOnly
            className="mt-4 min-h-[120px] w-full rounded-3xl border border-indigo/10 bg-white p-3 text-sm text-indigo/80"
            placeholder="Generated challenge code appears here"
          />
        </div>
        <div className="rounded-3xl bg-parchment/95 p-4">
          <label className="text-sm font-semibold text-indigo">Import Challenge Code</label>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            className="mt-3 min-h-[120px] w-full rounded-3xl border border-indigo/10 bg-white p-3 text-sm text-indigo/80"
            placeholder="Paste shared JSON code here"
          />
          <button
            type="button"
            onClick={importChallenge}
            className="mt-3 w-full rounded-3xl bg-herbal px-4 py-3 text-sm font-semibold text-white"
          >
            Import Challenge
          </button>
        </div>
        <div className="rounded-3xl bg-indigo/5 p-4 text-sm text-indigo/80">
          <p className="font-semibold">Manuscript fragment</p>
          <p className="mt-3 leading-6">{activeFragment}</p>
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
    <div className="rounded-3xl border border-indigo/10 bg-white/90 p-4">
      <p className="font-semibold text-indigo">{label}</p>
      <div className="mt-3 space-y-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`w-full rounded-3xl border px-4 py-3 text-left text-sm transition ${
              value === option ? 'border-herbal bg-herbal/10' : 'border-indigo/10 bg-parchment/90 hover:border-indigo/50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatPanel({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-indigo/10 bg-parchment/90 p-4 text-sm text-indigo">
      <p className="font-semibold">{label}</p>
      <p className="mt-3 text-3xl font-bold text-indigo">{value}</p>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
