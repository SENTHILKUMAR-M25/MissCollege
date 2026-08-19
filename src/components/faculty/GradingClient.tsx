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
        <p className="text-gray-400 text-sm py-4 text-center">No submissions yet.</p>
      ) : (
        submissions.map((s: any) => (
          <form key={s.id} onSubmit={(e) => handleGrade(e, s.id)} className="p-4 rounded-xl bg-gray-100 border border-gray-100 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-black text-sm font-semibold">{s.student.user.name}</p>
                <p className="text-gray-400 text-xs">Submitted: {new Date(s.submittedAt).toLocaleDateString("en-IN")}</p>
                {s.isLate && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">Late</span>}
              </div>
              <div className="flex gap-2 items-center shrink-0">
                {s.grade !== null && s.grade !== undefined && (
                  <span className="text-[#2F2FE4] text-sm font-bold">{s.grade}</span>
                )}
              </div>
            </div>

            {s.submissionText && (
              <p className="text-gray-700 text-xs bg-gray-100 rounded-lg p-3">{s.submissionText}</p>
            )}
            {s.fileUrl && (
              <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#2F2FE4] text-xs hover:text-[#2525c5]">
                Download Attachment
              </a>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className="text-gray-500 text-[10px] uppercase font-semibold mb-1 block">Grade (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={grades[s.id]?.grade ?? ""}
                  onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: { ...prev[s.id], grade: e.target.value ? Number(e.target.value) : undefined } }))}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-black text-xs focus:outline-none focus:border-[#2F2FE4]/50"
                />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <input
                  type="text"
                  value={grades[s.id]?.feedback ?? ""}
                  onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: { ...prev[s.id], feedback: e.target.value } }))}
                  placeholder="Feedback..."
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-black text-xs focus:outline-none focus:border-[#2F2FE4]/50"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10 transition-all disabled:opacity-50"
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
