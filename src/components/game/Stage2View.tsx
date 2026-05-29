import { useEffect, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export default function Stage2View() {
  const {
    playerPosition,
    heldItem,
    stage2,
    setStage2,
    updateHighScores,
    flashSushrutaAlert,
    highScores
  } = useGameStore();

  const { size, viewport } = useThree();
  const [nearCot, setNearCot] = useState(false);
  const [lensPos, setLensPos] = useState<[number, number, number]>([6, 0.8, -7.5]);
  const [dragActive, setDragActive] = useState<'rotate' | 'lens' | null>(null);

  // References for dragging
  const legRef = useRef<THREE.Group | null>(null);
  const lensRef = useRef<THREE.Mesh | null>(null);
  
  // Dynamic opacity references for manuscript-style details
  const veinsRef = useRef<THREE.Group | null>(null);

  // Check player distance to Cot 2: [6, 0, -8]
  useFrame((state) => {
    const px = playerPosition[0];
    const pz = playerPosition[2];

    const distCot = Math.sqrt(Math.pow(px - 6, 2) + Math.pow(pz - (-8), 2));
    setNearCot(distCot < 2.2);

    if (isFinished) return;
    setStage2({ timer: stage2.timer + 0.015 });

    // Distance-based opacity for nadis/marmas based on Lens position
    if (veinsRef.current && lensRef.current) {
      const lensWorldPos = new THREE.Vector3();
      lensRef.current.getWorldPosition(lensWorldPos);

      veinsRef.current.children.forEach((child) => {
        const childWorldPos = new THREE.Vector3();
        child.getWorldPosition(childWorldPos);
        
        const dist = lensWorldPos.distanceTo(childWorldPos);
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        
        // Show glowing orange if within lens radius (1.2 units)
        if (mat) {
          if (dist < 1.3) {
            mat.opacity = 1.0 - (dist / 1.3);
            mat.transparent = true;
          } else {
            mat.opacity = 0.08;
            mat.transparent = true;
          }
        }
      });
    }
  });

  const { isFinished, isSuccess, stars, rotation, swellingZones, marmaNodes, outcome, placedLeechZone, bloodSpurt } = stage2;

  const handlePickLens = () => {
    if (isFinished) return;
    useGameStore.setState({ heldItem: 'honey' }); // treat heldItem as Lens flag or general held
    setHeldTool('lens');
    flashSushrutaAlert('Holding Marma Lens. Drag to scan leg.');
  };

  const handlePickLeech = () => {
    if (isFinished) return;
    useGameStore.setState({ heldItem: 'leech_medicinal' });
    setHeldTool('leech');
    flashSushrutaAlert('Holding Jalauka Leech. Apply to swelling.');
  };

  const [heldTool, setHeldTool] = useState<'lens' | 'leech' | null>(null);

  const handlePlaceLeechOnZone = (zoneId: number) => {
    if (isFinished || heldTool !== 'leech') return;
    
    setStage2({ placedLeechZone: zoneId, isFinished: true });
    setHeldTool(null);
    useGameStore.setState({ heldItem: null });

    // Check if clicked zone overlaps any marma node (we hardcode overlap by ID for consistency)
    const isDangerous = zoneId === 2 || zoneId === 3; // Zones 2 and 3 overlap Janu and Sira nodes in default coordinates

    if (isDangerous) {
      setStage2({
        bloodSpurt: true,
        isSuccess: false,
        stars: 0,
        outcome: 'MARMA RUPTURED! Struck vital Janu junction. Hemorrhage cascade.'
      });
      flashSushrutaAlert('Collision fail!');
    } else {
      setStage2({
        isSuccess: true,
        stars: stage2.timer < 10.0 ? 3 : stage2.timer < 18.0 ? 2 : 1,
        outcome: 'Success! Applied leech on superficial tissue. Swelling is draining.'
      });
      flashSushrutaAlert('Complete!');
      
      const record = highScores.stage2BestTime;
      if (record === null || stage2.timer < record) {
        updateHighScores({ stage2BestTime: stage2.timer });
      }
    }
  };

  // Rotation and Lens dragging handles
  const handlePointerDown = (e: any, action: 'rotate' | 'lens') => {
    e.stopPropagation();
    setDragActive(action);
  };

  const handlePointerMove = (e: any) => {
    if (!dragActive) return;
    e.stopPropagation();

    // Map screen mouse pointer position to world coords or angles
    const rect = e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
    
    if (dragActive === 'rotate' && legRef.current) {
      const deltaX = e.movementX || 0;
      const nextRot = Math.min(180, Math.max(0, rotation + deltaX * 1.5));
      setStage2({ rotation: nextRot });
    }

    if (dragActive === 'lens') {
      // Move lens x, y coordinates based on mouse dragging
      const newX = Math.min(7.5, Math.max(4.5, lensPos[0] + (e.movementX || 0) * 0.015));
      const newY = Math.min(1.8, Math.max(0.6, lensPos[1] - (e.movementY || 0) * 0.015));
      setLensPos([newX, newY, lensPos[2]]);
    }
  };

  const handlePointerUp = () => {
    setDragActive(null);
  };

  const resetStage = () => {
    setHeldTool(null);
    useGameStore.setState({ heldItem: null });
    // Regenerate layout
    const zones = [
      { id: 1, baseX: 120, baseY: 65, size: 22 },
      { id: 2, baseX: 180, baseY: 55, size: 19 },
      { id: 3, baseX: 250, baseY: 75, size: 21 },
      { id: 4, baseX: 310, baseY: 60, size: 18 }
    ];
    setStage2({
      rotation: 90,
      placedLeechZone: null,
      isFinished: false,
      isSuccess: false,
      stars: 0,
      bloodSpurt: false,
      outcome: 'Use the Marma Lens to inspect, rotate, and place leech.',
      timer: 0
    });
  };

  return (
    <group onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* Cot 2 Bed Visual positioned at [6, 0, -8] */}
      
      {/* Leg assembly closeup focus */}
      <group position={[6, 0.48, -8]}>
        
        {/* Rotate handle board */}
        <mesh
          position={[0, 0.1, 1.2]}
          onPointerDown={(e) => handlePointerDown(e, 'rotate')}
        >
          <boxGeometry args={[1.5, 0.1, 0.3]} />
          <meshStandardMaterial color="#b36b32" roughness={0.5} />
        </mesh>

        <group ref={legRef} rotation={[0, 0, (rotation - 90) * (Math.PI / 180)]}>
          {/* Main Leg Cylinder */}
          <mesh position={[0, 0.15, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
            <cylinderGeometry args={[0.16, 0.18, 1.4, 16]} />
            <meshStandardMaterial color={bloodSpurt ? '#2d1212' : '#855b38'} />
          </mesh>

          {/* Normal swelling targets (glowing red spheres) */}
          {swellingZones.map((zone, idx) => {
            // Map baseX 120-310 to world x coords -0.5 to 0.5 along leg
            const worldX = -0.5 + (idx * 0.33);
            const isTargeted = placedLeechZone === zone.id;
            
            return (
              <group key={zone.id} position={[worldX, 0.22, 0]}>
                <mesh onClick={() => handlePlaceLeechOnZone(zone.id)}>
                  <sphereGeometry args={[isTargeted ? 0.08 : 0.065, 8, 8]} />
                  <meshStandardMaterial color="#ef4444" roughness={0.3} />
                </mesh>
                {/* Leech visual if placed here */}
                {isTargeted && (
                  <mesh position={[0, 0.08, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
                    <meshStandardMaterial color="#2d3e2e" />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>

        {/* Dynamic Opacity manuscript nadis and marma nodes */}
        <group ref={veinsRef}>
          {/* Janu marma node */}
          <mesh position={[-0.17, 0.23, 0.02]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial color="#ea580c" transparent opacity={0.08} />
          </mesh>

          {/* Sira marma node */}
          <mesh position={[0.16, 0.22, 0.02]}>
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color="#ea580c" transparent opacity={0.08} />
          </mesh>

          {/* Spurt blood loops on rupture */}
          {bloodSpurt && (
            <group position={[0, 0.3, 0]}>
              <mesh position={[0, 0.1, 0]}>
                <sphereGeometry args={[0.04, 4, 4]} />
                <meshBasicMaterial color="#b91c1c" />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* Draggable physical Marma Lens model */}
      <mesh
        ref={lensRef}
        position={lensPos}
        onPointerDown={(e) => handlePointerDown(e, 'lens')}
        castShadow
      >
        <torusGeometry args={[0.55, 0.06, 8, 24]} />
        <meshStandardMaterial color="#ea580c" metalness={0.8} roughness={0.2} />
        {/* Handle */}
        <mesh position={[0.45, -0.45, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#b36b32" />
        </mesh>
      </mesh>

      {/* Floating HTML overlays */}
      {nearCot && !isFinished && (
        <Html position={[6, 1.6, -8]} center>
          <div className="bg-stone-900/90 border border-amber/30 text-stone-100 rounded-2xl p-4 shadow-2xl space-y-2 text-center w-48 pointer-events-auto">
            <p className="text-[10px] text-amber uppercase font-black tracking-widest">Surgical Tray</p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={handlePickLens}
                className={`rounded-full py-1 text-xs font-bold transition-all ${
                  heldTool === 'lens' ? 'bg-amber text-stone-950' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
                }`}
              >
                🔍 Grab Marma Lens
              </button>
              <button
                type="button"
                onClick={handlePickLeech}
                className={`rounded-full py-1 text-xs font-bold transition-all ${
                  heldTool === 'leech' ? 'bg-amber text-stone-950' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
                }`}
              >
                🏺 Grab Leech
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Finished Result floating card */}
      {isFinished && (
        <Html position={[6, 1.8, -8]} center>
          <div className="bg-stone-900/95 border border-stone-800 text-stone-100 rounded-2xl p-4 shadow-2xl text-center w-52 pointer-events-auto">
            <span className="text-3xl block">{isSuccess ? '🏆' : '⚠️'}</span>
            <p className={`text-xs font-black uppercase tracking-wider mt-1 ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>
              {isSuccess ? 'Treatment Complete' : 'Failure'}
            </p>
            <p className="text-[10px] text-stone-400 mt-1 italic font-light">"{outcome}"</p>

            {isSuccess && (
              <div className="flex gap-1 justify-center mt-3">
                {[1, 2, 3].map((star) => (
                  <span key={star} className={`text-lg ${star <= stars ? 'opacity-100' : 'opacity-20'}`}>
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
