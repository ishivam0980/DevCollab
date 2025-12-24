'use server'

import getCurrentUser from "@/lib/utils";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import User from "@/models/User";

// ============================================
// CREATE NOTIFICATION (Internal use)
// ============================================
export const createNotification = async (
  recipientId: string,
  senderId: string,
  type: 'interest' | 'message',
  message: string,
  projectId?: string
) => {
  try {
    await connectDB();
    
    // Don't send notification to yourself
    if (recipientId === senderId) return { success: true };
    
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      project: projectId,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Create notification error:', error);
    return { error: 'Failed to create notification' };
  }
}

// ============================================
// GET MY NOTIFICATIONS
// ============================================
export const getMyNotifications = async (limit: number = 10) => {
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
    
    const notifications = await Notification.find({ recipient: user._id })
      .populate('sender', 'name image')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return { 
      success: true, 
      notifications: JSON.parse(JSON.stringify(notifications)) 
    };
  } catch (error) {
    console.error('Get notifications error:', error);
    return { error: 'Failed to fetch notifications' };
  }
}

// ============================================
// MARK AS READ
// ============================================
export const markAsRead = async (notificationId: string) => {
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
    
    // Only mark as read if the notification belongs to the user
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: user._id },
      { isRead: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Mark as read error:', error);
    return { error: 'Failed to mark notification as read' };
  }
}

// ============================================
// MARK ALL AS READ
// ============================================
export const markAllAsRead = async () => {
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
    
    await Notification.updateMany(
      { recipient: user._id, isRead: false },
      { isRead: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    return { error: 'Failed to mark notifications as read' };
  }
}

// ============================================
// GET UNREAD COUNT
// ============================================
export const getUnreadCount = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { count: 0 };
    }
    
    await connectDB();
    
    const user = await User.findOne({ email: currentUser.email });
    if (!user) {
      return { count: 0 };
    }
    
    const count = await Notification.countDocuments({ 
      recipient: user._id, 
      isRead: false 
    });
    
    return { count };
  } catch (error) {
    console.error('Get unread count error:', error);
    return { count: 0 };
  }
}

// ============================================
// DELETE NOTIFICATION
// ============================================
export const deleteNotification = async (notificationId: string) => {
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
    
    // Only delete if the notification belongs to the user
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: user._id
    });
    
    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    return { error: 'Failed to delete notification' };
  }
}

// ============================================
// CLEAR ALL NOTIFICATIONS
// ============================================
export const clearAllNotifications = async () => {
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
    
    await Notification.deleteMany({ recipient: user._id });
    
    return { success: true };
  } catch (error) {
    console.error('Clear notifications error:', error);
    return { error: 'Failed to clear notifications' };
  }
}
