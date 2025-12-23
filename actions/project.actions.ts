'use server'
import getCurrentUser from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Interest from "@/models/Interest";
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
export const createProject = async(data: any) => {
    try {
        // Auth check
        const user = await getCurrentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }
        // Data validation
        if (!data?.title || data.title.trim().length === 0) {
            return { error: 'Title cannot be empty' };
        }
        if (!data?.description || data.description.trim().length === 0) {
            return { error: 'Description cannot be empty' };
        }
        // Save to database
        await connectDB();
        const project = await Project.create({
            ...data,
            owner: user.id
        });
        return {
            success: true,
            project: JSON.parse(JSON.stringify(project)) // Convert Mongoose doc to plain object
        };
        
    } catch (error) {
        console.error('Create project error:', error);
        return { 
            success:false,
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
        const user=await getCurrentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        // Find project first to check ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        // Ownership check (CRITICAL SECURITY)
        if (project.owner.toString() !== user.id) {
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
        const user=await getCurrentUser();
        if (!user) {
            return { error: 'Unauthorized' };
        }
        
        await connectDB();
        
        // Find project first to check ownership
        const project = await Project.findById(projectId);
        if (!project) {
            return { error: 'Project not found' };
        }
        
        // Ownership check (CRITICAL SECURITY)
        if (project.owner.toString() !== user.id) {
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
