import { useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore, GameMode } from './store/gameStore';
import World from './components/game/World';
import Player from './components/game/Player';
import Stage1View from './components/game/Stage1View';
import Stage2View from './components/game/Stage2View';
import Stage3View from './components/game/Stage3View';
import SandboxView from './components/game/SandboxView';
import * as THREE from 'three';

// Camera controller scripting
function CameraController() {
  const { gameMode, stage, playerPosition } = useGameStore();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (gameMode === 'menu' || gameMode === 'settings') {
      // Slow drift around center
      const r = 13;
      const x = Math.sin(elapsed * 0.08) * r;
      const z = Math.cos(elapsed * 0.08) * r;
      state.camera.position.lerp(new THREE.Vector3(x, 6, z), 0.04);
      state.camera.lookAt(0, 1.5, 0);
    } else if (gameMode === 'play-active') {
      if (stage === 1) {
        // Follow player
        const px = playerPosition[0];
        const pz = playerPosition[2];
        state.camera.position.lerp(new THREE.Vector3(px, 5.0, pz + 6.5), 0.08);
        state.camera.lookAt(px, 0.8, pz);
      } else if (stage === 2) {
        // Close-up Cot 2
        state.camera.position.lerp(new THREE.Vector3(6, 1.4, -6.0), 0.08);
        state.camera.lookAt(6, 0.6, -8);
      } else if (stage === 3) {
        // Follow player in ward
        const px = playerPosition[0];
        const pz = playerPosition[2];
        state.camera.position.lerp(new THREE.Vector3(px, 5.5, pz + 7.5), 0.08);
        state.camera.lookAt(px, 0.8, pz);
      }
    } else if (gameMode === 'sandbox') {
      // Focus sandbox
      state.camera.position.lerp(new THREE.Vector3(3.0, 2.2, -1.2), 0.08);
      state.camera.lookAt(3.0, 0.6, -4);
    }
  });

  return null;
}

