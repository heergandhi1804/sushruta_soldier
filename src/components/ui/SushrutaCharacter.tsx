import { motion } from 'framer-motion';
import { useSimulation } from '../../systems/SimulationProvider';

export function SushrutaCharacter() {
  const { sushrutaDialogue, timeOfDay } = useSimulation();

  const expressionColors = {
    calm: 'border-amber/30 text-amber bg-amber/5',
    thoughtful: 'border-indigo/30 text-indigo bg-indigo/5',
    concerned: 'border-danger/30 text-danger bg-danger/5',
    approving: 'border-herbal/30 text-herbal bg-herbal/5',
    storytelling: 'border-copper/30 text-copper bg-copper/5'
  };

  const expressionLabels = {
    calm: 'Peaceful Mind (Shanta)',
    thoughtful: 'Contemplation (Vichara)',
    concerned: 'Compassion (Karuna)',
    approving: 'Contentment (Santosha)',
    storytelling: 'Scriptural Wisdom (Shastra-Katha)'
  };

  // Dynamic lamp positioning or lighting based on time of day
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-indigo/15 bg-white/80 p-5 shadow-parchment backdrop-blur-sm">
      {/* Decorative background grid resembling woven cotton threads */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#2b2c63_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start relative z-10">
        {/* Acharya Icon & Lamp */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] border border-copper/30 bg-gradient-to-tr from-amber/15 via-parchment to-white text-3xl shadow-md">
            🕉️
            {/* Flickering Oil Lamp next to the Acharya */}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-amber bg-amber-950 shadow-inner">
              <motion.div
                animate={{
                  scale: [1, 1.25, 0.9, 1.15, 1],
                  opacity: [0.8, 1, 0.7, 0.95, 0.8]
                }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="h-2 w-2 rounded-full bg-amber-400 blur-[1px]"
              />
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo/60">
            {timeOfDay}
          </span>
        </div>

        {/* Dialogue details */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-serif text-lg font-bold text-indigo tracking-wide">
              {sushrutaDialogue.speaker}
            </h4>
            <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${expressionColors[sushrutaDialogue.expression]}`}>
              {expressionLabels[sushrutaDialogue.expression]}
            </span>
          </div>

          <p className="text-sm leading-6 text-indigo/85 italic font-light relative pl-4 border-l border-amber/30">
            "{sushrutaDialogue.text}"
          </p>
        </div>
      </div>

      {/* Dynamic lamp smoke visualization in high details */}
      {isNight && (
        <div className="absolute right-4 top-2 pointer-events-none opacity-20">
          <motion.div
            animate={{
              y: [-10, -50],
              x: [0, 10, -10, 0],
              opacity: [0.6, 0]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeOut' }}
            className="w-1.5 h-6 bg-slate-400 rounded-full blur-[2px]"
          />
        </div>
      )}
    </div>
  );
}
