import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

interface WardPatient {
  id: string;
  name: string;
  occupation: string;
  visualId: string;
  story: string;
  pain: number; // 0 to 100
  bleeding: number; // 0 to 100
  infection: number; // 0 to 100
  status: 'waiting' | 'stabilized' | 'dead';
  bleedRate: number; // per tick
  infectRate: number; // per tick
  painRate: number;
}

const initialWardPatients: WardPatient[] = [
  {
    id: 'w1',
    name: 'Karna the Guard',
    occupation: 'Temple Soldier',
    visualId: '🛡️',
    story: 'Femoral artery slashed by a wind-torn roof tile. Bleeding to death rapidly.',
    pain: 60,
    bleeding: 75,
    infection: 10,
    status: 'waiting',
    bleedRate: 1.6, // very fast
    infectRate: 0.15,
    painRate: 0.8
  },
  {
    id: 'w2',
    name: 'Anya the Child',
    occupation: 'Little Girl',
    visualId: '👧',
    story: 'Fell on jagged clay pot in courtyard. Deep hand cut with dirt. High infection risk.',
    pain: 50,
    bleeding: 25,
    infection: 45,
    status: 'waiting',
    bleedRate: 0.3,
    infectRate: 1.4, // very fast infection
    painRate: 1.2
  },
  {
    id: 'w3',
    name: 'Madhav the Farmer',
    occupation: 'Local Harvester',
    visualId: '🌾',
    story: 'Fell from mango tree during storm. Compound fracture with bone protruding.',
    pain: 80, // high pain
    bleeding: 35,
    infection: 25,
    status: 'waiting',
    bleedRate: 0.5,
    infectRate: 0.6,
    painRate: 1.5
  },
  {
    id: 'w4',
    name: 'Gopal the Merchant',
    occupation: 'Spice Trader',
    visualId: '⚖️',
    story: 'Scalp wound from falling beam. Bleeding heavily, but vitals are robust.',
    pain: 40,
    bleeding: 55,
    infection: 5,
    status: 'waiting',
    bleedRate: 0.8,
    infectRate: 0.2,
    painRate: 0.6
  },
  {
    id: 'w5',
    name: 'Ramdas the Smith',
    occupation: 'Forge Artisan',
    visualId: '🔨',
    story: 'Molten copper crucible spilt onto forearm. Severe third-degree blister burns.',
    pain: 75,
    bleeding: 5,
    infection: 30,
    status: 'waiting',
    bleedRate: 0.1,
    infectRate: 0.8,
    painRate: 1.3
  }
];

