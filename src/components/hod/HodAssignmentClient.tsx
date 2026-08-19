"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Eye, Download, BarChart3, X } from "lucide-react"

type Assignment = {
  id: string
  title: string
  description: string
  dueDate: string
  totalMarks: number
  status: string
  priority: string
  className: string
  section: string
  subject: { id: string; name: string; code: string }
  faculty: { user: { name: string } }
  submissions: any[]
  submissionCount?: number
  avgGrade?: number | null
}

export default function HodAssignmentClient({ departmentId }: { departmentId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])

  const loadData = async () => {
    try {
      const res = await fetch(`/api/assignments?departmentId=${departmentId}`)
      const json = await res.json()
      if (json.success) setAssignments(json.data)
    } catch { /* silent */ }
  }

  async function openSubmissions(a: Assignment) {
    setSelected(a)
    try {
      const res = await fetch(`/api/assignments?action=submissions&assignmentId=${a.id}`)
      const json = await res.json()
      if (json.success) setSubmissions(json.data)
    } catch { /* silent */ }
  }

  useEffect(() => { loadData() }, [departmentId])

  const filtered = assignments.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subject.code.toLowerCase().includes(search.toLowerCase()))
  const totalSubs = assignments.reduce((sum, a) => sum + (a.submissionCount ?? a.submissions.length), 0)
  const avgGrade = assignments.length > 0 ? Math.round(assignments.filter(a => a.avgGrade != null).reduce((sum, a) => sum + (a.avgGrade ?? 0), 0) * 10) / 10 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Assignments", value: assignments.length, color: "text-black" },
          { label: "Total Submissions", value: totalSubs, color: "text-[#2F2FE4]" },
          { label: "Avg Grade", value: avgGrade, color: "text-[#2F2FE4]" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments…" className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-black text-sm placeholder:text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
            <BarChart3 size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No assignments found.</p>
          </div>
        ) : filtered.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-black font-bold text-sm">{a.title}</h4>
                <p className="text-gray-500 text-xs">{a.subject.code} - {a.subject.name} • Class {a.className} - {a.section}</p>
                <p className="text-gray-400 text-[10px] mt-1">By {a.faculty.user.name} • Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openSubmissions(a)} title="View Submissions" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#2F2FE4] hover:bg-[#2F2FE4]/10"><Eye size={13} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Marks</p><p className="text-black text-sm font-semibold">{a.totalMarks}</p></div>
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Submissions</p><p className="text-black text-sm font-semibold">{a.submissions.length}</p></div>
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Avg Grade</p><p className="text-black text-sm font-semibold">{a.avgGrade ?? "—"}</p></div>
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : a.status === "CLOSED" ? "bg-red-500/10 text-red-400" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submissions Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-gray-100 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h3 className="text-black font-bold">{selected.title}</h3>
                  <p className="text-gray-500 text-xs">{selected.subject.code} - {selected.subject.name} • {submissions.length} submissions</p>
                </div>
                 <button onClick={() => setSelected(null)} className="bg-gray-100 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-black transition-all w-8 h-8"><X size={19} /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {submissions.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">No submissions yet.</p> : submissions.map((s: any) => (
                  <div key={s.id} className="rounded-xl bg-gray-100 border border-gray-100 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-black text-sm font-semibold">{s.student.user.name}</p>
                        <p className="text-gray-400 text-[10px]">{s.student.department?.code} • {s.student.course?.name}</p>
                        <p className="text-gray-400 text-[10px]">Submitted: {new Date(s.submittedAt).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.isLate && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">Late</span>}
                        {s.grade != null && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Graded: {s.grade}/{selected.totalMarks}</span>}
                        {!s.grade && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">Pending</span>}
                      </div>
                    </div>
                    {s.submissionText && <p className="text-gray-700 text-xs bg-gray-100 rounded-lg p-2">{s.submissionText}</p>}
                    {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#2F2FE4] text-xs hover:text-[#2525c5]"><Download size={12} /> Download</a>}
                    {s.feedback && <p className="text-gray-700 text-xs bg-[#2F2FE4]/5 border border-[#2F2FE4]/20 rounded-lg p-2">Feedback: {s.feedback}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
