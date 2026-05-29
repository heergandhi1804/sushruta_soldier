import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicSequenceProps {
  onComplete: () => void;
}

export function CinematicSequence({ onComplete }: CinematicSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Dawn on the Ganga",
      description: "The morning mist rises over the river Ganga in ancient Kashi. Temple bells echo through the trees as the first rays of sunlight illuminate the stone steps. You have traveled for months to reach the gates of the valley's greatest physician.",
      bg: "from-amber-950/80 via-amber-900/60 to-amber-950/90",
      accent: "🌅"
    },
    {
      title: "The Gurukul Gates",
      description: "In the courtyard, you see palm leaf manuscripts drying in the sun, copper plates engraved with anatomical drawings, and students preparing clay pots of medicinal oils. The air is thick with the scent of burning incense, vacha, and holy basil.",
      bg: "from-orange-950/80 via-orange-900/60 to-orange-950/90",
      accent: "🌿"
    },
    {
      title: "Before the Acharya",
      description: "Acharya Sushruta stands in the shadow of a banyan tree, observing a student clean a copper lancet. His eyes are calm, yet sharp. He senses your presence and turns to you, gesturing toward the garden of medicinal herbs.",
      bg: "from-indigo-950/85 via-indigo-900/65 to-indigo-950/95",
      accent: "🕉️"
    },
    {
      title: "The Acharya's Welcome",
      description: '"Knowledge without observation is blind, and hands without training are dangerous. A surgeon must possess the courage of a lion, the precision of a hawk, and the touch of a gentle leaf. Are you prepared to learn the art of Salya-Tantra (surgery)?"',
      bg: "from-amber-950/90 via-copper-950/70 to-amber-950/95",
      accent: "✨"
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,122,30,0.15),transparent_60%)] animate-pulse" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(179,107,50,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(179,107,50,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.8 }}
          className={`relative mx-4 flex max-w-2xl flex-col items-center rounded-[32px] border border-amber/20 bg-gradient-to-b ${current.bg} p-8 text-center shadow-2xl backdrop-blur-md md:p-12`}
        >
          {/* Animated Oil Lamp / Flame effect */}
          <div className="absolute -top-10 flex h-20 w-20 items-center justify-center rounded-full border border-amber/30 bg-amber-950/90 text-4xl shadow-xl shadow-amber/10">
            <motion.div
              animate={{
                scale: [1, 1.15, 0.95, 1.1, 1],
                filter: ["drop-shadow(0 0 4px #C07A1E)", "drop-shadow(0 0 10px #B36B32)", "drop-shadow(0 0 4px #C07A1E)"]
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              {current.accent}
            </motion.div>
          </div>

          <span className="mt-4 text-xs font-semibold uppercase tracking-[0.4em] text-amber">
            Chapter {currentStep + 1} of 4 • Arrival
          </span>

          <h2 className="mt-4 text-3xl font-serif font-bold text-parchment leading-tight md:text-4xl">
            {current.title}
          </h2>

          <p className="mt-6 text-base leading-8 text-parchment/90 md:text-lg font-light">
            {current.description}
          </p>

          <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="relative overflow-hidden rounded-full bg-gradient-to-r from-amber to-copper px-8 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-amber/25"
              >
                Proceed into Courtyard
              </button>
            ) : (
              <motion.button
                initial={{ scale: 0.95 }}
                animate={{ scale: [0.95, 1.03, 0.95] }}
                transition={{ repeat: Infinity, duration: 2 }}
                type="button"
                onClick={onComplete}
                className="rounded-full bg-gradient-to-r from-herbal to-emerald-700 px-10 py-4 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-herbal/30"
              >
                Bow to the Acharya & Take the Oath
              </motion.button>
            )}
          </div>

          {/* Incense / Smoke particle effects */}
          <div className="absolute bottom-4 flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-amber/40 animate-ping" />
            <div className="h-1.5 w-1.5 rounded-full bg-amber/20" />
            <div className="h-1.5 w-1.5 rounded-full bg-amber/20" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
