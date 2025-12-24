'use server'
import getCurrentUser from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Interest from "@/models/Interest";
import Project from "@/models/Project";
import User from "@/models/User";

// ============================================
// TOGGLE INTEREST (Show or Withdraw Interest)
// ============================================
/**
 * Toggles user's interest in a project.
 * - If already interested → removes interest
 * - If not interested → adds interest
 * Returns the new state (interested: true/false)
 */
export const toggleInterest = async(projectId: string) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        // Get the user's MongoDB _id
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        // Can't show interest in your own project
        if (project.owner.toString() === user._id.toString()) {
            return { error: 'Cannot show interest in your own project' };
        }
        
        // Check if already interested
        const existingInterest = await Interest.findOne({
            user: user._id,
            project: projectId
        });
        
        if (existingInterest) {
            // Already interested → remove it
            await Interest.findByIdAndDelete(existingInterest._id);
            
            // Decrement the interest count on project
            await Project.findByIdAndUpdate(projectId, {
                $inc: { interestCount: -1 }
            });
            
            return { success: true, interested: false };
        } else {
            // Not interested → add it
            await Interest.create({
                user: user._id,
                project: projectId
            });
            
            // Increment the interest count on project
            await Project.findByIdAndUpdate(projectId, {
                $inc: { interestCount: 1 }
            });
            
            return { success: true, interested: true };
        }
        
    } catch (error) {
        console.error('Toggle interest error:', error);
        return { error: 'Failed to update interest' };
    }
}

// ============================================
// CHECK IF USER IS INTERESTED
// ============================================
/**
 * Checks if current user has shown interest in a project.
 * Used to show correct button state (I'm Interested vs Withdraw)
 */
export const checkInterest = async(projectId: string) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            // Not logged in - can't be interested
            return { success: true, interested: false };
        }
        
        await connectDB();
        
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { success: true, interested: false };
        }
        
        const interest = await Interest.findOne({
            user: user._id,
            project: projectId
        });
        
        return { success: true, interested: !!interest };
        
    } catch (error) {
        console.error('Check interest error:', error);
        return { error: 'Failed to check interest' };
    }
}

// ============================================
// GET MY INTERESTS (For My Interests Page)
// ============================================
/**
 * Gets all projects that the current user has shown interest in.
 * Used for "My Interests" page.
 */
export const getMyInterests = async() => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        // Find all interests for this user and populate project details
        const interests = await Interest.find({ user: user._id })
            .populate({
                path: 'project',
                populate: {
                    path: 'owner',
                    select: 'name email image'
                }
            })
            .sort({ createdAt: -1 }); // Most recent first
        
        // Extract projects from interests
        const projects = interests
            .map(i => i.project)
            .filter(p => p !== null); // Filter out deleted projects
        
        return { 
            success: true, 
            projects: JSON.parse(JSON.stringify(projects)) 
        };
        
    } catch (error) {
        console.error('Get my interests error:', error);
        return { error: 'Failed to fetch interests' };
    }
}

// ============================================
// GET INTERESTED USERS (For Project Owner)
// ============================================
/**
 * Gets all users who have shown interest in a specific project.
 * Only the project owner can see this list.
 */
export const getInterestedUsers = async(projectId: string) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        // Check if current user owns this project
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        // Security: Only owner can see interested users
        if (project.owner.toString() !== user._id.toString()) {
            return { error: 'Only project owner can view interested users' };
        }
        
        // Find all interests for this project and populate user details
        const interests = await Interest.find({ project: projectId })
            .populate({
                path: 'user',
                select: 'name email image skills experienceLevel bio location'
            })
            .sort({ createdAt: -1 });
        
        // Extract users from interests
        const users = interests
            .map(i => i.user)
            .filter(u => u !== null);
        
        return { 
            success: true, 
            users: JSON.parse(JSON.stringify(users)) 
        };
        
    } catch (error) {
        console.error('Get interested users error:', error);
        return { error: 'Failed to fetch interested users' };
    }
}

// ============================================
// GET MY PROJECTS (For My Projects Page)
// ============================================
/**
 * Gets all projects created by the current user.
 * Used for "My Projects" page.
 */
export const getMyProjects = async() => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        const user = await User.findOne({ email: currentUser.email });
        if (!user) {
            return { error: 'User not found' };
        }
        
        const projects = await Project.find({ owner: user._id })
            .populate('owner', 'name email image')
            .sort({ createdAt: -1 });
        
        return { 
            success: true, 
            projects: JSON.parse(JSON.stringify(projects)) 
        };
        
    } catch (error) {
        console.error('Get my projects error:', error);
        return { error: 'Failed to fetch your projects' };
    }
}
