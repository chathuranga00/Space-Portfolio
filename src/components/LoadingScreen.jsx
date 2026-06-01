import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const MESSAGES = [
  { until: 33, text: 'Initializing Space Explorer...' },
  { until: 66, text: 'Loading Assets...' },
  { until: 100, text: 'Entering Universe...' },
];

function getMessage(progress) {
  return MESSAGES.find((m) => progress <= m.until)?.text ?? MESSAGES[2].text;
}

function TwinkleStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 2,
        delay: `${Math.random() * 4}s`,
        duration: `${2 + Math.random() * 3}s`,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((star) => (
        <span
          key={star.id}
          className="loading-star absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}

function RocketIcon() {
  return (
    <div className="loading-rocket relative flex justify-center">
      <svg
        viewBox="0 0 64 96"
        className="h-24 w-16 drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]"
        aria-hidden
      >
        <path d="M32 8 L44 36 L32 32 L20 36 Z" fill="#e8ecf4" />
        <rect x="24" y="32" width="16" height="36" rx="4" fill="#c5ccd8" />
        <path d="M18 52 L8 72 L18 64 Z" fill="#a8b2c0" />
        <path d="M46 52 L56 72 L46 64 Z" fill="#a8b2c0" />
        <ellipse cx="32" cy="72" rx="10" ry="6" fill="#ff6600" opacity="0.9" />
        <ellipse cx="32" cy="78" rx="6" ry="10" fill="#ff3300" opacity="0.6" />
      </svg>
      <span className="loading-exhaust absolute bottom-0 left-1/2 h-8 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-orange-500/80 to-transparent" />
    </div>
  );
}

export default function LoadingScreen({ progress = 0, onComplete }) {
  const [visible, setVisible] = useState(true);
  const clamped = Math.min(100, Math.max(0, progress));
  const percent = Math.round(clamped);
  const statusText = getMessage(clamped);

  useEffect(() => {
    if (clamped >= 100) {
      const timer = setTimeout(() => setVisible(false), 120);
      return () => clearTimeout(timer);
    }
  }, [clamped]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loading-screen"
          className="pointer-events-auto fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050816]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
        >
          <TwinkleStars />

          <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-6">
            <RocketIcon />

            <div className="w-full space-y-3">
              <div className="h-2 overflow-hidden rounded-full border border-cyan-500/20 bg-slate-900/80">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_16px_rgba(34,211,238,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${clamped}%` }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-cyan-100/90"
                >
                  {statusText}
                </motion.p>
                <span className="font-mono font-semibold text-cyan-300 tabular-nums">
                  {percent}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
