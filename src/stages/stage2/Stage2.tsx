import { useMemo, useState } from 'react';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';
import { MarmaPoint } from '../../types/simulation';

const marmaPoints: MarmaPoint[] = [
  { id: 'm1', name: 'Janu', dangerLevel: 3, radius: 20, effect: 'knee nerve junction', visible: true },
  { id: 'm2', name: 'Manya', dangerLevel: 4, radius: 18, effect: 'neck vessel cluster', visible: false },
  { id: 'm3', name: 'Sira', dangerLevel: 5, radius: 30, effect: 'deep vessel line', visible: true }
];

const fragment = manuscriptFragments.find((item) => item.id === 'stage2-marma');

export default function Stage2() {
  const { realityLayer, updateScroll, updateConsequences, addHistory } = useSimulation();
  const [showOverlay, setShowOverlay] = useState(true);
  const [placementZone, setPlacementZone] = useState<number | null>(null);
  const [result, setResult] = useState('Drag the leech into the swelling while avoiding critical marma points.');
  const [completed, setCompleted] = useState(false);

  const activeFragment = fragment ? fragment[realityLayer] : '';

  const zones = useMemo(
    () => [
      { id: 1, label: 'safe', description: 'inner swelling ring' },
      { id: 2, label: 'danger', description: 'near vital marma' },
      { id: 3, label: 'border', description: 'outer edge of swelling' },
      { id: 4, label: 'safe', description: 'swelling center' },
      { id: 5, label: 'danger', description: 'crossing vessel line' },
      { id: 6, label: 'safe', description: 'superficial tissue area' },
      { id: 7, label: 'danger', description: 'joint intersection' },
      { id: 8, label: 'safe', description: 'soft flank region' },
      { id: 9, label: 'border', description: 'near muscle edge' }
    ],
    []
  );

  function handlePlace(zoneId: number) {
    if (completed) return;
    setPlacementZone(zoneId);
    const zone = zones.find((item) => item.id === zoneId);
    if (!zone) return;

    const isDanger = zone.label === 'danger';
    const isBorder = zone.label === 'border';

    if (isDanger) {
      setResult('Placement struck a marma zone, causing nerve damage and heavy bleeding.');
      updateConsequences({ inflammation: 14, bloodLoss: 16, pain: 12, permanentDamage: 9, trust: -10 });
      updateScroll({ ethics: -4, surgicalControl: -3 });
      addHistory('Stage 2: marma strike during placement.');
    } else if (isBorder) {
      setResult('Placement was marginal. The wound is managed but recovery is slower.');
      updateConsequences({ inflammation: 6, recovery: 4, trust: -3 });
      updateScroll({ precision: 2 });
      addHistory('Stage 2: marginal placement, patient recovery slowed.');
    } else {
      setResult('Safe placement within the swelling zone. The patient responds well to the leech.');
      updateConsequences({ inflammation: -14, bloodLoss: -6, recovery: 10, trust: 6 });
      updateScroll({ observation: 5, precision: 5, surgicalControl: 4 });
      addHistory('Stage 2: correct marma-safe placement.');
    }
    setCompleted(true);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_0.5fr]">
      <section className="rounded-3xl border border-indigo/10 bg-parchment/80 p-5 shadow-parchment">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-indigo">The Grid Precision</h3>
            <p className="text-sm leading-6 text-indigo/75">
              Use the marma overlay to place the leech without striking vital points. Spatial reasoning and careful observation are required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOverlay((value) => !value)}
            className="rounded-full border border-indigo/10 bg-white/90 px-3 py-2 text-sm font-semibold text-indigo transition hover:bg-indigo/5"
          >
            {showOverlay ? 'Hide' : 'Show'} Marma Overlay
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-indigo/10 bg-white/90 p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-amber/10 via-parchment to-white">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-44 w-44 rounded-full bg-amber/10 ring-4 ring-amber/20" />
                <div className="pointer-events-none absolute h-6 w-6 rounded-full bg-copper/30" style={{ top: '40%', left: '46%' }} />
              </div>
              {showOverlay && (
                <div className="absolute inset-0">
                  {marmaPoints.map((point, index) => (
                    <div
                      key={point.id}
                      className="absolute rounded-full border border-danger/60 bg-danger/10"
                      style={{ width: `${point.radius}px`, height: `${point.radius}px`, top: `${10 + index * 18}%`, left: `${12 + index * 22}%` }}
                    />
                  ))}
                </div>
              )}
              {placementZone && (
                <div className="absolute left-[40%] top-[45%] flex h-12 w-12 items-center justify-center rounded-full bg-herbal/20 text-xs font-semibold text-herbal">
                  placed
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <PlacementCell zone={zones[0]} onPlace={handlePlace} selectedZone={placementZone} />
              <PlacementCell zone={zones[1]} onPlace={handlePlace} selectedZone={placementZone} />
              <PlacementCell zone={zones[2]} onPlace={handlePlace} selectedZone={placementZone} />
              <PlacementCell zone={zones[3]} onPlace={handlePlace} selectedZone={placementZone} />
            </div>
            <div className="rounded-3xl bg-indigo/5 p-4 text-sm text-indigo/80">
              <p className="font-semibold">Placement guidance</p>
              <p className="mt-2">Safe zones appear within swelling. Too close to marma points creates permanent damage or heavy bleeding.</p>
            </div>
          </div>
        </div>
      </section>
      <aside className="space-y-4 rounded-3xl border border-indigo/10 bg-white/90 p-5 shadow-parchment">
        <div className="rounded-3xl bg-parchment/95 p-4">
          <p className="text-sm uppercase tracking-[0.35em] text-amber">Result</p>
          <p className="mt-3 text-sm leading-6 text-indigo/80">{result}</p>
        </div>
        <div className="rounded-3xl bg-indigo/5 p-4">
          <p className="text-sm font-semibold text-indigo">Manuscript fragment</p>
          <p className="mt-3 text-sm leading-6 text-indigo/80">{activeFragment}</p>
        </div>
      </aside>
    </div>
  );
}

function PlacementCell({
  zone,
  onPlace,
  selectedZone
}: {
  zone: { id: number; label: string; description: string };
  onPlace: (zoneId: number) => void;
  selectedZone: number | null;
}) {
  return (
    <button
      type="button"
      onClick={() => onPlace(zone.id)}
      className={`rounded-3xl border p-4 text-left transition ${
        selectedZone === zone.id ? 'border-herbal bg-herbal/10' : 'border-indigo/10 bg-white/80 hover:border-indigo/80'
      }`}
    >
      <p className="font-semibold text-indigo">Zone {zone.id}</p>
      <p className="mt-2 text-sm text-indigo/70">{zone.description}</p>
    </button>
  );
}
