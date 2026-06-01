import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import aboutDefaults from '../data/about';
import skillsDefaults from '../data/skills';
import contactDefaults from '../data/contact';

const PANEL_MOTION_DESKTOP = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 28, stiffness: 260 },
  },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
};

const PANEL_MOTION_MOBILE = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', damping: 30, stiffness: 280 },
  },
  exit: { y: '100%', opacity: 0, transition: { duration: 0.28 } },
};

const SKILL_TABS = [
  { label: 'Frontend', key: 'frontend' },
  { label: 'Backend', key: 'backend' },
  { label: 'Programming', key: 'programming' },
  { label: '3D', key: 'threeD' },
];

function CloseButton({ onClose, isMobile }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      aria-label="Close panel"
      className={`pointer-events-auto absolute top-4 right-4 z-20 flex cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-red-400/60 hover:bg-red-500/20 hover:text-red-400 hover:shadow-[0_0_16px_rgba(248,113,113,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 ${
        isMobile ? 'h-12 w-12 text-2xl' : 'h-9 w-9 text-lg'
      }`}
    >
      ×
    </button>
  );
}

function AboutContent({ data, isMobile }) {
  const content = { ...aboutDefaults, ...data };

  return (
    <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-cyan-400/70 bg-gradient-to-br from-slate-700 to-slate-900 shadow-[0_0_24px_rgba(0,229,255,0.25)]">
        <div className="flex h-full w-full items-center justify-center text-4xl text-slate-500">
          👨‍🚀
        </div>
      </div>

      <div>
        <h2 className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          {content.name}
        </h2>
        <p className="mt-2 text-sm font-medium text-cyan-200/80">{content.title}</p>
      </div>

      <p className="text-sm leading-relaxed text-slate-300/90">{content.bio}</p>

      <a
        href={content.resumeUrl}
        className={`inline-flex rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50 hover:brightness-110 ${
          isMobile ? 'min-h-[48px] items-center text-base' : 'text-sm'
        }`}
      >
        Download Resume
      </a>
    </div>
  );
}

