'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { getMyProjects, getMyInterests } from "@/actions/interest.actions"
import { getMatchedProjects } from "@/actions/project.actions"
import { getProfileCompletion } from "@/actions/user.actions"
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
  experienceLevel: string;
  status: string;
  interestCount: number;
  matchScore?: number;
  createdAt: string;
}

interface DashboardStats {
  projectsCreated: number;
  totalInterestsReceived: number;
  projectsInterested: number;
}

const DashboardPage = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    projectsCreated: 0,
    totalInterestsReceived: 0,
    projectsInterested: 0
  })
  const [recommendedProjects, setRecommendedProjects] = useState<Project[]>([])
  
  // Profile completion state
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [myProjectsResult, myInterestsResult, matchedResult, profileResult] = await Promise.all([
        getMyProjects(),
        getMyInterests(),
        getMatchedProjects(5),
        getProfileCompletion()
      ])
      
      // Profile completion
      if (profileResult.success) {
        setProfileCompletion(profileResult.percentage || 0)
        setMissingFields(profileResult.missingFields || [])
      }

      // Calculate stats
      if (myProjectsResult.success && myProjectsResult.projects) {
        const projects = myProjectsResult.projects
        const totalInterests = projects.reduce((sum: number, p: Project) => sum + (p.interestCount || 0), 0)
        setStats(prev => ({
          ...prev,
          projectsCreated: projects.length,
          totalInterestsReceived: totalInterests
        }))
      }

      if (myInterestsResult.success && myInterestsResult.projects) {
        setStats(prev => ({
          ...prev,
          projectsInterested: myInterestsResult.projects.length
        }))
      }

      if (matchedResult.success && matchedResult.projects) {
        setRecommendedProjects(matchedResult.projects)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper: Get match badge color
  const getMatchBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
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
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Welcome Section with Profile Completion */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Welcome back, {session?.user?.name?.split(' ')[0] || 'Developer'}!
                </span>
                <span className="ml-2">👋</span>
              </h1>
              <p className="text-slate-400">
                Find your next collaboration or share your project ideas
              </p>
            </div>
            
            {/* Profile Completion - Enhanced */}
            <div className="md:min-w-[220px] glass-card rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Profile</span>
                <span className={`text-lg font-bold ${profileCompletion >= 80 ? 'text-green-400' : profileCompletion >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    profileCompletion >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                    profileCompletion >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                    'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              {profileCompletion < 80 && (
                <Link 
                  href="/profile" 
                  className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-flex items-center gap-1 group"
                >
                  Complete profile 
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Compact with left-aligned icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/my-projects" className="glass-card rounded-xl p-4 hover:border-purple-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Projects Created</p>
              <p className="text-2xl font-bold text-white">{stats.projectsCreated}</p>
            </div>
          </div>
        </Link>

        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-pink-500/20 to-rose-600/20 rounded-xl flex items-center justify-center border border-pink-500/20">
              <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Interests Received</p>
              <p className="text-2xl font-bold text-white">{stats.totalInterestsReceived}</p>
            </div>
          </div>
        </div>

        <Link href="/my-interests" className="glass-card rounded-xl p-4 hover:border-purple-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Projects Interested</p>
              <p className="text-2xl font-bold text-white">{stats.projectsInterested}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions - Consistent height with lift effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link 
          href="/projects/new"
          className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold">Create New Project</p>
            <p className="text-slate-400 text-sm">Share your idea</p>
          </div>
        </Link>

        <Link 
          href="/browse"
          className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold">Browse Projects</p>
            <p className="text-slate-400 text-sm">Find collaborations</p>
          </div>
        </Link>

        <Link 
          href="/profile"
          className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold">Edit Profile</p>
            <p className="text-slate-400 text-sm">Update your skills</p>
          </div>
        </Link>
      </div>

      {/* Recommended Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Projects You Might Like</h2>
          <Link href="/browse" className="text-purple-400 hover:text-purple-300 text-sm transition-colors inline-flex items-center gap-1 group">
            View All 
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recommendedProjects.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-dashed border-slate-700">
            {/* Illustrated empty state */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-purple-500/20">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No recommendations yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Complete your profile with skills to get better matches!
            </p>
            <Link 
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProjects.map((project) => (
              <div
                key={project._id}
              >
                <Link href={`/projects/${project._id}`}>
                  <div className="glass-card rounded-xl p-4 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col">
                    {/* Header with Match Score */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-white line-clamp-1">{project.title}</h3>
                      {project.matchScore && (
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getMatchBadge(project.matchScore)}`}>
                          {project.matchScore}%
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                      {project.shortDescription || project.description.slice(0, 80)}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Owner */}
                    <div className="mt-auto flex items-center gap-2 pt-3 border-t border-slate-700/50">
                      <img 
                        src={project.owner?.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(project.owner?.name || 'User')}`}
                        alt={project.owner?.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-slate-500">{project.owner?.name}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DashboardPage
