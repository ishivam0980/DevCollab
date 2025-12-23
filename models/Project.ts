import mongoose, { Schema, models, Types } from 'mongoose';
const ProjectSchema = new Schema({
  // Basic Info
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 100 },
  
  // Owner Reference
  owner: { type: Types.ObjectId, ref: 'User', required: true },
  
  // Technical Details
  techStack: [{ type: String }],
  category: { 
    type: String, 
    enum: ['Web App', 'Mobile App', 'AI/ML', 'Game', 'DevTools', 'Other'],
    default: 'Web App'
  },
  
  // Requirements
  experienceLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced','Any'],
    default: 'Beginner'
  },
  teamSize: { 
    type: String, 
    enum: ['1-2', '3-5', '5+'],
    default: '1-2'
  },
  duration: {
    type: String,
    enum: ['< 1 month','1-3 months', '3-6 months', '6+ months'],
    default: '1-3 months'
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['Looking for collaborators', 'In Progress', 'Completed'],
    default: 'Looking for collaborators'
  },
  
  // Metadata
  interestCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for text search
ProjectSchema.index({ title: 'text', description: 'text' });
const Project = models.Project || mongoose.model('Project', ProjectSchema);
export default Project;