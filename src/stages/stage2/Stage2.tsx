import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

interface SwellingTarget {
  id: number;
  baseX: number; // center position at rotation 90
  baseY: number;
  size: number;
  marmaOverlapId: string | null;
}

const targetSwellingZones: SwellingTarget[] = [
  { id: 1, baseX: 120, baseY: 65, size: 22, marmaOverlapId: null }, // safe
  { id: 2, baseX: 200, baseY: 55, size: 18, marmaOverlapId: 'm1' }, // overlaps Janu joint marma
  { id: 3, baseX: 280, baseY: 75, size: 20, marmaOverlapId: 'm2' }, // overlaps Sira vessel line marma
  { id: 4, baseX: 160, baseY: 85, size: 24, marmaOverlapId: null }  // safe
];

export default function Stage2() {
  const {
    updateScroll,
    updateConsequences,
    addHistory,
    setUnlockedStages,
    flashSushrutaAlert,
    consequenceMetrics
  } = useSimulation();

  const [rotation, setRotation] = useState(90); // 0 to 180 degrees
  const [scannerStrength, setScannerStrength] = useState(30); // 0 to 100 opacity
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [placedZone, setPlacedZone] = useState<number | null>(null);
  const [outcome, setOutcome] = useState('Rotate the leg to scan different layers and place the leech away from vital marma junctions.');
  const [isFinished, setIsFinished] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bloodSpurt, setBloodSpurt] = useState(false);

  // Compute 2.5D x-position shift based on rotation angle
  const calculateXShift = (baseX: number, angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return baseX + Math.sin(rad) * 35;
  };

  const activeSwellingPoints = useMemo(() => {
    return targetSwellingZones.map((zone) => ({
      ...zone,
      currentX: calculateXShift(zone.baseX, rotation)
    }));
  }, [rotation]);

  const activeMarmaNodes = useMemo(() => {
    return [
      { id: 'm1', name: 'Janu (Joint)', baseX: 200, baseY: 55, radius: 24 },
      { id: 'm2', name: 'Sira (Deep Vessel)', baseX: 280, baseY: 75, radius: 22 }
    ].map((m) => ({
      ...m,
      currentX: calculateXShift(m.baseX, rotation)
    }));
  }, [rotation]);

  const handlePlaceLeech = (zoneId: number) => {
    if (isFinished) return;
    setPlacedZone(zoneId);
    setSelectedZone(zoneId);
    
    const zone = targetSwellingZones.find((z) => z.id === zoneId);
    if (!zone) return;

    if (zone.marmaOverlapId) {
      // Hit a Marma point!
      setBloodSpurt(true);
      setIsSuccess(false);
      setIsFinished(true);
      setOutcome(`CRITICAL MARMA STRIKE! Placed leech directly on the ${zone.marmaOverlapId === 'm1' ? 'Janu' : 'Sira'} vital center. Massive hemorrhage!`);
      flashSushrutaAlert('Marma strike! Emergency cooling with sandalwood required.');
      updateConsequences({ pain: 30, bloodLoss: 40, trust: -25, permanentDamage: 15 });
    } else {
      // Safe placement!
      setIsSuccess(true);
      setIsFinished(true);
      setOutcome('Perfect. Leech applied on safe superficial tissue. Swelling is draining steadily.');
      flashSushrutaAlert('Safe extraction. Swelling resolved. Chapter 3 unlocked!');
      updateScroll({ observation: 10, precision: 12, surgicalControl: 10 });
      updateConsequences({ inflammation: -25, pain: -15, trust: 15, recovery: 20 });
      setUnlockedStages([1, 2, 3]); // Progression trigger!
    }
  };

  const handleReset = () => {
    setRotation(90);
    setScannerStrength(30);
    setSelectedZone(null);
    setPlacedZone(null);
    setIsFinished(false);
    setIsSuccess(false);
    setBloodSpurt(false);
    setOutcome('Rotate the leg to scan different layers and place the leech away from vital marma junctions.');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] h-full items-stretch">
      {/* Limb rotation canvas */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-950 p-6 relative overflow-hidden shadow-2xl">
        
        {/* Rotation & Scan Sliders */}
        <div className="grid gap-3 sm:grid-cols-2 bg-stone-900/50 p-4 rounded-2xl border border-stone-800/60 mb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-500 uppercase font-bold block">Rotate Limb ({rotation}°)</span>
            <input
              type="range"
              min="0"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              disabled={isFinished}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-stone-500 uppercase font-bold block">Prana Scan ({scannerStrength}%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={scannerStrength}
              onChange={(e) => setScannerStrength(Number(e.target.value))}
              disabled={isFinished}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* 2.5D SVG Leg view */}
        <div className="flex-1 min-h-[220px] flex items-center justify-center relative bg-stone-900/20 border border-stone-800/30 rounded-[20px] overflow-hidden my-2">
          
          <svg viewBox="0 0 400 180" className="w-full max-w-[420px] overflow-visible">
            {/* Outline leg structure */}
            <path
              d="M 20,90 Q 120,40 220,50 T 380,80 L 380,105 T 220,120 Q 120,130 20,100 Z"
              fill="#1c1917"
              stroke="#b36b32"
              strokeWidth="2.5"
              className="transition-colors duration-500"
              style={{
                fill: bloodSpurt ? '#2c1212' : '#1c1917'
              }}
            />

            {/* Glowing biological nerve lines (visible based on scanner strength) */}
            <g style={{ opacity: scannerStrength / 100 }}>
              <path
                d="M 40,92 Q 130,55 210,65 T 350,90"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <path
                d="M 60,110 Q 180,80 280,100 T 370,95"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="opacity-70 animate-pulse"
              />
            </g>

            {/* Marma Nodes (Vascular/Nerve nodes) */}
            {activeMarmaNodes.map((point) => (
              <circle
                key={point.id}
                cx={point.currentX}
                cy={point.baseY}
                r={point.radius}
                fill="#ef4444"
                className="transition-all duration-300"
                style={{
                  fillOpacity: scannerStrength > 20 ? (scannerStrength / 100) * 0.45 : 0.05,
                  stroke: '#ef4444',
                  strokeWidth: 1.5,
                  strokeDasharray: '2 2',
                  strokeOpacity: scannerStrength > 20 ? 0.8 : 0.1
                }}
              />
            ))}

            {/* Target swelling zones */}
            {activeSwellingPoints.map((zone) => (
              <g key={zone.id}>
                <circle
                  cx={zone.currentX}
                  cy={zone.baseY}
                  r={zone.size}
                  fill="url(#swell-glow)"
                  className="cursor-pointer transition-all duration-300 hover:brightness-125"
                  onClick={() => handlePlaceLeech(zone.id)}
                />
                <text
                  x={zone.currentX}
                  y={zone.baseY + 4}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none opacity-80"
                >
                  Z{zone.id}
                </text>
              </g>
            ))}

            {/* Blood Spurt Lines (renders on failure) */}
            {bloodSpurt && (
              <g stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round">
                <line x1="200" y1="55" x2="180" y2="20" className="animate-bounce" />
                <line x1="200" y1="55" x2="220" y2="25" />
                <line x1="280" y1="75" x2="270" y2="40" className="animate-bounce" />
                <line x1="280" y1="75" x2="300" y2="45" />
              </g>
            )}

            {/* Gradients */}
            <defs>
              <radialGradient id="swell-glow">
                <stop offset="0%" stopColor="#be123c" />
                <stop offset="70%" stopColor="#9f1239" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* Alarm red flashing vignette */}
          {bloodSpurt && (
            <div className="absolute inset-0 bg-red-950/20 border border-red-500/30 rounded-[20px] animate-pulse pointer-events-none" />
          )}

          {/* Safe/Danger status alerts */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Active Scan</span>
            <span className="text-sm font-black text-amber">
              {scannerStrength < 40 ? '🔍 Scan Weak (Increase Power)' : '🟢 Biological Map Stable'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-stone-850 pt-4 mt-4">
          <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
            Instructions: Click Z1 to Z4 to apply leech.
          </span>
          {isFinished && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full bg-stone-800 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-stone-700"
            >
              Reset Anvil
            </button>
          )}
        </div>
      </div>

      {/* Narrative & Scores */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-900/40 p-6">
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Surgical Report</span>
          <h4 className="font-serif text-lg font-bold text-stone-200 border-b border-stone-800 pb-2">Anatomical Scan</h4>
          <p className="text-xs leading-6 text-stone-300 font-light italic">
            "{outcome}"
          </p>
        </div>

        {isFinished && (
          <div className="border-t border-stone-800 pt-4 space-y-4 mt-6">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Chapter Verdict</span>
            
            {isSuccess ? (
              <div className="rounded-xl border border-herbal/30 bg-herbal/10 p-4 text-center">
                <span className="text-2xl block mb-1">🎉</span>
                <span className="text-sm font-bold text-herbal uppercase tracking-wider block">Chapter Mastered</span>
                <p className="text-[11px] text-stone-300 font-light mt-1.5">
                  Successful dissection. Marma nerve clusters preserved. Chapter 3 (Triage Ward) unlocked.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-center">
                <span className="text-2xl block mb-1">⚠️</span>
                <span className="text-sm font-bold text-danger uppercase tracking-wider block">Disciple Failed</span>
                <p className="text-[11px] text-stone-300 font-light mt-1.5">
                  Surgical strike on a vital junction caused hemorrhage. Recheck scanner readings.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
