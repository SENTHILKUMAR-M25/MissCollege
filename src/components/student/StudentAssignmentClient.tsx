"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Plus, X, Upload, FileText, Clock, CheckCircle2, AlertCircle, Download, Eye } from "lucide-react"
import toast from "react-hot-toast"

type Assignment = {
  id: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  totalMarks: number
  priority: string
  status: string
  subject: { id: string; name: string; code: string }
  submission?: {
    id: string
    submittedAt: string
    grade: number | null
    feedback: string | null
    status: string
    isLate: boolean
    fileUrl: string | null
  }
  isOverdue: boolean
  isLate: boolean
}

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-red-500/10 text-red-400 border-red-500/20",
  DRAFT: "bg-gray-100 text-gray-500 border-gray-200",
  GRADED: "bg-[#2F2FE4]/10 text-[#2F2FE4] border-[#2F2FE4]/20",
  SUBMITTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LATE: "bg-red-500/10 text-red-400 border-red-500/20",
}

export default function StudentAssignmentClient({ studentId, studentUserId }: { studentId: string; studentUserId: string }) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [fileUrl, setFileUrl] = useState("")

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/assignments?studentId=${studentUserId}`)
      const json = await res.json()
      if (json.success) setAssignments(json.data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [studentUserId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", assignmentId: selected.id, submissionText, fileUrl: fileUrl || undefined }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Assignment submitted")
      setSelected(null)
      setSubmissionText("")
      setFileUrl("")
      await loadData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = assignments
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subject.code.toLowerCase().includes(search.toLowerCase()))

  const pending = filtered.filter(a => !a.submission)
  const submitted = filtered.filter(a => a.submission)
  const graded = submitted.filter(a => a.submission?.grade != null)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total", value: assignments.length, color: "text-black" },
          { label: "Pending", value: pending.length, color: "text-amber-400" },
          { label: "Graded", value: graded.length, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or subject code…" className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-black text-sm placeholder:text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">Loading assignments…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
            <FileText size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No assignments found.</p>
          </div>
        ) : (
          filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-black font-bold text-sm">{a.title}</h4>
                  <p className="text-gray-500 text-xs">{a.subject.code} - {a.subject.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[a.status] || STATUS_COLORS.DRAFT}`}>{a.status}</span>
                    {a.isOverdue && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">Overdue</span>}
                    {a.submission && <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[a.submission.status] || ""}`}>{a.submission.status}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-500 text-xs">Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}</p>
                  {a.submission?.grade != null && (
                    <p className="text-emerald-400 text-xl font-bold mt-1">{a.submission.grade}/{a.totalMarks}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setSelected(a)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-gray-700 text-xs hover:text-black">
                  <Eye size={12} /> {a.submission ? "View" : a.status === "CLOSED" ? "View (Closed)" : "View & Submit"}
                </button>
                {a.submission?.fileUrl && (
                  <a href={a.submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-gray-700 text-xs hover:text-black">
                    <Download size={12} /> Download Submitted
                  </a>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Assignment Detail / Submit Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-gray-100 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-black font-bold">{selected.title}</h3>
                  <p className="text-gray-500 text-xs">{selected.subject.code} - {selected.subject.name} • {new Date(selected.dueDate).toLocaleString("en-IN")}</p>
                </div>
                 <button onClick={() => setSelected(null)} className="bg-gray-100 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-black transition-all w-8 h-8"><X size={19} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase">Description</p>
                  <p className="text-gray-700 text-sm mt-1">{selected.description}</p>
                </div>
                {selected.instructions && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Instructions</p>
                    <p className="text-gray-700 text-sm mt-1">{selected.instructions}</p>
                  </div>
                )}

                {selected.submission ? (
                  <div className="rounded-xl bg-gray-100 border border-gray-100 p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Your Submission</p>
                    <p className="text-gray-700 text-xs">Submitted: {new Date(selected.submission.submittedAt).toLocaleString("en-IN")}</p>
                    {selected.submission.isLate && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">Late Submission</span>}
                    {selected.submission.grade != null && <p className="text-emerald-400 text-sm font-bold">Grade: {selected.submission.grade}/{selected.totalMarks}</p>}
                    {selected.submission.feedback && <p className="text-gray-700 text-xs bg-[#2F2FE4]/5 border border-[#2F2FE4]/20 rounded-lg p-2">Feedback: {selected.submission.feedback}</p>}
                    {selected.submission.fileUrl && <a href={selected.submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#2F2FE4] text-xs hover:text-[#2F2FE4]"><Download size={12} /> View Submitted File</a>}
                  </div>
                ) : selected.status === "CLOSED" ? (
                  <p className="text-red-400 text-sm">This assignment is closed for submissions.</p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Submission Text (optional)</label>
                      <textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)} rows={3} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" placeholder="Your answers or notes…" />
                    </div>
                    <div>
                      <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">File URL (optional)</label>
                      <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" placeholder="https://drive.google.com/…" />
                    </div>
                    {selected.isOverdue && (
                      <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={12} /> This assignment is overdue. Late submission may be penalized.</p>
                    )}
                    <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50">
                      <Upload size={14} /> {submitting ? "Submitting…" : "Submit Assignment"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
