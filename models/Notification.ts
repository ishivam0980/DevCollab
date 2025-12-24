import mongoose, { Schema, models, Types } from 'mongoose';

const NotificationSchema = new Schema({
  // Who receives the notification
  recipient: { type: Types.ObjectId, ref: 'User', required: true },
  
  // Who triggered the notification
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  
  // Type of notification
  type: { 
    type: String, 
    enum: ['interest', 'message'], 
    default: 'interest' 
  },
  
  // Related project (for interest notifications)
  project: { type: Types.ObjectId, ref: 'Project' },
  
  // Display message
  message: { type: String, required: true },
  
  // Read status
  isRead: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
});

// Index for faster queries
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
