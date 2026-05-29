import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { RealityLayer, ScrollMetrics, ConsequenceMetrics, SavePayload } from '../types/simulation';
import { initialScrollMetrics, adjustScrollMetrics } from './scroll';
import { initialConsequences, adjustConsequences } from './consequence';
import { loadSimulation, saveSimulation } from '../utils/storage';

interface SimulationState {
  stage: number;
  setStage: (value: number) => void;
  realityLayer: RealityLayer;
  setRealityLayer: (layer: RealityLayer) => void;
  scrollMetrics: ScrollMetrics;
  updateScroll: (changes: Partial<ScrollMetrics>) => void;
  consequenceMetrics: ConsequenceMetrics;
  updateConsequences: (changes: Partial<ConsequenceMetrics>) => void;
  history: string[];
  addHistory: (entry: string) => void;
  saveState: () => void;
  loadState: () => void;
}

const SimulationContext = createContext<SimulationState | undefined>(undefined);

const initialReality: RealityLayer = 'history';

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [stage, setStageState] = useState(1);
  const [realityLayer, setRealityLayerState] = useState<RealityLayer>(initialReality);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>(initialScrollMetrics);
  const [consequenceMetrics, setConsequenceMetrics] = useState<ConsequenceMetrics>(initialConsequences);
  const [history, setHistory] = useState<string[]>([]);

  const setStage = (value: number) => setStageState(value);

  const updateScroll = (changes: Partial<ScrollMetrics>) => {
    setScrollMetrics((current) => adjustScrollMetrics(current, changes));
  };

  const updateConsequences = (changes: Partial<ConsequenceMetrics>) => {
    setConsequenceMetrics((current) => adjustConsequences(current, changes));
  };

  const addHistory = (entry: string) => {
    setHistory((current) => [...current, entry].slice(-20));
  };

  const saveState = () => {
    const payload: SavePayload = {
      stage,
      scroll: scrollMetrics,
      consequences: consequenceMetrics,
      history
    };
    saveSimulation(payload);
  };

  const loadState = () => {
    const saved = loadSimulation();
    if (saved) {
      setStageState(saved.stage);
      setScrollMetrics(saved.scroll);
      setConsequenceMetrics(saved.consequences);
      setHistory(saved.history);
    }
  };

  const value = useMemo(
    () => ({
      stage,
      setStage,
      realityLayer,
      setRealityLayer: setRealityLayerState,
      scrollMetrics,
      updateScroll,
      consequenceMetrics,
      updateConsequences,
      history,
      addHistory,
      saveState,
      loadState
    }),
    [stage, realityLayer, scrollMetrics, consequenceMetrics, history]
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used inside SimulationProvider');
  }
  return context;
}
