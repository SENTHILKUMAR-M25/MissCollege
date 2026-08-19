"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
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
          isActive ? "bg-[#2F2FE4]/10 text-[#2F2FE4]" : "text-gray-500 hover:bg-gray-100 hover:text-black"
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
          ? "bg-[#2F2FE4]/10 text-[#2F2FE4]"
          : "text-gray-500 hover:bg-gray-100 hover:text-black"
      )}
    >
      {isActive && (
        <motion.div layoutId="active-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2F2FE4] rounded-full" />
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
    <div className="flex h-screen overflow-hidden bg-white">
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen flex flex-col bg-white border-r border-gray-200 overflow-hidden shrink-0 z-40"
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2F2FE4] flex items-center justify-center shadow-lg shadow-[#2F2FE4]/20">
              <School size={18} className="text-white" />
            </div>
            <div>
              <p className="text-black font-bold text-sm leading-tight">FACULTY PORTAL</p>
              {departmentName && <p className="text-[#2F2FE4] text-[10px] font-semibold truncate max-w-[160px]">{departmentName}</p>}
            </div>
          </motion.div>
          <button onClick={() => setCollapsed((v) => !v)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-100 items-center justify-center text-gray-500 hover:text-black transition-all shrink-0">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={14} />
            </motion.div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1.5">{group.group}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemRow key={item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl", !collapsed && "bg-gray-50")}>
            <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-black text-xs font-semibold truncate">{userName}</p>
                <p className="text-gray-400 text-[10px] truncate">{userEmail}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: "/Faculty-login" })}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 bg-white text-black">
          {children}
        </main>
      </div>
    </div>
  )
}
