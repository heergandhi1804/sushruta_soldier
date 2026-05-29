import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export default function Stage1View() {
  const {
    playerPosition,
    heldItem,
    stage1,
    setStage1,
    updateHighScores,
    flashSushrutaAlert,
    highScores
  } = useGameStore();

  const state1Ref = useRef(stage1);
  useEffect(() => {
    state1Ref.current = stage1;
  }, [stage1]);

  // Proximity alerts
  const [nearPond, setNearPond] = useState(false);
  const [nearCot, setNearCot] = useState(false);
  const [nearHoney, setNearHoney] = useState(false);

  // Sound/Flashing timers
  const bloodSpurtRef = useRef<THREE.Group | null>(null);

  // Check distances in frame ticks
  useFrame((state) => {
    const px = playerPosition[0];
    const pz = playerPosition[2];

    // Pond center: [6, 0, 5]
    const distPond = Math.sqrt(Math.pow(px - 6, 2) + Math.pow(pz - 5, 2));
    setNearPond(distPond < 2.5);

    // Cot center: [0, 0, -4]
    const distCot = Math.sqrt(Math.pow(px - 0, 2) + Math.pow(pz - (-4), 2));
    setNearCot(distCot < 2.2);

    // Honey bowl: [-2, 0, -4]
    const distHoney = Math.sqrt(Math.pow(px - (-2), 2) + Math.pow(pz - (-4), 2));
    setNearHoney(distHoney < 1.8);

    // Pulsate swelling sphere
    const elapsed = state.clock.getElapsedTime();
    if (stage1.attached && !stage1.isFinished) {
      // Tick duration
      setStage1({ timer: stage1.timer + 0.015 });

      if (stage1.attached === 'poisonous') {
        setStage1({
          poisonVeins: true,
          breathingRate: 0.5,
          swelling: Math.min(100, stage1.swelling + 0.35),
          bloodPool: Math.min(100, stage1.bloodPool + 0.6)
        });

        if (stage1.timer > 2.0) {
          triggerFailure('Savisha poison veins spread! Patient collapsed.');
        }
      } else {
        // Medicinal sucking
        const nextSwell = Math.max(10, stage1.swelling - 0.32);
        setStage1({
          swelling: nextSwell,
          breathingRate: Math.max(1.1, stage1.breathingRate - 0.01)
        });

        if (nextSwell <= 20) {
          setStage1({
            bloodPool: Math.min(100, stage1.bloodPool + 0.5),
            breathingRate: 0.7 // Gasping due to pain
          });

          if (stage1.bloodPool >= 70) {
            triggerFailure('Leech drained vital blood! Patient hemorrhage.');
          }
        }
      }
    }

    // Animate blood spurt spray particles
    if (bloodSpurtRef.current && stage1.poisonVeins) {
      bloodSpurtRef.current.rotation.y = elapsed * 10;
      bloodSpurtRef.current.children.forEach((child) => {
        child.scale.setScalar(1 + Math.sin(elapsed * 25) * 0.15);
      });
    }
  });

  const handlePickLeech = (type: 'medicinal' | 'poisonous') => {
    if (stage1.isFinished) return;
    useGameStore.setState({ heldItem: type === 'medicinal' ? 'leech_medicinal' : 'leech_poisonous' });
    flashSushrutaAlert(`Picked up ${type} leech.`);
  };

  const handlePickHoney = () => {
    if (stage1.isFinished) return;
    useGameStore.setState({ heldItem: 'honey' });
    flashSushrutaAlert('Picked up Honey Sponge.');
  };

  const handleApplyToCot = () => {
    if (stage1.isFinished) return;

    if (heldItem === 'leech_medicinal' || heldItem === 'leech_poisonous') {
      if (stage1.attached) {
        flashSushrutaAlert('A leech is already attached!');
        return;
      }
      setStage1({
        attached: heldItem === 'leech_medicinal' ? 'medicinal' : 'poisonous',
        timer: 0
      });
      useGameStore.setState({ heldItem: null });
      flashSushrutaAlert('Leech attached.');
    } else if (heldItem === 'honey') {
      if (!stage1.attached) {
        flashSushrutaAlert('No leech attached to release!');
        return;
      }

      const type = stage1.attached;
      setStage1({ attached: null });
      useGameStore.setState({ heldItem: null });
      setStage1({ isFinished: true });

      if (type === 'poisonous') {
        triggerFailure('Toxified! The Savisha leech did permanent tissue damage.');
      } else {
        if (stage1.swelling > 32) {
          setStage1({ isSuccess: false, verdict: 'Removed Too Early! Leg remains swollen.' });
          flashSushrutaAlert('Too early!');
        } else if (stage1.swelling <= 32 && stage1.bloodPool < 20) {
          setStage1({ isSuccess: true, stars: stage1.bloodPool < 8 ? 3 : 2, verdict: 'Gold Star: Flawless Extraction!' });
          flashSushrutaAlert('Perfect extraction!');
          // Save high score
          const record = highScores.stage1BestTime;
          if (record === null || stage1.timer < record) {
            updateHighScores({ stage1BestTime: stage1.timer });
          }
        } else {
          triggerFailure('Hemorrhage! Impure blood was drained, but healthy blood followed.');
        }
      }
    }
  };

  const triggerFailure = (msg: string) => {
    setStage1({
      isFinished: true,
      isSuccess: false,
      stars: 0,
      verdict: msg
    });
    flashSushrutaAlert('Failed.');
  };

  const resetStage = () => {
    setStage1({
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
    });
    useGameStore.setState({ heldItem: null });
  };

  return (
    <group>
      {/* 3D Cot Bed Visual */}
      {/* Position: [0, 0, -4]. world Hut wraps around this */}

      {/* Patient lying on the cot */}
      <group position={[0, 0.48, -4]}>
        {/* Patient body */}
        <mesh position={[0, 0.1, 0]} castShadow>
          <capsuleGeometry args={[0.18, 1.2, 8, 8]} />
          <meshStandardMaterial color={stage1.bloodPool > 55 ? '#a8a29e' : '#c68a4c'} />
        </mesh>
        
        {/* Patient head */}
        <mesh position={[-0.8, 0.15, 0]}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color={stage1.bloodPool > 55 ? '#a8a29e' : '#c68a4c'} />
        </mesh>

        {/* Affected Leg */}
        <mesh position={[0.4, 0.1, 0.1]} rotation={[0, 0, -0.05]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.7, 8]} />
          <meshStandardMaterial color={stage1.poisonVeins ? '#2c3e2e' : '#c68a4c'} />
        </mesh>

        {/* Swelling Node (Sphere) */}
        <mesh position={[0.4, 0.18, 0.12]}>
          <sphereGeometry args={[stage1.swelling * 0.0022 + 0.05, 8, 8]} />
          <meshStandardMaterial
            color={stage1.poisonVeins ? '#15803d' : '#ef4444'}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Spurt spray meshes when failing */}
        {stage1.poisonVeins && (
          <group ref={bloodSpurtRef} position={[0.4, 0.3, 0.12]}>
            <mesh position={[0.05, 0.1, 0]}>
              <sphereGeometry args={[0.03, 4, 4]} />
              <meshBasicMaterial color="#b91c1c" />
            </mesh>
            <mesh position={[-0.05, 0.12, 0.05]}>
              <sphereGeometry args={[0.03, 4, 4]} />
              <meshBasicMaterial color="#b91c1c" />
            </mesh>
          </group>
        )}

        {/* Attached leech cylinder */}
        {stage1.attached && (
          <mesh position={[0.4, 0.22, 0.18]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
            <meshStandardMaterial color={stage1.attached === 'poisonous' ? '#334155' : '#1e3a1e'} />
          </mesh>
        )}
      </group>

      {/* Red blood pool Under the cot */}
      {stage1.bloodPool > 0 && (
        <mesh position={[0, 0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[stage1.bloodPool * 0.035, stage1.bloodPool * 0.02]} />
          <meshStandardMaterial color="#991b1b" opacity={0.8} transparent />
        </mesh>
      )}

      {/* Honey Bowl at [-2, 0, -4] */}
      <group position={[-1.7, 0.02, -4]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.2, 0.12, 0.2, 8]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        {/* Honey contents */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.1} />
        </mesh>
      </group>

      {/* Float Billboards for 3D Interactions */}

      {/* Near Pond prompts */}
      {nearPond && !stage1.isFinished && (
        <Html position={[6, 1.8, 5]} center>
          <div className="bg-stone-900/90 border border-amber/30 text-stone-100 rounded-2xl p-4 shadow-2xl space-y-2 text-center w-48 pointer-events-auto">
            <p className="text-[10px] text-amber uppercase font-black tracking-widest">Leech Pond</p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handlePickLeech('medicinal')}
                className="bg-emerald-800 text-white rounded-full py-1 text-xs font-bold hover:bg-emerald-700"
              >
                Pick Jalauka (Olive)
              </button>
              <button
                type="button"
                onClick={() => handlePickLeech('poisonous')}
                className="bg-red-950 text-red-200 border border-red-500 rounded-full py-1 text-xs font-bold hover:bg-red-900"
              >
                Pick Savisha (Spiky)
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Near Honey prompts */}
      {nearHoney && !stage1.isFinished && (
        <Html position={[-1.7, 1.4, -4]} center>
          <div className="bg-stone-900/90 border border-amber/30 text-stone-100 rounded-2xl p-3 shadow-2xl text-center w-40 pointer-events-auto">
            <p className="text-[10px] text-amber uppercase font-black tracking-widest mb-1.5">Honey Sponge</p>
            <button
              type="button"
              onClick={handlePickHoney}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white rounded-full py-1 text-xs font-bold"
            >
              Grab Honey Sponge
            </button>
          </div>
        </Html>
      )}

      {/* Near Cot prompts */}
      {nearCot && !stage1.isFinished && heldItem && (
        <Html position={[0, 1.6, -4]} center>
          <div className="bg-stone-900/90 border border-amber/30 text-stone-100 rounded-2xl p-3 shadow-2xl text-center w-40 pointer-events-auto">
            <button
              type="button"
              onClick={handleApplyToCot}
              className="w-full bg-gradient-to-r from-amber to-copper text-white rounded-full py-2 text-xs font-bold"
            >
              {heldItem === 'honey' ? 'Apply Honey Sponge' : 'Attach Leech'}
            </button>
          </div>
        </Html>
      )}

      {/* Finished Star / Result Card floating above cot */}
      {stage1.isFinished && (
        <Html position={[0, 1.8, -4]} center>
          <div className="bg-stone-900/95 border border-stone-800 text-stone-100 rounded-2xl p-4 shadow-2xl text-center w-52 pointer-events-auto">
            <span className="text-3xl block">{stage1.isSuccess ? '🏆' : '⚠️'}</span>
            <p className={`text-xs font-black uppercase tracking-wider mt-1 ${stage1.isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
              {stage1.isSuccess ? 'Stabilized' : 'Failed'}
            </p>
            <p className="text-[10px] text-stone-400 mt-1 italic font-light">"{stage1.verdict}"</p>

            {stage1.isSuccess && (
              <div className="flex gap-1 justify-center mt-3">
                {[1, 2, 3].map((star) => (
                  <span key={star} className={`text-lg ${star <= stage1.stars ? 'opacity-100' : 'opacity-20'}`}>
                    ⭐
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={resetStage}
              className="mt-4 w-full bg-stone-800 hover:bg-stone-700 text-white rounded-full py-1 text-xs font-bold"
            >
              Retry Mode
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
