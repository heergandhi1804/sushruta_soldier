import { motion } from 'framer-motion';

export function StageHeader({ title, stage }: { title: string; stage: number }) {
  const chapterNames = [
    'First Lesson: The Selection & Application of Jalauka (Leech)',
    'Second Lesson: Marma Vidya (Vascular and Nerve Pathways)',
    'Third Lesson: Salya-Tantra (Triage & Surgery in Emergency)',
    'Fourth Lesson: Forging of Yantras (Surgical Instruments)'
  ];

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-[32px] border border-amber/15 bg-parchment/90 p-5 shadow-parchment sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-amber">
          Chapter {stage} of the Shastra
        </p>
        <h2 className="mt-1 font-serif text-xl font-bold text-indigo leading-tight">
          {title}
        </h2>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-indigo/5 bg-indigo/5 px-4 py-2 text-xs font-light text-indigo/80"
      >
        {chapterNames[stage - 1] ?? 'Interactive learning through observation.'}
      </motion.div>
    </div>
  );
}

