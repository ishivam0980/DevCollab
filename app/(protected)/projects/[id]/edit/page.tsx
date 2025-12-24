'use client'

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getProject, updateProject } from "@/actions/project.actions"
import { TECH_SKILLS, EXPERIENCE_LEVELS, PROJECT_CATEGORIES, TEAM_SIZES, PROJECT_DURATIONS, PROJECT_STATUSES } from "@/lib/constants"
import { motion } from "framer-motion"
import Link from "next/link"

const EditProjectPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notAuthorized, setNotAuthorized] = useState(false)
  
  // Form State
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

  // Fetch existing project data
  useEffect(() => {
    fetchProject()
  }, [id, session?.user?.email])

  const fetchProject = async () => {
    setLoading(true)
    try {
      const result = await getProject(id)
      if (result.success && result.project) {
        // Check if user is the owner
        if (session?.user?.email && result.project.owner?.email !== session.user.email) {
          setNotAuthorized(true)
          return
        }
        
        // Populate form with existing data
        setFormData({
          title: result.project.title || '',
          description: result.project.description || '',
          shortDescription: result.project.shortDescription || '',
          techStack: result.project.techStack || [],
          category: result.project.category || 'Web App',
          experienceLevel: result.project.experienceLevel || 'Beginner',
          teamSize: result.project.teamSize || '1-2',
          duration: result.project.duration || '1-3 months',
          status: result.project.status || 'Looking for collaborators'
        })
      } else {
        setError(result.error || 'Project not found')
      }
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Toggle tech stack selection
  const toggleTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }))
  }

  // Remove tech from selection
  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }))
  }

  // Filter tech skills based on search - LIMIT to 15 for performance
  const filteredTechSkills = TECH_SKILLS.filter(tech => 
    tech.toLowerCase().includes(techSearch.toLowerCase())
  ).slice(0, 15)

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Client-side validation
      if (!formData.title.trim()) {
        throw new Error('Project title is required')
      }
      if (!formData.description.trim()) {
        throw new Error('Project description is required')
      }
      if (formData.techStack.length === 0) {
        throw new Error('Please select at least one technology')
      }

      const result = await updateProject(id, formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Success! Redirect to project page
      router.push(`/projects/${id}`)
      
    } catch (err: any) {
      setError(err.message || 'Failed to update project')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-pink-500 animate-spin [animation-direction:reverse]"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Project...</p>
        </div>
      </div>
    )
  }

  // Not Authorized State
  if (notAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-2xl border border-red-500/20 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Not Authorized</h2>
          <p className="text-slate-400 mb-6">You can only edit projects that you own.</p>
          <Link href="/browse" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  // Error State
  if (error && !formData.title) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-2xl border border-red-500/20 max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link href="/browse" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* Page Header */}
      <div className="mb-8">
        <Link href={`/projects/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit Project</h1>
        <p className="text-slate-400 mt-2">Update your project details</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="glass-card rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Basic Information
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., AI Chatbot for Customer Support"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              maxLength={100}
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Short Description</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              placeholder="Brief one-line summary"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              maxLength={100}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Full Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your project in detail..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Tech Stack Section - higher z-index for dropdown */}
        <div className="glass-card rounded-xl p-6 space-y-5 relative z-20">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Tech Stack <span className="text-red-400 text-sm">*</span>
          </h2>

          {/* Selected Tech */}
          {formData.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map(tech => (
                <span 
                  key={tech} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30"
                >
                  {tech}
                  <button 
                    type="button" 
                    onClick={() => removeTech(tech)}
                    className="hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tech Search */}
          <div className="relative">
            <input
              type="text"
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
              onFocus={() => setShowTechDropdown(true)}
              placeholder="Search and select technologies..."
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
            
            {showTechDropdown && (
              <div className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
                {filteredTechSkills.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-800 transition-colors flex items-center justify-between ${
                      formData.techStack.includes(tech) ? 'text-purple-400 bg-purple-500/10' : 'text-slate-300'
                    }`}
                  >
                    {tech}
                    {formData.techStack.includes(tech) && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {showTechDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => setShowTechDropdown(false)} />
          )}
        </div>

        {/* Project Details Section */}
        <div className="glass-card rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {PROJECT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {EXPERIENCE_LEVELS.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Team Size</label>
              <select
                value={formData.teamSize}
                onChange={(e) => handleChange('teamSize', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {TEAM_SIZES.map(size => (
                  <option key={size} value={size}>{size} people</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {PROJECT_DURATIONS.map(dur => (
                  <option key={dur} value={dur}>{dur}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status - Special highlight */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Project Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {PROJECT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link 
            href={`/projects/${id}`}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default EditProjectPage
