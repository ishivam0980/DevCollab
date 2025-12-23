import mongoose, { Schema, models, Types } from 'mongoose';
const InterestSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User', required: true },
  project: { type: Types.ObjectId, ref: 'Project', required: true },
  createdAt: { type: Date, default: Date.now },
});
// Ensure a user can only show interest once per project
InterestSchema.index({ user: 1, project: 1 }, { unique: true });
const Interest = models.Interest || mongoose.model('Interest', InterestSchema);
export default Interest;