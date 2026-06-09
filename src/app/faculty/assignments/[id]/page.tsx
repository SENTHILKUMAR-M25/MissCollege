import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getAssignmentSubmissions } from "@/actions/faculty-portal"
import { ArrowLeft } from "lucide-react"
 import Link from "next/link"
import GradeFormClient from "@/components/faculty/GradeFormClient"

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: assignmentId } = await params

  const submissionsRes = await getAssignmentSubmissions(assignmentId)
  if (!submissionsRes.success) {
    return <div className="text-red-400">Failed to load submissions</div>
  }

  const submissions = submissionsRes.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/faculty/assignments" className="text-teal-400 hover:text-teal-300 flex items-center gap-1">
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h1 className="text-white text-2xl font-bold">Assignment Submissions</h1>
          <p className="text-slate-400 text-sm mt-0.5">{submissions.length} submissions received</p>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-12 text-center">
            <p className="text-slate-500 text-sm">No submissions yet.</p>
          </div>
        ) : (
          submissions.map((s: any) => (
            <div key={s.id} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-white font-bold text-sm">{s.student.user.name}</h3>
                  <p className="text-slate-500 text-xs">Submitted: {new Date(s.submittedAt).toLocaleString("en-IN")}</p>
                  {s.isLate && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">Late</span>}
                  <span className={`inline-block mt-1 ml-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.grade != null ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {s.grade != null ? "GRADED" : "PENDING"}
                  </span>
                </div>
              </div>

              {s.submissionText && (
                <p className="text-slate-300 text-xs bg-white/5 rounded-lg p-3">{s.submissionText}</p>
              )}

              {s.fileUrl && (
                <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-400 text-xs hover:text-teal-300">
                  Download Attachment
                </a>
              )}

              <GradeFormClient submission={s} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
