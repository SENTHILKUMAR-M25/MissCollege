"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard, Users, ClipboardCheck, GraduationCap,
  BookOpen, CalendarDays, FileText, LogOut, ChevronLeft, School, Bell,
  ClipboardList, Award, PenLine, UsersRound,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard },
      { label: "Profile", href: "/faculty/profile", icon: Users },
    ],
  },
  {
    group: "Academics",
    items: [
      { label: "Students", href: "/faculty/students", icon: GraduationCap },
      { label: "Attendance", href: "/faculty/attendance", icon: ClipboardCheck },
      { label: "Examinations", href: "/faculty/examinations", icon: Award },
      { label: "Subjects", href: "/faculty/subjects", icon: BookOpen },
    ],
  },
  {
    group: "Management",
    items: [
      { label: "My Classes", href: "/faculty/class-advisor", icon: UsersRound },
      { label: "Assignments", href: "/faculty/assignments", icon: PenLine },
      { label: "Timetable", href: "/faculty/timetable", icon: CalendarDays },
      { label: "Leave", href: "/faculty/leave", icon: FileText },
      { label: "Notices", href: "/faculty/notices", icon: Bell },
    ],
  },
]

function NavItemRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname()
  const hasChildren = !!item.children?.length
  const isActive = item.href ? pathname === item.href : item.children?.some((c) => c.href === pathname)
  const Icon = item.icon

  if (hasChildren) {
    return (
      <div>
        <button className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
          isActive ? "bg-teal-500/20 text-teal-400" : "text-slate-400 hover:bg-white/5 hover:text-white"
        )}>
          <Icon size={18} className="shrink-0" />
          {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
        </button>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-400 shadow-lg shadow-teal-500/10"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
    >
      {isActive && (
        <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-full" />
      )}
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

export default function FacultyLayoutClient({
  children,
  departmentName,
  userName,
  userEmail,
}: {
  children: React.ReactNode
  departmentName?: string
  userName?: string
  userEmail?: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const initials = (userName || "Faculty")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen flex flex-col bg-slate-900 border-r border-white/5 overflow-hidden shrink-0 z-40"
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
          <motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <School size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">FACULTY PORTAL</p>
              {departmentName && <p className="text-teal-400 text-[10px] font-semibold truncate max-w-[160px]">{departmentName}</p>}
            </div>
          </motion.div>
          <button onClick={() => setCollapsed((v) => !v)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 items-center justify-center text-slate-400 hover:text-white transition-all shrink-0">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={14} />
            </motion.div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1.5">{group.group}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemRow key={item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl", !collapsed && "bg-white/5")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{userName}</p>
                <p className="text-slate-500 text-[10px] truncate">{userEmail}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/Faculty-login" })}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 text-white">
          {children}
        </main>
      </div>
    </div>
  )
}
