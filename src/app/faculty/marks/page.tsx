import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { BookOpen, Award } from "lucide-react"
import FacultyMarksClient from "@/components/faculty/FacultyMarksClient"

export default async function FacultyMarksPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const subjectsRes = await prisma.subject.findMany({
    where: {
      departmentId: faculty.departmentId,
      isActive: true,
      OR: [{ facultyId: faculty.id }, { facultySubjects: { some: { facultyId: faculty.id, isActive: true } } }],
    },
    select: { id: true, name: true, code: true, semester: true, credits: true },
    orderBy: [{ semester: "asc" }, { code: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <Award size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Internal Marks</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <FacultyMarksClient facultyId={faculty.id} facultyUserId={user.id} departmentName={faculty.department.name} initialSubjects={subjectsRes} />
    </div>
  )
}
