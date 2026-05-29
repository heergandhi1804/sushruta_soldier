import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

interface LeechItem {
  id: 'medicinal' | 'poisonous';
  name: string;
  color: string;
  glow: string;
  skin: string;
  speed: string;
}

const leechesList: LeechItem[] = [
  {
    id: 'medicinal',
    name: 'Jalauka (Medicinal)',
    color: 'bg-emerald-850 border-emerald-500',
    glow: 'shadow-emerald-500/20',
    skin: 'Smooth olive skin, yellow bands',
    speed: 'Rhythmic, gentle waves'
  },
  {
    id: 'poisonous',
    name: 'Savisha (Poisonous)',
    color: 'bg-red-950 border-red-500',
    glow: 'shadow-red-500/20',
    skin: 'Rough grey knobs, black spikes',
    speed: 'Hyperactive, frantic twists'
  }
];

export default function Stage1() {
  const {
    updateScroll,
    updateConsequences,
    addHistory,
    setUnlockedStages,
    flashSushrutaAlert,
    consequenceMetrics
  } = useSimulation();

  const [selectedLeech, setSelectedLeech] = useState<'medicinal' | 'poisonous' | null>(null);
  const [attached, setAttached] = useState(false);
  const [timer, setTimer] = useState(0); // in seconds
  const [swelling, setSwelling] = useState(85); // percentage
  const [bloodPressure, setBloodPressure] = useState(130);
  const [breathingRate, setBreathingRate] = useState(2.2); // seconds per breath
  const [activeStatus, setActiveStatus] = useState('Inspect the leeches and click to select.');
  const [isFinished, setIsFinished] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [poisonVeins, setPoisonVeins] = useState(false);

  // Real-time ticking system (every 100ms)
  useEffect(() => {
    if (isFinished) return;

    const interval = window.setInterval(() => {
      if (attached) {
        setTimer((t) => {
          const nextT = t + 0.1;
          
          // Deteriorate if left too long
          if (nextT >= 6.0) {
            handleFailure('Leech fed past the impure blood, draining vital life-essence!');
            return 6.0;
          }
          return nextT;
        });

        // Leech sucks swelling
        setSwelling((s) => Math.max(10, s - 1.2));
        
        // Pressure drops as blood is extracted
        setBloodPressure((bp) => Math.max(70, bp - 1.1));

        if (selectedLeech === 'poisonous') {
          // Poison causes instant distress
          setPoisonVeins(true);
          setBreathingRate(0.6); // gasping
          updateConsequences({ pain: 3, inflammation: 2, infection: 4 });
        } else {
          // Medicinal relieves pain and breathing stabilizes
          setBreathingRate((rate) => Math.max(1.0, rate - 0.05));
          updateConsequences({ pain: -1.5, bloodLoss: 1 });
        }
      } else {
        // Swelling slowly accumulates if untreated
        setSwelling((s) => Math.min(100, s + 0.15));
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [attached, selectedLeech, isFinished]);

  const handleAttach = () => {
    if (!selectedLeech || attached || isFinished) return;
    setAttached(true);
    setTimer(0);
    setActiveStatus('Leech applied. Watch the swelling level and blood pulse speed.');
    flashSushrutaAlert('Leech attached. Monitor the color change and swelling reduction.');
  };

  const handleRemove = () => {
    if (!attached || isFinished) return;
    setAttached(false);
    setIsFinished(true);

    const isCorrectLeech = selectedLeech === 'medicinal';
    const isCorrectTiming = timer >= 4.0 && timer <= 5.2;

    if (selectedLeech === 'poisonous') {
      handleFailure('Toxic leech injected poison! Patient collapsed with burning fever.');
      updateConsequences({ pain: 25, infection: 30, trust: -20 });
    } else if (!isCorrectTiming) {
      if (timer < 4.0) {
        setActiveStatus('Removed too early. Swelling remains congested and painful.');
        flashSushrutaAlert('Too early! Impure blood remains blockaded.');
        updateConsequences({ pain: 10, trust: -5 });
      } else {
        handleFailure('Removed too late! Healthy blood was drained, leaving patient pale.');
        updateConsequences({ bloodLoss: 25, trust: -12 });
      }
    } else {
      // Success!
      setIsSuccess(true);
      setActiveStatus('Success! Impure blood drained, swelling resolved, pulse stabilized.');
      flashSushrutaAlert('Masterful timing. The leg is healed. Chapter 2 is unlocked!');
      updateScroll({ observation: 10, precision: 10 });
      updateConsequences({ inflammation: -30, pain: -20, trust: 20 });
      setUnlockedStages([1, 2]); // Progression trigger!
    }
  };

  const handleFailure = (msg: string) => {
    setIsFinished(true);
    setIsSuccess(false);
    setAttached(false);
    setActiveStatus(msg);
    flashSushrutaAlert('Therapy failed. Re-evaluate the parameters.');
  };

  const handleReset = () => {
    setSelectedLeech(null);
    setAttached(false);
    setTimer(0);
    setSwelling(85);
    setBloodPressure(130);
    setBreathingRate(2.2);
    setIsFinished(false);
    setIsSuccess(false);
    setPoisonVeins(false);
    setActiveStatus('Select a leech and place it to begin.');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] h-full items-stretch">
      {/* Simulation Screen */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-950 p-6 relative overflow-hidden shadow-2xl">
        
        {/* Breathing Torso visual indicator */}
        <div className="flex justify-between items-center bg-stone-900/50 p-3 rounded-2xl border border-stone-800/60 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🫁</span>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold">Chest Respiration</span>
              <div className="flex items-center gap-1 mt-0.5">
                {/* Visual breathing bar */}
                <motion.div
                  animate={{
                    scaleY: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: breathingRate,
                    ease: 'easeInOut'
                  }}
                  className="w-4 h-3 bg-herbal rounded origin-bottom"
                />
                <span className="text-xs font-bold text-stone-300">
                  {breathingRate < 1.0 ? 'Rapid Gasps' : 'Stable Breath'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-500 uppercase font-bold">Fluid Pressure</span>
            <p className="text-xs font-bold text-stone-200 mt-0.5">{Math.round(bloodPressure)} mmHg</p>
          </div>
        </div>

        {/* Dynamic SVG Leg model */}
        <div className="flex-1 min-h-[220px] flex items-center justify-center relative bg-stone-900/20 border border-stone-800/30 rounded-[20px] overflow-hidden my-2">
          
          <svg viewBox="0 0 400 180" className="w-full max-w-[420px] overflow-visible">
            {/* Outline leg structure */}
            <path
              d="M 20,90 Q 120,40 220,50 T 380,80 L 380,105 T 220,120 Q 120,130 20,100 Z"
              fill="#1c1917"
              stroke="#b36b32"
              strokeWidth="2.5"
              className="transition-colors duration-500"
              style={{
                fill: poisonVeins ? '#0c1a0f' : isFinished && !isSuccess ? '#2c1e1c' : '#1c1917'
              }}
            />

            {/* Vein pathways */}
            <path
              d="M 40,92 Q 130,55 210,65 T 350,90"
              fill="none"
              stroke={poisonVeins ? '#052e16' : '#991b1b'}
              strokeWidth="2"
              className="opacity-80"
            />
            
            {/* Pulsing blood pressure circle */}
            <motion.circle
              cx="180"
              cy="70"
              r="10"
              fill={poisonVeins ? 'none' : '#ef4444'}
              className="opacity-25"
              animate={{
                scale: attached ? [1, 1.6, 1] : [1, 1.25, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: attached ? 0.4 : 1.2,
                ease: 'easeInOut'
              }}
            />

            {/* Swelling Dome Visual (expands/contracts live) */}
            <circle
              cx="180"
              cy="72"
              r={swelling * 0.45}
              fill="url(#swelling-gradient)"
              className="opacity-75 transition-all duration-300"
            />

            {/* Attached Leech rendering */}
            {attached && (
              <motion.path
                d="M 180,72 Q 190,50 170,45"
                fill="none"
                stroke="#3f6212"
                strokeWidth="6"
                strokeLinecap="round"
                animate={{
                  strokeWidth: [6, 8, 6],
                  d: ['M 180,72 Q 190,50 170,45', 'M 180,72 Q 185,48 175,47', 'M 180,72 Q 190,50 170,45']
                }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            )}

            {/* Gradients */}
            <defs>
              <radialGradient id="swelling-gradient">
                <stop offset="0%" stopColor={poisonVeins ? '#15803d' : '#881337'} />
                <stop offset="60%" stopColor={poisonVeins ? '#166534' : '#be123c'} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1c1917" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* Poison Vein overlay notification */}
          {poisonVeins && (
            <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none border border-emerald-500/20 rounded-[20px] animate-pulse" />
          )}

          {/* Swelling meter overlay */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Active Swelling</span>
            <span className="text-sm font-black text-amber">{Math.round(swelling)}% Height</span>
          </div>

          {/* Live timer overlay */}
          {attached && (
            <div className="absolute top-4 right-4 bg-stone-950/80 border border-stone-800 rounded-full px-3 py-1 text-[10px] font-bold text-amber">
              ⏱️ Sucking: {timer.toFixed(1)}s
            </div>
          )}
        </div>

        {/* Leech Clay pots */}
        <div className="space-y-2 mt-4">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Clay Leeches Vessels</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {leechesList.map((leech) => (
              <button
                key={leech.id}
                type="button"
                onClick={() => setSelectedLeech(leech.id)}
                disabled={attached || isFinished}
                className={`group rounded-2xl border p-3.5 text-left transition-all ${
                  selectedLeech === leech.id
                    ? 'border-amber bg-stone-900 text-stone-100 shadow-lg'
                    : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border-2 ${leech.color} ${leech.glow}`} />
                  <span className="font-serif font-bold text-sm">{leech.name}</span>
                </div>
                <p className="text-[10px] text-stone-500 font-light mt-1.5 leading-4">
                  {leech.skin} • {leech.speed}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Surgical Controls */}
        <div className="flex flex-wrap items-center gap-3 border-t border-stone-850 pt-4 mt-4">
          <button
            type="button"
            onClick={handleAttach}
            disabled={!selectedLeech || attached || isFinished}
            className="flex-1 min-w-[120px] rounded-full bg-gradient-to-r from-herbal to-emerald-700 py-3 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply Leech
          </button>
          
          <button
            type="button"
            onClick={handleRemove}
            disabled={!attached || isFinished}
            className="flex-1 min-w-[120px] rounded-full border border-stone-800 bg-stone-900/60 py-3 text-xs font-bold uppercase tracking-wider text-stone-300 hover:bg-stone-850 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sponge Turmeric (Release)
          </button>

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

      {/* Real-time Game Log / Results */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-900/40 p-6">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Surgical Report</span>
          <h4 className="font-serif text-lg font-bold text-stone-200 border-b border-stone-800 pb-2">Diagnostic Log</h4>
          <p className="text-xs leading-6 text-stone-300 font-light italic">
            "{activeStatus}"
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
                  Swelling successfully resolved. The guard returns to duty. Chapter 2 has been unlocked.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
                <span className="text-2xl block mb-1">⚠️</span>
                <span className="text-sm font-bold text-danger uppercase tracking-wider block">Disciple Failed</span>
                <p className="text-[11px] text-stone-300 font-light mt-1.5">
                  The treatment resulted in patient distress or excessive blood loss. Reset the anvil to try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
