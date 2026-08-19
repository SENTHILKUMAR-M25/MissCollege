"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { FileText, ClipboardList, CalendarDays, Building2, UserCheck, BarChart3, Award, TrendingUp, FileSpreadsheet, ArrowLeft } from "lucide-react"
import Link from "next/link"

const examModules = [
  { title: "Exam Types", description: "Create and manage exam types", href: "/admin/exams/types", icon: FileText },
  { title: "Assessment Setup", description: "Configure assessment criteria", href: "/admin/exams/assessment", icon: ClipboardList },
  { title: "Exam Schedule", description: "Manage exam dates and time slots", href: "/admin/exams/schedule", icon: CalendarDays },
  { title: "Hall Allocation", description: "Allocate exam halls", href: "/admin/exams/halls", icon: Building2 },
  { title: "Invigilators", description: "Assign invigilators to exams", href: "/admin/exams/invigilators", icon: UserCheck },
  { title: "Marks Verification", description: "Verify and approve marks", href: "/admin/exams/marks-verification", icon: BarChart3 },
  { title: "Results", description: "Publish exam results", href: "/admin/exams/results", icon: Award },
  { title: "GPA/CGPA", description: "Calculate GPA and CGPA", href: "/admin/exams/gpa", icon: TrendingUp },
  { title: "Reports", description: "Generate exam reports", href: "/admin/exams/reports", icon: FileSpreadsheet },
]

export default function ExamDashboardClient({ initialStats, userRole }: { initialStats: any; userRole: string }) {
  const [stats] = useState(initialStats)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Examination Management</h1>
        <p className="text-gray-500">Manage exams, schedules, results, and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examModules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="bg-gray-100 border border-gray-100 rounded-xl p-5 hover:border-amber-500/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <module.icon size={20} />
              </div>
              <h3 className="text-black font-semibold group-hover:text-amber-400 transition-colors">{module.title}</h3>
            </div>
            <p className="text-gray-500 text-sm">{module.description}</p>
          </Link>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
            <h3 className="text-gray-500 text-sm mb-1">Total Exams</h3>
            <p className="text-black text-2xl font-bold">{stats.totalExamSchedule}</p>
          </div>
          <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
            <h3 className="text-gray-500 text-sm mb-1">Total Results</h3>
            <p className="text-black text-2xl font-bold">{stats.totalResults}</p>
          </div>
          <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
            <h3 className="text-gray-500 text-sm mb-1">Published Results</h3>
            <p className="text-black text-2xl font-bold">{stats.publishedResults}</p>
          </div>
        </div>
      )}
    </div>
  )
}
