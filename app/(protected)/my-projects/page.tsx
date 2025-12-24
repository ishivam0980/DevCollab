'use client'

import { useState, useEffect } from "react"
import { getMyProjects } from "@/actions/interest.actions"
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

const MyProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const result = await getMyProjects()
      if (result.success && result.projects) {
        setProjects(result.projects)
      } else {
        setError(result.error || 'Failed to load projects')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 mt-1">Manage projects you've created</p>
        </div>
        <Link 
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Project
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
            <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Your Projects...</p>
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
          <h2 className="text-xl font-bold text-white mb-2">Failed to load projects</h2>
          <p className="text-slate-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center glass-card p-12 rounded-2xl">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-slate-400 mb-6">You haven't created any projects. Start by sharing your first idea!</p>
          <Link 
            href="/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Project
          </Link>
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

              {/* Stats */}
              <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-slate-400">{project.interestCount} interested</span>
                </div>
                <span className="text-xs text-slate-500">{formatDate(project.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Link 
                  href={`/projects/${project._id}`}
                  className="flex-1 py-2 text-center text-sm bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  View
                </Link>
                <Link 
                  href={`/projects/${project._id}/edit`}
                  className="flex-1 py-2 text-center text-sm bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default MyProjectsPage
