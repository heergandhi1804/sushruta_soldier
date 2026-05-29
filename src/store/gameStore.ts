import { create } from 'zustand';

export type GameMode = 'menu' | 'play' | 'play-active' | 'sandbox' | 'settings';

export interface SandboxElement {
  id: string;
  type: 'swelling' | 'vein' | 'marma' | 'foreign_body' | 'fracture';
  x: number;
  y: number;
  size: number;
}

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  cotIndex: number;
  bleeding: number;
  infection: number;
  pain: number;
  injuryType: 'cut' | 'burn' | 'fracture';
  cleaned: boolean;
  wrapped: boolean;
  soothed: boolean;
  stitched: boolean;
  decaySpeed: number;
}

export interface HighScores {
  stage1BestTime: number | null;
  stage2BestTime: number | null;
  stage3MaxSaved: number;
  bestRank: string;
}

interface GameState {
  gameMode: GameMode;
  stage: number;
  heldItem: 'leech_medicinal' | 'leech_poisonous' | 'honey' | null;
  score: number;
  lives: number;
  highScores: HighScores;

  // Player position
  playerPosition: [number, number, number];
  setPlayerPosition: (pos: [number, number, number]) => void;

  setGameMode: (mode: GameMode) => void;
  setStage: (value: number) => void;
  updateHighScores: (changes: Partial<HighScores>) => void;
  sushrutaAlert: string | null;
  flashSushrutaAlert: (msg: string) => void;

  // Stage 1 variables
  stage1: {
    swelling: number;
    attached: 'medicinal' | 'poisonous' | null;
    timer: number;
    bloodPool: number;
    poisonVeins: boolean;
    breathingRate: number;
    isFinished: boolean;
    isSuccess: boolean;
    stars: number;
    verdict: string;
  };
  setStage1: (update: Partial<GameState['stage1']>) => void;
  resetStage1: () => void;

  // Stage 2 variables
  stage2: {
    rotation: number;
    placedLeechZone: number | null;
    swellingZones: { id: number; baseX: number; baseY: number; size: number }[];
    marmaNodes: { id: string; name: string; baseX: number; baseY: number; radius: number }[];
    isFinished: boolean;
    isSuccess: boolean;
    stars: number;
    bloodSpurt: boolean;
    outcome: string;
    timer: number;
  };
  setStage2: (update: Partial<GameState['stage2']>) => void;
  resetStage2: () => void;

  // Stage 3 variables
  stage3: {
    patients: Patient[];
    isGameOver: boolean;
    spawnTimer: number;
  };
  setStage3: (update: Partial<GameState['stage3']>) => void;
  resetStage3: () => void;

  // Sandbox variables
  sandbox: {
    forgedTool: {
      precision: number;
      gripStrength: number;
      speed: number;
      risk: number;
    };
    jawType: 'Crow Beak' | 'Eagle Pinch' | 'Crocodile Clamp' | 'Heron Probe';
    handleLength: 'Short' | 'Medium' | 'Long';
    weight: 'Light' | 'Balanced' | 'Heavy';
    tipShape: 'Fine' | 'Blunt' | 'Curved';
    elements: SandboxElement[];
    testMode: boolean;
    testLog: string;
    bleedValue: number;
    isTipBent: boolean;
  };
  setSandbox: (update: Partial<GameState['sandbox']>) => void;
  resetSandbox: () => void;
}

