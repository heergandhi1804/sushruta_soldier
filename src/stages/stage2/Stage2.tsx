import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';
import { manuscriptFragments } from '../../systems/historical';
import { MarmaPoint } from '../../types/simulation';

const marmaPoints: MarmaPoint[] = [
  { id: 'm1', name: 'Janu Marma (Joint)', dangerLevel: 4, radius: 25, effect: 'Severe pain, knee joint immobility', visible: true },
  { id: 'm2', name: 'Manya Marma (Neck Vessels)', dangerLevel: 5, radius: 20, effect: 'Loss of voice, thready pulse', visible: false },
  { id: 'm3', name: 'Sira Marma (Vessel Line)', dangerLevel: 5, radius: 30, effect: 'Excessive bleeding, cold extremities', visible: true }
];

const fragment = manuscriptFragments.find((item) => item.id === 'stage2-marma');

export default function Stage2() {
  const { realityLayer, updateScroll, updateConsequences, addHistory, setSushrutaDialogue } = useSimulation();
  const [showOverlay, setShowOverlay] = useState(true);
  const [placementZone, setPlacementZone] = useState<number | null>(null);
  const [result, setResult] = useState('Study the glowing Marma nodes on the scroll drawing. Place the leech by selecting one of the tissue zones.');
  const [completed, setCompleted] = useState(false);

  const activeFragment = fragment ? fragment[realityLayer] : '';

  const zones = useMemo(
    () => [
      { id: 1, label: 'safe', description: 'Inner Swelling Ring (Safe tissue)' },
      { id: 2, label: 'danger', description: 'Near Joint Marma (Vulnerable Nerve)' },
      { id: 3, label: 'border', description: 'Outer Swelling Edge (Muscle margin)' },
      { id: 4, label: 'safe', description: 'Swelling Center (Clean flesh)' },
      { id: 5, label: 'danger', description: 'Crossing Deep Vessel Line (Sira Marma)' },
      { id: 6, label: 'safe', description: 'Superficial Soft Tissue (Safe zone)' },
      { id: 7, label: 'danger', description: 'Joint Intersection (Janu Marma)' },
      { id: 8, label: 'safe', description: 'Soft Flank Region (Safe muscle)' }
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
      setResult('Placement struck a vital Marma point! Impure blood was not resolved, the nerve was irritated, and the warrior bled excessively.');
      updateConsequences({ inflammation: 12, bloodLoss: 20, pain: 15, permanentDamage: 10, trust: -12 });
      updateScroll({ surgicalControl: -4, ethics: -4 });
      addHistory('Stage 2: Struck vital Marma node during placement.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'Stop! You have punctured the vital energy line. Notice how the blood gushes in spurts. The Marma points are sacred junctions—never place tools blindly!',
        expression: 'concerned'
      });
    } else if (isBorder) {
      setResult('Placement was borderline. The leech is extracting blood, but it is on the tough muscle boundary. Drainage is slow and uncomfortable.');
      updateConsequences({ inflammation: 4, recovery: 5, trust: -2 });
      updateScroll({ precision: 4 });
      addHistory('Stage 2: Placed leech on marginal outer edge.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'The leech is attached, but on the outer border. The flow of stagnant blood is slow because you avoided the core swelling. Still, you avoided the Marma. Competent, but not perfect.',
        expression: 'thoughtful'
      });
    } else {
      setResult('Safe placement! The leech settled comfortably in the soft center of the swelling, bypassing the Marma nodes. The warrior felt immediate relief.');
      updateConsequences({ inflammation: -20, bloodLoss: -5, recovery: 15, trust: 10 });
      updateScroll({ observation: 6, precision: 8, surgicalControl: 6 });
      addHistory('Stage 2: Safe placement avoiding Marma pathways.');
      setSushrutaDialogue({
        speaker: 'Acharya Sushruta',
        text: 'A clean, precise placement! You kept the leech on the soft tissue, far from the Janu and Sira junctions. The warrior\'s knee is saved.',
        expression: 'approving'
      });
    }
    setCompleted(true);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      {/* Anatomy Scroll Grid */}
      <section className="rounded-[32px] border border-amber/15 bg-white/70 p-6 shadow-parchment">
        <div className="flex flex-col gap-4 border-b border-indigo/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Chapter 2</span>
            <h3 className="font-serif text-2xl font-bold text-indigo">Grid Precision & Marma Vidya</h3>
            <p className="mt-1 text-sm text-indigo/70">
              A veteran warrior of Kashi presents swelling near his knee joint. Identify the Marma points on the anatomical chart and place the leech safely.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOverlay((v) => !v)}
            className="rounded-full border border-copper/30 bg-parchment/60 px-4 py-2 text-xs font-semibold text-copper transition-all hover:bg-copper/10 active:scale-95"
          >
            {showOverlay ? 'Conceal' : 'Reveal'} Marma Overlay
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {/* Historical Body Scroll drawing */}
          <div className="rounded-[24px] border border-amber/20 bg-gradient-to-br from-amber-100/40 via-parchment/60 to-amber-200/20 p-4 relative overflow-hidden shadow-inner flex flex-col items-center">
            {/* Parchment background detail */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b36b32_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

            <div className="relative w-full max-w-[280px] aspect-[3/4] border border-amber-900/10 rounded-2xl bg-white/50 p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo/60 text-center block">
                Sanskrit Sharira Scroll
              </span>
              
              {/* Glowing Body Skeleton and Paths representation */}
              <div className="relative flex-1 flex items-center justify-center my-4 border border-indigo/5 bg-parchment/20 rounded-xl overflow-hidden">
                {/* Joint Visual Representation */}
                <div className="w-16 h-16 rounded-full border-2 border-indigo/20 border-dashed animate-spin absolute" />
                <div className="w-4 h-4 bg-indigo/30 rounded-full" />

                {/* Glowing nerve pathways */}
                {showOverlay && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Glowing golden threads */}
                    <svg className="w-full h-full stroke-orange-500 opacity-60 fill-none stroke-[2px]">
                      <path d="M 50,20 L 100,80 L 150,150 L 100,220" className="animate-pulse" />
                      <path d="M 200,40 L 120,110 L 80,180" className="animate-pulse" />
                    </svg>

                    {marmaPoints.map((point, index) => (
                      <motion.div
                        key={point.id}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
                        transition={{ repeat: Infinity, duration: 2 + index }}
                        className="absolute rounded-full border border-danger bg-danger/25 flex items-center justify-center text-[8px] font-bold text-danger"
                        style={{
                          width: `${point.radius * 2.2}px`,
                          height: `${point.radius * 2.2}px`,
                          top: `${25 + index * 20}%`,
                          left: `${20 + index * 18}%`
                        }}
                      >
                        <span className="bg-white/80 px-1 py-0.5 rounded border border-danger/20">
                          {point.name.split(' ')[0]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {placementZone && (
                  <div className="absolute bg-herbal/90 border border-white text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Leech Applied
                  </div>
                )}
              </div>

              <span className="text-[9px] italic text-indigo/50 text-center block">
                Janu-Sira Vascular Mapping
              </span>
            </div>
          </div>

          {/* Zones Selector list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-indigo uppercase tracking-wider">Select Placement Zone</h4>
            <div className="grid gap-3 overflow-y-auto max-h-[300px] pr-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handlePlace(zone.id)}
                  disabled={completed}
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    placementZone === zone.id
                      ? zone.label === 'danger'
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-herbal bg-herbal/10 text-herbal'
                      : 'border-indigo/10 bg-white/90 hover:border-amber/40'
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-indigo text-sm">Zone {zone.id}</span>
                    {placementZone === zone.id && (
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {zone.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-indigo/70">{zone.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tutors & Epistemology Panels */}
      <aside className="space-y-6">
        {/* Causal Outcome */}
        <div className="rounded-[32px] border border-amber/15 bg-amber-50/50 p-5 shadow-parchment">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Causal Results</span>
          <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/5 pb-2">Placement Effect</h4>
          <p className="mt-3 text-sm leading-6 text-indigo/80">
            {result}
          </p>
        </div>

        {/* Epistemological Shastra scroll */}
        <div className="rounded-[32px] border border-indigo/15 bg-parchment-scroll p-6 shadow-parchment relative">
          <div className="absolute top-0 bottom-0 left-4 w-[1px] bg-amber-700/10" />
          <div className="pl-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber">Epistemological Source</span>
            <h4 className="font-serif text-lg font-bold text-indigo mt-1 border-b border-indigo/10 pb-2">
              Manuscript Fragment
            </h4>
            <p className="mt-4 text-sm leading-7 text-indigo/80 italic font-light">
              {activeFragment}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
