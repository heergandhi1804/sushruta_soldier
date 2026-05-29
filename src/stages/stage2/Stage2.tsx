import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

interface SwellingTarget {
  id: number;
  baseX: number;
  baseY: number;
  size: number;
}

interface MarmaNode {
  id: string;
  name: string;
  baseX: number;
  baseY: number;
  radius: number;
}

export default function Stage2() {
  const {
    updateHighScores,
    flashSushrutaAlert,
    highScores
  } = useSimulation();

  const [rotation, setRotation] = useState(90); // 0 to 180 degrees
  const [heldTool, setHeldTool] = useState<'leech' | 'lens' | null>(null);
  const [lensCoords, setLensCoords] = useState({ x: 200, y: 90 });
  const [placedLeechZone, setPlacedLeechZone] = useState<number | null>(null);
  
  // Randomized layouts
  const [swellingZones, setSwellingZones] = useState<SwellingTarget[]>([]);
  const [marmaNodes, setMarmaNodes] = useState<MarmaNode[]>([]);

  // Simulation metrics
  const [isFinished, setIsFinished] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stars, setStars] = useState(0);
  const [bloodSpurt, setBloodSpurt] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [timer, setTimer] = useState(0);

  // Rotation dragging states
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDraggingLimb, setIsDraggingLimb] = useState(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(90);

  // Generate layouts on mount/reset
  useEffect(() => {
    generateRandomLayout();
  }, []);

  useEffect(() => {
    if (isFinished) return;
    const interval = window.setInterval(() => {
      setTimer((t) => t + 0.1);
    }, 100);
    return () => window.clearInterval(interval);
  }, [isFinished]);

  const generateRandomLayout = () => {
    // 4 zones
    const zones: SwellingTarget[] = [
      { id: 1, baseX: 120, baseY: 65, size: 22 },
      { id: 2, baseX: 180, baseY: 55, size: 19 },
      { id: 3, baseX: 250, baseY: 75, size: 21 },
      { id: 4, baseX: 310, baseY: 60, size: 18 }
    ];

    // Pick 1 or 2 zones to overlap marma nodes
    const overlapId1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
    let overlapId2 = Math.floor(Math.random() * 4) + 1;
    if (overlapId2 === overlapId1) {
      overlapId2 = (overlapId2 % 4) + 1;
    }

    const overlapZone1 = zones[overlapId1 - 1];
    const overlapZone2 = zones[overlapId2 - 1];

    const nodes: MarmaNode[] = [
      {
        id: 'm1',
        name: 'Janu Joint Marma',
        baseX: overlapZone1.baseX,
        baseY: overlapZone1.baseY,
        radius: 24
      },
      {
        id: 'm2',
        name: 'Sira Vessel Marma',
        baseX: overlapZone2.baseX,
        baseY: overlapZone2.baseY,
        radius: 22
      }
    ];

    setSwellingZones(zones);
    setMarmaNodes(nodes);
    setRotation(90);
    setHeldTool(null);
    setPlacedLeechZone(null);
    setIsFinished(false);
    setIsSuccess(false);
    setBloodSpurt(false);
    setOutcome('');
    setTimer(0);
  };

  // Compute 2.5D x-shift based on rotation
  const calculateXShift = (baseX: number, angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return baseX + Math.sin(rad) * 35;
  };

  const activeZones = useMemo(() => {
    return swellingZones.map((z) => ({
      ...z,
      currentX: calculateXShift(z.baseX, rotation)
    }));
  }, [swellingZones, rotation]);

  const activeMarmas = useMemo(() => {
    return marmaNodes.map((m) => ({
      ...m,
      currentX: calculateXShift(m.baseX, rotation)
    }));
  }, [marmaNodes, rotation]);

  // Handle dragging the limb to rotate
  const handleLimbMouseDown = (e: React.MouseEvent) => {
    if (isFinished || heldTool === 'lens') return;
    setIsDraggingLimb(true);
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotation;
  };

  const handleLimbMouseMove = (e: React.MouseEvent) => {
    if (isDraggingLimb) {
      const deltaX = e.clientX - dragStartX.current;
      // 1px delta is approx 0.8 degrees of rotation
      const nextRot = Math.min(180, Math.max(0, dragStartRotation.current + deltaX * 0.8));
      setRotation(nextRot);
    }

    // Dragging/moving the lens coordinates inside the SVG
    if (heldTool === 'lens' && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 400);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 180);
      setLensCoords({ x, y });
    }
  };

  const handleLimbMouseUp = () => {
    setIsDraggingLimb(false);
  };

  const handleZoneClick = (zoneId: number) => {
    if (isFinished || heldTool !== 'leech') return;
    
    setPlacedLeechZone(zoneId);
    setIsFinished(true);
    setHeldTool(null);

    // Check if this zone overlaps any active marma node coordinates
    const selectedZone = activeZones.find((z) => z.id === zoneId);
    if (!selectedZone) return;

    let hitMarma = false;
    activeMarmas.forEach((m) => {
      const dist = Math.sqrt(Math.pow(selectedZone.currentX - m.currentX, 2) + Math.pow(selectedZone.baseY - m.baseY, 2));
      if (dist < (selectedZone.size + m.radius) * 0.6) {
        hitMarma = true;
      }
    });

    if (hitMarma) {
      // Hemorrhage Cascade Failure
      setBloodSpurt(true);
      setIsSuccess(false);
      setStars(0);
      setOutcome('HEMOPHILIA! Struck a major vascular node. Vital breath (Prana) escaping.');
      flashSushrutaAlert('Marma cluster ruptured!');
    } else {
      // Success
      setIsSuccess(true);
      const earnedStars = timer < 10.0 ? 3 : timer < 18.0 ? 2 : 1;
      setStars(earnedStars);
      setOutcome(earnedStars === 3 ? 'Gold Title: Prana-Preserving Surgeon' : 'Silver: Successful Draining');
      flashSushrutaAlert('Treatment successful.');

      // Update High Scores
      const recordTime = highScores.stage2BestTime;
      if (recordTime === null || timer < recordTime) {
        updateHighScores({ stage2BestTime: timer });
      }
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-stretch h-full">
      {/* Rotation canvas viewport */}
      <div
        className="flex-1 rounded-[24px] border border-stone-800 bg-stone-950 p-6 flex flex-col justify-between min-h-[500px] relative overflow-hidden shadow-2xl"
        onMouseMove={handleLimbMouseMove}
        onMouseUp={handleLimbMouseUp}
        onMouseLeave={handleLimbMouseUp}
      >
        
        {/* Floating status */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {heldTool && (
            <div className="rounded-full bg-amber/20 border border-amber/40 px-3 py-1 text-[10px] uppercase font-bold text-amber animate-pulse">
              Holding: {heldTool === 'lens' ? 'Marma Lens' : 'Leech'}
            </div>
          )}
        </div>

        {/* Rotate instructions */}
        <div className="text-center text-[10px] text-stone-500 uppercase font-semibold tracking-wider mb-2">
          {heldTool === 'lens' ? 'Drag mouse over leg to inspect structures' : 'Drag leg directly left/right to rotate'}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center relative">
          <svg
            ref={svgRef}
            viewBox="0 0 400 180"
            className={`w-full max-w-[450px] overflow-visible select-none ${
              heldTool === 'lens' ? 'cursor-none' : isDraggingLimb ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleLimbMouseDown}
          >
            {/* dynamic clip path that follows the lens mouse coordinate */}
            <defs>
              <clipPath id="lens-clip-circle">
                <circle cx={lensCoords.x} cy={lensCoords.y} r="45" />
              </clipPath>
              <radialGradient id="swell-gradient-zone">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="70%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="lens-bkg">
                <stop offset="0%" stopColor="#292524" />
                <stop offset="100%" stopColor="#1c1917" />
              </radialGradient>
            </defs>

            {/* NORMAL STATE: Leg Skin */}
            <path
              d="M 20,90 Q 120,40 220,50 T 380,80 L 380,105 T 220,120 Q 120,130 20,100 Z"
              fill={bloodSpurt ? '#2d1212' : '#855b38'}
              stroke="#b36b32"
              strokeWidth="2.5"
              className="transition-colors duration-500"
            />

            {/* Normal Swelling targets on skin */}
            {activeZones.map((zone) => (
              <g key={zone.id}>
                <circle
                  cx={zone.currentX}
                  cy={zone.baseY}
                  r={zone.size}
                  fill="url(#swell-gradient-zone)"
                  className="cursor-pointer hover:brightness-110"
                  onClick={() => handleZoneClick(zone.id)}
                />
                <text
                  x={zone.currentX}
                  y={zone.baseY + 4}
                  fill="#fff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none opacity-60"
                >
                  Z{zone.id}
                </text>
              </g>
            ))}

            {/* LENS STATE: Internal Copper manuscript skeleton and vessels (masked inside the circle clip path) */}
            <g clipPath="url(#lens-clip-circle)">
              {/* Lens background paper color */}
              <path
                d="M 20,90 Q 120,40 220,50 T 380,80 L 380,105 T 220,120 Q 120,130 20,100 Z"
                fill="url(#lens-bkg)"
              />

              {/* Manuscript skeleton drawing lines */}
              <path
                d="M 40,85 Q 120,55 220,65 T 360,92"
                fill="none"
                stroke="#c2410c"
                strokeWidth="4"
                className="opacity-70"
              />
              <path
                d="M 50,102 Q 130,110 220,105 T 350,100"
                fill="none"
                stroke="#c2410c"
                strokeWidth="3.5"
                className="opacity-55"
              />

              {/* Glowing copper nadis (nerves/arteries) */}
              <path
                d="M 30,90 Q 120,45 220,55 T 370,85"
                fill="none"
                stroke="#f97316"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="animate-pulse"
              />

              {/* Glowing Marma nodes inside the manuscript */}
              {activeMarmas.map((m) => (
                <g key={m.id}>
                  <circle
                    cx={m.currentX}
                    cy={m.baseY}
                    r={m.radius}
                    fill="#b91c1c"
                    fillOpacity="0.25"
                    stroke="#ea580c"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <circle cx={m.currentX} cy={m.baseY} r="3" fill="#ea580c" />
                </g>
              ))}
            </g>

            {/* Render Leech if placed */}
            {placedLeechZone !== null && (
              <path
                d={`M ${activeZones.find((z) => z.id === placedLeechZone)?.currentX},${
                  activeZones.find((z) => z.id === placedLeechZone)?.baseY
                } Q 190,50 170,45`}
                fill="none"
                stroke="#2c3e2e"
                strokeWidth="7"
                strokeLinecap="round"
              />
            )}

            {/* Blood spurting failure cascades */}
            {bloodSpurt && (
              <g stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round">
                <line x1="180" y1="55" x2="160" y2="10" className="animate-bounce" />
                <line x1="250" y1="75" x2="260" y2="30" className="animate-bounce" />
              </g>
            )}

            {/* Physical copper ring of the Marma Lens following mouse */}
            {heldTool === 'lens' && (
              <g className="pointer-events-none">
                <circle cx={lensCoords.x} cy={lensCoords.y} r="45" fill="none" stroke="#ea580c" strokeWidth="3" />
                <line x1={lensCoords.x + 32} y1={lensCoords.y + 32} x2={lensCoords.x + 55} y2={lensCoords.y + 55} stroke="#ea580c" strokeWidth="4.5" strokeLinecap="round" />
              </g>
            )}
          </svg>
        </div>

        {/* Tray controls */}
        <div className="mt-6 border-t border-stone-850 pt-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Surgical Tools:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHeldTool('lens')}
                disabled={isFinished}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  heldTool === 'lens'
                    ? 'border-amber bg-stone-900 text-stone-100 shadow-md scale-105'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                🔍 <span className="font-serif">Marma Lens</span>
              </button>
              <button
                type="button"
                onClick={() => setHeldTool('leech')}
                disabled={isFinished}
                className={`rounded-2xl border px-3 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  heldTool === 'leech'
                    ? 'border-amber bg-stone-900 text-stone-100 shadow-md scale-105'
                    : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                }`}
              >
                🏺 <span className="font-serif">Jalauka Leech</span>
              </button>
            </div>
          </div>

          {isFinished && (
            <button
              type="button"
              onClick={generateRandomLayout}
              className="rounded-full bg-stone-800 hover:bg-stone-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white"
            >
              Reset Anvil
            </button>
          )}
        </div>
      </div>

      {/* Stats HUD */}
      <div className="w-full xl:w-80 rounded-[24px] border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Surgical Report</span>
          <h4 className="font-serif text-lg font-bold text-stone-200 border-b border-stone-800 pb-2 mt-1">Status</h4>

          <div className="mt-6 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-stone-950/40 border border-stone-850/60 min-h-[140px]">
            {isFinished ? (
              <>
                <span className="text-4xl block mb-2">{isSuccess ? '🏆' : '⚠️'}</span>
                <span className={`text-xs font-bold uppercase tracking-wider block ${isSuccess ? 'text-herbal' : 'text-danger'}`}>
                  {isSuccess ? 'Dissection Complete' : 'Failure'}
                </span>
                <p className="text-[11px] text-stone-400 mt-2 italic font-light px-2 leading-relaxed">
                  "{outcome}"
                </p>

                {isSuccess && (
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3].map((star) => (
                      <span key={star} className={`text-xl ${star <= stars ? 'opacity-100' : 'opacity-20'}`}>
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-[11px] text-stone-400 italic font-light leading-relaxed">
                  Pick up the Marma Lens to scan the internal lines. Rotate the leg to verify depth. Apply the leech away from vital red nodes.
                </p>
              </>
            )}
          </div>
        </div>

        {isFinished && isSuccess && (
          <div className="mt-4 p-3 bg-stone-950/60 border border-stone-850 rounded-xl text-center text-[10px] text-stone-500 uppercase font-bold tracking-widest">
            ⏱️ Solved In: {timer.toFixed(1)}s
          </div>
        )}
      </div>
    </div>
  );
}
