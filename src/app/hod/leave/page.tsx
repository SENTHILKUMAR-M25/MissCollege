import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import LeaveClient from "@/components/hod/LeaveClient"
import { FileText } from "lucide-react"

export default async function HodLeavePage() {
  const user = await requireHod()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!faculty?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = faculty.departmentId

  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { departmentId: deptId },
    include: {
      faculty: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true, code: true } },
        },
      },
      department: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const serialized = leaveRequests.map((l) => ({
    ...l,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    faculty: {
      ...l.faculty,
      hodAssignments: undefined as never,
      subjects: undefined as never,
      timetables: undefined as never,
      leaveRequests: undefined as never,
      attendance: undefined as never,
    },
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Leave Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <LeaveClient initialLeaves={serialized as any} facultyUserId={faculty.userId} />
    </div>
  )
}