function ProjectContent({ data, isMobile }) {
  const linkClass = isMobile
    ? 'min-h-[48px] items-center text-base'
    : 'text-sm';

  if (!data) {
    return (
      <p className="text-sm text-slate-400">Select a project to view details.</p>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-cyan-50">{data.title}</h2>
      <p className="text-sm leading-relaxed text-slate-300/90">{data.description}</p>

      <div className="flex flex-wrap gap-2">
        {data.tech?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        {data.features?.map((feature) => (
          <li
            key={feature}
            className="flex gap-2 text-sm text-slate-300/90"
          >
            <span className="text-emerald-400">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href={data.github}
          target="_blank"
          rel="noreferrer"
          className={`flex flex-1 justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-center font-semibold text-cyan-100 transition hover:bg-cyan-500/20 ${linkClass}`}
        >
          GitHub
        </a>
        <a
          href={data.demo}
          target="_blank"
          rel="noreferrer"
          className={`flex flex-1 justify-center rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2.5 text-center font-semibold text-white shadow-md shadow-blue-500/25 transition hover:brightness-110 ${linkClass}`}
        >
          Live Demo
        </a>
      </div>
    </div>
  );
}

function SkillBar({ name, percent, delay }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-200">{name}</span>
        <span className="text-cyan-300/90">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function SkillsContent({ data, isMobile }) {
  const skillMap = { ...skillsDefaults, ...data };
  const [activeTabKey, setActiveTabKey] = useState('frontend');
  const skills = skillMap[activeTabKey] ?? [];

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-cyan-50">Skills</h2>

      <div className="flex flex-wrap gap-2">
        {SKILL_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTabKey(tab.key)}
            className={`pointer-events-auto cursor-pointer rounded-full font-semibold transition ${
              isMobile ? 'min-h-[44px] px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
            } ${
              activeTabKey === tab.key
                ? 'border border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4" key={activeTabKey}>
        {skills.map((skill, i) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            percent={skill.level ?? skill.percent ?? 0}
            delay={i * 0.08}
          />
        ))}
      </div>
    </div>
  );
}

const SOCIAL_ICONS = {
  email: '✉️',
  github: '🐙',
  linkedin: '💼',
  whatsapp: '💬',
};

function ContactContent({ data, isMobile, btnClass = '' }) {
  const links = { ...contactDefaults, ...data };
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const socialItems = [
    { key: 'email', label: 'Email', href: links.email },
    { key: 'github', label: 'GitHub', href: links.github },
    { key: 'linkedin', label: 'LinkedIn', href: links.linkedin },
    { key: 'whatsapp', label: 'WhatsApp', href: links.whatsapp },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-50">Contact</h2>

      <div className="grid grid-cols-2 gap-3">
        {socialItems.map(({ key, label, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-white/5 px-3 text-slate-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 ${
              isMobile ? 'min-h-[48px] py-3 text-base' : 'py-2.5 text-sm'
            }`}
          >
            <span className="text-lg">{SOCIAL_ICONS[key]}</span>
            {label}
          </a>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={`w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 text-slate-100 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 ${
              isMobile ? 'min-h-[48px] py-3 text-base' : 'py-2 text-sm'
            }`}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={`w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 text-slate-100 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 ${
              isMobile ? 'min-h-[48px] py-3 text-base' : 'py-2 text-sm'
            }`}
            placeholder="you@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">
            Message
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
            className={`w-full resize-none rounded-lg border border-white/10 bg-slate-900/60 px-3 text-slate-100 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 ${
              isMobile ? 'py-3 text-base' : 'py-2 text-sm'
            }`}
            placeholder="Say hello..."
          />
        </div>
        <button
          type="submit"
          className={`pointer-events-auto w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:shadow-[0_0_24px_rgba(34,211,238,0.45)] hover:brightness-110 ${btnClass || 'py-2.5 text-sm'}`}
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

function PanelBody({ type, data, isMobile }) {
  const btnClass = isMobile ? 'min-h-[48px] text-base' : '';

  switch (type) {
    case 'about':
      return <AboutContent data={data} isMobile={isMobile} />;
    case 'project':
      return <ProjectContent data={data} isMobile={isMobile} />;
    case 'skills':
      return <SkillsContent data={data} isMobile={isMobile} />;
    case 'contact':
      return <ContactContent data={data} isMobile={isMobile} btnClass={btnClass} />;
    default:
      return null;
  }
}

export default function InfoPanel({ isOpen, onClose, type, data, isMobile = false }) {
  const panelMotion = isMobile ? PANEL_MOTION_MOBILE : PANEL_MOTION_DESKTOP;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close panel backdrop"
            className="pointer-events-auto fixed inset-0 z-[60] cursor-pointer bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            className={`pointer-events-auto fixed z-[70] flex flex-col bg-[rgba(5,8,22,0.85)] backdrop-blur-[20px] ${
              isMobile
                ? 'inset-x-0 bottom-0 top-auto h-[92vh] w-full rounded-t-2xl border-t border-[rgba(79,156,249,0.3)] shadow-[0_-8px_40px_rgba(79,156,249,0.15)]'
                : 'top-0 right-0 h-full w-full max-w-md border-l border-[rgba(79,156,249,0.3)] shadow-[-8px_0_40px_rgba(79,156,249,0.15),0_0_60px_rgba(0,229,255,0.08)]'
            }`}
            variants={panelMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <CloseButton onClose={onClose} isMobile={isMobile} />

            <div
              className={`flex-1 overflow-y-auto pt-14 pb-8 ${
                isMobile ? 'px-5 pb-10' : 'px-6'
              }`}
            >
              <PanelBody type={type} data={data} isMobile={isMobile} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
