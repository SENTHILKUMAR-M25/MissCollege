"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Building2,
  ClipboardList, BarChart3, Bell, Settings, LogOut, ChevronDown,
  ChevronRight, BookMarked, FileText, UserCheck, TrendingUp,
  Library, Shield, ChevronLeft, School, Award, Megaphone,
  CalendarDays, FileBarChart,
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
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    group: "Academic Management",
    items: [
      { label: "Departments", href: "/admin/departments", icon: Building2 },
      { label: "Courses", href: "/admin/courses", icon: Library },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
    ],
  },
  {
    group: "User Management",
    items: [
      { label: "Faculty", href: "/admin/faculty", icon: UserCheck },
      { label: "Students", href: "/admin/students", icon: GraduationCap },
    ],
  },
  {
    group: "Academic Operations",
    items: [
      { label: "Attendance", href: "/admin/attendance", icon: CalendarDays },
      { label: "Internal Marks", href: "/admin/marks", icon: ClipboardList },
      { label: "Results", href: "/admin/results", icon: Award },
    ],
  },
  {
    group: "Communication",
    items: [
      { label: "Notices", href: "/admin/notices", icon: Bell },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    group: "Reports",
    items: [
      {
        label: "Reports",
        icon: FileBarChart,
        children: [
          { label: "Student Reports", href: "/admin/reports/students", icon: Users },
          { label: "Faculty Reports", href: "/admin/reports/faculty", icon: UserCheck },
          { label: "Attendance Reports", href: "/admin/reports/attendance", icon: CalendarDays },
          { label: "Result Reports", href: "/admin/reports/results", icon: TrendingUp },
        ],
      },
    ],
  },
  {
    group: "System",
    items: [
      {
        label: "Settings",
        icon: Settings,
        children: [
          { label: "General Settings", href: "/admin/settings", icon: Settings },
          { label: "Profile", href: "/admin/settings/profile", icon: Users },
          { label: "Security", href: "/admin/settings/security", icon: Shield },
        ],
      },
    ],
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function NavItemRow({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem
  collapsed: boolean
  depth?: number
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const hasChildren = !!item.children?.length
  const isActive = item.href ? pathname === item.href : item.children?.some((c) => c.href === pathname)
  const Icon = item.icon

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
            isActive
              ? "bg-amber-500/20 text-amber-400"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight size={14} />
              </motion.div>
            </>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3"
            >
              {item.children!.map((child) => (
                <NavItemRow key={child.href} item={child} collapsed={false} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 shadow-lg shadow-amber-500/10"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-400 rounded-full"
        />
      )}
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col bg-slate-900 border-r border-white/5 overflow-hidden shrink-0 z-40"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <School size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">MISS COLLEGE</p>
                <p className="text-amber-400 text-[10px] font-semibold tracking-widest">ERP SYSTEM</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mx-auto"
            >
              <School size={18} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={14} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1.5">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItemRow key={item.label} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/5">
        <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl", !collapsed && "bg-white/5")}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Admin User</p>
              <p className="text-slate-500 text-[10px] truncate">admin@miss.edu</p>
            </div>
          )}
          {!collapsed && (
            <button className="text-slate-500 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
