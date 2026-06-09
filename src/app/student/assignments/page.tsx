import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { redirect } from "next/navigation"
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"

export default async function StudentAssignmentsPage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { assignments } = result.data

  const submitted = assignments.filter((a: any) => a.submissions.length > 0)
  const pending = assignments.filter((a: any) => a.submissions.length === 0)
  const graded = submitted.filter((a: any) => a.submissions[0]?.grade != null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Assignments</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your assignment submissions and grades</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: assignments.length, color: "text-white", bg: "bg-slate-800/50" },
          { label: "Submitted", value: submitted.length, color: "text-emerald-400", bg: "bg-emerald-500/10 border border-emerald-500/20" },
          { label: "Pending", value: pending.length, color: "text-amber-400", bg: "bg-amber-500/10 border border-amber-500/20" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl p-4 text-center ${bg}`}>
            <p className="text-slate-400 text-xs uppercase">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-bold flex items-center gap-2"><Clock size={14} className="text-amber-400" /> Pending Assignments</h3>
          {pending.map((a: any) => (
            <div key={a.id} className="rounded-2xl bg-slate-800/50 border border-amber-500/20 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-white font-bold">{a.title}</h4>
                  <p className="text-slate-400 text-sm mt-0.5">{a.subject?.name} ({a.subject?.code})</p>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">{a.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-slate-400 text-xs">Class: {a.className} - {a.section}</span>
                    <span className="text-slate-400 text-xs">Marks: {a.totalMarks}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-400 text-sm font-semibold">Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}</p>
                  {new Date(a.dueDate) < new Date() && (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">Overdue</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {submitted.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-bold flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Submitted Assignments</h3>
          {submitted.map((a: any) => {
            const sub = a.submissions[0]
            return (
              <div key={a.id} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-white font-bold">{a.title}</h4>
                    <p className="text-slate-400 text-sm mt-0.5">{a.subject?.name}</p>
                    <p className="text-slate-500 text-xs mt-1">Submitted: {new Date(sub.submittedAt).toLocaleDateString("en-IN")}</p>
                    {sub.feedback && <p className="text-slate-300 text-xs mt-2 bg-white/5 rounded-lg px-3 py-2">Feedback: {sub.feedback}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {sub.grade != null ? (
                      <div>
                        <p className="text-emerald-400 text-xl font-bold">{sub.grade}/{a.totalMarks}</p>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Graded</span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">Awaiting Grade</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {assignments.length === 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <FileText size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No assignments found for your semester.</p>
        </div>
      )}
    </div>
  )
}
