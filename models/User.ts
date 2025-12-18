// User database model
import mongoose, { Schema, models } from 'mongoose';
const UserSchema = new Schema({
  // Auth fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  provider: { type: String, default: 'credentials' },
  image: String,

  // Profile fields
  bio: String,                    
  location: String,               
  skills: [{ type: String }],     
  experienceLevel: {              
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  githubUrl: String,             
  linkedinUrl: String,     
  leetcodeUrl:String,
  codechefUrl:String,
  codeforcesUrl:String,      

  createdAt: { type: Date, default: Date.now },
});
const User = models.User || mongoose.model('User', UserSchema);
export default User;
