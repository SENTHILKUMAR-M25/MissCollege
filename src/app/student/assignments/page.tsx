import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { redirect } from "next/navigation"
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import StudentAssignmentClient from "@/components/student/StudentAssignmentClient"

export default async function StudentAssignmentsPage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { student } = result.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Assignments</h1>
          <p className="text-gray-500 text-sm mt-0.5">View and submit assignments</p>
        </div>
      </div>

      <StudentAssignmentClient studentId={student.id} studentUserId={user.id} />
    </div>
  )
}
