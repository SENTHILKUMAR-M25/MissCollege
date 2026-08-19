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
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <GraduationCap size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Register Number", "Name", "Course", "Semester", "Section", "Email", "Attendance", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
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
