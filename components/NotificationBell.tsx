'use client'

import { useState, useEffect, useRef } from 'react'
import { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount } from '@/actions/notification.actions'
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

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch unread count on mount + poll every 30s
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const fetchUnreadCount = async () => {
    const result = await getUnreadCount()
    setUnreadCount(result.count)
  }

  const fetchNotifications = async () => {
    setLoading(true)
    const result = await getMyNotifications(10)
    if (result.success && result.notifications) {
      setNotifications(result.notifications)
    }
    setLoading(false)
  }

  const handleBellClick = () => {
    if (!isOpen) fetchNotifications()
    setIsOpen(!isOpen)
  }

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId)
    setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    setIsOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-3 rounded-xl transition-all ${
          unreadCount > 0 
            ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
        }`}
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge - only shows when unread > 0 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">No notifications yet</p>
                <p className="text-slate-600 text-sm mt-1">When someone shows interest in your projects, you'll see it here</p>
              </div>
            ) : (
              notifications.map(notification => (
                <Link
                  key={notification._id}
                  href={`/projects/${notification.project?._id}`}
                  onClick={() => handleNotificationClick(notification._id)}
                  className={`flex items-start gap-3 px-4 py-4 hover:bg-white/5 transition-colors border-b border-slate-800/50 last:border-0 ${
                    !notification.isRead ? 'bg-purple-500/5 border-l-2 border-l-purple-500' : ''
                  }`}
                >
                  {/* Avatar */}
                  <img
                    src={notification.sender?.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(notification.sender?.name || 'User')}`}
                    alt={notification.sender?.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-700"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${notification.isRead ? 'text-slate-400' : 'text-white'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  
                  {/* Unread dot */}
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
