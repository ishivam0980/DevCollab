'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject } from "@/actions/project.actions"
import { TECH_SKILLS, EXPERIENCE_LEVELS, PROJECT_CATEGORIES, TEAM_SIZES, PROJECT_DURATIONS } from "@/lib/constants"
import { motion } from "framer-motion"
import Link from "next/link"

const NewProjectPage = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    techStack: [] as string[],
    category: 'Web App',
    experienceLevel: 'Beginner',
    teamSize: '1-2',
    duration: '1-3 months',
    status: 'Looking for collaborators'
  })

  const [showTechDropdown, setShowTechDropdown] = useState(false)
  const [techSearch, setTechSearch] = useState('')

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }))
  }

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }))
  }

  // Filter tech - only show unselected techs, always include "Others" at end
  const filteredTechSkills = (() => {
    const filtered = TECH_SKILLS.filter(tech => 
      tech !== 'Others' && // Exclude Others from main filter
      tech.toLowerCase().includes(techSearch.toLowerCase()) &&
      !formData.techStack.includes(tech)
    ); // No slice - show all matching techs
    
    // Show "Others" at the end if:
    // 1. Not already selected
    // 2. AND (empty search OR searching "others" OR no matches found)
    if (!formData.techStack.includes('Others') && 
        (techSearch === '' || 'others'.includes(techSearch.toLowerCase()) || filtered.length === 0)) {
      filtered.push('Others');
    }
    return filtered;
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!formData.title.trim()) throw new Error('Project title is required')
      if (!formData.description.trim()) throw new Error('Project description is required')
      if (formData.techStack.length === 0) throw new Error('Please select at least one technology')

      const result = await createProject(formData)
      if (result.error) throw new Error(result.error)
      router.push(`/projects/${result.project._id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      {/* Click outside overlay for tech dropdown - MUST be at root level */}
      {showTechDropdown && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={() => setShowTechDropdown(false)}
        />
      )}
      
      {/* Back Link */}
      <Link href="/browse" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Browse
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Project</h1>
          <p className="text-slate-400 text-sm">Share your idea and find collaborators</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: Basic Info */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Basic Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Project Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., AI Chatbot for Customer Support"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => handleChange('shortDescription', e.target.value)}
                  placeholder="Brief one-line summary for project cards"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your project in detail. What are you building? What problems does it solve?"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Tech Stack + Project Details */}
          <div className="space-y-6">
            {/* Tech Stack */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 relative z-[60]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Tech Stack <span className="text-red-400">*</span>
                </h2>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  onFocus={() => setShowTechDropdown(true)}
                  placeholder="Search and select technologies..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
                {showTechDropdown && filteredTechSkills.length > 0 && (
                  <div className="absolute z-[60] w-full mt-2 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                    {filteredTechSkills.map(tech => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => {
                          toggleTech(tech)
                          setTechSearch('')
                          setShowTechDropdown(false)
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-800 text-slate-300 transition-colors"
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                )}
                {showTechDropdown && filteredTechSkills.length === 0 && formData.techStack.length < TECH_SKILLS.length && (
                  <div className="absolute z-[60] w-full mt-2 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-center text-slate-500">
                    No matching technologies
                  </div>
                )}
              </div>

              <div className="min-h-[70px] flex flex-wrap gap-2 content-start">
                {formData.techStack.length > 0 ? (
                  formData.techStack.map(tech => (
                    <span key={tech} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30 shadow-sm">
                      {tech}
                      <button type="button" onClick={() => removeTech(tech)} className="hover:text-white transition-colors hover:scale-110">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>Click above to add technologies</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Details */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white">Project Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                  <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer">
                    {PROJECT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Experience</label>
                  <select value={formData.experienceLevel} onChange={(e) => handleChange('experienceLevel', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer">
                    {EXPERIENCE_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Team Size</label>
                  <select value={formData.teamSize} onChange={(e) => handleChange('teamSize', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer">
                    {TEAM_SIZES.map(size => <option key={size} value={size}>{size} people</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                  <select value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer">
                    {PROJECT_DURATIONS.map(dur => <option key={dur} value={dur}>{dur}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-slate-800">
          <Link 
            href="/my-projects" 
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
          >
            {isSubmitting ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Create Project</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default NewProjectPage
