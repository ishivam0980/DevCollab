'use client'

import { useState, useEffect, useRef } from "react"
import { getProfile, updateProfile } from "@/actions/user.actions"
import { TECH_SKILLS } from "@/lib/constants"

// Type for the data to handle revert logic easily
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

const Page = () => { 

  const [loading, setLoading] = useState<boolean>(true)
  const [hasErrorLoading, setLoadingError] = useState<boolean>(false)
  const [hasUnexpectedError, setUnexpectedError] = useState<boolean>(false)
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Current State (Displayed/Edited)
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

  // Backup State (For Cancellation)
  const backupData = useRef<ProfileData | null>(null)

  // Skill Input State
  const [showSkillSelector, setShowSkillSelector] = useState(false)
  const skillSelectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
       const fetchProfileDetails = async () => {
        setLoading(true);
        try {
          const result = await getProfile();
          
          /* REASON for checking !result.success instead of result.error:
             
             We are using a "Discriminated Union" in TypeScript.
             - Success Type: { success: true, user: ... } (Does NOT have an 'error' property)
             - Failure Type: { success: false, error: ... } (Does NOT have a 'user' property)
             
             If we try to write "if (result.error)", TypeScript yells because the Success Type 
             doesn't even have an 'error' property to check! 
             
             By checking "result.success", we are checking the one shared property (the "discriminator").
             Once we know success is false, TypeScript is smart enough to know we are in the 
             Failure Type, so accessing .error becomes safe.
          */
          if(!result.success){
            console.log(result.error);
            setLoadingError(true)
          }
          else{
            // Because we are in the "else" (Success) block, TypeScript knows 'result.user' DEFINITELY exists.
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
              /*
                 REASON for (result.user.image || ''):
                 
                 1. The Interface: In UserProfile, we defined image as "image?: string".
                    This means 'image' can be a String OR Undefined.
                 
                 2. The State: Our state is "useState<string>('')". 
                    It ONLY accepts strings. It does not accept undefined.
                 
                 3. If image is undefined (missing), use an empty string '' instead.
                    This prevents the app from crashing due to type mismatches.
              */
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
      
      fetchProfileDetails();
  }, [])

  // Start Editing
  const handleEdit = () => {
    backupData.current = { ...data } // Save copy
    setIsEditing(true)
  }

  // Cancel Editing
  const handleCancel = () => {
    if (backupData.current) {
      setData(backupData.current) // Revert
    }
    setIsEditing(false)
  }

  // Save Editing
  const handleSave = async () => {
    setIsSaving(true)
    
    // Create FormData
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('bio', data.bio)
    formData.append('location', data.location)
    formData.append('experienceLevel', data.experienceLevel)
    formData.append('skills', data.skills.join(','))
    formData.append('githubUrl', data.githubUrl)
    formData.append('linkedinUrl', data.linkedinUrl)
    // Note: Add other fields to updateProfile action if needed in future

    const result = await updateProfile(formData)
    
    if (result.success) {
      setIsEditing(false)
      // Success interaction could be added here (toast, etc)
    } else {
      alert("Failed to save profile")
    }
    setIsSaving(false)
  }

  // Field Change Handler
  const handleChange = (field: keyof ProfileData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  // Skill Management
  const removeSkill = (skillToRemove: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const addSkill = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSkill = e.target.value
    if (newSkill && !data.skills.includes(newSkill)) {
      setData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }))
    }
    setShowSkillSelector(false)
    if(skillSelectRef.current) skillSelectRef.current.value = ""
  }

  // ============================================
  // LOADING & ERROR STATES
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (hasErrorLoading) return <div className="text-red-500 text-center mt-10 min-h-screen bg-gray-100">Failed to load profile.</div>;
  if (hasUnexpectedError) return <div className="text-red-500 text-center mt-10 min-h-screen bg-gray-100">An unexpected error occurred.</div>;

  // ============================================
  // MAIN RENDER - RESUME STYLE LAYOUT
  // ============================================

  return (
    <div className="flex justify-center">
      
      {/* Resume Card Container */}
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ============================================ */}
        {/* LEFT SIDEBAR - Dark Blue Section */}
        {/* ============================================ */}
        <div className="w-full md:w-80 bg-slate-800 text-white p-6 flex flex-col">
          
          {/* Profile Picture */}
          <div className="mb-4">
            <img 
              src={data.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`} 
              alt="Profile" 
              className="w-48 h-48 rounded-lg object-cover mx-auto border-4 border-slate-600 shadow-lg"
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-4 mb-8">
            {/* Email */}
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-sm text-slate-300 break-all">{data.email}</span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {isEditing ? (
                <input 
                  type="text"
                  value={data.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="bg-slate-700 text-sm text-white px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-full"
                  placeholder="City, Country"
                />
              ) : (
                <span className="text-sm text-slate-300">{data.location || 'No location set'}</span>
              )}
            </div>
          </div>

          {/* Social Links Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Social Links</h3>
            <div className="flex flex-wrap gap-3">
              {/* GitHub */}
              {(data.githubUrl || isEditing) && (
                isEditing ? (
                  <input 
                    type="text"
                    value={data.githubUrl}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    className="bg-slate-700 text-xs text-white px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-full mb-2"
                    placeholder="GitHub URL"
                  />
                ) : (
                  <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </a>
                )
              )}
              
              {/* LinkedIn */}
              {(data.linkedinUrl || isEditing) && (
                isEditing ? (
                  <input 
                    type="text"
                    value={data.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    className="bg-slate-700 text-xs text-white px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-full mb-2"
                    placeholder="LinkedIn URL"
                  />
                ) : (
                  <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )
              )}

              {/* LeetCode */}
              {(data.leetcodeUrl || isEditing) && (
                isEditing ? (
                  <input 
                    type="text"
                    value={data.leetcodeUrl}
                    onChange={(e) => handleChange('leetcodeUrl', e.target.value)}
                    className="bg-slate-700 text-xs text-white px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-full mb-2"
                    placeholder="LeetCode URL"
                  />
                ) : (
                  <a href={data.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors text-xs font-bold">
                    LC
                  </a>
                )
              )}

              {/* CodeChef */}
              {(data.codechefUrl || isEditing) && (
                isEditing ? (
                  <input 
                    type="text"
                    value={data.codechefUrl}
                    onChange={(e) => handleChange('codechefUrl', e.target.value)}
                    className="bg-slate-700 text-xs text-white px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-full mb-2"
                    placeholder="CodeChef URL"
                  />
                ) : (
                  <a href={data.codechefUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors text-xs font-bold">
                    CC
                  </a>
                )
              )}

              {/* CodeForces */}
              {(data.codeforcesUrl || isEditing) && (
                isEditing ? (
                  <input 
                    type="text"
                    value={data.codeforcesUrl}
                    onChange={(e) => handleChange('codeforcesUrl', e.target.value)}
                    className="bg-slate-700 text-xs text-white px-2 py-1 rounded border border-slate-600 focus:border-blue-400 focus:outline-none w-full mb-2"
                    placeholder="CodeForces URL"
                  />
                ) : (
                  <a href={data.codeforcesUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors text-xs font-bold">
                    CF
                  </a>
                )
              )}
            </div>
          </div>

          {/* Member Since - Added PB to ensure not cut off */}
          <div className="mt-auto pt-8 border-t border-slate-700 pb-2">
            <p className="text-xs text-slate-500 text-center">Member since {data.date}</p>
          </div>

        </div>

        {/* ============================================ */}
        {/* RIGHT MAIN CONTENT - White Section */}
        {/* ============================================ */}
        <div className="flex-1 p-8 md:p-12">
          
          {/* Header with Name and Edit Button */}
          <div className="flex justify-between items-start mb-6">
            <div className="w-full mr-4">
              {isEditing ? (
                <input 
                  type="text"
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="text-4xl font-bold text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-indigo-300 rounded px-1 -ml-1 focus:outline-none w-full transition-all"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-4xl font-bold text-gray-900">{data.name}</h1>
              )}
              
              {/* Experience Level Badge */}
              {isEditing ? (
                <select
                  value={data.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  className="mt-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm font-medium border border-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
                >
                  <option value="Beginner">Beginner Developer</option>
                  <option value="Intermediate">Intermediate Developer</option>
                  <option value="Advanced">Senior Developer</option>
                </select>
              ) : (
                <p className="text-gray-500 mt-1">{data.experienceLevel} Developer</p>
              )}
            </div>
            
            {/* Edit Profile Button */}
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Summary / Bio Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Summary</h2>
            {isEditing ? (
              <textarea 
                value={data.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                className="w-full text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-3 focus:border-indigo-500 focus:outline-none resize-none"
                placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              />
            ) : (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {data.bio || 'No summary provided. Click "Edit Profile" to add one.'}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Skills</h2>
              
              {/* Add Skill Button (Visible Only in Edit Mode) */}
              {isEditing && (
                <div className="relative">
                  {!showSkillSelector ? (
                    <button
                      onClick={() => setShowSkillSelector(true)}
                      className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Skill
                    </button>
                  ) : (
                    <select
                      ref={skillSelectRef}
                      onChange={addSkill}
                      onBlur={() => setShowSkillSelector(false)}
                      autoFocus
                      className="bg-white text-gray-900 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm min-w-[150px]"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a skill...</option>
                      {TECH_SKILLS.filter(s => !data.skills.includes(s)).map(skill => (
                        <option key={skill} value={skill} className="text-gray-900">{skill}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Skills Tags */}
            <div className="flex flex-wrap gap-2">
              {data.skills.length > 0 ? data.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-200"
                >
                  {skill}
                  {isEditing && (
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="text-gray-400 hover:text-red-600 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </span>
              )) : (
                <span className="text-gray-400 text-sm">No skills added yet. {isEditing && 'Use "Add Skill" to add your tech stack.'}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Page