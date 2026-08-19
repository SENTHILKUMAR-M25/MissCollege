import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { PenLine } from "lucide-react"
import HodAssignmentClient from "@/components/hod/HodAssignmentClient"

export default async function HodAssignmentsPage() {
  const user = await requireHod()

  const hod = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { hodAssignments: { where: { isActive: true }, include: { department: true } } },
  })
  if (!hod?.hodAssignments[0]) redirect("/unauthorized")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <PenLine size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Assignments</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {hod.hodAssignments[0]?.department?.name ?? ""}</p>
        </div>
      </div>

      <HodAssignmentClient departmentId={hod.departmentId} />
    </div>
  )
}
