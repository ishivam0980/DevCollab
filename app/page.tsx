'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Floating developer profile cards data
const floatingProfiles = [
  { name: 'Shivam', skills: ['React', 'Node.js'], avatar: 'Shivam', rotation: -8, delay: 0 },
  { name: 'Arushi', skills: ['Python', 'ML'], avatar: 'Arushi', rotation: 5, delay: 0.2 },
  { name: 'Zayn', skills: ['Go', 'K8s'], avatar: 'Zayn', rotation: -3, delay: 0.4 },
  { name: 'Rohan', skills: ['Vue', 'TypeScript'], avatar: 'Rohan', rotation: 7, delay: 0.1 },
];

// Stats data
const stats = [
  { value: '5K+', label: 'Active Developers' },
  { value: '1,200+', label: 'Projects Created' },
  { value: '85%', label: 'Match Success Rate' },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030014] relative overflow-hidden selection:bg-purple-500/30">
      {/* Background gradient effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* ========== NAVBAR ========== */}
      <div className="sticky top-4 z-50 px-4 sm:px-6 flex justify-center mb-8">
        <nav className="w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10">
          <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-white font-bold text-sm">&lt;/&gt;</span>
                </div>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                DevCollab
              </span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
              <Link href="/browse" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">Browse</Link>
              <Link href="#features" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">Features</Link>
              <Link href="#how-it-works" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">How It Works</Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href="/sign-in" 
                className="text-slate-300 hover:text-white transition-colors text-sm font-medium px-4 py-2 hidden sm:block"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="relative group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Get Started</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              The #1 Platform for Developer Collaboration
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              <span className="block">Find Your Perfect</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                Co-Developers
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Match with developers who share your vision. Collaborate on projects that matter. Turn ideas into reality together with our AI-powered matching.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="/sign-up"
                className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Start Matching — It's Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/browse"
                className="glass-panel text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
              >
                Browse Projects
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-500 justify-center lg:justify-start border-t border-white/5 pt-8">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Free forever
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                2 min setup
              </span>
            </div>
          </motion.div>

          {/* RIGHT SIDE - Floating Profile Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative h-[500px] hidden lg:block"
          >
            {/* Animated mockup visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Center glow effect */}
              <div className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-[80px] animate-pulse" />
              
              {/* Floating profile cards */}
              {floatingProfiles.map((profile, index) => (
                <motion.div
                  key={profile.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -20, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    delay: profile.delay,
                    ease: "easeInOut"
                  }}
                  className="absolute z-10"
                  style={{
                    top: `${20 + (index * 15)}%`,
                    left: index % 2 === 0 ? `${5 + (index * 5)}%` : `${45 + (index * 5)}%`,
                    transform: `rotate(${profile.rotation}deg)`,
                  }}
                >
                  <div className="glass-card p-4 rounded-2xl w-56 neon-border group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity" />
                        <img 
                          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.avatar}`}
                          alt={profile.name}
                          className="relative w-12 h-12 rounded-full bg-slate-800 border border-white/10"
                        />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{profile.name}</p>
                        <p className="text-slate-400 text-xs">Full Stack Developer</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="text-[10px] font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {/* Match percentage badge */}
                    <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${75 + index * 5}%` }} />
                      </div>
                      <span className="text-xs text-green-400 font-bold">{75 + index * 5}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section id="how-it-works" className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How DevCollab Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Three simple steps to find your team and start building
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 md:grid md:grid-cols-3 md:gap-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {[
              { title: 'Create Your Profile', desc: 'Showcase your skills, experience, and the projects you want to build', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'purple' },
              { title: 'Post or Browse Projects', desc: 'Share your ideas or discover projects that match your expertise', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'blue' },
              { title: 'Match & Collaborate', desc: 'Connect with developers and start building amazing projects together', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'pink' }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-3xl p-8 relative group hover:-translate-y-2 transition-transform duration-300 min-w-[85vw] md:min-w-0 snap-center"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />
                
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-white/20 transition-colors relative z-10">
                  <svg className={`w-8 h-8 text-${step.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section id="features" className="relative z-10 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Developers Love DevCollab
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Connect with developers who have complementary skills and start building
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {[
              { icon: '\uD83E\uDDE9', title: 'Smart Matching', desc: 'Advanced algorithm matches you with compatible developers based on skills and experience' },
              { icon: '\uD83D\uDD0D', title: 'Skill Discovery', desc: 'Find developers with the exact tech stack your project needs' },
              { icon: '\u26A1', title: 'Real-Time Updates', desc: 'Get notified instantly when someone shows interest in your project' },
              { icon: '\uD83D\uDC19', title: 'GitHub Integration', desc: 'Connect your GitHub to showcase your contributions and repos' },
              { icon: '\uD83D\uDCCA', title: 'Project Analytics', desc: 'Track views, interests, and engagement on your posted projects' },
              { icon: '\uD83D\uDC65', title: 'Team Workspace', desc: 'Organize your team and collaborate effectively on projects' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-panel rounded-2xl p-6 hover:bg-white/5 transition-all group cursor-default min-w-[85vw] sm:min-w-0 snap-center"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{feature.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-white/10" />
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    {stat.value}
                  </div>
                  <p className="text-slate-300 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Find Your Next Team?
            </h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join hundreds of developers building the future, one project at a time.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started for Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-slate-500 mt-6 font-medium">
              No credit card required • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">&lt;/&gt;</span>
                </div>
                <span className="text-xl font-bold text-white">Dev<span className="text-purple-400">Collab</span></span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Connecting developers, one project at a time.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com/ishivam0980/DevCollab" target="_blank" className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/shivam-srivastava-817b33331" target="_blank" className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/browse" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Browse</Link></li>
                <li><Link href="#features" className="text-slate-400 hover:text-purple-400 text-sm transition-colors">Features</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Pricing</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">About</Link></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div className="hidden md:block">
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Documentation</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">API</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Support</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Status</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="hidden md:block">
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Privacy</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Terms</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Security</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 DevCollab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
