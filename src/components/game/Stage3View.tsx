import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore, Patient } from '../../store/gameStore';
import * as THREE from 'three';

const cotsPositions: [number, number, number][] = [
  [-6, 0, 6],   // Cot 0 (Mat A)
  [-2, 0, 8],   // Cot 1 (Mat B)
  [2, 0, 8],    // Cot 2 (Mat C)
  [-6, 0, 0],   // Cot 3 (Mat D)
  [6, 0, 0]     // Cot 4 (Mat E)
];

const namesPool = ['Karna', 'Anya', 'Madhav', 'Gopal', 'Ramdas', 'Vasu', 'Devi', 'Chandra'];
const avatarsPool = ['🛡️', '👧', '🌾', '⚖️', '🔨', '🧔', '👵', '⛵'];

export default function Stage3View() {
  const {
    playerPosition,
    score,
    lives,
    highScores,
    stage3,
    setStage3,
    updateHighScores,
    flashSushrutaAlert
  } = useGameStore();

  const { patients, isGameOver } = stage3;
  const [activeCotIndex, setActiveCotIndex] = useState<number | null>(null);

  // Check proximity to cots in useFrame
  useFrame(() => {
    if (isGameOver) return;

    const px = playerPosition[0];
    const pz = playerPosition[2];

    let closestIdx: number | null = null;
    let minDist = 2.0; // threshold

    cotsPositions.forEach((pos, idx) => {
      const dist = Math.sqrt(Math.pow(px - pos[0], 2) + Math.pow(pz - pos[2], 2));
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    setActiveCotIndex(closestIdx);
  });

  const handleTreat = (patientId: string, action: 'clean' | 'wrap' | 'soothe' | 'stitch') => {
    setStage3({
      patients: patients.map((p) => {
        if (p.id !== patientId) return p;
        let nextP = { ...p };

        if (action === 'clean') {
          nextP.cleaned = true;
          nextP.infection = Math.max(0, nextP.infection - 30);
          flashSushrutaAlert('Scrubbed infection.');
        } else if (action === 'wrap') {
          nextP.wrapped = true;
          nextP.bleeding = Math.max(0, nextP.bleeding - 40);
          flashSushrutaAlert('Bandaged cut.');
        } else if (action === 'soothe') {
          nextP.soothed = true;
          nextP.pain = Math.max(0, nextP.pain - 40);
          flashSushrutaAlert('Soothed pain.');
        } else if (action === 'stitch') {
          if (!p.cleaned || !p.wrapped) {
            flashSushrutaAlert('Wound must be cleansed and wrapped before stitching!');
            return p;
          }
          nextP.stitched = true;
          nextP.bleeding = 0;
          nextP.infection = 0;
          nextP.pain = 0;
        }

        return nextP;
      })
    });
  };

  // Check stabilization and discharge
  useEffect(() => {
    if (isGameOver) return;

    const stabilized = patients.find((p) => p.cleaned && p.wrapped && p.soothed && p.stitched);
    if (stabilized) {
      // Discharged patient
      useGameStore.setState({ score: score + 1 });
      flashSushrutaAlert(`${stabilized.name} stabilized & saved!`);
      setStage3({
        patients: patients.filter((p) => p.id !== stabilized.id)
      });
      setActiveCotIndex(null);
    }
  }, [patients, score, isGameOver]);

  const resetGame = () => {
    useGameStore.setState({ score: 0, lives: 3 });
    setStage3({
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
    });
    setActiveCotIndex(null);
  };

  return (
    <group>
      {/* Render cots and their patient states */}
      {cotsPositions.map((pos, index) => {
        const patient = patients.find((p) => p.cotIndex === index);
        const isNear = activeCotIndex === index;

        return (
          <group key={index} position={pos}>
            {patient && (
              <group position={[0, 0.48, 0]}>
                {/* 3D Patient body capsule */}
                <mesh position={[0, 0.1, 0]} castShadow>
                  <capsuleGeometry args={[0.18, 1.2, 8, 8]} />
                  <meshStandardMaterial color={patient.bleeding > 60 ? '#a8a29e' : '#c68a4c'} />
                </mesh>

                {/* Patient head */}
                <mesh position={[-0.8, 0.15, 0]}>
                  <sphereGeometry args={[0.16, 8, 8]} />
                  <meshStandardMaterial color={patient.bleeding > 60 ? '#a8a29e' : '#c68a4c'} />
                </mesh>

                {/* Shiver animation on severe pain */}
                {patient.pain > 70 && (
                  <group>
                    {/* Small visual jitter represented on coordinates */}
                  </group>
                )}

                {/* Render green infection rot spots on body */}
                {!patient.cleaned && patient.infection > 20 && (
                  <group position={[0.2, 0.18, 0.05]}>
                    <mesh>
                      <sphereGeometry args={[0.045, 4, 4]} />
                      <meshBasicMaterial color="#22c55e" />
                    </mesh>
                    <mesh position={[-0.15, 0.02, 0.05]}>
                      <sphereGeometry args={[0.035, 4, 4]} />
                      <meshBasicMaterial color="#22c55e" />
                    </mesh>
                  </group>
                )}

                {/* Floor blood pool mesh growing under cot */}
                {!patient.stitched && patient.bleeding > 20 && (
                  <mesh position={[0, -0.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[patient.bleeding * 0.032, patient.bleeding * 0.016]} />
                    <meshStandardMaterial color="#991b1b" opacity={0.7} transparent />
                  </mesh>
                )}
              </group>
            )}

            {/* Floating HTML Bedside HUD on proximity */}
            {isNear && patient && !isGameOver && (
              <Html position={[0, 1.8, 0]} center>
                <div className="bg-stone-900/90 border border-amber/30 text-stone-100 rounded-2xl p-4 shadow-2xl space-y-2 text-center w-52 pointer-events-auto select-none">
                  <div className="border-b border-stone-800 pb-1 flex justify-between items-center">
                    <span className="text-sm font-bold">{patient.name} {patient.avatar}</span>
                    <span className="text-[8px] bg-amber/10 border border-amber/30 px-1.5 py-0.5 rounded text-amber uppercase tracking-wider font-black">
                      Cot {index + 1}
                    </span>
                  </div>
                  
                  {/* Status Meters */}
                  <div className="text-left text-[9px] space-y-1 text-stone-400 font-semibold mt-1">
                    <p className={patient.bleeding > 60 ? 'text-red-500 font-bold' : ''}>
                      🩸 Bleed: {Math.round(patient.bleeding)}% {patient.wrapped ? '✅' : ''}
                    </p>
                    <p className={patient.infection > 60 ? 'text-emerald-500 font-bold' : ''}>
                      🟢 Rot: {Math.round(patient.infection)}% {patient.cleaned ? '✅' : ''}
                    </p>
                    <p className={patient.pain > 70 ? 'text-amber font-bold' : ''}>
                      ⚡ Pain: {Math.round(patient.pain)}% {patient.soothed ? '✅' : ''}
                    </p>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => handleTreat(patient.id, 'clean')}
                      className={`text-[9px] font-bold rounded py-1 border transition-all ${
                        patient.cleaned ? 'border-emerald-600 bg-emerald-950/20 text-emerald-400' : 'border-stone-800 bg-stone-950 hover:bg-stone-850'
                      }`}
                    >
                      🧽 Clean
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTreat(patient.id, 'wrap')}
                      className={`text-[9px] font-bold rounded py-1 border transition-all ${
                        patient.wrapped ? 'border-emerald-600 bg-emerald-950/20 text-emerald-400' : 'border-stone-800 bg-stone-950 hover:bg-stone-850'
                      }`}
                    >
                      🩹 Bandage
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTreat(patient.id, 'soothe')}
                      className={`text-[9px] font-bold rounded py-1 border transition-all ${
                        patient.soothed ? 'border-emerald-600 bg-emerald-950/20 text-emerald-400' : 'border-stone-800 bg-stone-950 hover:bg-stone-850'
                      }`}
                    >
                      🧪 Ointment
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTreat(patient.id, 'stitch')}
                      className="text-[9px] font-bold rounded py-1 bg-gradient-to-r from-amber to-copper text-white hover:brightness-110"
                    >
                      🪡 Suture
                    </button>
                  </div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Game Over Screen Overlay */}
      {isGameOver && (
        <Html position={[0, 2.5, 3]} center>
          <div className="bg-stone-950/95 border border-stone-800 text-stone-100 rounded-3xl p-6 shadow-2xl text-center w-64 pointer-events-auto select-none">
            <span className="text-4xl block">🏺</span>
            <h3 className="font-serif text-xl font-bold text-red-500 uppercase tracking-widest mt-1">Ward Overrun</h3>
            <p className="text-[10px] text-stone-400 mt-2 leading-relaxed">
              Disciple failed to triage casualties in time. Life-essence lost.
            </p>
            <div className="my-4 p-3 bg-stone-900 border border-stone-850 rounded-2xl text-xs space-y-1">
              <p>Citizens Saved: <span className="text-stone-100 font-bold">{score}</span></p>
              <p>Best Saved: <span className="text-amber font-bold">{highScores.stage3MaxSaved}</span></p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-amber to-copper text-white rounded-full py-2.5 text-xs font-bold uppercase tracking-widest"
            >
              Start New Run
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
