'use client'

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { getProject, deleteProject } from "@/actions/project.actions"
import { toggleInterest, checkInterest, getInterestedUsers } from "@/actions/interest.actions"
import { motion } from "framer-motion"
import Link from "next/link"

// Types
interface ProjectOwner {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface InterestedUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  skills?: string[];
  experienceLevel?: string;
  matchScore?: number;
  matchingSkills?: string[];
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
  teamSize: string;
  duration: string;
  status: string;
  interestCount: number;
  createdAt: string;
  updatedAt: string;
}

const ProjectDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  // Unwrap params using React.use()
  const { id } = use(params)
  
  const router = useRouter()
  const { data: session } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Interest state
  const [isInterested, setIsInterested] = useState(false)
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestCount, setInterestCount] = useState(0)
  
  // Owner-only: Interested users
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([])
  const [showInterestedUsers, setShowInterestedUsers] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  
  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch project data on mount and when session changes
  useEffect(() => {
    fetchProject()
    checkUserInterest()
  }, [id, session?.user?.email])

  const fetchProject = async () => {
    setLoading(true)
    try {
      const result = await getProject(id)
      if (result.success && result.project) {
        setProject(result.project)
        setInterestCount(result.project.interestCount || 0)
        
        // Check if current user is the owner by comparing emails
        if (session?.user?.email && result.project.owner?.email === session.user.email) {
          setIsOwner(true)
          // Auto-fetch interested users for owner
          fetchInterestedUsers()
        }
      } else {
        setError(result.error || 'Project not found')
      }
    } catch (err) {
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const checkUserInterest = async () => {
    try {
      const result = await checkInterest(id)
      if (result.success) {
        setIsInterested(result.interested || false)
      }
    } catch (err) {
      // Ignore errors - user might not be logged in
    }
  }

  const handleToggleInterest = async () => {
    setInterestLoading(true)
    try {
      const result = await toggleInterest(id)
      if (result.success) {
        setIsInterested(result.interested || false)
        setInterestCount(prev => result.interested ? prev + 1 : prev - 1)
      } else if (result.error) {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to update interest')
    } finally {
      setInterestLoading(false)
    }
  }

  const fetchInterestedUsers = async () => {
    try {
      const result = await getInterestedUsers(id)
      if (result.success && result.users) {
        setInterestedUsers(result.users)
        setIsOwner(true)
        setShowInterestedUsers(true)
      } else if (result.error) {
        // Not the owner
        setIsOwner(false)
        if (result.error !== 'Only project owner can view interested users') {
          alert(result.error)
        }
      }
    } catch (err) {
      // Ignore
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const result = await deleteProject(id)
      if (result.success) {
        router.push('/browse')
      } else if (result.error) {
        alert(result.error)
      }
    } catch (err) {
      alert('Failed to delete project')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  // Helper: Get experience level badge style
  const getExpBadge = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
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
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })
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

  // Error State
  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-2xl border border-red-500/20 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Project not found</h2>
          <p className="text-slate-400 mb-6">{error || 'This project may have been deleted or you may not have access.'}</p>
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
      className="max-w-4xl mx-auto"
    >
      {/* Back Link */}
      <Link href="/browse" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{project.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full border ${getExpBadge(project.experienceLevel)}`}>
                    {project.experienceLevel}
                  </span>
                  <span className="text-xs text-slate-500">{project.category}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-2">Description</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Tech Stack */}
            <div className="mb-6">
              <h3 className="text-sm text-slate-400 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map(tech => (
                  <span key={tech} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50">
              <div>
                <p className="text-xs text-slate-500 mb-1">Team Size</p>
                <p className="text-white font-medium">{project.teamSize} people</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-white font-medium">{project.duration}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Posted</p>
                <p className="text-white font-medium">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Interested</p>
                <p className="text-white font-medium">{interestCount} developers</p>
              </div>
            </div>
          </div>

          {/* Interested Users (Owner Only) */}
          {isOwner && interestedUsers.length > 0 && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Interested Developers ({interestedUsers.length})
                </h2>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Sorted by skill match</span>
              </div>
              <div className="space-y-3">
                {interestedUsers.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={user.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover bg-slate-800"
                        />
                        {/* Match score badge */}
                        <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          (user.matchScore || 0) >= 70 ? 'bg-green-500 text-white' :
                          (user.matchScore || 0) >= 40 ? 'bg-yellow-500 text-black' :
                          'bg-slate-600 text-white'
                        }`}>
                          {user.matchScore || 0}%
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{user.experienceLevel}</span>
                          {user.matchingSkills && user.matchingSkills.length > 0 && (
                            <span className="text-xs text-green-400">• Matches: {user.matchingSkills.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <a 
                      href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(user.email)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-sm bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      Contact
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Right */}
        <div className="space-y-6">
          {/* Owner Card */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm text-slate-400 mb-4">Posted by</h3>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={project.owner?.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(project.owner?.name || 'User')}`}
                alt={project.owner?.name}
                className="w-12 h-12 rounded-full object-cover bg-slate-800"
              />
              <div>
                <p className="text-white font-medium">{project.owner?.name}</p>
                <p className="text-xs text-slate-500">{project.owner?.email}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card rounded-xl p-6 space-y-3">
            {/* OWNER: Show Edit, Delete, View Interested Users */}
            {isOwner ? (
              <>
                <Link 
                  href={`/projects/${id}/edit`}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Project
                </Link>
                <div className="flex items-center justify-center gap-2 py-3 bg-slate-800/50 text-slate-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{interestCount} Interested</span>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </button>
              </>
            ) : (
              /* NON-OWNER: Show I'm Interested button */
              <button
                onClick={handleToggleInterest}
                disabled={interestLoading}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isInterested 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {interestLoading ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                ) : isInterested ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Withdraw Interest
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    I&apos;m Interested
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-bold text-white mb-2">Delete Project?</h2>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete "{project.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

export default ProjectDetailsPage
