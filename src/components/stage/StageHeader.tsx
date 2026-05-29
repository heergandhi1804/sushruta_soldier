import { motion } from 'framer-motion';

export function StageHeader({ title, stage }: { title: string; stage: number }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-indigo/10 bg-parchment/90 p-5 shadow-parchment sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-amber">Stage {stage}</p>
        <h2 className="mt-1 text-2xl font-semibold text-indigo">{title}</h2>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-indigo/5 px-4 py-2 text-sm text-indigo"
      >
        Interactive learning through observation, systems, and decision chains.
      </motion.div>
    </div>
  );
}
