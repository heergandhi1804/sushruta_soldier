import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

interface Patient {
  id: string;
  name: string;
  avatar: string;
  cotIndex: number; // 0 to 4
  bleeding: number; // 0 to 100
  infection: number; // 0 to 100
  pain: number; // 0 to 100
  injuryType: 'cut' | 'burn' | 'fracture';
  cleaned: boolean;
  wrapped: boolean;
  soothed: boolean;
  stitched: boolean;
  decaySpeed: number;
}

// 5 cots coordinates in the walkable ward
const cotsCoords = [
  { index: 0, x: 80, y: 70, label: 'Cot A' },
  { index: 1, x: 170, y: 70, label: 'Cot B' },
  { index: 2, x: 260, y: 70, label: 'Cot C' },
  { index: 3, x: 350, y: 70, label: 'Cot D' },
  { index: 4, x: 440, y: 70, label: 'Cot E' }
];

const patientNames = ['Karna', 'Anya', 'Madhav', 'Gopal', 'Ramdas', 'Vasu', 'Devi', 'Chandra'];
const patientAvatars = ['🛡️', '👧', '🌾', '⚖️', '🔨', '🧔', '👵', '⛵'];

export default function Stage3() {
  const {
    updateHighScores,
    flashSushrutaAlert,
    highScores
  } = useSimulation();

  // Survival state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [spawnTimer, setSpawnTimer] = useState(0);

  // Walkable Avatar state
  const [avatarPos, setAvatarPos] = useState({ x: 260, y: 180 });
  const [isWalking, setIsWalking] = useState(false);
  const [activeCotIndex, setActiveCotIndex] = useState<number | null>(null);

  // Bedside tool state
  const [heldTool, setHeldTool] = useState<'sponge' | 'bandage' | 'ointment' | 'needle' | null>(null);

  // Sound/Vibe cascade indicators
  const [cotAlerts, setCotAlerts] = useState<boolean[]>([false, false, false, false, false]);

  // Initial load: spawn first patient
  useEffect(() => {
    spawnPatient();
  }, []);

  // Main Survival loop (Ticks every 200ms)
  useEffect(() => {
    if (isGameOver) return;

    const interval = window.setInterval(() => {
      // 1. Update patient vitals
      setPatients((currentList) => {
        let deadOccurred = false;
        const nextList = currentList.map((p) => {
          const nextBleed = p.stitched ? p.bleeding : Math.min(100, p.bleeding + p.decaySpeed * (p.injuryType === 'cut' ? 1.5 : 0.8));
          const nextInfect = p.cleaned ? p.infection : Math.min(100, p.infection + p.decaySpeed * (p.injuryType === 'burn' ? 1.4 : 0.8));
          const nextPain = p.soothed ? p.pain : Math.min(100, p.pain + p.decaySpeed * (p.injuryType === 'fracture' ? 1.6 : 0.7));

          let expired = false;
          if (nextBleed >= 100 || nextInfect >= 100 || nextPain >= 100) {
            expired = true;
            deadOccurred = true;
          }

          // Trigger warning sounds/vibrations if getting critical
          const isCritical = nextBleed > 75 || nextInfect > 75;
          setCotAlerts((prev) => {
            const nextAlerts = [...prev];
            nextAlerts[p.cotIndex] = isCritical;
            return nextAlerts;
          });

          return expired ? null : {
            ...p,
            bleeding: nextBleed,
            infection: nextInfect,
            pain: nextPain
          };
        }).filter((p): p is Patient => p !== null);

        if (deadOccurred) {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              flashSushrutaAlert('Gurukul overwhelmed. Game Over.');
              // Check high score
              if (savedCount > highScores.stage3MaxSaved) {
                updateHighScores({
                  stage3MaxSaved: savedCount,
                  bestRank: getSurgeonRank(savedCount)
                });
              }
            } else {
              flashSushrutaAlert('A patient expired in the ward!');
            }
            return nextL;
          });
        }

        return nextList;
      });

      // 2. Handle dynamic spawning
      setSpawnTimer((prev) => {
        const nextT = prev + 0.2;
        // Spawning rate scales with saved count
        const threshold = Math.max(5, 12 - savedCount * 0.6);
        if (nextT >= threshold) {
          spawnPatient();
          return 0;
        }
        return nextT;
      });
    }, 200);

    return () => window.clearInterval(interval);
  }, [isGameOver, savedCount, highScores.stage3MaxSaved]);

  // Spawn patient on empty cot
  const spawnPatient = () => {
    setPatients((currentList) => {
      if (currentList.length >= 5) return currentList;

      // Find indices of empty cots
      const occupiedCots = currentList.map((p) => p.cotIndex);
      const emptyCots = [0, 1, 2, 3, 4].filter((i) => !occupiedCots.includes(i));
      
      if (emptyCots.length === 0) return currentList;

      const randomCotIndex = emptyCots[Math.floor(Math.random() * emptyCots.length)];
      const randomName = patientNames[Math.floor(Math.random() * patientNames.length)];
      const randomAvatar = patientAvatars[Math.floor(Math.random() * patientAvatars.length)];
      
      const injuryTypes: Patient['injuryType'][] = ['cut', 'burn', 'fracture'];
      const randomInjury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];

      const newPatient: Patient = {
        id: `p_${Date.now()}`,
        name: randomName,
        avatar: randomAvatar,
        cotIndex: randomCotIndex,
        bleeding: randomInjury === 'cut' ? 55 : 10 + Math.random() * 20,
        infection: randomInjury === 'burn' ? 45 : 5 + Math.random() * 20,
        pain: randomInjury === 'fracture' ? 65 : 15 + Math.random() * 20,
        injuryType: randomInjury,
        cleaned: false,
        wrapped: false,
        soothed: false,
        stitched: false,
        decaySpeed: 0.6 + savedCount * 0.1 // speed up over time
      };

      flashSushrutaAlert(`Patient arrived at ${cotsCoords[randomCotIndex].label}!`);
      return [...currentList, newPatient];
    });
  };

  const getSurgeonRank = (score: number) => {
    if (score >= 15) return 'Prana Master';
    if (score >= 10) return 'Siddha Surgeon';
    if (score >= 5) return 'Gurukul Graduate';
    return 'Apprentice';
  };

  // Click to walk to cot
  const handleCotClick = (cotIndex: number) => {
    if (isGameOver) return;
    const target = cotsCoords[cotIndex];
    setIsWalking(true);
    
    // Walk avatar to a position just below the target cot
    setAvatarPos({ x: target.x, y: target.y + 45 });
    
    setTimeout(() => {
      setIsWalking(false);
      setActiveCotIndex(cotIndex);
      setHeldTool(null);
    }, 800); // 800ms travel time transition
  };

  // Leave active cot
  const handleLeaveCot = () => {
    setActiveCotIndex(null);
    setHeldTool(null);
  };

  // Bedside treatments
  const activePatient = useMemo(() => {
    if (activeCotIndex === null) return null;
    return patients.find((p) => p.cotIndex === activeCotIndex) || null;
  }, [activeCotIndex, patients]);

  const handleApplyToolToPatient = (tool: typeof heldTool) => {
    if (!activePatient || !tool) return;

    setPatients((currentList) =>
      currentList.map((p) => {
        if (p.id !== activePatient.id) return p;

        let nextP = { ...p };
        if (tool === 'sponge') {
          nextP.cleaned = true;
          nextP.infection = Math.max(0, nextP.infection - 35);
          flashSushrutaAlert('Wound cleansed of rot.');
        } else if (tool === 'bandage') {
          nextP.wrapped = true;
          nextP.bleeding = Math.max(0, nextP.bleeding - 40);
          flashSushrutaAlert('Pressure wrap applied.');
        } else if (tool === 'ointment') {
          nextP.soothed = true;
          nextP.pain = Math.max(0, nextP.pain - 40);
          flashSushrutaAlert('Soma ointment applied.');
        } else if (tool === 'needle') {
          if (!p.cleaned || !p.wrapped) {
            flashSushrutaAlert('Wound must be cleaned and bound before stitching!');
            return p;
          }
          nextP.stitched = true;
          nextP.bleeding = 0;
          nextP.infection = 0;
          nextP.pain = 0;
        }
        return nextP;
      })
    );
    setHeldTool(null);
  };

  // Complete/Stabilize patient trigger
  useEffect(() => {
    if (activePatient && activePatient.cleaned && activePatient.wrapped && activePatient.soothed && activePatient.stitched) {
      // Patient saved!
      setSavedCount((s) => s + 1);
      flashSushrutaAlert(`${activePatient.name} stabilized and discharged!`);
      
      // Remove patient from list
      setPatients((prev) => prev.filter((p) => p.id !== activePatient.id));
      setActiveCotIndex(null);
    }
  }, [activePatient]);

  const resetGame = () => {
    setPatients([]);
    setSavedCount(0);
    setLives(3);
    setIsGameOver(false);
    setSpawnTimer(0);
    setActiveCotIndex(null);
    setHeldTool(null);
    spawnPatient();
  };

  // Render Stars achieved based on score
  const renderStars = () => {
    const count = savedCount >= 12 ? 3 : savedCount >= 6 ? 2 : savedCount >= 2 ? 1 : 0;
    return (
      <div className="flex gap-1.5 justify-center mt-3">
        {[1, 2, 3].map((star) => (
          <span key={star} className={`text-2xl ${star <= count ? 'opacity-100' : 'opacity-20'}`}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch h-full">
      {/* Ward grid + Walk viewport */}
      <div className="flex-1 rounded-[24px] border border-stone-800 bg-stone-950 p-6 flex flex-col justify-between min-h-[500px] relative shadow-2xl overflow-hidden">
        
        {/* Game Over Screen Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-stone-950/90 z-40 flex flex-col items-center justify-center text-center p-8">
            <span className="text-5xl block mb-2">🕉️</span>
            <h3 className="font-serif text-3xl font-bold text-danger uppercase tracking-wider">Gurukul Overrun</h3>
            <p className="text-sm text-stone-300 font-light max-w-sm mt-3 leading-relaxed">
              Disciple failed to triage the incoming wave of storm casualties. Lives lost.
            </p>
            <div className="my-6 p-4 rounded-2xl bg-stone-900 border border-stone-800 w-full max-w-xs">
              <p className="text-[10px] text-stone-500 uppercase font-bold">Performance Summary</p>
              <p className="text-xl font-bold text-stone-100 mt-1">{savedCount} Citizens Stabilized</p>
              <p className="text-xs text-amber font-bold mt-1 uppercase">Rank: {getSurgeonRank(savedCount)}</p>
              {renderStars()}
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="rounded-full bg-gradient-to-r from-amber to-copper px-8 py-3 text-sm font-bold text-white uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Start New Run
            </button>
          </div>
        )}

        {/* Seamless Bedside zooming layout */}
        {activePatient ? (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-stone-850 pb-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activePatient.avatar}</span>
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-200">{activePatient.name}</h4>
                  <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">
                    Bed {cotsCoords[activePatient.cotIndex].label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLeaveCot}
                className="rounded-full border border-stone-800 bg-stone-900/60 px-4 py-1.5 text-xs text-stone-300 hover:bg-stone-800"
              >
                Back to Ward View
              </button>
            </div>

            {/* Closeup anatomical drawing inside cot view */}
            <div className="flex-1 flex items-center justify-center my-4 relative bg-stone-900/10 border border-stone-850 rounded-2xl p-4 overflow-hidden">
              
              {/* Respiration Torso closeup */}
              <svg viewBox="0 0 400 200" className="w-full max-w-[420px] overflow-visible">
                {/* Cot */}
                <rect x="20" y="140" width="360" height="20" fill="#3e2723" rx="2" />
                
                {/* Flinch/breathing torso */}
                <motion.g
                  animate={{
                    scaleY: activePatient.pain > 70 ? [1, 1.12, 1] : [1, 1.06, 1],
                    y: activePatient.pain > 70 ? [0, -4, 0] : [0, -2, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: activePatient.pain > 70 ? 0.6 : activePatient.bleeding > 60 ? 1.0 : 2.5
                  }}
                >
                  <path
                    d="M 40,135 Q 150,110 240,130 T 360,138"
                    fill="none"
                    stroke={activePatient.bleeding > 60 ? '#b5a191' : '#855b38'}
                    strokeWidth="24"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="110" r="14" fill="#855b38" />
                </motion.g>

                {/* Wound element overlay */}
                <g className="cursor-pointer" onClick={() => handleApplyToolToPatient(heldTool)}>
                  {activePatient.injuryType === 'cut' && (
                    <g>
                      {/* Laceration Slice line */}
                      <path
                        d="M 180,126 Q 200,120 220,127"
                        fill="none"
                        stroke={activePatient.wrapped ? '#f5f5f4' : '#b91c1c'}
                        strokeWidth={activePatient.wrapped ? '12' : '6'}
                        strokeLinecap="round"
                      />
                      {/* stitch cross lines */}
                      {activePatient.stitched && (
                        <path d="M185,120 L190,132 M195,120 L200,132 M205,120 L210,132 M215,120 L220,132" stroke="#44403c" strokeWidth="2.5" />
                      )}
                    </g>
                  )}

                  {activePatient.injuryType === 'burn' && (
                    <g>
                      {/* Blister area */}
                      <ellipse
                        cx="200"
                        cy="124"
                        rx="28"
                        ry="12"
                        fill={activePatient.soothed ? '#855b38' : '#e11d48'}
                        fillOpacity={activePatient.soothed ? '0.5' : '0.85'}
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                      />
                      {/* green pustules rot spots */}
                      {!activePatient.cleaned && (
                        <g fill="#22c55e" stroke="#15803d" strokeWidth="0.5">
                          <circle cx="185" cy="120" r="4.5" />
                          <circle cx="210" cy="126" r="3.5" />
                          <circle cx="198" cy="128" r="5" />
                        </g>
                      )}
                    </g>
                  )}

                  {activePatient.injuryType === 'fracture' && (
                    <g>
                      {/* Bone protrusion visual */}
                      <path
                        d="M 170,125 L 200,118 L 230,126"
                        fill="none"
                        stroke="#855b38"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      {!activePatient.soothed && (
                        <path
                          d="M 195,120 L 200,112 L 205,120"
                          fill="none"
                          stroke="#fafaf9"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                        />
                      )}
                      {activePatient.wrapped && (
                        <path d="M 180,125 Q 200,115 220,126" fill="none" stroke="#f5f5f4" strokeWidth="24" strokeLinecap="round" />
                      )}
                    </g>
                  )}
                </g>
              </svg>

              {/* Physical cues text banner instead of UI gauges */}
              <div className="absolute bottom-4 left-4 text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                {activePatient.bleeding > 60 && '⚠️ Arterial Blood Squirting'}
                {activePatient.infection > 60 && '🟢 Green Tissue Decay'}
                {activePatient.pain > 70 && '🫨 Patient Spasming'}
                {activePatient.bleeding <= 60 && activePatient.infection <= 60 && activePatient.pain <= 70 && '🟢 Status Stable'}
              </div>
            </div>

            {/* Treatment tools tray */}
            <div className="border-t border-stone-850 pt-4 flex gap-2 justify-center flex-wrap">
              <button
                type="button"
                onClick={() => setHeldTool('sponge')}
                className={`rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${
                  heldTool === 'sponge' ? 'border-amber bg-stone-900 text-stone-100' : 'border-stone-800 bg-stone-950 text-stone-400'
                }`}
              >
                🧽 Sponge Clean
              </button>
              <button
                type="button"
                onClick={() => setHeldTool('bandage')}
                className={`rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${
                  heldTool === 'bandage' ? 'border-amber bg-stone-900 text-stone-100' : 'border-stone-800 bg-stone-950 text-stone-400'
                }`}
              >
                🩹 Bandage Wrap
              </button>
              <button
                type="button"
                onClick={() => setHeldTool('ointment')}
                className={`rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${
                  heldTool === 'ointment' ? 'border-amber bg-stone-900 text-stone-100' : 'border-stone-800 bg-stone-950 text-stone-400'
                }`}
              >
                🧪 Soma Ointment
              </button>
              <button
                type="button"
                onClick={() => setHeldTool('needle')}
                className={`rounded-2xl border px-4 py-3 text-xs font-bold transition-all ${
                  heldTool === 'needle' ? 'border-amber bg-stone-900 text-stone-100' : 'border-stone-800 bg-stone-950 text-stone-400'
                }`}
              >
                🪡 Suture Wound
              </button>
            </div>
          </div>
        ) : (
          /* Walkable Ward Map view */
          <div className="flex-1 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-4 text-center">
              Walkable Ward: Click Bed to Approach Citizen
            </span>

            {/* 2D Map Area */}
            <div className="flex-1 min-h-[300px] border border-stone-850 rounded-[20px] bg-stone-900/10 relative p-4 overflow-hidden">
              
              {/* Cots list */}
              {cotsCoords.map((cot) => {
                const currentPat = patients.find((p) => p.cotIndex === cot.index);
                const hasAlert = cotAlerts[cot.index];
                
                return (
                  <button
                    key={cot.index}
                    type="button"
                    onClick={() => handleCotClick(cot.index)}
                    className="absolute group text-center flex flex-col items-center select-none"
                    style={{
                      left: `${cot.x}px`,
                      top: `${cot.y}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {/* Cot visual drawing */}
                    <div
                      className={`w-14 h-8 rounded border relative flex items-center justify-center transition-all ${
                        hasAlert
                          ? 'border-red-500 bg-red-950/20 animate-pulse'
                          : currentPat
                          ? 'border-stone-700 bg-stone-900 hover:border-amber/40'
                          : 'border-stone-850 bg-stone-950/40 opacity-40 hover:opacity-75'
                      }`}
                    >
                      {currentPat ? (
                        <span className="text-xl">{currentPat.avatar}</span>
                      ) : (
                        <span className="text-[9px] text-stone-700 font-bold uppercase">Empty</span>
                      )}

                      {/* Growing blood pool under cot directly on map */}
                      {currentPat && currentPat.bleeding > 50 && (
                        <div
                          className="absolute -bottom-2 bg-red-900/60 rounded-full blur-xs pointer-events-none"
                          style={{
                            width: `${currentPat.bleeding * 0.45}px`,
                            height: `${currentPat.bleeding * 0.2}px`
                          }}
                        />
                      )}
                    </div>
                    <span className="text-[9px] text-stone-500 font-bold uppercase mt-1">
                      {cot.label}
                    </span>
                  </button>
                );
              })}

              {/* Walkable Disciple Avatar representation */}
              <motion.div
                className="absolute w-8 h-8 rounded-full bg-amber border-2 border-copper flex items-center justify-center shadow-lg pointer-events-none z-10"
                animate={{ x: avatarPos.x - 16, y: avatarPos.y - 16 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <span className="text-stone-950 text-xs font-black">👨‍⚕️</span>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Survival score card */}
      <div className="w-full xl:w-80 rounded-[24px] border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Survival HUD</span>
            <h4 className="font-serif text-lg font-bold text-stone-200 border-b border-stone-800 pb-2 mt-1">Vitals</h4>
          </div>

          {/* Lives count */}
          <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-850/60 flex flex-col items-center">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Gurukul Integrity</span>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map((life) => (
                <span key={life} className={`text-2xl ${life <= lives ? 'opacity-100 animate-pulse' : 'opacity-20'}`}>
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* Scores count */}
          <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-850/60 text-center">
            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Citizens Saved</span>
            <p className="text-3xl font-black text-amber mt-1">{savedCount}</p>
            <p className="text-[9px] text-stone-500 uppercase font-semibold mt-1">Rank: {getSurgeonRank(savedCount)}</p>
          </div>
        </div>

        {/* Small warning reminder */}
        <div className="text-[9px] text-stone-600 font-bold uppercase tracking-wider text-center mt-4">
          Triage CASUALTIES before they bleed to death.
        </div>
      </div>
    </div>
  );
}
