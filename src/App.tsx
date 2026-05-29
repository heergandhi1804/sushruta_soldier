import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StageHeader } from './components/stage/StageHeader';
import { StageSelector } from './components/controls/StageSelector';
import { SaveLoadPanel } from './components/controls/SaveLoadPanel';
import { SimulationProvider } from './systems/SimulationProvider';
import Stage1 from './stages/stage1/Stage1';
import Stage2 from './stages/stage2/Stage2';
import Stage3 from './stages/stage3/Stage3';
import Stage4 from './stages/stage4/Stage4';
import { RealityToggle } from './components/stage/RealityToggle';
import { useReducedMotion } from './hooks/useReducedMotion';

const stageList = [
  { id: 1, label: 'Pressure Test' },
  { id: 2, label: 'Grid Precision' },
  { id: 3, label: 'Reconstruction Academy' },
  { id: 4, label: 'Gurukul Master Builder' }
];

function App() {
  const [activeStage, setActiveStage] = useState(1);
  const reducedMotion = useReducedMotion();

  const activeStageComponent = useMemo(() => {
    if (activeStage === 1) return <Stage1 />;
    if (activeStage === 2) return <Stage2 />;
    if (activeStage === 3) return <Stage3 />;
    return <Stage4 />;
  }, [activeStage]);

  return (
    <SimulationProvider>
      <div className="min-h-screen bg-parchment text-indigo selection:bg-amber/40">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 rounded-3xl border border-indigo/10 bg-white/80 p-5 shadow-parchment backdrop-blur-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber">Ancient Academy Simulation</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight">Sushruta's Secret Map & The Living Lancets</h1>
              <p className="mt-2 max-w-2xl text-sm text-indigo/80 sm:text-base">
                Learn surgical observation, anatomy interactions, triage reasoning, and tool design in an authentic simulation inspired by early medical systems.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <RealityToggle />
              <SaveLoadPanel />
            </div>
          </header>

          <StageSelector stageList={stageList} activeStage={activeStage} onSelect={setActiveStage} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.4 }}
              className="rounded-[32px] border border-indigo/10 bg-white/80 p-5 shadow-parchment"
            >
              <StageHeader title={stageList.find((item) => item.id === activeStage)?.label ?? 'Stage'} stage={activeStage} />
              {activeStageComponent}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SimulationProvider>
  );
}

export default App;
