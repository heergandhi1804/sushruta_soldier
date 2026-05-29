import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StageHeader } from './components/stage/StageHeader';
import { StageSelector } from './components/controls/StageSelector';
import { SaveLoadPanel } from './components/controls/SaveLoadPanel';
import { SimulationProvider, useSimulation } from './systems/SimulationProvider';
import Stage1 from './stages/stage1/Stage1';
import Stage2 from './stages/stage2/Stage2';
import Stage3 from './stages/stage3/Stage3';
import Stage4 from './stages/stage4/Stage4';
import { RealityToggle } from './components/stage/RealityToggle';
import { useReducedMotion } from './hooks/useReducedMotion';
import { CinematicSequence } from './components/layout/CinematicSequence';
import { SushrutaCharacter } from './components/ui/SushrutaCharacter';

const stageList = [
  { id: 1, label: 'Leech Therapy' },
  { id: 2, label: 'Marma Grid' },
  { id: 3, label: 'Storm Triage' },
  { id: 4, label: 'Tool Forge' }
];

const todClasses = {
  morning: 'tod-morning',
  afternoon: 'tod-afternoon',
  evening: 'tod-evening',
  night: 'tod-night'
};

const locationNames = {
  courtyard: 'Training Courtyard (Dawn Studies)',
  garden: 'Medicinal Herb Garden',
  hall: 'Anatomy Study Hall (Marma Vidya)',
  recovery: 'Patient Recovery Hall (Storm Triage)',
  riverbank: 'Riverbank Practice Area',
  chamber: 'Ancient Manuscript Library',
  library: 'Sanskrit Library',
  workshop: 'Surgical Tool Forge (Loha-Sala)'
};

function SimulationApp() {
  const { 
    stage, 
    setStage, 
    timeOfDay, 
    location, 
    completedCinematic, 
    setCompletedCinematic 
  } = useSimulation();

  const reducedMotion = useReducedMotion();

  const activeStageComponent = useMemo(() => {
    if (stage === 1) return <Stage1 />;
    if (stage === 2) return <Stage2 />;
    if (stage === 3) return <Stage3 />;
    return <Stage4 />;
  }, [stage]);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${todClasses[timeOfDay]} text-indigo selection:bg-amber/40`}>
      {/* Interactive Cinematic Sequence */}
      <AnimatePresence>
        {!completedCinematic && (
          <CinematicSequence onComplete={() => setCompletedCinematic(true)} />
        )}
      </AnimatePresence>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[32px] border border-amber/15 bg-white/80 p-5 shadow-parchment backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-amber">
              Sushruta's Academy • Ancient Kashi
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-wide text-indigo sm:text-3xl">
              The Living Lancets
            </h1>
            <p className="mt-2 text-xs text-indigo/70 font-light max-w-xl">
              Active Location: <strong className="text-copper">{locationNames[location]}</strong>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <RealityToggle />
            <SaveLoadPanel />
          </div>
        </header>

        {/* Sushruta as a living, physical character overseeing the studies */}
        <SushrutaCharacter />

        <StageSelector stageList={stageList} activeStage={stage} onSelect={setStage} />

        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0.2 : 0.4 }}
            className="rounded-[32px] border border-amber/15 bg-white/80 p-5 shadow-parchment"
          >
            <StageHeader 
              title={stageList.find((item) => item.id === stage)?.label ?? 'Study Stage'} 
              stage={stage} 
            />
            {activeStageComponent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <SimulationProvider>
      <SimulationApp />
    </SimulationProvider>
  );
}

export default App;
