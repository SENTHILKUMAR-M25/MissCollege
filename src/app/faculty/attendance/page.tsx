import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyAttendanceRecords, getFacultySubjects } from "@/actions/faculty-portal"
import { ClipboardCheck } from "lucide-react"
import AttendanceClient from "@/components/faculty/AttendanceClient"

export default async function FacultyAttendancePage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const [recordsResult, subjectsResult] = await Promise.all([
    getFacultyAttendanceRecords(faculty.id),
    getFacultySubjects(faculty.id),
  ])

  if (!recordsResult.success) {
    return <div className="text-red-400">Failed to load attendance records</div>
  }

  const students = await prisma.student.findMany({
    where: { departmentId: faculty.departmentId },
    select: {
      id: true,
      registerNumber: true,
      semester: true,
      section: true,
      user: { select: { name: true } },
    },
    orderBy: [{ semester: "asc" }, { section: "asc" }, { registerNumber: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Attendance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <AttendanceClient
        facultyId={faculty.id}
        subjects={subjectsResult.data ?? []}
        students={students}
        initialRecords={recordsResult.data}
      />
    </div>
  )
}
