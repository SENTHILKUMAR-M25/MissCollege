import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { FileText } from "lucide-react"
import LeaveClient from "@/components/faculty/LeaveClient"

export default async function FacultyLeavePage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { facultyId: faculty.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const serialized = leaveRequests.map((l) => ({
    id: l.id,
    leaveType: l.leaveType,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    reason: l.reason,
    status: l.status,
    reviewRemarks: l.reviewRemarks,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Leave</h1>
          <p className="text-gray-500 text-sm mt-0.5">Apply for leave and view history</p>
        </div>
      </div>

      <LeaveClient initialLeaves={serialized} facultyId={faculty.id} departmentId={faculty.departmentId} />
    </div>
  )
}
