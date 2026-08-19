import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyAttendanceRecords, getFacultySubjects, getFacultyTimetable, getPeriods, getClassStudents, getAttendanceSummary } from "@/actions/faculty-portal"
import { ClipboardCheck } from "lucide-react"
import AttendanceClient from "@/components/faculty/AttendanceClient"

export default async function FacultyAttendancePage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { id: true, name: true, code: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const [recordsResult, subjectsResult, timetableResult, periodsResult, summaryResult] = await Promise.all([
    getFacultyAttendanceRecords(faculty.id),
    getFacultySubjects(faculty.id),
    getFacultyTimetable(faculty.id),
    getPeriods(),
    getAttendanceSummary(faculty.id),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Attendance</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <AttendanceClient
        facultyId={faculty.id}
        departmentId={faculty.department.id}
        subjects={subjectsResult.data ?? []}
        initialRecords={recordsResult.data}
        timetable={timetableResult.data ?? []}
        periods={periodsResult.data ?? []}
        summary={summaryResult.data}
      />
    </div>
  )
}
