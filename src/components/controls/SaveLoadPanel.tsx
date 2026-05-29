import { useState } from 'react';
import { useSimulation } from '../../systems/SimulationProvider';

export function SaveLoadPanel() {
  const { saveState, loadState, history } = useSimulation();
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col gap-2 rounded-[24px] border border-amber/15 bg-white/80 p-2.5 shadow-parchment sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => {
          saveState();
          setMessage('Manuscript recorded.');
          window.setTimeout(() => setMessage(''), 2200);
        }}
        className="rounded-[18px] bg-gradient-to-r from-amber to-copper px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95 shadow-sm"
      >
        Save Record
      </button>
      <button
        type="button"
        onClick={() => {
          loadState();
          setMessage('Manuscript unrolled.');
          window.setTimeout(() => setMessage(''), 2200);
        }}
        className="rounded-[18px] border border-indigo/10 bg-parchment/50 px-4 py-2 text-xs font-semibold text-indigo transition-all hover:bg-indigo/5 active:scale-95"
      >
        Load Record
      </button>
      <span className="text-xs text-indigo/70 font-semibold px-2">
        Records: {history.length}
      </span>
      {message && <span className="text-xs text-copper font-bold animate-pulse">{message}</span>}
    </div>
  );
}

