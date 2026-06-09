"use client"

import { useState } from "react"
import { gradeAssignment } from "@/actions/faculty-portal"

export default function GradeFormClient({ submission }: { submission: any }) {
  const [grade, setGrade] = useState(submission.grade ?? "")
  const [feedback, setFeedback] = useState(submission.feedback ?? "")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await gradeAssignment(submission.id, Number(grade), feedback)
    if (res.success) {
      window.location.reload()
    } else {
      alert(res.error || "Failed to grade")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="text-slate-400 text-[10px] uppercase font-semibold mb-1 block">Grade (0-100)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500/50"
        />
      </div>
      <div className="md:col-span-2 flex gap-2">
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Feedback..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-500/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  )
}
