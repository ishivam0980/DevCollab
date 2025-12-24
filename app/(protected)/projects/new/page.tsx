'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/actions/project.actions"
import { TECH_SKILLS, EXPERIENCE_LEVELS, PROJECT_CATEGORIES, TEAM_SIZES, PROJECT_DURATIONS } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const STEPS = [
  { name: 'Basic Info', icon: '📝' },
  { name: 'Tech Stack', icon: '⚡' },
  { name: 'Details', icon: '📋' },
  { name: 'Links', icon: '🔗' },
]

const NewProjectPage = () => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '', description: '', shortDescription: '', techStack: [] as string[],
    category: 'Web App', experienceLevel: 'Beginner', teamSize: '1-2',
    duration: '1-3 months', status: 'Looking for collaborators',
    githubUrl: '', liveUrl: '', figmaUrl: ''
  })
  const [showTechDropdown, setShowTechDropdown] = useState(false)
  const [techSearch, setTechSearch] = useState('')
  const techDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking anywhere on page
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target as Node)) {
        setShowTechDropdown(false)
      }
    }
    if (showTechDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTechDropdown])

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))
  const toggleTech = (tech: string) => setFormData(prev => ({ ...prev, techStack: prev.techStack.includes(tech) ? prev.techStack.filter(t => t !== tech) : [...prev.techStack, tech] }))
  const removeTech = (tech: string) => setFormData(prev => ({ ...prev, techStack: prev.techStack.filter(t => t !== tech) }))

  const filteredTechSkills = (() => {
    const filtered = TECH_SKILLS.filter(tech => 
      tech !== 'Others' && 
      tech.toLowerCase().includes(techSearch.toLowerCase()) && 
      !formData.techStack.includes(tech)
    );
    // Always show "Others" at the end if: not already selected AND (no search OR no matches OR search includes "others")
    if (!formData.techStack.includes('Others') && (techSearch === '' || filtered.length === 0 || 'others'.includes(techSearch.toLowerCase()))) {
      filtered.push('Others');
    }
    return filtered;
  })()

  const validateStep = (): boolean => {
    if (currentStep === 0 && !formData.title.trim()) { setError('Project title is required'); return false; }
    if (currentStep === 0 && !formData.description.trim()) { setError('Description is required'); return false; }
    if (currentStep === 1 && formData.techStack.length === 0) { setError('Select at least one technology'); return false; }
    setError(null); return true;
  }

  const nextStep = () => { if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, 3)) }
  const prevStep = () => { setError(null); setCurrentStep(prev => Math.max(prev - 1, 0)) }

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true); setError(null)
    try {
      const result = await createProject(formData)
      if (result.error) throw new Error(result.error)
      router.push(`/projects/${result.project._id}`)
    } catch (err: any) { setError(err.message || 'Failed to create project') }
    finally { setIsSubmitting(false) }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Create New Project
          </h1>
        </div>
        <p className="text-slate-400 text-sm">Share your idea and find collaborators</p>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex gap-1.5 mb-4">
        {STEPS.map((step, i) => (
          <div key={step.name} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-800">
            <div 
              className={`h-full transition-all duration-300 ${
                i < currentStep ? 'bg-green-500' : i === currentStep ? 'bg-gradient-to-r from-purple-500 to-blue-500' : ''
              }`}
              style={{ width: i <= currentStep ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Current Step Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{STEPS[currentStep].icon}</span>
        <h2 className="text-lg font-semibold text-white">{STEPS[currentStep].name}</h2>
        <span className="text-slate-500 text-sm ml-auto">Step {currentStep + 1} of {STEPS.length}</span>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 glass-card rounded-xl p-6 border border-white/10 overflow-auto">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Title <span className="text-red-400">*</span></label>
                <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="e.g., AI Chatbot for Customer Support" className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Short Description <span className="text-slate-500 font-normal text-xs">(optional)</span></label>
                <input type="text" value={formData.shortDescription} onChange={(e) => handleChange('shortDescription', e.target.value)} placeholder="Brief summary for cards" maxLength={100} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all" />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Description <span className="text-red-400">*</span></label>
                <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe your project in detail. What are you building? What problems does it solve?" className="flex-1 min-h-[100px] w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-none" />
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full flex flex-col gap-4">
              <div className="relative" ref={techDropdownRef}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Technologies <span className="text-red-400">*</span></label>
                <input type="text" value={techSearch} onChange={(e) => { setTechSearch(e.target.value); setShowTechDropdown(true); }} onFocus={() => setShowTechDropdown(true)} placeholder="Type to search (React, Node.js...)" className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all" />
                {showTechDropdown && (
                  <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
                    {filteredTechSkills.map(tech => (
                      <button key={tech} type="button" onClick={() => { toggleTech(tech); setTechSearch(''); setShowTechDropdown(false); }} className="w-full px-4 py-2 text-left hover:bg-purple-500/20 text-slate-300 text-sm transition-colors">{tech}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-wrap gap-2 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50 content-start overflow-auto">
                {formData.techStack.length > 0 ? formData.techStack.map(tech => (
                  <span key={tech} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30 h-fit">
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-white transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </span>
                )) : <span className="text-slate-500 text-sm">Search and select technologies above</span>}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer">{PROJECT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Experience Level</label>
                <select value={formData.experienceLevel} onChange={(e) => handleChange('experienceLevel', e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer">{EXPERIENCE_LEVELS.map(e => <option key={e}>{e}</option>)}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Team Size</label>
                <select value={formData.teamSize} onChange={(e) => handleChange('teamSize', e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer">{TEAM_SIZES.map(s => <option key={s}>{s} people</option>)}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration</label>
                <select value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer">{PROJECT_DURATIONS.map(d => <option key={d}>{d}</option>)}</select>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <p className="text-sm text-slate-400 mb-2">Optional: Add links to help collaborators understand your project</p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub Repository
                </label>
                <input type="url" value={formData.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} placeholder="https://github.com/username/repo" className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                  Live Demo
                </label>
                <input type="url" value={formData.liveUrl} onChange={(e) => handleChange('liveUrl', e.target.value)} placeholder="https://your-project.vercel.app" className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5.5 9.5l6.5-6.5 6.5 6.5-6.5 6.5-6.5-6.5zm0 5l6.5 6.5 6.5-6.5" /></svg>
                  Figma / Design
                </label>
                <input type="url" value={formData.figmaUrl} onChange={(e) => handleChange('figmaUrl', e.target.value)} placeholder="https://figma.com/file/..." className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-4">
        {currentStep > 0 ? (
          <button onClick={prevStep} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
        ) : (
          <Link href="/browse" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Cancel
          </Link>
        )}

        {currentStep < 3 ? (
          <button onClick={nextStep} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5 hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-purple-500/20">
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5 hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-green-500/20 disabled:opacity-50">
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating...</>
            ) : (
              <>Create Project<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default NewProjectPage