export const useGameStore = create<GameState>((set, get) => {
  // Load high scores safely
  let initialHighScores: HighScores = {
    stage1BestTime: null,
    stage2BestTime: null,
    stage3MaxSaved: 0,
    bestRank: 'Disciple'
  };

  try {
    const rawScores = localStorage.getItem('sushruta-3d-high-scores');
    if (rawScores) {
      const parsed = JSON.parse(rawScores);
      if (parsed && typeof parsed === 'object') {
        initialHighScores = {
          stage1BestTime: typeof parsed.stage1BestTime === 'number' ? parsed.stage1BestTime : null,
          stage2BestTime: typeof parsed.stage2BestTime === 'number' ? parsed.stage2BestTime : null,
          stage3MaxSaved: typeof parsed.stage3MaxSaved === 'number' ? parsed.stage3MaxSaved : 0,
          bestRank: typeof parsed.bestRank === 'string' ? parsed.bestRank : 'Disciple'
        };
      }
    }
  } catch (e) {
    // fallback to default
  }

  return {
    gameMode: 'menu',
    stage: 1,
    heldItem: null,
    score: 0,
    lives: 3,
    highScores: initialHighScores,
    playerPosition: [0, 0, 0],

    setPlayerPosition: (playerPosition) => set({ playerPosition }),

    setGameMode: (gameMode) => {
      set({ gameMode });
      if (gameMode === 'play-active') {
        const activeStage = get().stage;
        if (activeStage === 1) get().resetStage1();
        else if (activeStage === 2) get().resetStage2();
        else if (activeStage === 3) get().resetStage3();
      }
    },

    setStage: (stage) => set({ stage }),

    updateHighScores: (changes) => {
      set((state) => {
        const next = { ...state.highScores, ...changes };
        try {
          localStorage.setItem('sushruta-3d-high-scores', JSON.stringify(next));
        } catch (e) {
          // ignore save error
        }
        return { highScores: next };
      });
    },

    sushrutaAlert: null,
    flashSushrutaAlert: (msg) => {
      set({ sushrutaAlert: msg });
      setTimeout(() => {
        set({ sushrutaAlert: null });
      }, 2500);
    },

    // Stage 1 default state
    stage1: {
      swelling: 85,
      attached: null,
      timer: 0,
      bloodPool: 0,
      poisonVeins: false,
      breathingRate: 2.2,
      isFinished: false,
      isSuccess: false,
      stars: 0,
      verdict: ''
    },
    setStage1: (update) =>
      set((state) => ({ stage1: { ...state.stage1, ...update } })),
    resetStage1: () =>
      set({
        heldItem: null,
        stage1: {
          swelling: 85,
          attached: null,
          timer: 0,
          bloodPool: 0,
          poisonVeins: false,
          breathingRate: 2.2,
          isFinished: false,
          isSuccess: false,
          stars: 0,
          verdict: ''
        }
      }),

    // Stage 2 default state
    stage2: {
      rotation: 90,
      placedLeechZone: null,
      swellingZones: [],
      marmaNodes: [],
      isFinished: false,
      isSuccess: false,
      stars: 0,
      bloodSpurt: false,
      outcome: '',
      timer: 0
    },
    setStage2: (update) =>
      set((state) => ({ stage2: { ...state.stage2, ...update } })),
    resetStage2: () => {
      // Generate randomized layout for Stage 2
      const zones = [
        { id: 1, baseX: 120, baseY: 65, size: 22 },
        { id: 2, baseX: 180, baseY: 55, size: 19 },
        { id: 3, baseX: 250, baseY: 75, size: 21 },
        { id: 4, baseX: 310, baseY: 60, size: 18 }
      ];

      const overlapId = Math.floor(Math.random() * 4) + 1;
      const overlapZone = zones[overlapId - 1];

      const nodes = [
        {
          id: 'm1',
          name: 'Janu Joint Marma',
          baseX: overlapZone.baseX,
          baseY: overlapZone.baseY,
          radius: 24
        },
        {
          id: 'm2',
          name: 'Sira Vessel Marma',
          baseX: zones[(overlapId % 4)].baseX,
          baseY: zones[(overlapId % 4)].baseY,
          radius: 22
        }
      ];

      set({
        heldItem: null,
        stage2: {
          rotation: 90,
          placedLeechZone: null,
          swellingZones: zones,
          marmaNodes: nodes,
          isFinished: false,
          isSuccess: false,
          stars: 0,
          bloodSpurt: false,
          outcome: 'Use the Marma Lens to inspect, rotate, and place leech.',
          timer: 0
        }
      });
    },

    // Stage 3 default state
    stage3: {
      patients: [],
      isGameOver: false,
      spawnTimer: 0
    },
    setStage3: (update) =>
      set((state) => ({ stage3: { ...state.stage3, ...update } })),
    resetStage3: () =>
      set({
        score: 0,
        lives: 3,
        heldItem: null,
        stage3: {
          patients: [
            {
              id: 'p_init',
              name: 'Karna the Guard',
              avatar: '🛡️',
              cotIndex: 0,
              bleeding: 45,
              infection: 15,
              pain: 50,
              injuryType: 'cut',
              cleaned: false,
              wrapped: false,
              soothed: false,
              stitched: false,
              decaySpeed: 0.8
            }
          ],
          isGameOver: false,
          spawnTimer: 0
        }
      }),

    // Sandbox default state
    sandbox: {
      forgedTool: { precision: 70, gripStrength: 60, speed: 75, risk: 10 },
      jawType: 'Crow Beak',
      handleLength: 'Medium',
      weight: 'Balanced',
      tipShape: 'Fine',
      elements: [],
      testMode: false,
      testLog: 'Engrave layout, forge and run test.',
      bleedValue: 0,
      isTipBent: false
    },
    setSandbox: (update) =>
      set((state) => ({ sandbox: { ...state.sandbox, ...update } })),
    resetSandbox: () =>
      set((state) => ({
        sandbox: {
          ...state.sandbox,
          elements: [],
          testMode: false,
          testLog: 'Anvil cleared.',
          bleedValue: 0,
          isTipBent: false
        }
      }))
  };
});
