'use client'

import { useState, useEffect } from 'react'
import { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '@/actions/notification.actions'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Notification {
  _id: string
  sender: { _id: string; name: string; image?: string }
  project: { _id: string; title: string }
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    // Mark all as read when visiting the page
    markAllAsRead()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const result = await getMyNotifications(50)
    if (result.success && result.notifications) {
      setNotifications(result.notifications)
    }
    setLoading(false)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n))
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteNotification(notificationId)
    setNotifications(prev => prev.filter(n => n._id !== notificationId))
  }

  const handleClearAll = async () => {
    await clearAllNotifications()
    setNotifications([])
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-pink-500 animate-spin [animation-direction:reverse]"></div>
          </div>
          <p className="text-slate-400 text-sm">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            Notifications
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-2">Stay updated on who's interested in your projects</p>
        </div>
        
        {/* Action Button */}
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No notifications yet</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            When developers show interest in your projects, you'll see their notifications here.
          </p>
          <Link href="/browse" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <Link
                href={`/projects/${notification.project?._id}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                className={`glass-card rounded-xl p-5 flex items-start gap-4 transition-all hover:bg-white/5 ${
                  !notification.isRead ? 'border-l-4 border-l-purple-500 bg-purple-500/5' : ''
                }`}
              >
                {/* Avatar */}
                <img
                  src={notification.sender?.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(notification.sender?.name || 'User')}`}
                  alt={notification.sender?.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700 flex-shrink-0"
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-base leading-relaxed ${notification.isRead ? 'text-slate-400' : 'text-white font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                
                {/* Status + Delete */}
                <div className="flex items-center gap-3">
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  )}
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(e, notification._id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete notification"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default NotificationsPage
