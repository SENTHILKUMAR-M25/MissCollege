import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyStudents } from "@/actions/faculty-portal"
import { GraduationCap, Search, Eye } from "lucide-react"
import StudentsClient from "@/components/faculty/StudentsClient"

export default async function FacultyStudentsPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const result = await getFacultyStudents(faculty.id)
  if (!result.success) {
    return <div className="text-red-400">Failed to load students</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <GraduationCap size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Students</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/30">
                {["Register Number", "Name", "Course", "Semester", "Section", "Email", "Attendance", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <StudentsClient initialStudents={result.data} />
          </table>
        </div>
      </div>
    </div>
  )
}
