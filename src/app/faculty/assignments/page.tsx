import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultySubjects } from "@/actions/faculty-portal"
import { getFacultyAssignmentsV2 as getFacultyAssignments } from "@/actions/assignments"
import { PenLine } from "lucide-react"
import AssignmentClient from "@/components/faculty/AssignmentClient"

export default async function FacultyAssignmentsPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const [subjectsRes, assignmentsRes] = await Promise.all([
    getFacultySubjects(faculty.id),
    getFacultyAssignments(faculty.id),
  ])

  if (!subjectsRes.success) {
    return <div className="text-red-400">Failed to load subjects</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <PenLine size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Assignments</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage assignments</p>
        </div>
      </div>

      <AssignmentClient
        facultyId={faculty.id}
        subjects={subjectsRes.data}
        initialAssignments={assignmentsRes.data as any}
      />
    </div>
  )
}
