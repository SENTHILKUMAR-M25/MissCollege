"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Bell, Check, CheckCheck, ExternalLink, Filter } from "lucide-react"
import toast from "react-hot-toast"

const NOTIFICATION_TYPES = {
  NOTICE: { label: "Notice", color: "bg-[#2F2FE4]/10 text-[#2F2FE4]" },
  EXAM_SCHEDULE: { label: "Exam Schedule", color: "bg-amber-500/10 text-amber-400" },
  INVIGILATION_DUTY: { label: "Invigilation", color: "bg-[#2F2FE4]/10 text-[#2F2FE4]" },
  ASSIGNMENT: { label: "Assignment", color: "bg-emerald-500/10 text-emerald-400" },
  RESULT: { label: "Result", color: "bg-[#2F2FE4]/10 text-[#2F2FE4]" },
  ATTENDANCE: { label: "Attendance", color: "bg-orange-500/10 text-orange-400" },
  TIMETABLE: { label: "Timetable", color: "bg-[#2F2FE4]/10 text-[#2F2FE4]" },
}

export default function StudentNoticesClient({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const fetchNotifications = async () => {
    try {
      const url = `/api/notifications?unreadOnly=${filter === "unread"}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setNotifications(json.notifications || [])
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [filter])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all`, { method: "POST" })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-black">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Stay updated with notices, results, exams, and assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Filter size={14} className="text-gray-500 ml-2" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-transparent text-black text-xs border-none outline-none"
            >
              <option value="all" className="bg-gray-100">All</option>
              <option value="unread" className="bg-gray-100">Unread</option>
            </select>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2F2FE4]/10 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 border border-gray-100 rounded-xl p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white rounded w-3/4" />
                  <div className="h-3 bg-white rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-12 text-center">
          <Bell size={40} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No notifications yet</p>
          <p className="text-gray-400 text-xs mt-1">You'll see notices, results, and exam updates here</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => {
              const typeConfig = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.NOTICE
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`rounded-xl border p-4 transition-all ${
                    notification.isRead
                      ? "bg-gray-50 border-gray-100"
                      : "bg-gray-100 border-[#2F2FE4]/20 shadow-lg shadow-violet-500/5"
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${typeConfig.color}`}>
                      <Bell size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#2F2FE4]" />
                        )}
                      </div>
                      <p className={`text-sm ${notification.isRead ? "text-gray-500" : "text-black font-medium"}`}>
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(notification.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="text-gray-500 hover:text-[#2F2FE4] transition-colors shrink-0"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
