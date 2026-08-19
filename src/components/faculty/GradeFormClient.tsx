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
    <form onSubmit={handleSubmit} className="pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="text-gray-500 text-[10px] uppercase font-semibold mb-1 block">Grade (0-100)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-black text-xs focus:outline-none focus:border-[#2F2FE4]/50"
        />
      </div>
      <div className="md:col-span-2 flex gap-2">
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Feedback..."
          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-black text-xs focus:outline-none focus:border-[#2F2FE4]/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10 disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </form>
  )
}
