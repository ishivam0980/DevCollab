'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const devs = [
  { name: 'Shivam', role: 'Full Stack', skills: ['React', 'Node', 'PostgreSQL'], match: 96, avatar: 'Shivam', color: '#22d3ee' },
  { name: 'Arushi', role: 'ML Engineer', skills: ['Python', 'PyTorch', 'AWS'], match: 92, avatar: 'Arushi', color: '#a78bfa' },
  { name: 'Zayn', role: 'DevOps Lead', skills: ['Go', 'K8s', 'Terraform'], match: 89, avatar: 'Zayn', color: '#fbbf24' },
  { name: 'Rohan', role: 'Frontend Dev', skills: ['Vue', 'TS', 'Tailwind'], match: 94, avatar: 'Rohan', color: '#60a5fa' },
  { name: 'Neha', role: 'Mobile Dev', skills: ['Flutter', 'Dart', 'Firebase'], match: 87, avatar: 'Neha', color: '#f472b6' },
  { name: 'Aman', role: 'Backend Dev', skills: ['Rust', 'Kafka', 'Redis'], match: 91, avatar: 'Aman', color: '#4ade80' },
];

const steps = [
  { num: '01', title: 'Create Profile', desc: 'Add your stack, GitHub, and what you want to build.', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  { num: '02', title: 'Discover', desc: 'Browse projects or post your idea. Filter by tech & timezone.', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
  { num: '03', title: 'Collaborate', desc: 'Match with devs, jump into workspace, ship together.', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
];

const bentoFeatures = [
  { title: 'AI Matching Engine', desc: 'We analyze your stack, experience, and goals to suggest the best teammates.', size: 'large', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z', bg: 'bg-cyan-950/30 border-cyan-900/40' },
  { title: 'GitHub Sync', desc: 'One-click import of your repos, languages, and contribution graph.', size: 'small', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5', bg: 'bg-white/[0.02] border-white/[0.06]' },
  { title: 'Smart Filters', desc: 'Filter by tech stack, experience level, timezone, and availability.', size: 'small', icon: 'M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z', bg: 'bg-white/[0.02] border-white/[0.06]' },
  { title: 'Real-Time Chat', desc: 'Built-in messaging with code snippets, file sharing, and voice rooms.', size: 'small', icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.18.063-2.33.155-3.457.278-.958.105-1.73.84-1.886 1.79l-.098.64c-.15 1.017.415 2.005 1.346 2.395l.707.294m0 0l3.183 1.324', bg: 'bg-white/[0.02] border-white/[0.06]' },
  { title: 'Project Boards', desc: 'Kanban boards, task assignments, and sprint planning for every team.', size: 'small', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z', bg: 'bg-white/[0.02] border-white/[0.06]' },
  { title: 'Analytics Dashboard', desc: 'Track profile views, match requests, and project engagement.', size: 'large', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', bg: 'bg-violet-950/30 border-violet-900/40' },
];

const whyJoin = [
  { title: 'Stop coding alone', desc: 'Solo projects die. Teams ship. Find people who care about the same problems.' },
  { title: 'Complement your skills', desc: 'You build the backend, they handle the frontend. Together you ship faster.' },
  { title: 'Build your portfolio', desc: 'Real collaborative projects look better on your resume than tutorial clones.' },
  { title: 'Learn from peers', desc: 'Working with better developers is the fastest way to level up your skills.' },
];

/* ═══════════════════════════════════════════
   HORIZONTAL SCROLL HOOK
   ═══════════════════════════════════════════ */
function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (ref.current && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      e.preventDefault();
      ref.current.scrollLeft += e.deltaY;
    }
  }, []);
  return { ref, onWheel };
}

/* ═══════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════ */
export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeWhy, setActiveWhy] = useState(0);

  const devsScroll = useHorizontalScroll();
  const featureScroll = useHorizontalScroll();
  const whyScroll = useHorizontalScroll();

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') router.push('/dashboard');
  }, [status, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden selection:bg-cyan-500/30">
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none !important; }
        .hide-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      {/* ─── BACKGROUND ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[100px]" />
      </div>

      {/* ═══════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/40' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/20 transition-shadow">
                <span className="text-black font-bold text-sm">&lt;/&gt;</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Dev<span className="text-cyan-400">Collab</span></span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {['Browse','Features','How It Works','Why Join'].map(item => (
                <Link key={item} href={item === 'Browse' ? '/browse' : item === 'Features' ? '#features' : item === 'How It Works' ? '#how-it-works' : '#why-join'}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  {item}
                </Link>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/sign-in" className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
              <Link href="/sign-up" className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 hover:scale-105 transition-all shadow-lg shadow-white/10">Get Started</Link>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
              </svg>
            </button>
          </nav>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 shadow-xl">
              <div className="px-4 py-6 space-y-1">
                {[{l:'Browse Projects',h:'/browse'},{l:'Features',h:'#features'},{l:'How It Works',h:'#how-it-works'},{l:'Why Join',h:'#why-join'}].map(item => (
                  <Link key={item.l} href={item.h} onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">{item.l}</Link>
                ))}
                <div className="pt-4 mt-2 border-t border-white/5 flex flex-col gap-2">
                  <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:bg-white/5 border border-white/10 transition-all">Sign In</Link>
                  <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold text-black bg-white hover:bg-slate-200 transition-all">Get Started Free</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative z-10 pt-28 sm:pt-36 md:pt-44 pb-10 sm:pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="lg:col-span-3 text-center lg:text-left">
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold mb-5 sm:mb-7">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-75"/><span className="relative rounded-full h-2 w-2 bg-cyan-500"/></span>
                  Early Access — Free Forever
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} className="text-[2.6rem] sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 sm:mb-6 leading-[1.05] tracking-tight">
                Find devs who{' '}
                <span className="text-cyan-400">actually</span>
                <br className="hidden sm:block" /> get your stack
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg md:text-xl text-slate-400 mb-7 sm:mb-9 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Stop coding alone. Match with developers who share your tech, your vision, and your hustle. Built by devs, for devs.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8">
                <Link href="/sign-up" className="group bg-white text-black px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-200 hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2">
                  Create Free Account
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
                <Link href="/browse" className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                  Browse Projects
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 justify-center lg:justify-start">
                {['No credit card', 'Free forever', '2-min setup'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Desktop Visual */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="hidden lg:block lg:col-span-2 relative h-[480px]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 rounded-3xl border border-white/5" />
              {devs.slice(0, 4).map((dev, i) => {
                const pos = [{t:'5%',l:'0%'},{t:'8%',l:'45%'},{t:'50%',l:'5%'},{t:'52%',l:'48%'}][i];
                return (
                  <motion.div key={dev.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: [0, -10, 0] }}
                    transition={{ opacity: { duration: 0.5, delay: 0.6 + i * 0.15 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 } }}
                    className="absolute z-10 w-52" style={{ top: pos.t, left: pos.l }}>
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl shadow-black/20">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${dev.avatar}`} alt={dev.name} className="w-10 h-10 rounded-full bg-white/5 border border-white/10" loading="lazy"/>
                        <div><p className="text-white font-bold text-sm">{dev.name}</p><p className="text-slate-400 text-xs">{dev.role}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dev.skills.map(s => <span key={s} className="text-[10px] font-semibold bg-white/5 text-slate-300 px-1.5 py-0.5 rounded border border-white/5">{s}</span>)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${dev.match}%` }} transition={{ duration: 1.5, delay: 1 + i * 0.2 }} className="h-full rounded-full" style={{ backgroundColor: dev.color }}/>
                        </div>
                        <span className="text-xs font-bold" style={{ color: dev.color }}>{dev.match}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/[0.03] backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
                <div className="text-center"><div className="text-xl font-black text-white">AI</div><div className="text-[10px] text-slate-400 font-medium">Match</div></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MOBILE DEV CAROUSEL
      ═══════════════════════════════════════ */}
      <section className="lg:hidden relative z-10 pb-6 -mt-2">
        <div className="px-4 sm:px-6 mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Example Matches</p>
        </div>
        <div {...devsScroll} className="flex gap-4 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory hide-scroll">
          {devs.map(dev => (
            <div key={dev.name} className="snap-start shrink-0 w-[260px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3 mb-3">
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${dev.avatar}`} alt={dev.name} className="w-11 h-11 rounded-full bg-white/5 border border-white/10" loading="lazy"/>
                <div><p className="text-white font-bold text-sm">{dev.name}</p><p className="text-slate-400 text-xs">{dev.role}</p></div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {dev.skills.map(s => <span key={s} className="text-[10px] font-semibold bg-white/5 text-slate-300 px-1.5 py-0.5 rounded border border-white/5">{s}</span>)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${dev.match}%`, backgroundColor: dev.color }}/>
                </div>
                <span className="text-xs font-bold" style={{ color: dev.color }}>{dev.match}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="mb-12 sm:mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs sm:text-sm font-semibold mb-4">Simple Process</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">How It Works</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-400 text-base sm:text-lg max-w-xl">Three steps from solo coder to shipped product.</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {steps.map((step, i) => (
              <motion.div key={step.num} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={fadeUp} custom={i} className="relative">
                <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg shadow-white/5">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={step.icon}/></svg>
                  </div>
                  <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#0a0a0f] border border-white/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{i + 1}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES — BENTO GRID
      ═══════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-20 sm:py-28 lg:py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="mb-12 sm:mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold mb-4">What You Get</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Everything You Need</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-400 text-base sm:text-lg max-w-xl">Built by devs who were tired of coding alone.</motion.p>
          </motion.div>

          {/* Desktop Bento */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} className="hidden md:grid md:grid-cols-3 md:grid-rows-2 gap-4 sm:gap-5">
            {bentoFeatures.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i}
                className={`group ${f.size === 'large' ? 'md:col-span-2' : ''} ${f.bg} rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] transition-all duration-500`}>
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 sm:mb-5 text-cyan-400 group-hover:text-white group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300">
                  <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/></svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile Swipe */}
          <div className="md:hidden">
            <div {...featureScroll} className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scroll">
              {bentoFeatures.map((f) => (
                <div key={f.title} className={`snap-start shrink-0 ${f.size === 'large' ? 'w-[300px]' : 'w-[260px]'} ${f.bg} rounded-2xl p-5`}>
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon}/></svg>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-3">← Swipe to explore →</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY JOIN
      ═══════════════════════════════════════ */}
      <section id="why-join" className="relative z-10 py-20 sm:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="mb-12 sm:mb-16">
            <motion.span variants={fadeUp} custom={0} className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs sm:text-sm font-semibold mb-4">Why DevCollab</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3">Why Join?</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-slate-400 text-base sm:text-lg max-w-xl">Real reasons to start collaborating today.</motion.p>
          </motion.div>

          {/* Desktop Grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger} className="hidden md:grid md:grid-cols-2 gap-5 sm:gap-6">
            {whyJoin.map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i} className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile Swipe */}
          <div className="md:hidden">
            <div {...whyScroll} className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scroll">
              {whyJoin.map((item) => (
                <div key={item.title} className="snap-start shrink-0 w-[280px] bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
                  <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-1">
              {whyJoin.map((_, i) => (
                <button key={i} onClick={() => setActiveWhy(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeWhy ? 'bg-white w-5' : 'bg-white/20 w-1.5'}`}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
            className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-75"/><span className="relative rounded-full h-2 w-2 bg-cyan-500"/></span>
                Early Access — Free Forever
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">Be Among the First</motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto">
                We're just getting started. Join now and help shape the future of developer collaboration. Early users get lifetime free access.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/sign-up" className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-slate-200 hover:scale-105 transition-all shadow-xl shadow-white/10">
                  Join Early Access
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
                <Link href="/browse" className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg border border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all">See Projects</Link>
              </motion.div>
              <motion.p variants={fadeUp} custom={4} className="text-xs sm:text-sm text-slate-500 mt-6 sm:mt-8">No credit card required • Free for early users • Setup in 2 minutes</motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4 sm:mb-5">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><span className="text-black font-bold text-xs">&lt;/&gt;</span></div>
                <span className="text-lg font-bold text-white">Dev<span className="text-cyan-400">Collab</span></span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs">A new way for developers to find teammates, collaborate, and ship products together.</p>
              <div className="flex gap-2">
                <a href="https://github.com/ishivam0980/DevCollab" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/shivam-srivastava-817b33331" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5">
                <li><Link href="/browse" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Browse Projects</Link></li>
                <li><Link href="#features" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">How It Works</Link></li>
                <li><Link href="#why-join" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Why Join</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm">Account</h4>
              <ul className="space-y-2.5">
                <li><Link href="/sign-in" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Sign In</Link></li>
                <li><Link href="/sign-up" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Create Account</Link></li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-cyan-400 text-sm transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm">Legal</h4>
              <ul className="space-y-2.5">
                <li><span className="text-slate-400 text-sm cursor-default">Privacy Policy</span></li>
                <li><span className="text-slate-400 text-sm cursor-default">Terms of Service</span></li>
                <li><span className="text-slate-400 text-sm cursor-default">Cookie Policy</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-500 text-xs sm:text-sm">© {new Date().getFullYear()} DevCollab.</p>
            <p className="text-slate-600 text-xs">Early access — free forever</p>
          </div>
        </div>
      </footer>
    </div>
  );
}