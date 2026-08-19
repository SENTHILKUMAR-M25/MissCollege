"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Bell, ChevronDown, User, Settings, LogOut, X, Clock } from "lucide-react"
import { signOut } from "next-auth/react"

interface TopNavProps {
  pageTitle: string
}

const notifications = [
  { id: 1, title: "Attendance Updated", desc: "November attendance for all departments", time: "2 hours ago", read: false },
  { id: 2, title: "Results Published", desc: "Semester IV CS results are live", time: "5 hours ago", read: false },
  { id: 3, title: "Defaulter Alert", desc: "12 students below 75% attendance", time: "1 day ago", read: true },
  { id: 4, title: "New Admission", desc: "Karthik Rajan enrolled in B.Sc CS", time: "2 days ago", read: true },
]

export default function AdminTopNav({ pageTitle }: TopNavProps) {
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [search, setSearch] = useState("")
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white shrink-0 z-30">
      {/* Page Title */}
      <div>
        <h1 className="text-base font-bold text-black">{pageTitle}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, faculty…"
            className="bg-transparent outline-none w-44 placeholder:text-gray-400 text-sm text-black"
          />
          {search && (
            <button onClick={() => setSearch("")}><X size={13} className="text-gray-400" /></button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif((v) => !v); setShowProfile(false) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center relative bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black transition-all"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-80 rounded-2xl border border-gray-200 shadow-xl bg-white overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-sm text-black">Notifications</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#2F2FE4] text-white px-1.5 py-0.5 rounded-full">{unread} new</span>
                    <button onClick={() => setShowNotif(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400">
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? "bg-[#2F2FE4]/5" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-300" : "bg-[#2F2FE4]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-black">{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.desc}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><Clock size={10} />{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="text-xs text-[#2F2FE4] hover:underline font-medium">Mark all as read</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotif(false) }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-black leading-tight">Admin User</p>
              <p className="text-[10px] text-gray-400">Administrator</p>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-52 rounded-2xl border border-gray-200 shadow-xl bg-white overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-black">Admin User</p>
                    <p className="text-xs text-gray-400">admin@miss.edu</p>
                  </div>
                  <button onClick={() => setShowProfile(false)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400">
                    <X size={13} />
                  </button>
                </div>
                {[
                  { icon: User, label: "Profile", href: "/admin/settings/profile" },
                  { icon: Settings, label: "Settings", href: "/admin/settings" },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <item.icon size={14} />
                    {item.label}
                  </a>
                ))}
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => signOut({ callbackUrl: "/admin-login" })}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