function GameApp() {
  const {
    gameMode,
    setGameMode,
    stage,
    setStage,
    highScores,
    score,
    lives,
    heldItem,
    sushrutaAlert
  } = useGameStore();

  const [showSettings, setShowSettings] = useState(false);
  const [completedCinematic, setCompletedCinematic] = useState(true);

  return (
    <div className="relative w-screen h-screen bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 8], fov: 50 }}>
          <CameraController />
          <World />
          
          {/* Load active 3D stage components */}
          {gameMode === 'play-active' && (
            <>
              {stage === 1 && <Stage1View />}
              {stage === 2 && <Stage2View />}
              {stage === 3 && <Stage3View />}
            </>
          )}

          {gameMode === 'sandbox' && <SandboxView />}

          {/* Load walkable player healer avatar */}
          {gameMode === 'play-active' && (stage === 1 || stage === 3) && <Player />}
        </Canvas>
      </div>

      {/* Glassmorphic UI HUD overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Floating Sushruta warning banner */}
        <AnimatePresence>
          {sushrutaAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full border border-amber/30 bg-stone-900/95 px-6 py-2.5 text-xs font-bold text-amber shadow-2xl flex items-center gap-2 pointer-events-auto"
            >
              <span>🕉️ Acharya:</span>
              <span className="text-white italic">"{sushrutaAlert}"</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP BAR HUD: Left / Right options */}
        <div className="flex justify-between items-start w-full">
          {/* Back button / Navigation */}
          {gameMode !== 'menu' && (
            <button
              type="button"
              onClick={() => {
                if (gameMode === 'play-active') setGameMode('play');
                else setGameMode('menu');
              }}
              className="rounded-full border border-stone-800 bg-stone-900/80 backdrop-blur-md px-4 py-2 text-xs font-bold text-stone-200 hover:bg-stone-850 active:scale-95 transition-all pointer-events-auto shadow-lg"
            >
              ← Exit Mode
            </button>
          )}
          <div />

          {/* Held item visualization */}
          {gameMode === 'play-active' && heldItem && (
            <div className="rounded-full bg-amber/20 border border-amber/40 backdrop-blur-md px-4 py-2 text-xs font-bold text-amber shadow-lg animate-pulse">
              ✋ Tool: {heldItem.replace('_', ' ').toUpperCase()}
            </div>
          )}
        </div>

        {/* MIDDLE CONTENT: Menu systems */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto">
          {gameMode === 'menu' && (
            /* Main Menu */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-stone-950/75 border border-stone-900 backdrop-blur-md rounded-3xl p-8 text-center max-w-sm w-full space-y-6 shadow-2xl"
            >
              <div>
                <span className="text-[10px] font-bold tracking-[0.4em] text-amber uppercase">3D Surgical Game</span>
                <h1 className="font-serif text-3xl font-extrabold tracking-widest text-stone-100 uppercase mt-1">
                  Living Lancets
                </h1>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setGameMode('play')}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber to-copper py-3.5 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
                >
                  PLAY
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('sandbox')}
                  className="w-full rounded-2xl border border-amber/20 bg-stone-900/40 py-3.5 text-xs font-bold text-amber hover:bg-stone-900/80 active:scale-95 transition-all uppercase tracking-wider"
                >
                  SANDBOX
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="w-full rounded-2xl border border-stone-800 bg-stone-900/20 py-3 text-xs font-bold text-stone-400 hover:text-stone-300 active:scale-95 transition-all uppercase tracking-wider"
                >
                  SETTINGS
                </button>
              </div>

              {/* High Score Records */}
              {(highScores.stage3MaxSaved > 0 || highScores.stage1BestTime !== null) && (
                <div className="p-3 bg-stone-950/40 border border-stone-850 rounded-xl text-left text-[10px] space-y-1 text-stone-400">
                  <p className="text-amber font-bold text-center uppercase tracking-widest border-b border-stone-850 pb-1 mb-1.5">Camp Records</p>
                  {highScores.stage1BestTime !== null && <p>⏱️ Stage 1: <span className="text-stone-200 font-bold">{highScores.stage1BestTime.toFixed(1)}s</span></p>}
                  {highScores.stage2BestTime !== null && <p>⏱️ Stage 2: <span className="text-stone-200 font-bold">{highScores.stage2BestTime.toFixed(1)}s</span></p>}
                  {highScores.stage3MaxSaved > 0 && <p>🌾 Stage 3 Survival: <span className="text-stone-200 font-bold">{highScores.stage3MaxSaved} saved</span></p>}
                  <p>🎖️ Title: <span className="text-amber font-bold">{highScores.bestRank}</span></p>
                </div>
              )}
            </motion.div>
          )}

          {gameMode === 'play' && (
            /* Free Play Selection Menu */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-stone-950/75 border border-stone-900 backdrop-blur-md rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
              <div className="text-center">
                <span className="text-[10px] font-bold text-amber uppercase tracking-wider">Play Selection</span>
                <h2 className="font-serif text-2xl font-bold text-stone-100 mt-0.5">Gurukul Clearings</h2>
              </div>

              <div className="space-y-3">
                {[
                  { id: 1, label: 'Pressure Test', desc: 'Walk WASD to pond, grab leech, apply to cot.' },
                  { id: 2, label: 'Marma Precision', desc: 'Leg closeup, rotate leg, inspect nodes via Lens.' },
                  { id: 3, label: 'Reconstruction Camp', desc: 'Dynamic triage survival, stabilize ward mats.' }
                ].map((stg) => (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => {
                      setStage(stg.id);
                      setGameMode('play-active');
                    }}
                    className="w-full rounded-2xl border border-amber/25 bg-stone-900/60 p-4 text-left hover:border-amber/60 hover:bg-stone-900/80 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-amber/60 uppercase">Mode {stg.id}</span>
                      <h4 className="font-serif text-md font-bold text-stone-200">{stg.label}</h4>
                      <p className="text-[10px] text-stone-500 font-light mt-0.5">{stg.desc}</p>
                    </div>
                    <span className="text-amber text-xs font-bold uppercase tracking-wider">ENTER</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setGameMode('menu')}
                className="w-full text-center text-xs text-stone-500 hover:text-stone-300 underline font-bold"
              >
                Return to Menu
              </button>
            </motion.div>
          )}
        </div>

        {/* BOTTOM HUD STATUS info */}
        <div className="flex justify-between items-end w-full">
          <div className="text-[9px] text-stone-600 font-semibold tracking-wider">
            Vibrant 3D ancient India healer clearing
          </div>

          {gameMode === 'play-active' && (stage === 1 || stage === 3) && (
            <div className="text-[9px] text-stone-500 bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-850">
              🎮 Movement: <span className="font-bold text-white">W A S D</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-xs w-full rounded-3xl border border-stone-800 bg-stone-900 p-6 space-y-6 text-center shadow-2xl"
            >
              <h3 className="font-serif text-lg font-bold text-amber uppercase tracking-wider">Gurukul Settings</h3>
              
              <div className="space-y-3 text-left text-xs text-stone-300">
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span>Soft Shadows rendering</span>
                  <span className="text-xs text-emerald-500 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span>3D Foliage wind breeze</span>
                  <span className="text-xs text-emerald-500 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between border-b border-stone-850 pb-2">
                  <span>Third-person camera damping</span>
                  <span className="text-xs text-emerald-500 font-bold">ACTIVE</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-full rounded-full bg-stone-800 py-2.5 text-xs font-bold text-stone-300 hover:bg-stone-700"
              >
                Close Settings
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return <GameApp />;
}
