import { useSimulation } from '../../systems/SimulationProvider';
import { realityLabels } from '../../systems/historical';

const order = ['pratyaksha', 'shastra', 'anumana'] as const;

export function RealityToggle() {
  const { realityLayer, setRealityLayer } = useSimulation();

  const currentLabel = realityLabels[realityLayer];

  return (
    <button
      type="button"
      onClick={() => {
        const nextIndex = (order.indexOf(realityLayer) + 1) % order.length;
        setRealityLayer(order[nextIndex]);
      }}
      className="inline-flex items-center justify-center rounded-full border border-copper/20 bg-copper/10 px-4 py-2 text-xs font-semibold text-copper transition hover:bg-copper/15 focus:outline-none focus:ring-2 focus:ring-copper/50"
      title="Toggle between Direct Observation, Ayurvedic Scripture, and Causal Inference perspectives"
    >
      <span className="hidden sm:inline">Disciple's Perspective:</span> {currentLabel}
    </button>
  );
}

