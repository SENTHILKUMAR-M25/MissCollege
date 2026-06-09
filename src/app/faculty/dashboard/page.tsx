import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyDashboardStats } from "@/actions/faculty-portal"
import { getFacultyClassAssignments } from "@/actions/class-assignments"
import {
  Users, BookOpen, PenLine, ClipboardCheck, CalendarDays, Bell,
  ArrowRight, Shield, UsersRound
} from "lucide-react"
import DashboardClient from "@/components/faculty/DashboardClient"

const MISS_AP_001_DOB = "16061998"

export default async function FacultyDashboardPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const statsResult = await getFacultyDashboardStats(user.id, faculty.departmentId)
  const classAssignmentsResult = await getFacultyClassAssignments(faculty.id)

  if (!statsResult.success || !statsResult.data) {
    return <div className="text-red-400">Failed to load dashboard data</div>
  }

  const classAssignments = classAssignmentsResult.success ? classAssignmentsResult.data : []

  const stats = statsResult.data

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "from-emerald-500/20 to-teal-500/10 text-emerald-400" },
    { label: "Total Subjects", value: stats.totalSubjects, icon: BookOpen, color: "from-teal-500/20 to-cyan-500/10 text-teal-400" },
    { label: "Pending Assignments", value: stats.pendingAssignments, icon: PenLine, color: "from-amber-500/20 to-orange-500/10 text-amber-400" },
    { label: "Attendance Today", value: stats.timetableToday.length, icon: ClipboardCheck, color: "from-violet-500/20 to-purple-500/10 text-violet-400" },
    { label: "Class Advisor Of", value: classAssignments.length, icon: UsersRound, color: "from-indigo-500/20 to-blue-500/10 text-indigo-400" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Department of {stats.departmentName} overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold">
          <Shield size={14} /> Faculty Member
        </div>
      </div>

      <p className="text-slate-500 text-[10px] font-mono">MISS-AP-001 DOB: {MISS_AP_001_DOB} (DDMMYYYY: 16-06-1998)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 p-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-white text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Icon size={22} />
              </div>
            </div>
          )
        })}
      </div>

      {classAssignments.length > 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/20 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">My Class Advisor Responsibilities</h3>
              <p className="text-slate-500 text-xs mt-0.5">Classes you are assigned as Class Advisor</p>
            </div>
            <a href="/faculty/class-advisor" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-all">
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/20">
                  {["Academic Year", "Semester", "Section", "Department", "Assigned Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classAssignments.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-300 text-sm">{a.academicYear}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">Semester {a.semester}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">Section {a.section}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{a.department.code}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DashboardClient
          timetable={stats.timetableToday}
          notices={stats.notices}
        />
      </div>
    </div>
  )
}
