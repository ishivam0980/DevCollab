'use client'

import { useState, useEffect } from "react"
import { getProjectsWithMatching } from "@/actions/project.actions"
import { TECH_SKILLS, EXPERIENCE_LEVELS, PROJECT_CATEGORIES } from "@/lib/constants"
import { motion } from "framer-motion"
import Link from "next/link"

// Types for our project data
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
  teamSize: string;
  duration: string;
  status: string;
  interestCount: number;
  matchScore: number | null;
  isOwner?: boolean;
  createdAt: string;
}

const BrowsePage = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedExperience, setSelectedExperience] = useState("")
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Fetch projects on mount and when filters change
  useEffect(() => {
    // Reset pagination when filters change
    setCurrentPage(1)
    setProjects([])
    fetchProjects(1, true)
  }, [selectedCategory, selectedExperience, selectedTechStack])

  const fetchProjects = async (page: number = 1, reset: boolean = false) => {
    if (reset) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      const result = await getProjectsWithMatching(
        searchQuery || undefined,
        {
          category: selectedCategory || undefined,
          experienceLevel: selectedExperience || undefined,
          techStack: selectedTechStack.length > 0 ? selectedTechStack : undefined
        },
        page,
        12 // limit per page
      )
      
      if (result.success && result.projects) {
        if (reset) {
          setProjects(result.projects)
        } else {
          setProjects(prev => [...prev, ...result.projects])
        }
        
        if (result.pagination) {
          setCurrentPage(result.pagination.page)
          setTotalCount(result.pagination.totalCount)
          setHasMore(result.pagination.hasMore)
        }
      } else {
        setError(result.error || 'Failed to load projects')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1)
    setProjects([])
    fetchProjects(1, true)
  }
  
  // Load more projects
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProjects(currentPage + 1, false)
    }
  }
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedExperience("")
    setSelectedTechStack([])
  }

  // Toggle tech stack filter
  const toggleTech = (tech: string) => {
    setSelectedTechStack(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  // Helper: Get match badge color based on score
  const getMatchBadge = (score: number | null) => {
    if (score === null) return null
    if (score >= 80) return { text: "Excellent Match", color: "bg-green-500/20 text-green-400 border-green-500/30" }
    if (score >= 60) return { text: "Good Match", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    if (score >= 40) return { text: "Potential Match", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    return { text: "Low Match", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" }
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

  // Helper: Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
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
          <h1 className="text-3xl font-bold text-white">Browse Projects</h1>
          <p className="text-slate-400 mt-1">Find projects that match your skills</p>
        </div>
        <Link 
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </Link>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10 transition-all"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 hover:scale-[1.02] text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30"
          >
            Search
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${showFilters ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/5'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Categories</option>
                  {PROJECT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Experience Level</label>
                <select 
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Tech Stack Filter */}
            <div className="mt-4">
              <label className="block text-sm text-slate-400 mb-2">Tech Stack ({TECH_SKILLS.length} available)</label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
                {TECH_SKILLS.map(tech => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedTechStack.includes(tech)
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : tech === 'Others' 
                          ? 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-slate-400 text-sm">
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''} found`}
          </p>
          {!loading && projects.length > 0 && (
            <span className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
              ✨ Sorted by skill match
            </span>
          )}
        </div>
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
            <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Projects...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No projects found</h2>
          <p className="text-slate-400 mb-6">Try adjusting your filters or be the first to create a project!</p>
          <Link 
            href="/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Project
          </Link>
        </div>
      )}

      {/* Project Cards Grid */}
      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/projects/${project._id}`}>
                <div className="glass-card rounded-xl overflow-hidden hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col group">
                  {/* Gradient Header Bar */}
                  <div className="h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    {/* Header with Match Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-purple-200 transition-colors">{project.title}</h3>
                      {project.matchScore !== null && (
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold border-2 shadow-lg ${
                          project.matchScore >= 70 ? 'bg-green-500/20 border-green-500/50 text-green-400 shadow-green-500/20' :
                          project.matchScore >= 40 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-yellow-500/20' :
                          'bg-slate-700/50 border-slate-600 text-slate-300'
                        }`}>
                          {project.matchScore}%
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                      {project.shortDescription || project.description.slice(0, 120)}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.techStack.slice(0, 4).map(tech => (
                        <span key={tech} className="px-2 py-0.5 text-xs bg-slate-800/80 text-slate-300 rounded-md border border-white/5">
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-2 py-0.5 text-xs bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Experience Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full border font-medium ${getExpBadge(project.experienceLevel)}`}>
                        {project.experienceLevel}
                      </span>
                      <span className="text-xs text-slate-500">{project.category}</span>
                    </div>

                    {/* Footer: Owner & Stats */}
                    <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Avatar with gradient ring */}
                        <div className="p-0.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                          <img 
                            src={project.owner?.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(project.owner?.name || 'User')}`}
                            alt={project.owner?.name}
                            className="w-6 h-6 rounded-full border border-slate-900 object-cover"
                          />
                        </div>
                        <span className="text-sm text-slate-400">{project.owner?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {project.interestCount}
                        </span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Load More Button / Pagination */}
      {!loading && !error && projects.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Load More Projects
                </>
              )}
            </button>
          ) : (
            <p className="text-slate-500 text-sm">You've reached the end</p>
          )}
          <p className="text-slate-500 text-xs">
            Showing {projects.length} of {totalCount} projects
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default BrowsePage
