"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { createInternalMark } from "@/actions/faculty-portal"
import toast from "react-hot-toast"

export default function MarksClient({
  facultyId,
  subjects,
  initialMarks,
  createMarkAction,
}: {
  facultyId: string
  subjects: any[]
  initialMarks: any[]
  createMarkAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>
}) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "")
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [examType, setExamType] = useState("Internal1")
  const [mark, setMark] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedSubject) {
      fetch(`/api/students/by-subject?subjectId=${selectedSubject}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStudents(data.data || [])
          else setStudents([])
        })
        .catch(() => setStudents([]))
    }
  }, [selectedSubject])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("studentId", selectedStudent)
    formData.append("subjectId", selectedSubject)
    formData.append("examType", examType)
    formData.append("mark", mark)

    const res = await createMarkAction(formData)
    if (res.success) {
      toast.success("Mark added successfully")
      setSelectedStudent("")
      setMark("")
      window.location.reload()
    } else {
      toast.error(res.error || "Failed to add mark")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
        <div>
          <h3 className="text-white font-bold text-base">Enter Marks</h3>
          <p className="text-slate-500 text-xs mt-0.5">Record internal assessment marks</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Subject *</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50"
              >
                <option value="">Select Subject</option>
                {subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Student *</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50"
              >
                <option value="">Select Student</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.registerNumber} - {s.user?.name || "Unknown"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Exam Type *</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50"
              >
                <option value="Internal1">Internal 1</option>
                <option value="Internal2">Internal 2</option>
                <option value="Assignment">Assignment</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Mark *</label>
              <input
                type="number"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                min={0}
                max={100}
                placeholder="0-100"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedStudent || !selectedSubject || !mark}
            className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Plus size={14} /> {loading ? "Saving..." : "Add Mark"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
        <h3 className="text-white font-bold text-base">Recent Marks</h3>
        {initialMarks.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No marks recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Student", "Subject", "Exam Type", "Mark"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialMarks.map((m: any) => (
                  <tr key={m.id} className="border-b border-white/5">
                    <td className="px-3 py-2 text-white text-xs">{m.studentName}</td>
                    <td className="px-3 py-2 text-slate-300 text-xs">{m.subjectCode} - {m.subjectName}</td>
                    <td className="px-3 py-2 text-slate-300 text-xs">{m.examType}</td>
                    <td className="px-3 py-2 text-teal-400 text-xs font-semibold">{m.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
