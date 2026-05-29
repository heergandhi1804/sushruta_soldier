import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { RealityLayer, ScrollMetrics, ConsequenceMetrics, SavePayload, TimeOfDay, GurukulLocation, SushrutaDialogueState } from '../types/simulation';
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
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  location: GurukulLocation;
  setLocation: (loc: GurukulLocation) => void;
  sushrutaDialogue: SushrutaDialogueState;
  setSushrutaDialogue: (dialogue: SushrutaDialogueState) => void;
  completedCinematic: boolean;
  setCompletedCinematic: (val: boolean) => void;
}

const SimulationContext = createContext<SimulationState | undefined>(undefined);

const initialReality: RealityLayer = 'pratyaksha';

const initialDialogue: SushrutaDialogueState = {
  speaker: 'Acharya Sushruta',
  text: 'Welcome to Kashi, my disciple. Remember: observation is the first lancet. Study the swelling of the body and let your eyes guide your hand.',
  expression: 'calm'
};

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [stage, setStageState] = useState(1);
  const [realityLayer, setRealityLayerState] = useState<RealityLayer>(initialReality);
  const [scrollMetrics, setScrollMetrics] = useState<ScrollMetrics>(initialScrollMetrics);
  const [consequenceMetrics, setConsequenceMetrics] = useState<ConsequenceMetrics>(initialConsequences);
  const [history, setHistory] = useState<string[]>([]);
  
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [location, setLocation] = useState<GurukulLocation>('courtyard');
  const [sushrutaDialogue, setSushrutaDialogue] = useState<SushrutaDialogueState>(initialDialogue);
  const [completedCinematic, setCompletedCinematic] = useState(false);

  const setStage = (value: number) => {
    setStageState(value);
    // Automatically transition location and time based on the active stage/chapter
    if (value === 1) {
      setLocation('courtyard');
      setTimeOfDay('morning');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Ah, your first real test. A royal guard wounded in the battle-drills of Kashi. Look closely at his swollen limb—what does the text of observation teach us?',
        expression: 'calm'
      });
    } else if (value === 2) {
      setLocation('hall');
      setTimeOfDay('afternoon');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The pathways of life-breath, the Marma points, are sacred. Avoid them at all costs, or the flow of life will cease.',
        expression: 'thoughtful'
      });
    } else if (value === 3) {
      setLocation('recovery');
      setTimeOfDay('evening');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The Kashi storm has broken. The Gurukul is full, and our hearts are tested. You must decide who requires our treatment first, my senior disciple.',
        expression: 'concerned'
      });
    } else if (value === 4) {
      setLocation('workshop');
      setTimeOfDay('night');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The metal of the anvil is like the medicine of the body—both must be shaped with intent. Reflect on nature, copy the form of the beast, and create your instrument.',
        expression: 'storytelling'
      });
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
      loadState,
      timeOfDay,
      setTimeOfDay,
      location,
      setLocation,
      sushrutaDialogue,
      setSushrutaDialogue,
      completedCinematic,
      setCompletedCinematic
    }),
    [stage, realityLayer, scrollMetrics, consequenceMetrics, history, timeOfDay, location, sushrutaDialogue, completedCinematic]
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

