"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin/layout/AdminSidebar"
import AdminTopNav from "@/components/admin/layout/AdminTopNav"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/students": "Student Management",
  "/admin/faculty": "Faculty Management",
  "/admin/departments": "Department Management",
  "/admin/hod-management": "HoD Management",
  "/admin/courses": "Course Management",
  "/admin/subjects": "Subject Management",
  "/admin/attendance": "Attendance Management",
  "/admin/marks": "Internal Marks",
  "/admin/results": "Result Management",
  "/admin/notices": "Notice Management",
  "/admin/announcements": "Announcements",
  "/admin/reports/students": "Student Reports",
  "/admin/reports/faculty": "Faculty Reports",
  "/admin/reports/attendance": "Attendance Reports",
  "/admin/reports/results": "Result Reports",
  "/admin/settings": "Settings",
  "/admin/settings/profile": "Profile Settings",
  "/admin/settings/security": "Security Settings",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Admin Panel"

  return (
    <div className={cn("flex h-screen overflow-hidden", darkMode ? "dark bg-slate-950" : "bg-slate-50")}>
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopNav pageTitle={title} darkMode={darkMode} onThemeToggle={() => setDarkMode((v) => !v)} />
        <main className={cn(
          "flex-1 overflow-y-auto p-6",
          darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-800"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
