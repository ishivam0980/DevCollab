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

  // Restore scroll position on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('homeScrollPosition');
      }
    }
  }, []);

  // Save scroll position before navigating away
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-blue-900/20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">&lt;/&gt;</span>
            </div>
            <span className="text-xl font-bold text-white">Dev<span className="text-purple-400">Collab</span></span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/browse" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Browse</Link>
            <Link href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
            <Link href="#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">How It Works</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              href="/sign-in" 
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

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
            

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Find Your Perfect</span>
              <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                Co-Developers
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Match with developers who share your vision. Collaborate on projects that matter. Turn ideas into reality together.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                href="/sign-up"
                className="group bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
              >
                Start Matching — It&apos;s Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/browse"
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
              >
                Browse Projects
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-sm text-slate-500 justify-center lg:justify-start">
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
            className="relative h-[400px] md:h-[500px] hidden lg:block"
          >
            {/* Animated mockup visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Center glow effect */}
              <div className="absolute w-64 h-64 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
              
              {/* Floating profile cards */}
              {floatingProfiles.map((profile, index) => (
                <motion.div
                  key={profile.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    y: [0, -15, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    delay: profile.delay,
                    ease: "easeInOut"
                  }}
                  className="absolute"
                  style={{
                    top: `${20 + (index * 20)}%`,
                    left: index % 2 === 0 ? `${10 + (index * 8)}%` : `${50 + (index * 5)}%`,
                    transform: `rotate(${profile.rotation}deg)`,
                  }}
                >
                  <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 shadow-xl w-48">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${profile.avatar}`}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full bg-slate-700"
                      />
                      <div>
                        <p className="text-white font-medium text-sm">{profile.name}</p>
                        <p className="text-slate-500 text-xs">Developer</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {/* Match percentage badge */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full" style={{ width: `${75 + index * 5}%` }} />
                      </div>
                      <span className="text-xs text-green-400 font-medium">{75 + index * 5}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section id="how-it-works" className="relative z-10 bg-slate-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How DevCollab Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Three simple steps to find your team and start building
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all group"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                01
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Your Profile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Showcase your skills, experience, and the projects you want to build
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all group"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                02
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Post or Browse Projects</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Share your ideas or discover projects that match your expertise
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all group"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                03
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Match & Collaborate</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect with developers and start building amazing projects together
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section id="features" className="relative z-10 py-24 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Developers Love DevCollab
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Connect with developers who have complementary skills and start building
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🧠', title: 'Smart Matching', desc: 'Advanced algorithm matches you with compatible developers based on skills and experience' },
              { icon: '🔍', title: 'Skill Discovery', desc: 'Find developers with the exact tech stack your project needs' },
              { icon: '🔔', title: 'Real-Time Updates', desc: 'Get notified instantly when someone shows interest in your project' },
              { icon: '🔗', title: 'GitHub Integration', desc: 'Connect your GitHub to showcase your contributions and repos' },
              { icon: '📊', title: 'Project Analytics', desc: 'Track views, interests, and engagement on your posted projects' },
              { icon: '🛠️', title: 'Team Workspace', desc: 'Organize your team and collaborate effectively on projects' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/30 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl">{feature.icon}</span>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
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
            className="bg-gradient-to-r from-purple-900/30 via-violet-900/20 to-blue-900/30 border border-white/10 rounded-3xl p-8 md:p-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative z-10 py-24 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Next Team?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              Join hundreds of developers building the future, one project at a time.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              Get Started for Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required • Setup in 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 bg-slate-950 border-t border-white/10 py-12">
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
                <a href="https://github.com/ishivam0980/DevCollab" target="_blank" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.linkedin.com/in/shivam-srivastava-817b33331" target="_blank" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
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
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Documentation</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">API</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Support</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Status</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Privacy</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Terms</Link></li>
                <li><Link href="#" onClick={(e) => e.preventDefault()} className="text-slate-400 hover:text-purple-400 text-sm transition-colors cursor-not-allowed opacity-50">Security</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 DevCollab. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              Made with <span className="text-red-500">❤️</span> for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
