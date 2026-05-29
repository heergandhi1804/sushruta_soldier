import { useSimulation } from '../../systems/SimulationProvider';
import { realityLabels } from '../../systems/historical';

const order = ['history', 'ayurveda', 'simulation'] as const;

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
      className="inline-flex items-center justify-center rounded-full border border-copper/20 bg-copper/10 px-4 py-2 text-sm font-semibold text-copper transition hover:bg-copper/15 focus:outline-none focus:ring-2 focus:ring-copper/50"
    >
      <span className="hidden sm:inline">Reality Layer:</span> {currentLabel}
    </button>
  );
}
