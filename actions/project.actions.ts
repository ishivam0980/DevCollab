'use server'
import getCurrentUser from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Interest from "@/models/Interest";
import User from "@/models/User";
interface ProjectResponse {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    owner: string;
    techStack: string[];
    category: string;
    experienceLevel: string;
    teamSize: string;
    duration: string;
    status: string;
    interestCount: number;
    createdAt: Date;
    updatedAt: Date;   
}

// ============================================
// MATCHING ALGORITHM HELPER
// ============================================
/**
 * Calculates how well a project matches a user's profile (0-100%)
 * 
 * Formula:
 * - Skill Match: 60% weight (can user do the work?)
 * - Experience Match: 20% weight (is difficulty appropriate?)
 * - Profile Completeness: 20% weight (is user serious/active?)
 */
function calculateMatchScore(
    userSkills: string[],
    userExperience: string,
    userProfileComplete: boolean,
    projectTechStack: string[],
    projectExperience: string
): number {
    // STEP 1: Skill Match (60% weight)
    // How many project skills does the user have?
    const matchingSkills = projectTechStack.filter(skill => 
        userSkills.includes(skill)
    );
    const skillMatchPercent = projectTechStack.length > 0 
        ? (matchingSkills.length / projectTechStack.length) * 100 
        : 0;
    
    // STEP 2: Experience Match (20% weight)
    // Is user's level appropriate for project?
    const expLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const userLevel = expLevels.indexOf(userExperience);
    const projectLevel = expLevels.indexOf(projectExperience);
    
    let expMatchPercent = 0;
    if (userLevel === projectLevel) {
        expMatchPercent = 100; // Perfect match
    } else if (Math.abs(userLevel - projectLevel) === 1) {
        expMatchPercent = 50; // One level off (still doable)
    } else {
        expMatchPercent = 25; // Two levels off (risky)
    }
    
    // STEP 3: Profile Completeness (20% weight)
    // Users with complete profiles are more serious
    const profileMatchPercent = userProfileComplete ? 100 : 50;
    
    // FINAL SCORE: Weighted average
    const finalScore = (
        skillMatchPercent * 0.6 +
        expMatchPercent * 0.2 +
        profileMatchPercent * 0.2
    );
    
    return Math.round(finalScore);
}


export const createProject = async(data: any) => {
    try {
        // Auth check
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        // Data validation
        if (!data?.title || data.title.trim().length === 0) {
            return { error: 'Title cannot be empty' };
        }
        if (!data?.description || data.description.trim().length === 0) {
            return { error: 'Description cannot be empty' };
        }
        
        // Connect to database and get user's MongoDB ObjectId
        await connectDB();
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        // Create project with proper ObjectId
        const project = await Project.create({
            ...data,
            owner: user._id  // Use MongoDB ObjectId, not session string id
        });
        
        return {
            success: true,
            project: JSON.parse(JSON.stringify(project))
        };
        
    } catch (error) {
        console.error('Create project error:', error);
        return { 
            success: false,
            error: 'Failed to create project' 
        };
    }
}
export const getProjects = async(keywords?: string) => {
    try {
        await connectDB();
        
        let query = {};
        
        // If keywords provided, use text search
        if (keywords && keywords.trim()) {
            query = { $text: { $search: keywords } };
        }
        
        const projects = await Project.find(query)
            .populate('owner', 'name email image') // Get owner details
            .sort({ createdAt: -1 }); // Newest first
        
        return {
            success: true,
            projects: JSON.parse(JSON.stringify(projects))
        };
    } catch (error) {
        
        console.error('Get projects error:', error);
        return { 
            success:false,
            error: 'Failed to fetch projects' 
        };
    }
}

// Get all projects by a specific user ID
export const getProjectsByUserId = async (userId: string) => {
    try {
        await connectDB();
        
        // Validate ObjectId format
        if (!userId || !/^[a-fA-F0-9]{24}$/.test(userId)) {
            return { success: false, error: 'Invalid user ID' };
        }
        
        const projects = await Project.find({ owner: userId })
            .populate('owner', 'name email image')
            .sort({ createdAt: -1 });
        
        return {
            success: true,
            projects: JSON.parse(JSON.stringify(projects))
        };
    } catch (error) {
        console.error('Get projects by user error:', error);
        return { success: false, error: 'Failed to fetch projects' };
    }
}
export const getProject=async(projectId:string)=>{
    try {
        //Here we didnt do auth check. As public user can also view project
        await connectDB();
        const project=await Project.findById(projectId)
        .populate('owner','name email image')
        return {
            success: true,
            project: JSON.parse(JSON.stringify(project))
        };
    } catch (error) {
        console.error('Get project error:', error);
        return { 
            success:false,
            error: 'Failed to fetch project' 
        };
    }
}

export const updateProject=async(projectId:string,data:any)=>{
    try {
        // Auth check
        const currentUser=await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        // Get user's MongoDB ObjectId
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        // Find project first to check ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        // Ownership check (CRITICAL SECURITY) - compare MongoDB ObjectIds
        if (project.owner.toString() !== user._id.toString()) {
            return { error: 'Not your project!' };
        }
        
        // Now safe to update
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            data,
            { new: true }
        ).populate('owner','name email image');
        
        return {
            success: true,
            project: JSON.parse(JSON.stringify(updatedProject))
        };
    } catch (error) {
        console.error('Update project error:', error);
        return { 
            success:false,
            error: 'Failed to update project' 
        };
    }
}

