'use server';

import getCurrentUser from '@/lib/utils';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { UTApi } from "uploadthing/server";

// return types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;//it means that image can be optional(undefined) or of type string 
  bio: string;
  location: string;
  skills: string[];
  experienceLevel: string;
  githubUrl: string;
  linkedinUrl: string;
  leetcodeUrl: string;
  codechefUrl: string;
  codeforcesUrl: string;
  createdAt:Date
}


/*
  If we define the type simply as:
  type GetProfileResponse = { success: true; user: UserProfile } | { success: false; error: string };
  
  TypeScript cannot guarantee that 'user' exists just because 'success' is true in the else block.
  It worries: "What if an object comes back with { success: false, error: '...' }? usage of .user would crash."
  
  SOLUTIONS:
  Option 1 (Frontend Check): 
  Keep the simple type, but in page.tsx you must write:
  if (!result.user) return; // Manually prove to TypeScript that user exists.

  Option 2 (Strict Discriminated Union):
  We use 'error?: never' and 'user?: never' to make the states mutually exclusive.
  This tells TypeScript: "If success is true, error is IMPOSSIBLE. If success is false, user is IMPOSSIBLE."
*/

export type GetProfileResponse = 
  | { success: true; user: UserProfile; error?: never }  // Success Case
  | { success: false; error: string; user?: never };     // Failure Case


export type ActionResponse = {
  success?: boolean;
  error?: string;
  newImage?: string; // For profile image updates
};

// ============================================
// 1. GET PROFILE - Fetch current user's data
// ============================================
export async function getProfile(): Promise<GetProfileResponse> {
  try {
    // Step 1: Check if user is logged in
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return { success:false ,error: 'Unauthorized' };
    }
    
    // Step 2: Connect to MongoDB
    await connectDB();
    
    // Step 3: Find user by their email
    const user = await User.findOne({ email: currentUser.email });
    if (!user) {
      return { success:false ,error: 'User not found' };
    }
    
    // Step 4: Return user data (remove password for security)
    return { 
      success:true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio || '',
        location: user.location || '',
        skills: user.skills || [],
        experienceLevel: user.experienceLevel || 'Beginner',
        githubUrl: user.githubUrl || '',
        linkedinUrl: user.linkedinUrl || '',
        leetcodeUrl: user.leetcodeUrl || '',
        codechefUrl: user.codechefUrl || '',
        codeforcesUrl: user.codeforcesUrl || '',
        createdAt:user.createdAt
      }
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success:false ,error: 'Failed to fetch profile' };
  }
}

// ============================================
// 2. UPDATE PROFILE - Save profile changes
// ============================================
export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  try {
    // Step 1: Check if user is logged in
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return { error: 'Unauthorized' };
    }
    
    // Step 2: Extract data from the form
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const location = formData.get('location') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const githubUrl = formData.get('githubUrl') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const leetcodeUrl = formData.get('leetcodeUrl') as string;
    const codechefUrl = formData.get('codechefUrl') as string;
    const codeforcesUrl = formData.get('codeforcesUrl') as string;
    
    // Skills come as comma-separated string, convert to array
    const skillsString = formData.get('skills') as string;
    const skills = skillsString ? skillsString.split(',').map(s => s.trim()) : [];
    
    // Step 3: Validate required fields
    if (!name || name.trim().length === 0) {
      return { error: 'Name is required' };
    }
    
    // Step 4: Connect to database
    await connectDB();
    
    // Fetch OLD user to get previous image (for cleanup)
    const oldUser = await User.findOne({ email: currentUser.email });
    const oldImage = oldUser?.image;

    // Step 5: Update user document
    const newImageUrl = (formData.get('image') as string) || oldImage || '';
    
    await User.findOneAndUpdate(
      { email: currentUser.email },  // Find by email
      {
        name: name.trim(),
        bio: bio?.trim() || '',
        location: location?.trim() || '',
        skills,
        experienceLevel: experienceLevel || 'Beginner',
        githubUrl: githubUrl?.trim() || '',
        linkedinUrl: linkedinUrl?.trim() || '',
        leetcodeUrl: leetcodeUrl?.trim() || '',
        codechefUrl: codechefUrl?.trim() || '',
        codeforcesUrl: codeforcesUrl?.trim() || '',
        image: newImageUrl,
      }
    );

    // Step 6: Delete old image from UploadThing if replaced
    const newImage = formData.get('image') as string;
    if (newImage && oldImage && newImage !== oldImage) {
      // Basic check to ensure we only try delete UploadThing images
      if (oldImage.includes("utfs.io")) {
        const key = oldImage.split("/").pop();
        if (key) {
          try {
            const utapi = new UTApi();
            await utapi.deleteFiles(key);
            console.log("Deleted old profile image:", key);
          } catch (error) {
            console.error("Failed to delete old image:", error);
          }
        }
      }
    }
    
    // Return success with new image URL for session update
    return { success: true, newImage: newImageUrl };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }
}

// ============================================
// 3. DELETE PROFILE - Delete user account
// ============================================
export async function deleteProfile(): Promise<ActionResponse> {
  try {
    // Step 1: Check if user is logged in
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return { error: 'Unauthorized' };
    }
    
    // Step 2: Connect to database
    await connectDB();
    
    // Step 3: Delete the user
    await User.findOneAndDelete({ email: currentUser.email });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting profile:', error);
    return { error: 'Failed to delete account' };
  }
}

// ============================================
// GET PROFILE COMPLETION %
// ============================================
export const getProfileCompletion = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    await connectDB();
    const user = await User.findOne({ email: currentUser.email });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Define required fields and their weights
    const fields = [
      { name: 'name', weight: 15, filled: !!(user.name && user.name.trim()) },
      { name: 'bio', weight: 20, filled: !!(user.bio && user.bio.trim()) },
      { name: 'skills', weight: 25, filled: !!(user.skills && user.skills.length > 0) },
      { name: 'experienceLevel', weight: 15, filled: !!(user.experienceLevel) },
      { name: 'location', weight: 10, filled: !!(user.location && user.location.trim()) },
      { name: 'githubUrl', weight: 10, filled: !!(user.githubUrl && user.githubUrl.trim()) },
      { name: 'image', weight: 5, filled: !!(user.image && user.image.trim()) },
    ];

    // Calculate completion percentage
    const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
    const filledWeight = fields.filter(f => f.filled).reduce((sum, f) => sum + f.weight, 0);
    const percentage = Math.round((filledWeight / totalWeight) * 100);

    // Get missing fields
    const missingFields = fields.filter(f => !f.filled).map(f => f.name);

    return {
      success: true,
      percentage,
      missingFields,
      isComplete: percentage >= 80
    };
  } catch (error) {
    console.error('Profile completion error:', error);
    return { success: false, error: 'Failed to calculate completion' };
  }
}