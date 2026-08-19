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
  "/admin/enquiries": "Enquiries",
  "/admin/applications": "Applications",
  "/admin/settings.security": "Security Settings",
}

export default function AdminLayout({ children, userRole }: { children: React.ReactNode; userRole: string }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const title = pageTitles[pathname] || "Admin Panel"

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopNav pageTitle={title} />
        <main className="flex-1 overflow-y-auto p-6 bg-white text-black">
          {children}
        </main>
      </div>
    </div>
  )
}

