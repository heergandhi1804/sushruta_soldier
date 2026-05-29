import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { GameMode, RealityLayer, ScrollMetrics, ConsequenceMetrics, SavePayload, TimeOfDay, SandboxElement, ToolOption, HighScores } from '../types/simulation';
import { initialScrollMetrics, adjustScrollMetrics } from './scroll';
import { initialConsequences, adjustConsequences } from './consequence';
import { loadSimulation, saveSimulation } from '../utils/storage';

interface SimulationState {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  stage: number;
  setStage: (value: number) => void;
  unlockedStages: number[];
  setUnlockedStages: (stages: number[]) => void;
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
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  completedCinematic: boolean;
  setCompletedCinematic: (val: boolean) => void;
  sushrutaAlert: string | null;
  flashSushrutaAlert: (msg: string) => void;
  sandboxElements: SandboxElement[];
  setSandboxElements: (elements: SandboxElement[] | ((prev: SandboxElement[]) => SandboxElement[])) => void;
  forgedTool: ToolOption;
  setForgedTool: (tool: ToolOption) => void;
  highScores: HighScores;
  updateHighScores: (changes: Partial<HighScores>) => void;
}

const SimulationContext = createContext<SimulationState | undefined>(undefined);

const initialReality: RealityLayer = 'pratyaksha';

const defaultTool: ToolOption = {
  id: 'custom-forged',
  label: 'Disciple Lancet',
  precision: 70,
  gripStrength: 60,
  speed: 75,
  risk: 10
};

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [stage, setStageState] = useState(1);
  const [unlockedStages, setUnlockedStages] = useState<number[]>([1, 2, 3]);
  const [realityLayer, setRealityLayerState] = useState<RealityLayer>(initialReality);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>(initialScrollMetrics);
  const [consequenceMetrics, setConsequenceMetrics] = useState<ConsequenceMetrics>(initialConsequences);
  const [history, setHistory] = useState<string[]>([]);
  
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [completedCinematic, setCompletedCinematic] = useState(false);
  const [sushrutaAlert, setSushrutaAlert] = useState<string | null>(null);
  
  const [sandboxElements, setSandboxElements] = useState<SandboxElement[]>([]);
  const [forgedTool, setForgedTool] = useState<ToolOption>(defaultTool);

  const [highScores, setHighScores] = useState<HighScores>(() => {
    const raw = localStorage.getItem('sushruta-high-scores');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // use default
      }
    }
    return {
      stage1BestTime: null,
      stage2BestTime: null,
      stage3MaxSaved: 0,
      bestRank: 'Disciple'
    };
  });

  const updateHighScores = (changes: Partial<HighScores>) => {
    setHighScores((prev) => {
      const next = { ...prev, ...changes };
      localStorage.setItem('sushruta-high-scores', JSON.stringify(next));
      return next;
    });
  };

  const flashSushrutaAlert = (msg: string) => {
    setSushrutaAlert(msg);
    window.setTimeout(() => setSushrutaAlert(null), 2500);
  };

  const setStage = (value: number) => {
    setStageState(value);
    if (value === 1) {
      setTimeOfDay('morning');
    } else if (value === 2) {
      setTimeOfDay('afternoon');
    } else if (value === 3) {
      setTimeOfDay('evening');
    } else if (value === 4) {
      setTimeOfDay('night');
    }
  };

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
      history,
      highScores
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
      if (saved.highScores) {
        setHighScores(saved.highScores);
      }
    }
  };

  const value = useMemo(
    () => ({
      gameMode,
      setGameMode,
      stage,
      setStage,
      unlockedStages,
      setUnlockedStages,
      realityLayer,
      setRealityLayer: setRealityLayerState,
      scrollMetrics,
      updateScroll,
      consequenceMetrics,
      updateConsequences,
      history,
      addHistory,
      saveState,
      loadState,
      timeOfDay,
      setTimeOfDay,
      completedCinematic,
      setCompletedCinematic,
      sushrutaAlert,
      flashSushrutaAlert,
      sandboxElements,
      setSandboxElements,
      forgedTool,
      setForgedTool,
      highScores,
      updateHighScores
    }),
    [
      gameMode, 
      stage, 
      unlockedStages, 
      realityLayer, 
      scrollMetrics, 
      consequenceMetrics, 
      history, 
      timeOfDay, 
      completedCinematic, 
      sushrutaAlert, 
      sandboxElements, 
      forgedTool,
      highScores,
      updateHighScores
    ]
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
