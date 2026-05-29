import { useState } from 'react';
import { useSimulation } from '../../systems/SimulationProvider';

export function SaveLoadPanel() {
  const { saveState, loadState, history } = useSimulation();
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-indigo/10 bg-white/80 p-3 shadow-parchment sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => {
          saveState();
          setMessage('Saved locally.');
          window.setTimeout(() => setMessage(''), 2200);
        }}
        className="rounded-3xl bg-indigo px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo/80"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          loadState();
          setMessage('Loaded saved progress.');
          window.setTimeout(() => setMessage(''), 2200);
        }}
        className="rounded-3xl border border-indigo/10 bg-parchment px-4 py-2 text-sm font-semibold text-indigo transition hover:bg-indigo/5"
      >
        Load
      </button>
      <span className="text-sm text-indigo/70">History entries: {history.length}</span>
      {message && <span className="text-sm text-amber">{message}</span>}
    </div>
  );
}
