import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';
import { SandboxElement } from '../../types/simulation';

const jawOptions = ['Crow Beak', 'Eagle Pinch', 'Crocodile Clamp', 'Heron Probe'] as const;
const handleOptions = ['Short', 'Medium', 'Long'] as const;
const weightOptions = ['Light', 'Balanced', 'Heavy'] as const;
const tipOptions = ['Fine', 'Blunt', 'Curved'] as const;

export default function Stage4() {
  const {
    timeOfDay,
    sushrutaAlert,
    flashSushrutaAlert,
    sandboxElements,
    setSandboxElements,
    forgedTool,
    setForgedTool
  } = useSimulation();

  // Forging states
  const [jawType, setJawType] = useState<typeof jawOptions[number]>('Crow Beak');
  const [handleLength, setHandleLength] = useState<typeof handleOptions[number]>('Medium');
  const [weight, setWeight] = useState<typeof weightOptions[number]>('Balanced');
  const [tipShape, setTipShape] = useState<typeof tipOptions[number]>('Fine');

  // Sandbox Creator states
  const [selectedToolType, setSelectedToolType] = useState<'swelling' | 'vein' | 'marma' | 'foreign_body' | 'fracture' | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testLog, setTestLog] = useState('Build your tool, place elements on the leg, and run the test simulator.');
  const [bleedValue, setBleedValue] = useState(0);

  // Stats calculation
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
      precision: Math.min(100, Math.max(10, basePrec + lengthMod + tipMod)),
      gripStrength: Math.min(100, Math.max(10, baseGrip + weightMod)),
      speed: Math.min(100, Math.max(10, baseSpeed + (handleLength === 'Short' ? 8 : -4))),
      risk: Math.min(100, Math.max(5, baseRisk + (tipShape === 'Blunt' ? 4 : -2)))
    };

    setForgedTool({
      id: 'custom-sandbox',
      label: `${jawType} Lancet`,
      ...toolStats
    });

    return toolStats;
  }, [jawType, handleLength, weight, tipShape, setForgedTool]);

  // Click on Leg canvas to place element or perform test surgery
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (testMode) {
      // Live surgical testing interactions
      handleSurgeryClick(x, y);
    } else {
      // Placement mode
      if (!selectedToolType) return;
      const newElem: SandboxElement = {
        id: `elem_${Date.now()}`,
        type: selectedToolType,
        x,
        y,
        size: selectedToolType === 'swelling' ? 24 : selectedToolType === 'marma' ? 20 : 12
      };
      setSandboxElements((prev) => [...prev, newElem]);
      flashSushrutaAlert(`Placed ${selectedToolType} at coordinates.`);
    }
  };

  const handleSurgeryClick = (x: number, y: number) => {
    // Find closest element clicked
    let closestIndex = -1;
    let minDist = 999;

    sandboxElements.forEach((el, index) => {
      const dist = Math.sqrt(Math.pow(el.x - x, 2) + Math.pow(el.y - y, 2));
      if (dist < el.size && dist < minDist) {
        minDist = dist;
        closestIndex = index;
      }
    });

    if (closestIndex === -1) {
      setTestLog('Clicked clean tissue. No effect.');
      return;
    }

    const clickedEl = sandboxElements[closestIndex];

    if (clickedEl.type === 'swelling') {
      // Drain swelling
      setSandboxElements((prev) =>
        prev.map((el, i) => (i === closestIndex ? { ...el, size: Math.max(0, el.size - 8) } : el)).filter((el) => el.size > 0)
      );
      setTestLog('Draining swelling pocket. Swelling height contracting.');
      // Random chance to bleed based on risk
      if (Math.random() * 100 < stats.risk) {
        setBleedValue((b) => Math.min(100, b + 12));
        setTestLog('Lancet slipped! Minor hemorrhage occurred.');
      }
    } else if (clickedEl.type === 'marma') {
      // Marma hit
      setBleedValue((b) => Math.min(100, b + 35));
      setTestLog('WARNING: Struck vital nerve marma! Massive Prana bleeding!');
      flashSushrutaAlert('Marma strike! Sandalwood cooling required.');
    } else if (clickedEl.type === 'foreign_body') {
      // Extract metal shard
      const successChance = stats.precision - stats.risk;
      if (Math.random() * 100 < successChance) {
        setSandboxElements((prev) => prev.filter((el, i) => i !== closestIndex));
        setTestLog('Successfully extracted iron shard with precise alignment.');
      } else {
        setBleedValue((b) => Math.min(100, b + 18));
        setTestLog('Grip slipped! Shard tore local capillaries.');
      }
    } else if (clickedEl.type === 'fracture') {
      // Snap bone back
      if (stats.gripStrength > 65) {
        setSandboxElements((prev) => prev.filter((el, i) => i !== closestIndex));
        setTestLog('Exerted high leverage to align broken bone. Fractured leg stabilized.');
      } else {
        setTestLog('Insufficient tool leverage. Handle length is too short to align compound fracture.');
      }
    }
  };

  const handleClearSandbox = () => {
    setSandboxElements([]);
    setBleedValue(0);
    setTestLog('Canvas cleared.');
  };

  // Custom tool SVG blueprint generator paths
  const toolVisualPath = useMemo(() => {
    const isLong = handleLength === 'Long';
    const isShort = handleLength === 'Short';
    const handleLenVal = isLong ? 150 : isShort ? 80 : 110;
    
    // Jaw path silhouettes
    let jawD = '';
    if (jawType === 'Crow Beak') {
      jawD = 'M 40,25 Q 20,40 5,42 Q 22,48 40,43 L 40,25 Z';
    } else if (jawType === 'Crocodile Clamp') {
      jawD = 'M 40,20 L 5,28 L 5,36 L 40,44 L 35,32 Z';
    } else if (jawType === 'Heron Probe') {
      jawD = 'M 40,28 L 0,33 L 40,38 Z';
    } else { // Eagle Pinch
      jawD = 'M 40,22 C 20,25 5,15 0,28 C 15,38 30,35 40,40 Z';
    }

    return { jawD, handleLenVal };
  }, [jawType, handleLength]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] h-full items-stretch select-none">
      
      {/* Sandbox workspace */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-950 p-6 relative shadow-2xl">
        <div>
          {/* Live Scenario Builder Leg Canvas */}
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-3">
            Sandbox Canvas: Click Leg to Place / Treat
          </span>

          <div className="relative min-h-[220px] flex items-center justify-center bg-stone-900/30 border border-stone-850 rounded-2xl overflow-hidden mb-4">
            
            <svg
              viewBox="0 0 400 180"
              className="w-full max-w-[420px] overflow-visible cursor-crosshair"
              onClick={handleCanvasClick}
            >
              {/* Leg Outline */}
              <path
                d="M 20,90 Q 120,40 220,50 T 380,80 L 380,105 T 220,120 Q 120,130 20,100 Z"
                fill="#1c1917"
                stroke="#b36b32"
                strokeWidth="2"
              />

              {/* Sandbox elements custom render */}
              {sandboxElements.map((el) => {
                if (el.type === 'swelling') {
                  return (
                    <circle
                      key={el.id}
                      cx={el.x}
                      cy={el.y}
                      r={el.size}
                      fill="url(#swell-grad)"
                      className="opacity-75"
                    />
                  );
                } else if (el.type === 'marma') {
                  return (
                    <g key={el.id}>
                      <circle
                        cx={el.x}
                        cy={el.y}
                        r={el.size}
                        fill="#ff0055"
                        fillOpacity="0.15"
                        stroke="#ff0055"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <circle cx={el.x} cy={el.y} r="3" fill="#ff0055" />
                    </g>
                  );
                } else if (el.type === 'foreign_body') {
                  return (
                    <polygon
                      key={el.id}
                      points={`${el.x},${el.y - 6} ${el.x - 4},${el.y + 4} ${el.x + 4},${el.y + 4}`}
                      fill="#78716c"
                      stroke="#d6d3d1"
                      strokeWidth="1"
                    />
                  );
                } else if (el.type === 'fracture') {
                  return (
                    <g key={el.id} stroke="#e7e5e4" strokeWidth="2" strokeLinecap="round">
                      <line x1={el.x - 8} y1={el.y - 4} x2={el.x + 2} y2={el.y} />
                      <line x1={el.x + 8} y1={el.y + 4} x2={el.x} y2={el.y} />
                    </g>
                  );
                } else { // vein
                  return (
                    <circle
                      key={el.id}
                      cx={el.x}
                      cy={el.y}
                      r="6"
                      fill="#991b1b"
                    />
                  );
                }
              })}

              <defs>
                <radialGradient id="swell-grad">
                  <stop offset="0%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            {/* Test statistics overlays */}
            <div className="absolute top-4 left-4 text-xs font-semibold space-y-1">
              <p className="text-stone-500 uppercase tracking-widest text-[9px]">Testing HUD</p>
              <p className={bleedValue > 50 ? 'text-red-500 font-bold' : 'text-stone-300'}>
                Blood Loss: {bleedValue}%
              </p>
            </div>

            <div className="absolute bottom-4 right-4 bg-stone-950/80 border border-stone-850 rounded-full px-3 py-1 text-[9px] font-bold text-amber">
              {testMode ? '🔴 SIMULATION RUNNING' : '🛠️ EDIT MODE'}
            </div>
          </div>

          {/* Scenario Placing Options / Test trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-850 pb-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-stone-500 uppercase font-bold pr-2">Place Element:</span>
              <button
                type="button"
                onClick={() => { setSelectedToolType('swelling'); setTestMode(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  selectedToolType === 'swelling' ? 'border-amber bg-amber/10 text-amber' : 'border-stone-850 bg-stone-900/30'
                }`}
              >
                Swelling
              </button>
              <button
                type="button"
                onClick={() => { setSelectedToolType('marma'); setTestMode(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  selectedToolType === 'marma' ? 'border-amber bg-amber/10 text-amber' : 'border-stone-850 bg-stone-900/30'
                }`}
              >
                Marma Node
              </button>
              <button
                type="button"
                onClick={() => { setSelectedToolType('foreign_body'); setTestMode(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  selectedToolType === 'foreign_body' ? 'border-amber bg-amber/10 text-amber' : 'border-stone-850 bg-stone-900/30'
                }`}
              >
                Iron Shard
              </button>
              <button
                type="button"
                onClick={() => { setSelectedToolType('fracture'); setTestMode(false); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  selectedToolType === 'fracture' ? 'border-amber bg-amber/10 text-amber' : 'border-stone-850 bg-stone-900/30'
                }`}
              >
                Fracture
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setTestMode(!testMode); setSelectedToolType(null); }}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider ${
                  testMode ? 'bg-amber text-stone-950' : 'bg-gradient-to-r from-herbal to-emerald-700 text-white'
                }`}
              >
                {testMode ? 'Stop Test' : 'Run Test'}
              </button>
              <button
                type="button"
                onClick={handleClearSandbox}
                className="rounded-full bg-stone-800 px-4 py-2 text-xs font-bold text-stone-400 hover:text-stone-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Forge Builders designed like metal engraving grids */}
        <div className="grid gap-3 sm:grid-cols-4 mt-6">
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Jaw Shape</span>
            <div className="flex flex-col gap-1.5">
              {jawOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setJawType(o)}
                  className={`text-left rounded-xl border px-3 py-2 text-[10px] font-semibold transition-all ${
                    jawType === o ? 'border-amber bg-amber/5 text-amber' : 'border-stone-850 bg-stone-950'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Handle Length</span>
            <div className="flex flex-col gap-1.5">
              {handleOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setHandleLength(o)}
                  className={`text-left rounded-xl border px-3 py-2 text-[10px] font-semibold transition-all ${
                    handleLength === o ? 'border-amber bg-amber/5 text-amber' : 'border-stone-850 bg-stone-950'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Tip shape</span>
            <div className="flex flex-col gap-1.5">
              {tipOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setTipShape(o)}
                  className={`text-left rounded-xl border px-3 py-2 text-[10px] font-semibold transition-all ${
                    tipShape === o ? 'border-amber bg-amber/5 text-amber' : 'border-stone-850 bg-stone-950'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Anvil Weight</span>
            <div className="flex flex-col gap-1.5">
              {weightOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setWeight(o)}
                  className={`text-left rounded-xl border px-3 py-2 text-[10px] font-semibold transition-all ${
                    weight === o ? 'border-amber bg-amber/5 text-amber' : 'border-stone-850 bg-stone-950'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tool Blueprint Rendering & Stats */}
      <div className="flex flex-col justify-between rounded-[24px] border border-stone-800 bg-stone-900/40 p-6">
        <div>
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Forge Blueprint</span>
          
          {/* Custom SVG Tool Silhouette */}
          <div className="relative min-h-[160px] flex items-center justify-center bg-stone-950 border border-stone-850 rounded-2xl overflow-hidden my-4 p-4">
            <svg viewBox="0 0 100 200" className="h-32 w-auto overflow-visible">
              {/* Handle */}
              <line
                x1="50"
                y1="40"
                x2="50"
                y2={40 + toolVisualPath.handleLenVal}
                stroke="#78350f"
                strokeWidth={weight === 'Heavy' ? '8' : weight === 'Light' ? '4' : '6'}
                strokeLinecap="round"
              />
              
              {/* Pivot joint */}
              <circle cx="50" cy="40" r="4" fill="#d97706" />

              {/* Custom Jaw path (replaces/moves based on jaw selector) */}
              <path
                d={toolVisualPath.jawD}
                fill="#b45309"
                stroke="#f59e0b"
                strokeWidth="1"
                transform="translate(10, -5)"
              />
              {/* Mirrored jaw */}
              <path
                d={toolVisualPath.jawD}
                fill="#b45309"
                stroke="#f59e0b"
                strokeWidth="1"
                transform="scale(-1, 1) translate(-90, -5)"
              />
            </svg>

            <span className="absolute bottom-2 right-3 text-[9px] text-stone-600 font-bold uppercase tracking-widest">
              COPPER DESIGN
            </span>
          </div>

          {/* Tool stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold text-stone-400">
            <div className="bg-stone-950/40 p-2.5 rounded-xl border border-stone-850/80">
              <span className="text-[8px] text-stone-500 uppercase block">Precision Control</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{stats.precision}%</span>
            </div>
            <div className="bg-stone-950/40 p-2.5 rounded-xl border border-stone-850/80">
              <span className="text-[8px] text-stone-500 uppercase block">Grip Strength</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{stats.gripStrength}%</span>
            </div>
            <div className="bg-stone-950/40 p-2.5 rounded-xl border border-stone-850/80">
              <span className="text-[8px] text-stone-500 uppercase block">Reach Speed</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{stats.speed}%</span>
            </div>
            <div className="bg-stone-950/40 p-2.5 rounded-xl border border-stone-850/80">
              <span className="text-[8px] text-stone-500 uppercase block">Tissue Damage Risk</span>
              <span className="text-sm font-bold text-stone-200 mt-1 block">{stats.risk}%</span>
            </div>
          </div>
        </div>

        {/* Live execution logs */}
        <div className="border-t border-stone-850 pt-4 mt-6">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Live Sandbox Feed</span>
          <p className="text-xs leading-6 text-stone-300 font-light mt-2 italic">
            "{testLog}"
          </p>
        </div>
      </div>
    </div>
  );
}
