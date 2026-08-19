"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  LayoutDashboard, User, BookOpen, ClipboardCheck, FileText,
  Award, CalendarDays, LogOut, ChevronLeft, GraduationCap, Bell,
  Settings, Menu, X
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/student/profile", icon: User },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck },
  { label: "Assignments", href: "/student/assignments", icon: FileText },
  { label: "Examinations", href: "/student/examinations", icon: Award },
  { label: "Timetable", href: "/student/timetable", icon: CalendarDays },
  { label: "Leave", href: "/student/leave", icon: Bell },
  { label: "Settings", href: "/student/settings", icon: Settings },
]

export default function StudentLayoutClient({
  children,
  studentName,
  registerNumber,
  departmentName,
}: {
  children: React.ReactNode
  studentName: string
  registerNumber: string
  departmentName: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col bg-white border-r border-gray-200 h-full", mobile ? "w-64" : collapsed ? "w-16" : "w-60")}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2F2FE4] flex items-center justify-center shadow-lg">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-black font-bold text-sm leading-tight">MISS COLLEGE</p>
              <p className="text-[#2F2FE4] text-[10px] font-semibold tracking-widest">STUDENT PORTAL</p>
            </div>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(v => !v)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition-all shrink-0">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}><ChevronLeft size={14} /></motion.div>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group",
                isActive ? "bg-[#2F2FE4]/10 text-[#2F2FE4]" : "text-gray-500 hover:bg-gray-100 hover:text-black"
              )}>
              {isActive && <motion.div layoutId="student-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2F2FE4] rounded-full" />}
              <Icon size={18} className="shrink-0" />
              {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl", (!collapsed || mobile) && "bg-gray-50")}>
          <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {studentName?.charAt(0) || "S"}
          </div>
          {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-black text-xs font-semibold truncate">{studentName}</p>
              <p className="text-gray-400 text-[10px] truncate">{registerNumber}</p>
            </div>
          )}
          {(!collapsed || mobile) && (
            <button onClick={() => signOut({ callbackUrl: "/student-login" })} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Desktop sidebar */}
      <motion.aside animate={{ width: collapsed ? 64 : 240 }} transition={{ duration: 0.3 }} className="hidden md:block shrink-0 z-40">
        <Sidebar />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "tween" }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden">
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500 hover:text-black">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-black font-semibold text-sm">{departmentName}</p>
              <p className="text-gray-400 text-xs">{registerNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-xs font-bold">
              {studentName?.charAt(0) || "S"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-white text-black">
          {children}
        </main>
      </div>
    </div>
  )
}
