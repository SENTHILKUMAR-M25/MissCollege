import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyClassAssignments } from "@/actions/class-assignments"
import { getFacultyStudents } from "@/actions/faculty-portal"
import { Users, GraduationCap, BookOpen, CalendarDays, Bell } from "lucide-react"
import Link from "next/link"

export default async function FacultyClassAdvisorPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true, code: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const [assignmentsResult, studentsResult] = await Promise.all([
    getFacultyClassAssignments(faculty.id),
    getFacultyStudents(faculty.id),
  ])

  const assignments = assignmentsResult.success ? assignmentsResult.data : []
  const allStudents = studentsResult.success ? studentsResult.data : []

  const assignedSections = assignments.map((a) => a.section)
  const assignedSemesters = assignments.map((a) => a.semester)
  const classStudents = allStudents.filter((s) =>
    assignedSections.includes(s.section) && assignedSemesters.includes(s.semester)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Class Advisor Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Assigned Classes</p>
          <p className="text-2xl font-bold text-white mt-1">{assignments.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Students Under Guidance</p>
          <p className="text-2xl font-bold text-teal-400 mt-1">{classStudents.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Avg. Attendance</p>
          {(() => {
            const presentCount = classStudents.reduce((sum, s) => sum + (s.attendance?.length || 0), 0)
            return <p className="text-2xl font-bold text-violet-400 mt-1">{presentCount} records</p>
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
          <h3 className="text-white font-bold">Assigned Classes</h3>
          {assignments.length === 0 ? (
            <p className="text-slate-500 text-sm">No class advisor assignments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Academic Year</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Semester</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-slate-300 text-sm">{a.academicYear}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">Semester {a.semester}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">Section {a.section}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{a.department.code}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
          <h3 className="text-white font-bold">Class Management Features</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/faculty/students" className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/20 border border-white/5 hover:border-teal-500/30 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <Users size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium group-hover:text-teal-400 transition-colors">Student List</p>
                <p className="text-slate-500 text-xs">View class student details</p>
              </div>
            </Link>
            <Link href="/faculty/attendance" className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/20 border border-white/5 hover:border-teal-500/30 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <CalendarDays size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium group-hover:text-teal-400 transition-colors">Attendance Monitoring</p>
                <p className="text-slate-500 text-xs">Track daily attendance</p>
              </div>
            </Link>
            <Link href="/faculty/examinations" className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/20 border border-white/5 hover:border-teal-500/30 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <BookOpen size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium group-hover:text-teal-400 transition-colors">Academic Performance</p>
                <p className="text-slate-500 text-xs">View and update marks</p>
              </div>
            </Link>
            <Link href="/faculty/assignments" className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/20 border border-white/5 hover:border-teal-500/30 transition-all group">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                <GraduationCap size={16} />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium group-hover:text-teal-400 transition-colors">Assignment Progress</p>
                <p className="text-slate-500 text-xs">Track assignment submissions</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
        <h3 className="text-white font-bold">Class Students</h3>
        {classStudents.length === 0 ? (
          <p className="text-slate-500 text-sm">No students found in your assigned classes.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/20">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Register Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Parent Contact</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-violet-400 text-sm font-mono">{s.registerNumber}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{s.user?.name || s.registerNumber}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">Semester {s.semester}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">Section {s.section}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{s.parentPhone || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
