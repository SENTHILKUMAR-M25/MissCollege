import { requireStudent } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Bell } from "lucide-react"
import StudentLeaveClient from "@/components/student/LeaveClient"

export default async function StudentLeavePage() {
  const user = await requireStudent()
  const student = await prisma.student.findUnique({ where: { userId: user.id } })
  if (!student) redirect("/unauthorized")

  // Students don't have leaveRequests directly in schema (it's faculty-based)
  // Reuse faculty leave model by passing studentId as facultyId workaround
  // For now show empty state with apply form
  const leaves: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Leave Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Apply and track leave requests</p>
        </div>
      </div>
      <StudentLeaveClient leaves={leaves} facultyId={student.id} departmentId={student.departmentId} />
    </div>
  )
}
