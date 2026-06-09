import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultySubjects, getFacultyAssignments } from "@/actions/faculty-portal"
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
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <PenLine size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Assignments</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create and manage assignments</p>
        </div>
      </div>

      <AssignmentClient
        facultyId={faculty.id}
        subjects={subjectsRes.data}
        initialAssignments={assignmentsRes.data}
      />
    </div>
  )
}
