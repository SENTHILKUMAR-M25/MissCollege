"use client"

import { useState, useMemo, Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Role } from "@prisma/client"
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, Building2,
  ClipboardList, BarChart3, Bell, Settings, LogOut, ChevronRight,
  UserCheck, TrendingUp, Library, Shield, ChevronLeft, School,
  Award, Megaphone, CalendarDays, FileBarChart, Crown,
  ClipboardPenLine, FileSpreadsheet, FileCopy, MessageSquare, FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
}

const EXAM_NAV_ITEMS: NavItem[] = [
  { label: "Exam Types", href: "/admin/exams/types", icon: FileCopy },
  { label: "Assessment Setup", href: "/admin/exams/assessment", icon: ClipboardPenLine },
  { label: "Exam Schedule", href: "/admin/exams/schedule", icon: CalendarDays },
  { label: "Hall Allocation", href: "/admin/exams/halls", icon: Building2 },
  { label: "Invigilators", href: "/admin/exams/invigilators", icon: UserCheck },
  { label: "Marks Verification", href: "/admin/exams/marks-verification", icon: BarChart3 },
  { label: "Results", href: "/admin/exams/results", icon: Award },
  { label: "GPA/CGPA", href: "/admin/exams/gpa", icon: TrendingUp },
  { label: "Reports", href: "/admin/exams/reports", icon: FileSpreadsheet },
]

type AllowedRole = Role | [Role.ADMIN, Role.EXAM_ADMIN] | [Role.ADMIN, Role.ACADEMIC_ADMIN]

interface NavGroup {
  group: string
  items: NavItem[]
  allowedRoles: AllowedRole[]
}

const HARDCODED_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN],
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    group: "Academic Management",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN],
    items: [
      { label: "Departments", href: "/admin/departments", icon: Building2 },
      { label: "Courses", href: "/admin/courses", icon: Library },
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
    ],
  },
  {
    group: "User Management",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN],
    items: [
      { label: "Faculty", href: "/admin/faculty", icon: UserCheck },
      { label: "Students", href: "/admin/students", icon: GraduationCap },
      { label: "HoD Management", href: "/admin/hod-management", icon: Crown },
    ],
  },
  {
    group: "Academic Operations",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN],
    items: [
      { label: "Attendance", href: "/admin/attendance", icon: CalendarDays },
      { label: "Internal Marks", href: "/admin/marks", icon: ClipboardList },
      { label: "Results", href: "/admin/results", icon: Award },
    ],
  },
  {
    group: "Examination Management",
    allowedRoles: [Role.ADMIN, Role.EXAM_ADMIN],
    items: EXAM_NAV_ITEMS,
  },
  {
    group: "Admissions",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN],
    items: [
      { label: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
      { label: "Applications", href: "/admin/applications", icon: FileText },
    ],
  },
  {
    group: "Communication",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN],
    items: [
      { label: "Notices", href: "/admin/notices", icon: Bell },
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    group: "Reports",
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN],
    items: [
      {
        label: "Reports", icon: FileBarChart,
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
    allowedRoles: [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN],
    items: [
      {
        label: "Settings", icon: Settings,
        children: [
          { label: "General Settings", href: "/admin/settings", icon: Settings },
          { label: "Profile", href: "/admin/settings/profile", icon: Users },
          { label: "Security", href: "/admin/settings/security", icon: Shield },
        ],
      },
    ],
  },
]

const requiredRoleMap: Record<string, Role> = {
  ADMIN: Role.ADMIN,
  ACADEMIC_ADMIN: Role.ACADEMIC_ADMIN,
  EXAM_ADMIN: Role.EXAM_ADMIN,
}

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  userRole: string
}

function NavItemRow({ item, collapsed, depth = 0 }: { item: NavItem; collapsed: boolean; depth?: number }) {
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
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            isActive
              ? "bg-[#2F2FE4]/10 text-[#2F2FE4]"
              : "text-gray-500 hover:bg-gray-100 hover:text-black"
          )}
        >
          {Icon ? <Icon size={17} className="shrink-0" /> : null}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight size={13} />
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
              className="overflow-hidden ml-4 mt-0.5 space-y-0.5 border-l-2 border-gray-200 pl-3"
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
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
        isActive
          ? "bg-[#2F2FE4] text-white shadow-md shadow-[#2F2FE4]/25"
          : "text-gray-500 hover:bg-gray-100 hover:text-black"
      )}
    >
      <Fragment>
        {Icon ? <Icon size={17} className="shrink-0" /> : null}
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Fragment>
    </Link>
  )
}

function roleMatches(userRole: Role, allowed: AllowedRole): boolean {
  if (Array.isArray(allowed)) return allowed.includes(userRole)
  return userRole === allowed
}

export default function AdminSidebar({ collapsed, onToggle, userRole }: AdminSidebarProps) {
  const sidebarRole = requiredRoleMap[userRole] ?? null

  const visibleGroups = useMemo(() => {
    if (!sidebarRole) return []
    return HARDCODED_GROUPS.filter((group) =>
      group.allowedRoles.some((allowed) => roleMatches(sidebarRole, allowed))
    )
  }, [sidebarRole])

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen flex flex-col bg-white border-r border-gray-200 overflow-hidden shrink-0 z-40"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2F2FE4] flex items-center justify-center shadow-md shadow-[#2F2FE4]/30">
                <School size={18} className="text-black" />
              </div>
              <div>
                <p className="text-black font-bold text-sm leading-tight">MISS COLLEGE</p>
                <p className="text-[#2F2FE4] text-[10px] font-semibold tracking-widest">ERP SYSTEM</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-9 h-9 rounded-xl bg-[#2F2FE4] flex items-center justify-center shadow-md shadow-[#2F2FE4]/30 mx-auto">
              <School size={18} className="text-black" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-all shrink-0"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={14} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-hide">
        {visibleGroups.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-1.5">
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
      <div className="p-3 border-t border-gray-100">
        <div className={cn("flex items-center gap-3 px-2 py-2 rounded-xl", !collapsed && "bg-gray-50")}>
          <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-xs font-bold shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-black text-xs font-semibold truncate">Admin User</p>
              <p className="text-gray-400 text-[10px] truncate">admin@miss.edu</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={() => signOut({ callbackUrl: "/admin-login" })} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
