'use server'
import getCurrentUser from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Interest from "@/models/Interest";
import Project from "@/models/Project";
import User from "@/models/User";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

// ============================================
// TOGGLE INTEREST (Show or Withdraw Interest)
// ============================================
/**
 * Toggles user's interest in a project using MongoDB Transactions.
 * - If already interested → removes interest
 * - If not interested → adds interest
 * Returns the new state (interested: true/false)
 */
export const toggleInterest = async(projectId: string) => {
    // 1. Initial Checks (No transaction needed yet)
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
        
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        if (project.owner.toString() === user._id.toString()) {
            return { error: 'Cannot show interest in your own project' };
        }
        
        const existingInterest = await Interest.findOne({
            user: user._id,
            project: projectId
        });
        
        // 2. Start MongoDB Session for Transaction
        const session = await mongoose.startSession();
        
        try {
            session.startTransaction();
            
            if (existingInterest) {
                // WITHDRAW INTEREST FLOW
                await Interest.findByIdAndDelete(existingInterest._id, { session });
                
                await Project.findByIdAndUpdate(projectId, {
                    $inc: { interestCount: -1 }
                }, { session });
                
                await session.commitTransaction();
                return { success: true, interested: false };
            } else {
                // SHOW INTEREST FLOW
                // Create Interest (Passing array and { session } is required for .create() in transactions)
                await Interest.create(
                    [{
                        user: user._id,
                        project: projectId
                    }],
                    { session }
                );
                
                await Project.findByIdAndUpdate(projectId, {
                    $inc: { interestCount: 1 }
                }, { session });
                
                // Create Notification manually here to include it in the transaction
                await Notification.create(
                    [{
                        recipient: project.owner,
                        sender: user._id,
                        type: 'interest',
                        message: `${user.name} is interested in your project "${project.title}"`,
                        project: projectId
                    }],
                    { session }
                );
                
                await session.commitTransaction();
                return { success: true, interested: true };
            }
            
        } catch (txnError) {
            // If anything fails (Interest creation, Counter update, or Notification)
            await session.abortTransaction();
            console.error('Transaction aborted:', txnError);
            return { error: 'Database transaction failed. Please try again.' };
            
        } finally {
            // Always end the session to prevent memory leaks
            session.endSession();
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
        
        // Extract users and calculate match scores
        const projectTechStack = project.techStack || [];
        const usersWithMatch = interests
            .map(i => i.user)
            .filter(u => u !== null)
            .map(u => {
                const userSkills = u.skills || [];
                // Calculate match: how many of project's tech stack does user have?
                const matchingSkills = projectTechStack.filter((tech: string) => 
                    userSkills.some((skill: string) => 
                        skill.toLowerCase() === tech.toLowerCase()
                    )
                );
                const matchScore = projectTechStack.length > 0 
                    ? Math.round((matchingSkills.length / projectTechStack.length) * 100)
                    : 0;
                
                return {
                    ...u.toObject(),
                    matchScore,
                    matchingSkills
                };
            })
            // Sort by match score (highest first)
            .sort((a, b) => b.matchScore - a.matchScore);
        
        return { 
            success: true, 
            users: JSON.parse(JSON.stringify(usersWithMatch)) 
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
