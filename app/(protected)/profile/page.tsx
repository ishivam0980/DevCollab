'use client'

import { useState, useEffect, useRef } from "react"
import { getProfile, updateProfile } from "@/actions/user.actions"
import { TECH_SKILLS } from "@/lib/constants"
import { motion } from "framer-motion"
import { UploadButton } from "@/lib/uploadthing"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface ProfileData {
  name: string;
  email: string; 
  bio: string;
  location: string;
  skills: string[];
  experienceLevel: string;
  githubUrl: string;
  linkedinUrl: string;
  leetcodeUrl: string;
  codechefUrl: string;
  codeforcesUrl: string;
  image: string;
  date: string;
}

const ProfilePage = () => { 
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState<boolean>(true)
  const [hasErrorLoading, setLoadingError] = useState<boolean>(false)
  const [hasUnexpectedError, setUnexpectedError] = useState<boolean>(false)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [data, setData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
    location: '',
    skills: [],
    experienceLevel: 'Beginner',
    githubUrl: '',
    linkedinUrl: '',
    leetcodeUrl: '',
    codechefUrl: '',
    codeforcesUrl: '',
    image: '',
    date: ''
  })

  const backupData = useRef<ProfileData | null>(null)
  
  // Skill selection state
  const [showSkillSelector, setShowSkillSelector] = useState(false)
  const [skillSearch, setSkillSearch] = useState('')
  const skillDropdownRef = useRef<HTMLDivElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillSelector(false)
      }
    }
    if (showSkillSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSkillSelector])

  // Filter skills based on search
  const filteredSkills = (() => {
    // 1. Get matches (exclude 'Others' to avoid duplication/filtering issues)
    const filtered = TECH_SKILLS.filter(skill => 
      !data.skills.includes(skill) && 
      skill !== 'Others' &&
      skill.toLowerCase().includes(skillSearch.toLowerCase())
    )
    
    // 2. Always show "Others" at the end if not already selected
    // This allows users to select it even if their search matches other items partially
    if (!data.skills.includes('Others')) {
      filtered.push('Others')
    }
    
    return filtered
  })()

  const fetchProfileDetails = async () => {
    setLoading(true);
    try {
      const result = await getProfile();
      
      if(!result.success){
        console.log(result.error);
        setLoadingError(true)
      }
      else{
        if(!result.user) return;
        
        const fetchedData: ProfileData = {
          name: result.user.name,
          email: result.user.email,
          bio: result.user.bio || '',
          location: result.user.location || '',
          skills: result.user.skills || [],
          experienceLevel: result.user.experienceLevel || 'Beginner',
          githubUrl: result.user.githubUrl || '',
          linkedinUrl: result.user.linkedinUrl || '',
          leetcodeUrl: result.user.leetcodeUrl || '',
          codechefUrl: result.user.codechefUrl || '',
          codeforcesUrl: result.user.codeforcesUrl || '',
          image: result.user.image || '',
          date: new Date(result.user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        }
        
        setData(fetchedData)
      }
    } catch (error) {
      setUnexpectedError(true);
    } finally {
      setLoading(false);
    }
  }

  // Refresh profile without showing loading spinner (for image updates)
  const refreshProfile = async () => {
    try {
      const result = await getProfile();
      if(result.success && result.user) {
        const fetchedData: ProfileData = {
          name: result.user.name,
          email: result.user.email,
          bio: result.user.bio || '',
          location: result.user.location || '',
          skills: result.user.skills || [],
          experienceLevel: result.user.experienceLevel || 'Beginner',
          githubUrl: result.user.githubUrl || '',
          linkedinUrl: result.user.linkedinUrl || '',
          leetcodeUrl: result.user.leetcodeUrl || '',
          codechefUrl: result.user.codechefUrl || '',
          codeforcesUrl: result.user.codeforcesUrl || '',
          image: result.user.image || '',
          date: new Date(result.user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        }
        setData(fetchedData)
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  }

  useEffect(() => {
    fetchProfileDetails();
  }, [])

  const handleEdit = () => {
    backupData.current = { ...data, skills: [...data.skills] }
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (backupData.current) {
      setData(backupData.current)
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('bio', data.bio)
    formData.append('location', data.location)
    formData.append('experienceLevel', data.experienceLevel)
    formData.append('skills', data.skills.join(','))
    formData.append('githubUrl', data.githubUrl)
    formData.append('linkedinUrl', data.linkedinUrl)
    formData.append('leetcodeUrl', data.leetcodeUrl)
    formData.append('codechefUrl', data.codechefUrl)
    formData.append('codeforcesUrl', data.codeforcesUrl)
    if(data.image) formData.append('image', data.image)

    const result = await updateProfile(formData)
    
    if (result.success) {
      // Use the image URL returned from server for session update
      const imageToUse = result.newImage || data.image
      await update({ 
        ...session, 
        user: { 
          ...session?.user, 
          image: imageToUse,
          name: data.name  // Also update name in session
        } 
      })
      setIsEditing(false)
    } else {
      alert("Failed to save profile")
    }
    setIsSaving(false)
  }

  const handleChange = (field: keyof ProfileData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const removeSkill = (skillToRemove: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addSkill = (skill: string) => {
    if (skill && !data.skills.includes(skill)) {
      setData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
    setSkillSearch('')
    setShowSkillSelector(false)
  }

  const getExperienceBadgeStyle = (level: string) => {
    switch(level) {
      case 'Beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
      case 'Intermediate':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
      case 'Advanced':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
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
    );
  }

  if (hasErrorLoading || hasUnexpectedError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-2xl border border-red-500/20">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to load profile</h2>
          <p className="text-slate-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* LEFT SIDEBAR */}
      <div className="md:col-span-1">
        <div className="glass-card rounded-2xl p-6 md:sticky md:top-24">
          
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group w-32 h-32">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-black border-2 border-slate-700">
                <img 
                  src={data.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`} 
                  alt="Profile" 
                  className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-30' : ''}`}
                />
                
                {/* Uploading Spinner Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                      <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
                    </div>
                    <span className="text-xs text-white font-medium mt-2">Uploading...</span>
                  </div>
                )}
                
                {isEditing && !isUploading && (
                  <>
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity pointer-events-none">
                      <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-white font-medium">Change</span>
                    </div>
                    {/* Invisible Upload Trigger covering the whole circle */}
                    <div className="absolute inset-0 z-50 opacity-0 cursor-pointer">
                      <UploadButton
                        endpoint="profileImage"
                        onUploadBegin={() => {
                          setIsUploading(true)
                        }}
                        onClientUploadComplete={(res) => {
                          setIsUploading(false)
                          if (res && res[0]) {
                            // Update local state ONLY (Preview Mode)
                            setData(prev => ({ ...prev, image: res[0].url }));
                          }
                        }}
                        onUploadError={(error) => {
                          setIsUploading(false)
                          alert(`Upload failed: ${error.message}`);
                        }}
                        appearance={{
                          container: "w-full h-full",
                          button: "w-full h-full cursor-pointer",
                          allowedContent: "hidden"
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="text-center mb-6">
            {isEditing ? (
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xl font-bold text-center rounded-xl px-4 py-2 focus:outline-none focus:border-white/30 mb-3"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white mb-2">{data.name}</h2>
            )}
            
            {isEditing ? (
              <select
                value={data.experienceLevel}
                onChange={(e) => handleChange('experienceLevel', e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="Beginner" className="bg-slate-900">Beginner</option>
                <option value="Intermediate" className="bg-slate-900">Intermediate</option>
                <option value="Advanced" className="bg-slate-900">Advanced</option>
              </select>
            ) : (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getExperienceBadgeStyle(data.experienceLevel)}`}>
                {data.experienceLevel}
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm break-all font-medium">{data.email}</span>
            </div>
            
            <div className="flex items-center gap-3 text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {isEditing ? (
                <input 
                  type="text"
                  value={data.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-600"
                  placeholder="City, Country"
                />
              ) : (
                <span className="text-sm font-medium">{data.location || 'Location not set'}</span>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Social Profiles</h3>
            
            {isEditing ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </div>
                  <input type="text" value={data.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-white/30" placeholder="GitHub URL" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </div>
                  <input type="text" value={data.linkedinUrl} onChange={(e) => handleChange('linkedinUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-white/30" placeholder="LinkedIn URL" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">LC</div>
                  <input type="text" value={data.leetcodeUrl} onChange={(e) => handleChange('leetcodeUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-white/30" placeholder="LeetCode URL" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">CC</div>
                  <input type="text" value={data.codechefUrl} onChange={(e) => handleChange('codechefUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-white/30" placeholder="CodeChef URL" />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">CF</div>
                  <input type="text" value={data.codeforcesUrl} onChange={(e) => handleChange('codeforcesUrl', e.target.value)} className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-white/30" placeholder="Codeforces URL" />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <a href={data.githubUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${data.githubUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-purple-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !data.githubUrl && e.preventDefault()} title="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
                <a href={data.linkedinUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${data.linkedinUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-blue-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !data.linkedinUrl && e.preventDefault()} title="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={data.leetcodeUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${data.leetcodeUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-yellow-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !data.leetcodeUrl && e.preventDefault()} title="LeetCode">
                  <span className="font-bold text-xs">LC</span>
                </a>
                <a href={data.codechefUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${data.codechefUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-orange-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !data.codechefUrl && e.preventDefault()} title="CodeChef">
                  <span className="font-bold text-xs">CC</span>
                </a>
                <a href={data.codeforcesUrl || '#'} target="_blank" rel="noopener noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-white/5 ${data.codeforcesUrl ? 'bg-white/5 hover:bg-white/10 text-white hover:scale-110 hover:border-red-500/50' : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'}`} onClick={(e) => !data.codeforcesUrl && e.preventDefault()} title="Codeforces">
                  <span className="font-bold text-xs">CF</span>
                </a>
              </div>
            )}
          </div>

          {/* Member Since */}
          <div className="pt-5 border-t border-white/5">
            <p className="text-xs text-slate-500 text-center uppercase tracking-widest">Member since {data.date}</p>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="md:col-span-2">
        <div className="glass-card rounded-2xl p-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
              About Me
            </h1>
            {isEditing ? (
              <div className="flex gap-3">
                <button onClick={handleCancel} className="text-slate-400 hover:text-white px-4 py-2 text-sm rounded-xl transition-all cursor-pointer hover:bg-white/5">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 text-sm rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-500/20">
                  {isSaving ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>) : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button onClick={handleEdit} className="text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 hover:border-purple-500/30 group">
                <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* Summary */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Bio</h3>
              {isEditing ? (
                <textarea value={data.bio} onChange={(e) => handleChange('bio', e.target.value)} className="w-full min-h-[120px] bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-white/30 resize-none leading-relaxed" placeholder="Tell others about yourself..." />
              ) : (
                <p className={`text-base leading-relaxed ${data.bio ? 'text-slate-300' : 'text-slate-500 italic'}`}>{data.bio || "No summary added yet."}</p>
              )}
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skills & Technologies</h3>
              {isEditing ? (
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {data.skills.map((skill, index) => (
                      <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-sm font-medium flex items-center gap-2">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-purple-400 hover:text-red-400 transition-colors cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </motion.span>
                    ))}
                  </div>
                  {showSkillSelector ? (
                    <div className="relative w-full max-w-xs" ref={skillDropdownRef}>
                      <div className="relative">
                        <input
                          type="text" 
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-purple-500/50 text-white text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-purple-500 shadow-lg shadow-purple-500/10 transition-all placeholder:text-slate-600"
                          placeholder="Search skills..."
                          autoFocus
                        />
                        <button 
                          onClick={() => setShowSkillSelector(false)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      
                      <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                        {filteredSkills.length > 0 ? (
                          filteredSkills.map(skill => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-purple-500/20 hover:text-white transition-colors border-b border-slate-700/50 last:border-0"
                            >
                              {skill}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                            No matching skills found
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowSkillSelector(true)} className="flex items-center gap-2 text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all cursor-pointer hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 group">
                      <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                        <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </div>
                      Add Skill
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.skills.length > 0 ? data.skills.map((skill, index) => (
                    <motion.span 
                      key={skill} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: index * 0.05 }} 
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all cursor-default"
                    >
                      {skill}
                    </motion.span>
                  )) : (<p className="text-sm text-slate-500">No skills added yet</p>)}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="pt-6 border-t border-white/5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/projects/new" className="group flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  Create New Project
                </Link>
                <Link href="/browse" className="group flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl text-white font-medium transition-all">
                  <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  Browse Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProfilePage
