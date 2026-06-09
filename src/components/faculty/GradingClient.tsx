"use client"

import { useState } from "react"
import { gradeAssignment } from "@/actions/faculty-portal"
import toast from "react-hot-toast"

export default function GradingClient({ submissions }: { submissions: any[] }) {
  const [grades, setGrades] = useState<Record<string, { grade?: number; feedback?: string }>>({})

  async function handleGrade(e: React.FormEvent, submissionId: string) {
    e.preventDefault()
    const g = grades[submissionId]
    if (!g?.grade && !g?.feedback) {
      toast.error("Please enter grade or feedback")
      return
    }
    const res = await gradeAssignment(submissionId, Number(g.grade), g.feedback || "")
    if (res.success) {
      toast.success("Grade submitted")
    } else {
      toast.error(res.error || "Failed to submit grade")
    }
  }

  return (
    <div className="space-y-3">
      {submissions.length === 0 ? (
        <p className="text-slate-500 text-sm py-4 text-center">No submissions yet.</p>
      ) : (
        submissions.map((s: any) => (
          <form key={s.id} onSubmit={(e) => handleGrade(e, s.id)} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">{s.student.user.name}</p>
                <p className="text-slate-500 text-xs">Submitted: {new Date(s.submittedAt).toLocaleDateString("en-IN")}</p>
                {s.isLate && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">Late</span>}
              </div>
              <div className="flex gap-2 items-center shrink-0">
                {s.grade !== null && s.grade !== undefined && (
                  <span className="text-teal-400 text-sm font-bold">{s.grade}</span>
                )}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-semibold mb-1 block">Grade (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={grades[s.id]?.grade ?? ""}
                  onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value ? Number(e.target.value) : undefined } }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <input
                  type="text"
                  value={grades[s.id]?.feedback ?? ""}
                  onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: { ...prev[s.id], feedback: e.target.value } }))}
                  placeholder="Feedback..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500/50"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-all disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        ))
      )}
    </div>
  )
}
