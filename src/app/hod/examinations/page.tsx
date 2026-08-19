import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Award } from "lucide-react"
import HodMarksClient from "@/components/hod/HodMarksClient"

export default async function HodExaminationsPage() {
  const user = await requireHod()

  const hod = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { hodAssignments: { where: { isActive: true }, include: { department: true } } },
  })
  if (!hod?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = hod.departmentId

  const [subjects, marks] = await Promise.all([
    prisma.subject.findMany({
      where: { departmentId: deptId, isActive: true },
      select: { id: true, name: true, code: true, semester: true },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    }),
    prisma.internalMark.findMany({
      where: { student: { departmentId: deptId } },
      include: {
        student: { include: { user: { select: { name: true } }, department: { select: { name: true, code: true } } } },
        subject: { select: { id: true, name: true, code: true, semester: true } },
      },
      orderBy: [{ subject: { semester: "asc" } }, { student: { registerNumber: "asc" } }],
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <Award size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Internal Marks</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {hod.hodAssignments[0]?.department?.name ?? ""}</p>
        </div>
      </div>

      <HodMarksClient subjects={subjects} initialMarks={marks} />
    </div>
  )
}
