'use client'

import { useState, useEffect, use } from "react"
import { getUserById } from "@/actions/user.actions"
import { getProjectsByUserId } from "@/actions/project.actions"
import { motion } from "framer-motion"
import Link from "next/link"

interface UserData {
  id: string
  name: string
  email: string
  image?: string
  bio: string
  location: string
  skills: string[]
  experienceLevel: string
  githubUrl: string
  linkedinUrl: string
  leetcodeUrl: string
  codechefUrl: string
  codeforcesUrl: string
  createdAt: Date
}

interface Project {
  _id: string
  title: string
  description: string
  techStack: string[]
  status: string
  experienceLevel: string
  createdAt: string
}

const PublicProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params)
  const [user, setUser] = useState<UserData | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      const userResult = await getUserById(id)
      if (!userResult.success) {
        setError(userResult.error || 'User not found')
        setLoading(false)
        return
      }
      setUser(userResult.user)
      
      const projectsResult = await getProjectsByUserId(id)
      if (projectsResult.success) {
        setProjects(projectsResult.projects || [])
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [id])

  const getExperienceBadgeStyle = (level: string) => {
    switch(level) {
      case 'Beginner': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Advanced': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Looking for collaborators') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (status === 'In Progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-pink-500 animate-spin [animation-direction:reverse]"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Profile...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-2xl border border-red-500/20 max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-slate-400 mb-4">{error || 'This profile does not exist.'}</p>
          <Link href="/browse" className="text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  const memberDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDEBAR - User Info */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 lg:sticky lg:top-24">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-black border-2 border-slate-700">
                <img 
                  src={user.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name & Experience */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">{user.name}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getExperienceBadgeStyle(user.experienceLevel)}`}>
                {user.experienceLevel}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm break-all font-medium">{user.email}</span>
              </div>
              
              {user.location && (
                <div className="flex items-center gap-3 text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{user.location}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Social Profiles</h3>
              <div className="flex flex-wrap gap-3">
                <a href={user.githubUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${user.githubUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-purple-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !user.githubUrl && e.preventDefault()} title="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
                <a href={user.linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${user.linkedinUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-blue-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !user.linkedinUrl && e.preventDefault()} title="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={user.leetcodeUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${user.leetcodeUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-yellow-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !user.leetcodeUrl && e.preventDefault()} title="LeetCode">
                  <span className="font-bold text-xs">LC</span>
                </a>
                <a href={user.codechefUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${user.codechefUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-orange-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !user.codechefUrl && e.preventDefault()} title="CodeChef">
                  <span className="font-bold text-xs">CC</span>
                </a>
                <a href={user.codeforcesUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${user.codeforcesUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-red-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !user.codeforcesUrl && e.preventDefault()} title="Codeforces">
                  <span className="font-bold text-xs">CF</span>
                </a>
              </div>
            </div>

            {/* Member Since */}
            <div className="pt-5 border-t border-white/5">
              <p className="text-xs text-slate-500 text-center uppercase tracking-widest">Member since {memberDate}</p>
            </div>
          </div>
        </div>

        {/* RIGHT MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
              About
            </h1>
            
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Bio</h3>
              <p className={`text-base leading-relaxed ${user.bio ? 'text-slate-300' : 'text-slate-500 italic'}`}>
                {user.bio || "No bio added yet."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.length > 0 ? user.skills.map((skill, index) => (
                  <motion.span 
                    key={skill} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.05 }} 
                    className="px-4 py-2 bg-white/5 border border-white/5 text-slate-300 rounded-xl text-sm font-medium"
                  >
                    {skill}
                  </motion.span>
                )) : (
                  <p className="text-sm text-slate-500 italic">No skills added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
              <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
              Projects ({projects.length})
            </h2>
            
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={`/projects/${project._id}`}
                      className="block p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.slice(0, 4).map(tech => (
                          <span key={tech} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="px-2 py-1 bg-slate-800 text-slate-500 rounded text-xs">
                            +{project.techStack.length - 4} more
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-slate-500">No projects yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PublicProfilePage
