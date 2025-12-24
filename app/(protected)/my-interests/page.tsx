'use client'

import { useState, useEffect } from "react"
import { getMyInterests, toggleInterest } from "@/actions/interest.actions"
import { motion } from "framer-motion"
import Link from "next/link"

interface ProjectOwner {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  owner: ProjectOwner;
  techStack: string[];
  category: string;
  experienceLevel: string;
  status: string;
  interestCount: number;
  createdAt: string;
}

const MyInterestsPage = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInterests()
  }, [])

  const fetchInterests = async () => {
    setLoading(true)
    try {
      const result = await getMyInterests()
      if (result.success && result.projects) {
        setProjects(result.projects)
      } else {
        setError(result.error || 'Failed to load interests')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (projectId: string) => {
    setWithdrawingId(projectId)
    try {
      const result = await toggleInterest(projectId)
      if (result.success && !result.interested) {
        // Remove from list
        setProjects(prev => prev.filter(p => p._id !== projectId))
      }
    } catch (err) {
      alert('Failed to withdraw interest')
    } finally {
      setWithdrawingId(null)
    }
  }

  // Helper: Get status badge style
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Looking for collaborators': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Completed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  // Helper: Get experience badge style
  const getExpBadge = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  // Helper: Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Interests</h1>
          <p className="text-slate-400 mt-1">Projects you've shown interest in</p>
        </div>
        <Link 
          href="/browse"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg font-medium hover:bg-purple-500/30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Browse More Projects
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-pink-500 animate-spin [animation-direction:reverse]"></div>
              <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin"></div>
            </div>
            <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Your Interests...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center glass-card p-8 rounded-2xl border border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to load interests</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center glass-card p-12 rounded-2xl border border-dashed border-slate-700">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-pink-500/30">
            <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Find Your Next Project</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Browse exciting projects and show interest to connect with project owners!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/browse"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Projects
            </Link>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              View Recommendations
            </Link>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass-card rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-1">{project.title}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${getStatusBadge(project.status)}`}>
                  {project.status === 'Looking for collaborators' ? 'Open' : project.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                {project.shortDescription || project.description.slice(0, 100)}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.slice(0, 3).map(tech => (
                  <span key={tech} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-md">
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded-md">
                    +{project.techStack.length - 3}
                  </span>
                )}
              </div>

              {/* Owner */}
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={project.owner?.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(project.owner?.name || 'User')}`}
                  alt={project.owner?.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-slate-400">{project.owner?.name}</span>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
                <span className={`px-2 py-0.5 text-xs rounded-full border ${getExpBadge(project.experienceLevel)}`}>
                  {project.experienceLevel}
                </span>
                <span className="text-xs text-slate-500">{formatDate(project.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Link 
                  href={`/projects/${project._id}`}
                  className="flex-1 py-2 text-center text-sm bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  View Project
                </Link>
                <button 
                  onClick={() => handleWithdraw(project._id)}
                  disabled={withdrawingId === project._id}
                  className="flex-1 py-2 text-center text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {withdrawingId === project._id ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                  ) : (
                    'Withdraw'
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default MyInterestsPage
