import { useState, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useGameStore, SandboxElement } from '../../store/gameStore';
import * as THREE from 'three';

export default function SandboxView() {
  const {
    sandbox,
    setSandbox,
    flashSushrutaAlert
  } = useGameStore();

  const { elements, forgedTool, jawType, handleLength, weight, tipShape, testMode, testLog, bleedValue, isTipBent } = sandbox;
  const [selectedType, setSelectedType] = useState<SandboxElement['type'] | null>(null);

  // Mouse drag tracking refs
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const svgRef = useRef<THREE.Group | null>(null);

  // Stats calculation based on selections
  const stats = useMemo(() => {
    let basePrec = 70;
    let baseGrip = 60;
    let baseSpeed = 75;
    let baseRisk = 10;

    if (jawType === 'Eagle Pinch') {
      basePrec = 80; baseGrip = 75; baseSpeed = 65;
    } else if (jawType === 'Crocodile Clamp') {
      basePrec = 55; baseGrip = 95; baseSpeed = 50; baseRisk = 15;
    } else if (jawType === 'Heron Probe') {
      basePrec = 90; baseGrip = 40; baseSpeed = 80;
    }

    const lengthMod = handleLength === 'Short' ? -6 : handleLength === 'Long' ? 6 : 0;
    const weightMod = weight === 'Light' ? -5 : weight === 'Heavy' ? 5 : 0;
    const tipMod = tipShape === 'Fine' ? 8 : tipShape === 'Blunt' ? -4 : 4;

    const toolStats = {
      precision: Math.max(10, Math.min(100, basePrec + lengthMod + tipMod - (isTipBent ? 25 : 0))),
      gripStrength: Math.min(100, Math.max(10, baseGrip + weightMod)),
      speed: Math.min(100, Math.max(10, baseSpeed + (handleLength === 'Short' ? 8 : -4))),
      risk: Math.min(100, Math.max(5, baseRisk + (tipShape === 'Blunt' ? 4 : -2)))
    };

    setSandbox({ forgedTool: toolStats });
    return toolStats;
  }, [jawType, handleLength, weight, tipShape, isTipBent]);

  // Click on leg canvas
  const handleLegClick = (e: any) => {
    e.stopPropagation();
    if (testMode) {
      // Find closest element
      const clickPt = e.point;
      let closestIdx = -1;
      let minDist = 999;

      elements.forEach((el, index) => {
        // el.x / el.y map to world positions along the leg
        const elWorldX = 4 + (el.x / 100) * 2;
        const elWorldY = 0.55 + (el.y / 100) * 0.4;
        const dist = Math.sqrt(Math.pow(clickPt.x - elWorldX, 2) + Math.pow(clickPt.y - elWorldY, 2));
        if (dist < el.size * 0.02 && dist < minDist) {
          minDist = dist;
          closestIdx = index;
        }
      });

      if (closestIdx === -1) {
        setSandbox({ testLog: 'Clicked tissue. No effect.' });
        return;
      }

      const el = elements[closestIdx];
      if (el.type === 'swelling') {
        setSandbox({
          elements: elements.map((item, i) => (i === closestIdx ? { ...item, size: Math.max(0, item.size - 8) } : item)).filter((item) => item.size > 0),
          testLog: 'Drained swelling node.'
        });
        if (Math.random() * 100 < stats.risk) {
          setSandbox({ bleedValue: Math.min(100, bleedValue + 12), testLog: 'Slipped! Tissue bleeding.' });
        }
      } else if (el.type === 'marma') {
        setSandbox({ bleedValue: Math.min(100, bleedValue + 35), testLog: 'WARNING: Struck vital nerve marma!' });
        flashSushrutaAlert('Marma ruptured!');
      } else if (el.type === 'foreign_body') {
        if (Math.random() * 100 < stats.precision - stats.risk) {
          setSandbox({ elements: elements.filter((item, i) => i !== closestIdx), testLog: 'Extracted iron shard.' });
        } else {
          setSandbox({ bleedValue: Math.min(100, bleedValue + 15), testLog: 'Grip slipped! Shard tore flesh.' });
        }
      } else if (el.type === 'fracture') {
        if (tipShape === 'Fine') {
          setSandbox({ isTipBent: true, testLog: 'CLANG! Fine copper needle tip bent against bone!' });
          flashSushrutaAlert('Tip bent!');
        } else if (stats.gripStrength > 65) {
          setSandbox({ elements: elements.filter((item, i) => i !== closestIdx), testLog: 'Leveraged fracture back.' });
        } else {
          setSandbox({ testLog: 'Insufficient leverage. Handle too short.' });
        }
      }
    } else {
      // Place element mode
      if (!selectedType) return;
      const rectPt = e.point;
      // Map world coords back to 0-100 percentages
      const xPercent = Math.round(((rectPt.x - 4) / 2) * 100);
      const yPercent = Math.round(((rectPt.y - 0.55) / 0.4) * 100);

      const newEl: SandboxElement = {
        id: `el_${Date.now()}`,
        type: selectedType,
        x: xPercent,
        y: yPercent,
        size: selectedType === 'swelling' ? 24 : selectedType === 'marma' ? 20 : 12
      };
      setSandbox({ elements: [...elements, newEl] });
      flashSushrutaAlert(`Placed ${selectedType}.`);
    }
  };

  // Mouse drag slip physics in 3D
  const handlePointerMove = (e: any) => {
    if (!testMode) return;
    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 15) {
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = dist / dt;

      const slipThreshold = weight === 'Heavy' ? 0.75 : weight === 'Light' ? 1.5 : 1.1;

      if (speed > slipThreshold) {
        setSandbox({
          bleedValue: Math.min(100, bleedValue + 10),
          testLog: 'SLIP! Momentum drag caused tool to tear local capillaries.'
        });
        flashSushrutaAlert('Slipped!');
      }

      lastX.current = e.clientX;
      lastY.current = e.clientY;
      lastTime.current = now;
    }
  };

  const handleClear = () => {
    setSandbox({ elements: [], bleedValue: 0, isTipBent: false, testLog: 'Canvas cleared.' });
  };

  return (
    <group onPointerMove={handlePointerMove}>
      {/* 3D Blacksmith Anvil model at [1, 0, -4] */}
      <group position={[1, 0.02, -4]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.5, 0.8, 8]} />
          <meshStandardMaterial color="#455a64" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.8, 0.15, 0.4]} />
          <meshStandardMaterial color="#37474f" metalness={0.9} />
        </mesh>
      </group>

      {/* 3D Test Leg model at [5, 0.48, -4] */}
      <group position={[5, 0.48, -4]} ref={svgRef} onClick={handleLegClick}>
        <mesh position={[0, 0.1, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.17, 2.0, 16]} />
          <meshStandardMaterial color={bleedValue > 50 ? '#b5a191' : '#855b38'} />
        </mesh>

        {/* Bone outlines (always visible in sandbox test mode to verify placement) */}
        <mesh position={[0, 0.1, -0.05]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.8, 8]} />
          <meshBasicMaterial color="#e7e5e4" transparent opacity={0.35} />
        </mesh>

        {/* Sandbox Elements rendering */}
        {elements.map((el) => {
          const worldX = -1.0 + (el.x / 100) * 2;
          const worldY = 0.1 + (el.y / 100) * 0.4;
          
          if (el.type === 'swelling') {
            return (
              <mesh key={el.id} position={[worldX, worldY, 0.15]}>
                <sphereGeometry args={[el.size * 0.005, 8, 8]} />
                <meshStandardMaterial color="#b91c1c" roughness={0.4} />
              </mesh>
            );
          } else if (el.type === 'marma') {
            return (
              <group key={el.id} position={[worldX, worldY, 0.15]}>
                <mesh>
                  <sphereGeometry args={[0.08, 8, 8]} />
                  <meshStandardMaterial color="#ea580c" transparent opacity={0.7} />
                </mesh>
              </group>
            );
          } else if (el.type === 'foreign_body') {
            return (
              <mesh key={el.id} position={[worldX, worldY, 0.15]} rotation={[0.4, 0.4, 0]}>
                <coneGeometry args={[0.04, 0.12, 4]} />
                <meshStandardMaterial color="#78716c" metalness={0.8} />
              </mesh>
            );
          } else if (el.type === 'fracture') {
            return (
              <mesh key={el.id} position={[worldX, worldY, 0.13]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.05, 0.22, 0.05]} />
                <meshStandardMaterial color="#f5f5f4" />
              </mesh>
            );
          } else { // vein
            return (
              <mesh key={el.id} position={[worldX, worldY, 0.14]}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshBasicMaterial color="#b91c1c" />
              </mesh>
            );
          }
        })}
      </group>

      {/* Floating Forge Anvil control panel HTML */}
      <Html position={[1, 1.8, -4]} center>
        <div className="bg-stone-900/90 border border-stone-800 text-stone-100 rounded-3xl p-5 shadow-2xl space-y-4 w-72 pointer-events-auto select-none">
          <p className="text-[10px] text-amber uppercase font-black tracking-widest text-center border-b border-stone-850 pb-1 mb-2">Blacksmith Forge</p>
          
          <div className="grid grid-cols-2 gap-3 text-[9px] font-semibold">
            {/* Jaw selector */}
            <div className="space-y-1">
              <span className="text-stone-500 uppercase block">Jaw shape</span>
              <select
                value={jawType}
                onChange={(e) => setSandbox({ jawType: e.target.value as any })}
                className="w-full bg-stone-950 border border-stone-800 rounded py-1 px-1.5 text-stone-300"
              >
                <option value="Crow Beak">Crow Beak</option>
                <option value="Eagle Pinch">Eagle Pinch</option>
                <option value="Crocodile Clamp">Crocodile Clamp</option>
                <option value="Heron Probe">Heron Probe</option>
              </select>
            </div>
            
            {/* Handle Length */}
            <div className="space-y-1">
              <span className="text-stone-500 uppercase block">Handle Length</span>
              <select
                value={handleLength}
                onChange={(e) => setSandbox({ handleLength: e.target.value as any })}
                className="w-full bg-stone-950 border border-stone-800 rounded py-1 px-1.5 text-stone-300"
              >
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
              </select>
            </div>

            {/* Tip Shape */}
            <div className="space-y-1">
              <span className="text-stone-500 uppercase block">Tip Shape</span>
              <select
                value={tipShape}
                onChange={(e) => setSandbox({ tipShape: e.target.value as any })}
                className="w-full bg-stone-950 border border-stone-800 rounded py-1 px-1.5 text-stone-300"
              >
                <option value="Fine">Fine</option>
                <option value="Blunt">Blunt</option>
                <option value="Curved">Curved</option>
              </select>
            </div>

            {/* Anvil Weight */}
            <div className="space-y-1">
              <span className="text-stone-500 uppercase block">Anvil Weight</span>
              <select
                value={weight}
                onChange={(e) => setSandbox({ weight: e.target.value as any })}
                className="w-full bg-stone-950 border border-stone-800 rounded py-1 px-1.5 text-stone-300"
              >
                <option value="Light">Light</option>
                <option value="Balanced">Balanced</option>
                <option value="Heavy">Heavy</option>
              </select>
            </div>
          </div>

          {/* Visual Bent Needle Badge */}
          {isTipBent && (
            <div className="bg-red-950 border border-red-500 text-red-200 text-[8px] font-black rounded px-2 py-0.5 text-center animate-pulse uppercase">
              ⚠️ Needle bent! Precision degraded.
            </div>
          )}

          {/* Real-time stats */}
          <div className="grid grid-cols-2 gap-1.5 bg-stone-950/40 p-2.5 rounded-xl border border-stone-850 text-[9px] text-stone-400 font-semibold">
            <p>🎯 Precision: {stats.precision}%</p>
            <p>✊ Grip: {stats.gripStrength}%</p>
            <p>⚡ Speed: {stats.speed}%</p>
            <p>⚠️ Risk: {stats.risk}%</p>
          </div>
        </div>
      </Html>

      {/* Floating Canvas Builder control panel HTML */}
      <Html position={[5, 1.8, -4]} center>
        <div className="bg-stone-900/90 border border-stone-800 text-stone-100 rounded-3xl p-5 shadow-2xl space-y-4 w-72 pointer-events-auto select-none">
          <p className="text-[10px] text-amber uppercase font-black tracking-widest text-center border-b border-stone-850 pb-1 mb-2">Scenario Builder</p>
          
          {/* Item Selector */}
          <div className="flex flex-wrap gap-1 justify-center">
            {(['swelling', 'marma', 'foreign_body', 'fracture'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => { setSelectedType(type); setSandbox({ testMode: false }); }}
                className={`text-[8px] font-bold rounded px-2 py-1 border transition-all ${
                  selectedType === type ? 'border-amber bg-amber/10 text-amber' : 'border-stone-800 bg-stone-950'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Test Runner */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSandbox({ testMode: !testMode }); setSelectedType(null); }}
              className={`flex-1 rounded-full py-1.5 text-xs font-bold uppercase tracking-wider ${
                testMode ? 'bg-amber text-stone-950' : 'bg-gradient-to-r from-emerald-800 to-emerald-600 text-white hover:brightness-110'
              }`}
            >
              {testMode ? 'Stop Test' : 'Run Test'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-full px-4 py-1.5 text-xs font-bold"
            >
              Clear
            </button>
          </div>

          <div className="text-[9px] text-stone-400 border-t border-stone-850 pt-2 font-semibold">
            <p>Hemorrhage: <span className={bleedValue > 50 ? 'text-red-500 font-bold' : 'text-stone-300'}>{bleedValue}%</span></p>
            <p className="mt-1 italic text-stone-500">"{testLog}"</p>
          </div>
        </div>
      </Html>
    </group>
  );
}
