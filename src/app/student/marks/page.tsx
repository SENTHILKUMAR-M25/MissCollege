import prisma from "@/lib/prisma"
import { requireStudent } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getStudentMarks } from "@/actions/faculty-marks"
import { Award } from "lucide-react"
import StudentMarksClient from "@/components/student/StudentMarksClient"

export default async function StudentMarksPage() {
  const user = await requireStudent()

  const result = await getStudentMarks(user.id)
  if (!result.success) return <div className="text-red-400">Failed to load marks</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Award size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">My Marks</h1>
          <p className="text-slate-400 text-sm mt-0.5">Internal assessment marks</p>
        </div>
      </div>

      <StudentMarksClient data={result.data} />
    </div>
  )
}
