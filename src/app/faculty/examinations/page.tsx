import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultySubjects, getFacultyInternalMarks, createInternalMark } from "@/actions/faculty-portal"
import { Award } from "lucide-react"
import MarksClient from "@/components/faculty/MarksClient"

export default async function FacultyExaminationsPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } }, subjects: true },
  })
  if (!faculty) return redirect("/unauthorized")

  const [subjectsRes, marksRes] = await Promise.all([
    getFacultySubjects(faculty.id),
    getFacultyInternalMarks(faculty.id),
  ])

  if (!subjectsRes.success || !marksRes.success) {
    return <div className="text-red-400">Failed to load data</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <Award size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Examinations</h1>
          <p className="text-gray-500 text-sm mt-0.5">Internal marks management</p>
        </div>
      </div>

      <MarksClient
        facultyId={faculty.id}
        subjects={subjectsRes.data}
        initialMarks={marksRes.data}
        createMarkAction={createInternalMark}
      />
    </div>
  )
}
