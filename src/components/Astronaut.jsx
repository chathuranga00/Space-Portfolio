import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const TIPS = [
  'Welcome Explorer! 🚀',
  'Click the Sun to learn about me ☀️',
  'Visit One Tap Help Planet 🌍',
  'Check My Skills Moon 🌙',
  'Contact me at the Space Station 🛸',
  'Explore the asteroid belt for fun facts! 🪨',
];

const TIPS_MOBILE = [
  'Tap the Sun to learn about me ☀️',
  'Tap planets to view projects 🌍',
  'Tap the Moon for skills 🌙',
  'Tap the Space Station to contact 🛸',
];

const ROTATE_MS = 4000;

function AstronautAvatar({ compact }) {
  return (
    <svg
      viewBox="0 0 80 100"
      className={
        compact
          ? 'h-12 w-10 drop-shadow-[0_0_8px_rgba(0,229,255,0.35)]'
          : 'h-20 w-16 drop-shadow-[0_0_12px_rgba(0,229,255,0.35)]'
      }
      aria-hidden
    >
      <ellipse cx="40" cy="28" rx="22" ry="24" fill="#e8ecf4" />
      <ellipse cx="40" cy="28" rx="18" ry="20" fill="#1a2a3a" opacity="0.85" />
      <ellipse cx="33" cy="26" rx="4" ry="5" fill="#00e5ff" opacity="0.9" />
      <ellipse cx="47" cy="26" rx="4" ry="5" fill="#00e5ff" opacity="0.9" />
      <rect x="28" y="48" width="24" height="32" rx="6" fill="#c5ccd8" />
      <rect x="22" y="52" width="10" height="22" rx="4" fill="#a8b2c0" />
      <rect x="48" y="52" width="10" height="22" rx="4" fill="#a8b2c0" />
      <rect x="32" y="78" width="8" height="16" rx="3" fill="#909aa8" />
      <rect x="40" y="78" width="8" height="16" rx="3" fill="#909aa8" />
      <circle cx="40" cy="18" r="3" fill="#00e5ff" />
    </svg>
  );
}

export default function Astronaut({
  isMobile = false,
  hidden = false,
  onInteract,
}) {
  const tips = isMobile ? TIPS_MOBILE : TIPS;
  const [tipIndex, setTipIndex] = useState(0);
  const [expanded, setExpanded] = useState(!isMobile);

  useEffect(() => {
    if (hidden) return undefined;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [hidden, tips.length]);

  if (hidden) return null;

  const handleInteract = () => {
    onInteract?.();
    if (isMobile) {
      setExpanded(false);
    }
  };

  return (
    <div
      className={`pointer-events-none fixed z-[80] flex flex-col gap-3 ${
        isMobile
          ? 'bottom-4 left-4 items-start'
          : 'bottom-6 right-6 items-end'
      }`}
    >
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="bubble-shell"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`pointer-events-auto relative rounded-2xl border border-cyan-400/45 bg-slate-950/75 px-3 py-2 text-left shadow-lg shadow-cyan-500/15 backdrop-blur-md ${
              isMobile ? 'max-w-[200px]' : 'max-w-[260px] px-4 py-3'
            }`}
          >
            {!isMobile && (
              <div
                className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-cyan-400/45 bg-slate-950/75"
                aria-hidden
              />
            )}
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className={`leading-snug font-medium text-cyan-50 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}
              >
                {tips[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleInteract();
          if (!isMobile) setExpanded((prev) => !prev);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-expanded={expanded}
        aria-label={expanded ? 'Hide assistant tips' : 'Show assistant tips'}
        className={`pointer-events-auto relative z-10 flex cursor-pointer flex-col items-center rounded-2xl border border-cyan-400/40 bg-slate-950/60 backdrop-blur-md transition-colors hover:border-cyan-300/70 hover:bg-slate-900/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 ${
          isMobile ? 'gap-0.5 p-2' : 'gap-1 p-3'
        }`}
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <AstronautAvatar compact={isMobile} />
        {!isMobile && (
          <span className="text-[10px] font-semibold tracking-widest text-cyan-400/90 uppercase">
            Guide
          </span>
        )}
      </motion.button>
    </div>
  );
}
