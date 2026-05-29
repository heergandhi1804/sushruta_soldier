import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

export default function Stage1() {
  const {
    updateHighScores,
    flashSushrutaAlert,
    highScores
  } = useSimulation();

  // Tool states
  const [heldTool, setHeldTool] = useState<'medicinal' | 'poisonous' | 'honey' | null>(null);
  const [attached, setAttached] = useState<'medicinal' | 'poisonous' | null>(null);
  
  // Patient vitals
  const [swelling, setSwelling] = useState(85); // 0 to 100
  const [bloodPool, setBloodPool] = useState(0); // 0 to 100 (size of blood pool under cot)
  const [breathingRate, setBreathingRate] = useState(2.2); // seconds per breath cycle
  const [poisonVeins, setPoisonVeins] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // Game states
  const [isFinished, setIsFinished] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stars, setStars] = useState(0);
  const [verdict, setVerdict] = useState('');

  // Ticking logic
  useEffect(() => {
    if (isFinished) return;

    const interval = window.setInterval(() => {
      if (attached) {
        setTimer((t) => t + 0.1);

        if (attached === 'poisonous') {
          // Failure cascade for poisonous leech
          setPoisonVeins(true);
          setBreathingRate(0.5); // Gasping
          setSwelling((s) => Math.min(100, s + 3)); // Swells due to toxic reaction
          setBloodPool((bp) => Math.min(100, bp + 4)); // Bleeding bursts
          
          if (timer > 1.5) {
            triggerFailure('Toxified! The Savisha leech injected deadly venom.');
          }
        } else {
          // Medicinal leech drains swelling
          setSwelling((s) => Math.max(10, s - 2.2));
          
          // Breathing relaxes as swelling goes down
          setBreathingRate((br) => Math.max(1.2, br - 0.05));

          // If swelling is drained, leech starts drinking healthy blood!
          if (swelling <= 15) {
            setBloodPool((bp) => Math.min(100, bp + 3.5)); // blood starts pooling on floor
            setBreathingRate(0.8); // patient groans in pain
            if (bloodPool >= 70) {
              triggerFailure('Hemorrhage! The leech drained vital life-blood.');
            }
          }
        }
      } else {
        // Untreated: swelling pulses/increases slightly
        setSwelling((s) => Math.min(100, s + 0.1));
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [attached, swelling, bloodPool, isFinished, timer]);

  const handleApplyTool = () => {
    if (isFinished) return;

    if (heldTool === 'medicinal' || heldTool === 'poisonous') {
      if (attached) {
        flashSushrutaAlert('A leech is already attached!');
        return;
      }
      setAttached(heldTool);
      setTimer(0);
      setHeldTool(null);
      flashSushrutaAlert('Leech attached. Observe the swelling.');
    } else if (heldTool === 'honey') {
      if (!attached) {
        flashSushrutaAlert('Nothing to release. Select a leech first.');
        return;
      }
      
      // Remove leech and check verdict
      const finalAttached = attached;
      setAttached(null);
      setHeldTool(null);
      setIsFinished(true);

      if (finalAttached === 'poisonous') {
        triggerFailure('Toxified! The poisonous leech did permanent tissue damage.');
      } else {
        // Check timing/swelling
        if (swelling > 30) {
          // Too early
          setIsSuccess(false);
          setStars(0);
          setVerdict('Removed Too Early! Impure blood remains stagnant.');
          flashSushrutaAlert('Unfinished. The swelling remains.');
        } else if (swelling <= 30 && bloodPool < 25) {
          // Perfect
          setIsSuccess(true);
          const earnedStars = bloodPool < 10 ? 3 : 2;
          setStars(earnedStars);
          setVerdict(earnedStars === 3 ? 'Gold Ribbon: Flawless Extraction!' : 'Silver Ribbon: Minor Bleeding.');
          flashSushrutaAlert('Masterfully completed.');
          
          // Save high score (fastest time)
          const recordTime = highScores.stage1BestTime;
          if (recordTime === null || timer < recordTime) {
            updateHighScores({ stage1BestTime: timer });
          }
        } else {
          // Too late, excessive blood loss
          triggerFailure('Hemorrhage! Impure blood was drained, but healthy blood followed.');
        }
      }
    }
  };

  const triggerFailure = (msg: string) => {
    setIsFinished(true);
    setIsSuccess(false);
    setStars(0);
    setVerdict(msg);
    flashSushrutaAlert('Treatment failed.');
  };

  const resetStage = () => {
    setHeldTool(null);
    setAttached(null);
    setSwelling(85);
    setBloodPool(0);
    setBreathingRate(2.2);
    setPoisonVeins(false);
    setTimer(0);
    setIsFinished(false);
    setIsSuccess(false);
    setStars(0);
    setVerdict('');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch h-full">
      {/* Simulation viewport */}
      <div className="flex-1 rounded-[24px] border border-stone-800 bg-stone-950 p-6 flex flex-col justify-between min-h-[500px] relative overflow-hidden shadow-2xl">
        
        {/* Background blood pool on the floor */}
        {bloodPool > 0 && (
          <motion.div
            className="absolute bottom-[5%] left-[30%] bg-red-900 rounded-full blur-md opacity-75 pointer-events-none"
            style={{
              width: `${bloodPool * 3.5}px`,
              height: `${bloodPool * 1.8}px`,
              transform: 'translateX(-50%)',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        )}

        {/* Floating Tool status */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {heldTool && (
            <div className="rounded-full bg-amber/20 border border-amber/40 px-3 py-1 text-[10px] uppercase font-bold text-amber animate-pulse">
              Holding: {heldTool === 'honey' ? 'Honey Sponge' : `${heldTool} Leech`}
            </div>
          )}
        </div>

        {/* Breathing Torso close-up viewport */}
        <div className="flex-1 flex items-center justify-center relative">
          <svg viewBox="0 0 500 300" className="w-full max-w-[550px] overflow-visible">
            {/* Woven Cot */}
            <rect x="50" y="200" width="400" height="30" rx="4" fill="#3e2723" stroke="#271510" strokeWidth="2" />
            <line x1="80" y1="230" x2="80" y2="280" stroke="#3e2723" strokeWidth="8" strokeLinecap="round" />
            <line x1="420" y1="230" x2="420" y2="280" stroke="#3e2723" strokeWidth="8" strokeLinecap="round" />
            
            {/* Patient chest outline (breathes!) */}
            <motion.g
              animate={{ scaleY: [1, 1.08, 1], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: breathingRate, ease: 'easeInOut' }}
            >
              {/* Torso */}
              <path d="M 60,195 Q 160,165 240,190 T 400,205" fill="none" stroke="#855b38" strokeWidth="20" strokeLinecap="round" />
              {/* Head flinch representation */}
              <circle cx="80" cy="170" r="18" fill="#855b38" />
            </motion.g>

            {/* Leg structure (un-affected leg behind) */}
            <path d="M 230,193 Q 290,175 380,210" fill="none" stroke="#704a2c" strokeWidth="24" strokeLinecap="round" className="opacity-45" />

            {/* Affected Leg (breathing/pulsating/swelling) */}
            <motion.path
              d="M 240,190 Q 300,160 380,205"
              fill="none"
              stroke={poisonVeins ? '#2c3e2e' : bloodPool > 50 ? '#b5a191' : '#855b38'}
              strokeWidth="28"
              strokeLinecap="round"
              className="transition-colors duration-700"
            />

            {/* Poison toxic veins path */}
            {poisonVeins && (
              <path
                d="M 260,185 Q 300,165 340,180 T 370,200"
                fill="none"
                stroke="#15803d"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                className="animate-pulse"
              />
            )}

            {/* Swelling mound circle overlay */}
            <circle
              cx="310"
              cy="176"
              r={swelling * 0.32}
              fill="url(#swellGradient)"
              className="cursor-pointer transition-all duration-300 hover:brightness-110"
              onClick={handleApplyTool}
            />

            {/* Attached Leech visual representation */}
            {attached && (
              <motion.path
                d="M 310,176 Q 320,150 300,145"
                fill="none"
                stroke={attached === 'poisonous' ? '#4a5d4b' : '#1e381e'}
                strokeWidth="7"
                strokeLinecap="round"
                animate={{
                  d: ['M 310,176 Q 320,150 300,145', 'M 310,176 Q 315,148 305,147', 'M 310,176 Q 320,150 300,145']
                }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              />
            )}

            {/* Red blood squirts for fail cascade */}
            {attached === 'poisonous' && (
              <g stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round">
                <line x1="310" y1="176" x2="295" y2="140" className="animate-bounce" />
                <line x1="310" y1="176" x2="330" y2="145" />
              </g>
            )}

            <defs>
              <radialGradient id="swellGradient">
                <stop offset="0%" stopColor={poisonVeins ? '#22c55e' : '#b91c1c'} />
                <stop offset="60%" stopColor={poisonVeins ? '#15803d' : '#ef4444'} stopOpacity="0.45" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Tray of Tools */}
        <div className="mt-6 border-t border-stone-850 pt-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Surgical Tray:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHeldTool('medicinal')}
                disabled={isFinished || attached !== null}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  heldTool === 'medicinal'
                    ? 'border-amber bg-stone-900 text-stone-100 shadow-md scale-105'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                } disabled:opacity-30`}
              >
                🏺 <span className="font-serif">Jalauka (Olive)</span>
              </button>
              <button
                type="button"
                onClick={() => setHeldTool('poisonous')}
                disabled={isFinished || attached !== null}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  heldTool === 'poisonous'
                    ? 'border-amber bg-stone-900 text-stone-100 shadow-md scale-105'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                } disabled:opacity-30`}
              >
                🏺 <span className="font-serif">Savisha (Spiky)</span>
              </button>
              <button
                type="button"
                onClick={() => setHeldTool('honey')}
                disabled={isFinished}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  heldTool === 'honey'
                    ? 'border-amber bg-stone-900 text-stone-100 shadow-md scale-105'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                } disabled:opacity-30`}
              >
                🧽 <span className="font-serif">Honey Sponge</span>
              </button>
            </div>
          </div>

          {isFinished && (
            <button
              type="button"
              onClick={resetStage}
              className="rounded-full bg-stone-800 hover:bg-stone-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
            >
              Reset Cot
            </button>
          )}
        </div>
      </div>

      {/* Star Rank & Verdict HUD */}
      <div className="w-full xl:w-80 rounded-[24px] border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Surgical Report</span>
          <h4 className="font-serif text-lg font-bold text-stone-200 border-b border-stone-800 pb-2 mt-1">Status</h4>
          
          <div className="mt-6 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-stone-950/40 border border-stone-850/60 min-h-[140px]">
            {isFinished ? (
              <>
                <span className="text-4xl block mb-2">{isSuccess ? '🏆' : '⚠️'}</span>
                <span className={`text-xs font-bold uppercase tracking-wider block ${isSuccess ? 'text-herbal' : 'text-danger'}`}>
                  {isSuccess ? 'Treatment Complete' : 'Failure'}
                </span>
                <p className="text-[11px] text-stone-400 mt-2 italic font-light px-2 leading-relaxed">
                  "{verdict}"
                </p>

                {isSuccess && (
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3].map((star) => (
                      <span key={star} className={`text-xl ${star <= stars ? 'opacity-100' : 'opacity-20'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-3xl block mb-2">👁️</span>
                <p className="text-[11px] text-stone-400 italic font-light leading-relaxed">
                  Apply a medicinal leech to extract impure blood. Remove it with honey before healthy blood is drained.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Small timing indicator only visible when leech is sucking */}
        {attached && (
          <div className="mt-4 p-3 bg-stone-950/60 border border-stone-850 rounded-xl text-center text-[10px] text-stone-500 uppercase font-bold tracking-widest">
            ⏱️ Flow Duration: {timer.toFixed(1)}s
          </div>
        )}
      </div>
    </div>
  );
}
