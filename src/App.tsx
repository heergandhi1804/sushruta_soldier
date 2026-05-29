import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SimulationProvider, useSimulation } from './systems/SimulationProvider';
import Stage1 from './stages/stage1/Stage1';
import Stage2 from './stages/stage2/Stage2';
import Stage3 from './stages/stage3/Stage3';
import Stage4 from './stages/stage4/Stage4';
import { useReducedMotion } from './hooks/useReducedMotion';

const stageList = [
  { id: 1, label: 'Pressure Test', location: 'Leech Therapy' },
  { id: 2, label: 'Marma Precision', location: 'Skill Challenge' },
  { id: 3, label: 'Reconstruction Academy', location: 'Survival Mode' }
];

function GameApp() {
  const {
    gameMode,
    setGameMode,
    stage,
    setStage,
    unlockedStages,
    timeOfDay,
    sushrutaAlert,
    completedCinematic,
    setCompletedCinematic,
    highScores
  } = useSimulation();

  const reducedMotion = useReducedMotion();
  const [showSettings, setShowSettings] = useState(false);
  const [introTimer, setIntroTimer] = useState(0);

  // Quick 15s atmospheric intro
  const runIntro = () => {
    setCompletedCinematic(false);
    setIntroTimer(1);
    window.setTimeout(() => {
      setCompletedCinematic(true);
      setGameMode('menu');
    }, 12000);
  };

  const activeStageComponent = useMemo(() => {
    if (stage === 1) return <Stage1 />;
    if (stage === 2) return <Stage2 />;
    return <Stage3 />;
  }, [stage]);

  const currentTODClass = {
    morning: 'from-stone-900 via-stone-950 to-amber-950/20',
    afternoon: 'from-stone-950 via-stone-900 to-orange-950/15',
    evening: 'from-stone-900 via-stone-950 to-red-950/20',
    night: 'from-stone-950 via-stone-950 to-indigo-950/30'
  }[timeOfDay];

  return (
    <div className={`relative min-h-screen bg-gradient-to-b ${currentTODClass} text-stone-100 overflow-x-hidden font-sans select-none`}>
      {/* Flicker candles ambient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(179,107,50,0.06),transparent_50%)] animate-pulse" />
      <div className="pointer-events-none absolute inset-0 opacity-5 bg-[linear-gradient(rgba(179,107,50,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(179,107,50,0.15)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Floating Sushruta Alert Overlay (Flash style, disappears after 2.5s) */}
      <AnimatePresence>
        {sushrutaAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: -20, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 z-50 rounded-full border border-amber/30 bg-stone-900/95 px-6 py-2 text-xs font-bold text-amber shadow-2xl flex items-center gap-2"
          >
            <span>🕉️ Acharya:</span>
            <span className="text-white italic">"{sushrutaAlert}"</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro cinematic blocker (Max 12 seconds) */}
      <AnimatePresence>
        {!completedCinematic && introTimer > 0 && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-center p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(179,107,50,0.12),transparent_70%)]" />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5 }}
              className="relative max-w-md space-y-4"
            >
              <span className="text-4xl">🕉️</span>
              <h2 className="font-serif text-3xl font-bold text-amber tracking-wider">KASHI, 600 BCE</h2>
              <p className="text-sm leading-6 text-stone-300 font-light">
                "Welcome to Sushruta's Gurukul. Here, hands must learn before the mind commands. Live the ancient teachings of surgery."
              </p>
              <button
                type="button"
                onClick={() => {
                  setCompletedCinematic(true);
                  setGameMode('menu');
                }}
                className="mt-6 rounded-full border border-amber/30 bg-amber/10 px-6 py-2 text-xs font-bold text-amber hover:bg-amber/20"
              >
                Skip Intro
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game views */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {gameMode === 'menu' && (
          /* Main Menu view */
          <div className="flex-1 flex flex-col items-center justify-center py-20 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 max-w-lg relative z-10"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-amber">Gurukul Simulation</span>
                <h1 className="mt-2 font-serif text-4xl font-extrabold tracking-wider text-stone-100 sm:text-5xl uppercase">
                  Living Lancets
                </h1>
              </div>

              {/* Menu selections */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setGameMode('play')}
                  className="w-full rounded-[24px] bg-gradient-to-r from-amber to-copper py-4 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                >
                  PLAY
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('sandbox')}
                  className="w-full rounded-[24px] border border-amber/20 bg-stone-900/60 py-4 text-sm font-bold text-amber hover:bg-stone-900/90 active:scale-95 transition-all uppercase tracking-widest"
                >
                  SANDBOX
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="w-full rounded-[24px] border border-stone-800 bg-stone-900/30 py-3 text-xs font-bold text-stone-400 hover:text-stone-200 active:scale-95 transition-all uppercase tracking-widest"
                >
                  SETTINGS
                </button>
              </div>

              {/* High Score panel in Main Menu */}
              {(highScores.stage3MaxSaved > 0 || highScores.stage1BestTime !== null) && (
                <div className="mt-4 p-4 rounded-2xl border border-stone-800/80 bg-stone-950/40 text-left text-xs space-y-1.5 text-stone-400 max-w-xs mx-auto">
                  <p className="text-[10px] font-bold text-amber uppercase tracking-wider text-center border-b border-stone-850 pb-1 mb-2">Record Hall</p>
                  {highScores.stage1BestTime !== null && <p>⏱️ Pressure Test Best: <span className="text-stone-200 font-bold">{highScores.stage1BestTime.toFixed(1)}s</span></p>}
                  {highScores.stage2BestTime !== null && <p>⏱️ Marma Best: <span className="text-stone-200 font-bold">{highScores.stage2BestTime.toFixed(1)}s</span></p>}
                  {highScores.stage3MaxSaved > 0 && <p>🌾 Survival Max Saved: <span className="text-stone-200 font-bold">{highScores.stage3MaxSaved} patients</span></p>}
                  <p>🎖️ Surgeon Rank: <span className="text-amber font-bold">{highScores.bestRank}</span></p>
                </div>
              )}

              <p className="text-[10px] text-stone-500 font-light">
                Developed in compliance with the Sushruta Samhita.
              </p>
            </motion.div>
          </div>
        )}

        {gameMode === 'play' && (
          /* Stage Select Screen */
          <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto py-10 space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold text-amber uppercase tracking-wider">Free Play Modes</span>
              <h2 className="font-serif text-2xl font-bold text-stone-100 mt-1">Select Surgical Challenge</h2>
            </div>

            <div className="space-y-3">
              {stageList.map((stg) => {
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => {
                      setStage(stg.id);
                      setGameMode('play-active');
                    }}
                    className="w-full rounded-[24px] border border-amber/25 bg-stone-900/80 hover:border-amber/60 hover:bg-stone-900 p-5 text-left transition-all relative overflow-hidden flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-amber/60 uppercase">Mode {stg.id}</span>
                      <h4 className="font-serif text-lg font-bold text-stone-200 mt-1">{stg.label}</h4>
                      <p className="text-[10px] text-stone-500 uppercase font-semibold mt-0.5">{stg.location}</p>
                    </div>
                    <div>
                      <span className="text-amber text-xs font-bold uppercase tracking-wider">ENTER</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setGameMode('menu')}
              className="w-full text-center text-xs text-stone-500 hover:text-stone-300 underline font-bold"
            >
              Return to Main Menu
            </button>
          </div>
        )}

        {gameMode === 'play-active' && (
          /* Active Gameplay screen */
          <div className="flex-1 flex flex-col gap-4">
            {/* Top Minimal HUD (Scores) */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGameMode('play')}
                  className="rounded-full border border-stone-800 bg-stone-900/40 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-900"
                >
                  Leave Stage
                </button>
                <span className="text-xs font-bold text-amber uppercase">
                  {stageList.find((item) => item.id === stage)?.label}
                </span>
              </div>
              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                Direct Bodily Assessment Active
              </span>
            </div>

            {/* Active stage component */}
            <div className="flex-1">
              {activeStageComponent}
            </div>
          </div>
        )}

        {gameMode === 'sandbox' && (
          /* Sandbox (Tool Forge / scenario creator) */
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <button
                type="button"
                onClick={() => setGameMode('menu')}
                className="rounded-full border border-stone-800 bg-stone-900/40 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-900"
              >
                Exit Sandbox
              </button>
              <span className="text-xs font-bold text-amber uppercase tracking-wider">
                Loha-Sala (Blacksmith Forge & Anvil Sandbox)
              </span>
            </div>
            
            <div className="flex-1">
              <Stage4 />
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-md w-full rounded-[32px] border border-stone-800 bg-stone-900 p-6 space-y-6 text-center shadow-2xl"
            >
              <h3 className="font-serif text-xl font-bold text-amber">Academy Settings</h3>
              
              <div className="space-y-4 text-left text-sm text-stone-300">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span>Atmospheric sound cues</span>
                  <span className="text-xs text-herbal font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span>Dynamic camera breathing</span>
                  <span className="text-xs text-herbal font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span>Flickering oil lamp filters</span>
                  <span className="text-xs text-herbal font-bold">ACTIVE</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={runIntro}
                  className="w-full rounded-full border border-amber/20 bg-amber-500/10 py-2.5 text-xs font-bold text-amber hover:bg-amber-500/20"
                >
                  Replay Kashi Cinematic Intro
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="w-full rounded-full bg-stone-800 py-2.5 text-xs font-bold text-stone-300 hover:bg-stone-700"
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <SimulationProvider>
      <GameApp />
    </SimulationProvider>
  );
}

export default App;
