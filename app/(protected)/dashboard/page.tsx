'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { getMyProjects, getMyInterests } from "@/actions/interest.actions"
import { getMatchedProjects } from "@/actions/project.actions"
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [myProjectsResult, myInterestsResult, matchedResult] = await Promise.all([
        getMyProjects(),
        getMyInterests(),
        getMatchedProjects(5)
      ])

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'Developer'}! 👋
          </h1>
          <p className="text-slate-400 text-lg">
            Find your next collaboration or share your project ideas
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/my-projects" className="glass-card rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Projects Created</p>
              <p className="text-3xl font-bold text-white">{stats.projectsCreated}</p>
            </div>
            <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Interests Received</p>
              <p className="text-3xl font-bold text-white">{stats.totalInterestsReceived}</p>
            </div>
            <div className="w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <Link href="/my-interests" className="glass-card rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Projects Interested</p>
              <p className="text-3xl font-bold text-white">{stats.projectsInterested}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/projects/new"
          className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Create New Project</p>
            <p className="text-slate-400 text-sm">Share your idea</p>
          </div>
        </Link>

        <Link 
          href="/browse"
          className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Browse Projects</p>
            <p className="text-slate-400 text-sm">Find collaborations</p>
          </div>
        </Link>

        <Link 
          href="/profile"
          className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Edit Profile</p>
            <p className="text-slate-400 text-sm">Update your skills</p>
          </div>
        </Link>
      </div>

      {/* Recommended Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Projects You Might Like</h2>
          <Link href="/browse" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
            View All →
          </Link>
        </div>

        {recommendedProjects.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No recommendations yet</h3>
            <p className="text-slate-400 text-sm mb-4">Complete your profile with skills to get better matches!</p>
            <Link 
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Complete Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DashboardPage