export default function Stage3() {
  const {
    updateScroll,
    updateConsequences,
    addHistory,
    flashSushrutaAlert,
    consequenceMetrics
  } = useSimulation();

  const [patients, setPatients] = useState<WardPatient[]>(initialWardPatients);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [outcome, setOutcome] = useState('All patients are deteriorating! Click a mat to zoom in and treat them manually.');

  // Live ward loop ticker (runs every 150ms)
  useEffect(() => {
    if (isFinished) return;

    const interval = window.setInterval(() => {
      setPatients((currentList) => {
        let hasDead = false;
        let allStabilized = true;

        const nextList = currentList.map((p) => {
          if (p.status === 'stabilized') return p;

          // Increase values based on rate
          const nextBleed = Math.min(100, p.bleeding + p.bleedRate);
          const nextInfect = Math.min(100, p.infection + p.infectRate);
          const nextPain = Math.min(100, p.pain + p.painRate);

          let nextStatus = p.status;
          if (nextBleed >= 100 || nextInfect >= 100) {
            nextStatus = 'dead';
            hasDead = true;
          }

          allStabilized = false;

          return {
            ...p,
            bleeding: nextBleed,
            infection: nextInfect,
            pain: nextPain,
            status: nextStatus
          };
        });

        if (hasDead) {
          handleFailure('A patient died! The Gurukul has lost a soul to the storm.');
        } else if (allStabilized) {
          handleSuccess();
        }

        return nextList;
      });
    }, 150);

    return () => window.clearInterval(interval);
  }, [isFinished]);

  const handleSuccess = () => {
    setIsFinished(true);
    setIsSuccess(true);
    setOutcome('Incredible! You stabilized all five Kashi citizens in the raging storm. Master surgeon status achieved.');
    flashSushrutaAlert('All citizens saved. You are a true master of surgery!');
    updateScroll({ diagnosis: 15, surgicalControl: 15, ethics: 15 });
    updateConsequences({ recovery: 30, trust: 30 });
  };

  const handleFailure = (msg: string) => {
    setIsFinished(true);
    setIsSuccess(false);
    setOutcome(msg);
  };

  const handleReset = () => {
    setPatients(initialWardPatients.map((p) => ({ ...p })));
    setActivePatientId(null);
    setIsFinished(false);
    setIsSuccess(false);
    setOutcome('All patients are deteriorating! Click a mat to zoom in and treat them manually.');
  };

  // Zoomed-in patient surgery actions
  const activePatient = patients.find((p) => p.id === activePatientId);

  const cleanWound = () => {
    if (!activePatientId || isFinished) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatientId ? { ...p, infection: Math.max(0, p.infection - 25) } : p))
    );
  };

  const compressBleeding = () => {
    if (!activePatientId || isFinished) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatientId ? { ...p, bleeding: Math.max(0, p.bleeding - 30) } : p))
    );
  };

  const applySomaHerb = () => {
    if (!activePatientId || isFinished) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatientId ? { ...p, pain: Math.max(0, p.pain - 25) } : p))
    );
  };

  const finalizeSuture = () => {
    if (!activePatientId || isFinished) return;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === activePatientId) {
          // If bleeding and infection are low enough, stabilize
          if (p.bleeding <= 15 && p.infection <= 25) {
            flashSushrutaAlert(`${p.name} stabilized!`);
            return { ...p, status: 'stabilized', bleeding: 0, infection: 0, pain: 0 };
          } else {
            flashSushrutaAlert('Wound is too congested or bleeding to suture! Wash and compress first.');
            return p;
          }
        }
        return p;
      })
    );
  };

  // Automatically close modal if patient is stabilized
  useEffect(() => {
    if (activePatient && activePatient.status === 'stabilized') {
      setActivePatientId(null);
    }
  }, [activePatient]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] h-full items-stretch relative">
      {/* Zoom in overlay modal */}
      <AnimatePresence>
        {activePatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col justify-between rounded-[24px] border border-amber/20 bg-stone-950 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-850 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activePatient.visualId}</span>
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-200">{activePatient.name}</h4>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{activePatient.occupation}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePatientId(null)}
                className="rounded-full border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-bold text-stone-300 hover:bg-stone-800"
              >
                Exit Mat (Return to Ward)
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-300 italic my-2 font-light leading-5">
              "{activePatient.story}"
            </p>

            {/* Live Metrics */}
            <div className="grid gap-3 sm:grid-cols-3 bg-stone-900/40 p-4 rounded-xl border border-stone-850">
              <div className="space-y-1">
                <span className="text-[9px] text-stone-500 uppercase font-bold">Hemorrhage Level</span>
                <div className="h-2 w-full bg-stone-850 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${activePatient.bleeding}%` }} />
                </div>
                <span className="text-xs font-bold text-red-500">{Math.round(activePatient.bleeding)}%</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-stone-500 uppercase font-bold">Infection Rot</span>
                <div className="h-2 w-full bg-stone-850 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${activePatient.infection}%` }} />
                </div>
                <span className="text-xs font-bold text-emerald-500">{Math.round(activePatient.infection)}%</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-stone-500 uppercase font-bold">Pain Index</span>
                <div className="h-2 w-full bg-stone-850 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${activePatient.pain}%` }} />
                </div>
                <span className="text-xs font-bold text-amber-500">{Math.round(activePatient.pain)}%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid gap-2 sm:grid-cols-2 mt-4">
              <button
                type="button"
                onClick={compressBleeding}
                className="rounded-2xl border border-red-500/20 bg-red-950/20 py-4 text-xs font-bold text-red-400 hover:bg-red-950/40 active:scale-95 transition-all uppercase tracking-wider"
              >
                Compress Bleeder (-30%)
              </button>
              <button
                type="button"
                onClick={cleanWound}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 py-4 text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 active:scale-95 transition-all uppercase tracking-wider"
              >
                Wash Wound (-25%)
              </button>
              <button
                type="button"
                onClick={applySomaHerb}
                className="rounded-2xl border border-amber/20 bg-amber-500/5 py-4 text-xs font-bold text-amber hover:bg-amber-500/10 active:scale-95 transition-all uppercase tracking-wider"
              >
                Apply Soma Ghee (-25%)
              </button>
              <button
                type="button"
                onClick={finalizeSuture}
                className="rounded-2xl bg-gradient-to-r from-herbal to-emerald-700 py-4 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
              >
                Tie Sutures (Requires &lt;15% Bleeding)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ward Floor (Mats) */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-950 p-6 shadow-2xl">
        <div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Ward Overview</span>
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            {patients.map((p) => {
              const isCritical = p.bleeding > 70 || p.infection > 65;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPatient(p.id)}
                  disabled={p.status === 'stabilized' || isFinished}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                    p.status === 'stabilized'
                      ? 'border-emerald-500/10 bg-emerald-950/5 opacity-55 cursor-default'
                      : isCritical
                      ? 'border-red-500/40 bg-red-950/5 hover:border-red-500 animate-pulse'
                      : 'border-stone-800 bg-stone-900/60 hover:border-amber/40 hover:bg-stone-900'
                  }`}
                >
                  <div className="flex justify-between items-start border-b border-stone-850 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.visualId}</span>
                      <div>
                        <span className="font-serif font-bold text-sm block">{p.name}</span>
                        <span className="text-[9px] text-stone-500 uppercase font-semibold block">{p.occupation}</span>
                      </div>
                    </div>
                    {p.status === 'stabilized' ? (
                      <span className="text-emerald-500 text-[9px] font-bold uppercase">Stabilized</span>
                    ) : (
                      <span className={`text-[9px] font-bold uppercase ${isCritical ? 'text-red-500' : 'text-stone-400'}`}>
                        {isCritical ? 'CRITICAL' : 'WAITING'}
                      </span>
                    )}
                  </div>

                  {p.status !== 'stabilized' && (
                    <div className="grid grid-cols-3 gap-1 text-[9px] font-semibold text-stone-400 mt-4 border-t border-stone-850 pt-2">
                      <span className="text-red-500">Blood: {Math.round(p.bleeding)}%</span>
                      <span className="text-emerald-500">Rot: {Math.round(p.infection)}%</span>
                      <span className="text-amber-500">Pain: {Math.round(p.pain)}%</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-850 pt-4 mt-6">
          <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
            Deterioration active. Treat critical patients first.
          </span>
          {isFinished && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full bg-stone-800 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-700"
            >
              Reset Anvil
            </button>
          )}
        </div>
      </div>

      {/* Narrative Info */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-900/40 p-6">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Surgical Report</span>
          <h4 className="font-serif text-lg font-bold text-stone-200 border-b border-stone-800 pb-2">Ward Log</h4>
          <p className="text-xs leading-6 text-stone-300 font-light italic">
            "{outcome}"
          </p>
        </div>

        {isFinished && (
          <div className="border-t border-stone-800 pt-4 space-y-4 mt-6">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Chapter Verdict</span>
            
            {isSuccess ? (
              <div className="rounded-xl border border-herbal/30 bg-herbal/10 p-4 text-center">
                <span className="text-2xl block mb-1">🎉</span>
                <span className="text-sm font-bold text-herbal uppercase tracking-wider block">Chapter Mastered</span>
                <p className="text-[11px] text-stone-300 font-light mt-1.5">
                  All patients successfully bound and stabilized. The Kashi storm passes. Sandbox forge fully unlocked.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
                <span className="text-2xl block mb-1">⚠️</span>
                <span className="text-sm font-bold text-danger uppercase tracking-wider block">Disciple Failed</span>
                <p className="text-[11px] text-stone-300 font-light mt-1.5">
                  One of the patients expired due to untreated trauma. Reset the anvil to try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function handleSelectPatient(id: string) {
    if (isFinished) return;
    setActivePatientId(id);
  }
}
