"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Bell, MessageSquare, Sun, Moon, ChevronDown,
  User, Settings, LogOut, X, Check, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TopNavProps {
  pageTitle: string
  darkMode: boolean
  onThemeToggle: () => void
}

const notifications = [
  { id: 1, type: "info", title: "Attendance Updated", desc: "November attendance for all departments", time: "2 hours ago", read: false },
  { id: 2, type: "success", title: "Results Published", desc: "Semester IV CS results are live", time: "5 hours ago", read: false },
  { id: 3, type: "warning", title: "Defaulter Alert", desc: "12 students below 75% attendance", time: "1 day ago", read: true },
  { id: 4, type: "info", title: "New Admission", desc: "Karthik Rajan enrolled in B.Sc CS", time: "2 days ago", read: true },
]

export default function AdminTopNav({ pageTitle, darkMode, onThemeToggle }: TopNavProps) {
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [search, setSearch] = useState("")
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-6 border-b shrink-0 z-30",
      darkMode ? "bg-slate-900/80 border-white/5 backdrop-blur-xl" : "bg-white/80 border-slate-200 backdrop-blur-xl"
    )}>
      {/* Page Title */}
      <div>
        <h1 className={cn("text-lg font-bold", darkMode ? "text-white" : "text-slate-800")}>{pageTitle}</h1>
        <p className={cn("text-xs", darkMode ? "text-slate-400" : "text-slate-500")}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn(
          "hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm",
          darkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
        )}>
          <Search size={15} className={darkMode ? "text-slate-400" : "text-slate-400"} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, faculty…"
            className="bg-transparent outline-none w-44 placeholder:text-slate-400 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            darkMode ? "bg-white/5 hover:bg-white/10 text-amber-400" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
          )}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif((v) => !v); setShowProfile(false) }}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center relative transition-all",
              darkMode ? "bg-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            )}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
            )}
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "absolute right-0 top-11 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50",
                  darkMode ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
                )}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <p className={cn("font-semibold text-sm", darkMode ? "text-white" : "text-slate-800")}>Notifications</p>
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unread} new</span>
                </div>
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => (
                    <div key={n.id} className={cn("px-4 py-3 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer", !n.read && "bg-amber-500/5")}>
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.read ? "bg-slate-600" : "bg-amber-400")} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-semibold", darkMode ? "text-white" : "text-slate-800")}>{n.title}</p>
                        <p className={cn("text-xs truncate", darkMode ? "text-slate-400" : "text-slate-500")}>{n.desc}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={10} />{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-white/5">
                  <button className="text-xs text-amber-400 hover:text-amber-300 font-medium">Mark all as read</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotif(false) }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="hidden md:block text-left">
              <p className={cn("text-xs font-semibold leading-tight", darkMode ? "text-white" : "text-slate-800")}>Admin User</p>
              <p className={cn("text-[10px]", darkMode ? "text-slate-400" : "text-slate-500")}>Administrator</p>
            </div>
            <ChevronDown size={13} className={darkMode ? "text-slate-400" : "text-slate-400"} />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "absolute right-0 top-11 w-52 rounded-2xl border shadow-2xl overflow-hidden z-50",
                  darkMode ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
                )}
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className={cn("text-sm font-semibold", darkMode ? "text-white" : "text-slate-800")}>Admin User</p>
                  <p className={cn("text-xs", darkMode ? "text-slate-400" : "text-slate-500")}>admin@miss.edu</p>
                </div>
                {[
                  { icon: User, label: "Profile", href: "/admin/settings/profile" },
                  { icon: Settings, label: "Settings", href: "/admin/settings" },
                ].map((item) => (
                  <a key={item.label} href={item.href} className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5",
                    darkMode ? "text-slate-300" : "text-slate-600"
                  )}>
                    <item.icon size={15} />
                    {item.label}
                  </a>
                ))}
                <div className="border-t border-white/5">
                  <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                    <LogOut size={15} />
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