export const deleteProject=async(projectId:string)=>{
    try {
        // Auth check
        const currentUser=await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        // Get user's MongoDB ObjectId
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        // Find project first to check ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        // Ownership check (CRITICAL SECURITY) - compare MongoDB ObjectIds
        if (project.owner.toString() !== user._id.toString()) {
            return { error: 'Not your project!' };
        }
        
        // Delete project
        await Project.findByIdAndDelete(projectId);
        
        // Cleanup: Delete all interests related to this project
        await Interest.deleteMany({ project: projectId });
        
        return {
            success: true
        };
    } catch (error) {
        console.error('Delete project error:', error);
        return { 
            success:false,
            error: 'Failed to delete project' 
        };
    }
}

// ============================================
// HELPER: Check if user profile is complete
// ============================================
/**
 * Profile is "complete" if user has filled:
 * - Bio, Skills (at least 1), Experience Level, Location
 * Returns true if 3+ of these are filled
 */
function isProfileComplete(user: any): boolean {
    let filledFields = 0;
    if (user.bio && user.bio.trim().length > 0) filledFields++;
    if (user.skills && user.skills.length > 0) filledFields++;
    if (user.experienceLevel) filledFields++;
    if (user.location && user.location.trim().length > 0) filledFields++;
    return filledFields >= 3;
}

// ============================================
// GET PROJECTS WITH MATCHING (For Browse Page)
// ============================================
/**
 * Gets all projects with match scores for the current user.
 * Supports keyword search, filters, and PAGINATION.
 * Uses regex search for reliability (no text index required).
 */
export const getProjectsWithMatching = async(
    keywords?: string,
    filters?: {
        techStack?: string[];
        experienceLevel?: string;
        category?: string;
    },
    page: number = 1,
    limit: number = 12
) => {
    try {
        await connectDB();
        
        // Build query based on filters
        let query: any = {};
        
        // Use regex search for keywords (more reliable than $text)
        // Searches: title, description, shortDescription, AND techStack
        if (keywords && keywords.trim()) {
            const searchRegex = new RegExp(keywords.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { shortDescription: searchRegex },
                { techStack: { $elemMatch: { $regex: searchRegex } } }
            ];
        }
        
        // Apply filters
        if (filters?.techStack && filters.techStack.length > 0) {
            query.techStack = { $in: filters.techStack };
        }
        if (filters?.experienceLevel) {
            query.experienceLevel = filters.experienceLevel;
        }
        if (filters?.category) {
            query.category = filters.category;
        }
        
        // Get total count for pagination
        const totalCount = await Project.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;
        
        // Fetch paginated projects
        const projects = await Project.find(query)
            .populate('owner', 'name email image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        // Try to get current user for matching
        const currentUser = await getCurrentUser();
        
        let projectsWithScores = projects.map(project => {
            return JSON.parse(JSON.stringify(project));
        });
        
        // If user is logged in, calculate match scores
        if (currentUser) {
            const userProfile = await User.findOne({ email: currentUser.email });
            
            if (userProfile) {
                const userSkills = userProfile.skills || [];
                const userExperience = userProfile.experienceLevel || 'Beginner';
                const profileComplete = isProfileComplete(userProfile);
                
                projectsWithScores = projectsWithScores
                    .filter(project => {
                        // Filter out user's own projects from browse
                        return project.owner?.email !== currentUser.email;
                    })
                    .map(project => {
                        project.matchScore = calculateMatchScore(
                            userSkills,
                            userExperience,
                            profileComplete,
                            project.techStack || [],
                            project.experienceLevel || 'Beginner'
                        );
                        project.isOwner = false;
                        return project;
                    })
                    // Sort by matchScore descending (highest first)
                    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            }
        }
        
        return {
            success: true,
            projects: projectsWithScores,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasMore: page < totalPages
            }
        };
        
    } catch (error) {
        console.error('Get projects with matching error:', error);
        return { 
            success: false,
            error: 'Failed to fetch projects' 
        };
    }
}

// ============================================
// GET MATCHED PROJECTS (For Dashboard Recommendations)
// ============================================
/**
 * Gets top matching projects for the logged-in user.
 * Excludes user's own projects.
 * Returns only projects with 40%+ match, sorted by score.
 */
export const getMatchedProjects = async(limit: number = 5) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { error: 'Please log in to see recommendations' };
        }
        
        await connectDB();
        
        // Get user's full profile
        const userProfile = await User.findOne({ email: currentUser.email });
        if (!userProfile) {
            return { error: 'Profile not found' };
        }
        
        const userSkills = userProfile.skills || [];
        const userExperience = userProfile.experienceLevel || 'Beginner';
        const profileComplete = isProfileComplete(userProfile);
        
        // Fetch all projects (exclude user's own projects)
        const projects = await Project.find({ 
            owner: { $ne: userProfile._id },
            status: 'Looking for collaborators' // Only show open projects
        })
            .populate('owner', 'name email image')
            .sort({ createdAt: -1 });
        
        // Calculate match scores
        const projectsWithScores = projects.map(project => {
            const plainProject = JSON.parse(JSON.stringify(project));
            plainProject.matchScore = calculateMatchScore(
                userSkills,
                userExperience,
                profileComplete,
                project.techStack || [],
                project.experienceLevel || 'Beginner'
            );
            return plainProject;
        });
        
        // Filter to 40%+ matches, sort by score, limit results
        const matchedProjects = projectsWithScores
            .filter(p => p.matchScore >= 40)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
        
        return {
            success: true,
            projects: matchedProjects
        };
        
    } catch (error) {
        console.error('Get matched projects error:', error);
        return { 
            success: false,
            error: 'Failed to fetch recommendations' 
        };
    }
}
