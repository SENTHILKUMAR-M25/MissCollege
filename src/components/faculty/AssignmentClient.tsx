"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Plus, X, Save, Trash2, Download, FileText, AlertCircle, Clock, CheckCircle2, Eye, Edit2, BarChart3, Filter } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

type Subject = { id: string; name: string; code: string; semester: number }
type Assignment = {
  id: string
  title: string
  description: string
  instructions?: string
  dueDate: string
  totalMarks: number
  priority: string
  status: string
  className: string
  section: string
  submissionCount?: number
  avgGrade?: number | null
  subject: { id: string; name: string; code: string }
  submissions: any[]
}

const SECTIONS = ["A", "B", "C", "D"]
const CLASS_NAMES = ["I", "II", "III", "IV"]
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"]
const STATUSES = ["PUBLISHED", "CLOSED", "DRAFT"]

export default function AssignmentClient({ facultyId, subjects, initialAssignments }: { facultyId: string; subjects: Subject[]; initialAssignments: Assignment[] }) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments || [])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [viewSubmissions, setViewSubmissions] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [subjectFilter, setSubjectFilter] = useState("")

  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeValue, setGradeValue] = useState("")
  const [feedbackValue, setFeedbackValue] = useState("")

  const emptyForm = () => ({ title: "", description: "", instructions: "", subjectId: "", className: "I", section: "A", semester: 1, academicYear: new Date().getFullYear().toString(), dueDate: "", totalMarks: 100, priority: "MEDIUM", attachmentUrls: [] as string[], allowResubmission: false, maxResubmissions: 1, plagiarismCheck: false, status: "PUBLISHED" as "PUBLISHED" | "CLOSED" | "DRAFT" })
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    setAssignments(initialAssignments || [])
  }, [initialAssignments])

  async function loadStats() {
    try {
      const res = await fetch(`/api/assignments?action=stats&facultyId=${facultyId}`)
      const json = await res.json()
      if (json.success) setStats(json.data)
    } catch { /* silent */ }
  }

  useEffect(() => { loadStats() }, [facultyId])

  function resetForm() {
    setFormData(emptyForm())
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...formData, facultyId, dueDate: formData.dueDate }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Assignment created")
      setShowModal(false)
      resetForm()
      const r = await fetch(`/api/assignments?facultyId=${facultyId}`)
      const d = await r.json()
      if (d.success) setAssignments(d.data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this assignment?")) return
    try {
      const res = await fetch(`/api/assignments`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", assignmentId: id, facultyUserId: facultyId }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Deleted")
      setAssignments(prev => prev.filter(a => a.id !== id))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/assignments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "status", assignmentId: id, status, facultyUserId: facultyId }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Status updated")
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleGrade(submissionId: string, maxMarks: number) {
    if (!gradeValue || Number(gradeValue) < 0 || Number(gradeValue) > maxMarks) {
      toast.error(`Grade must be between 0 and ${maxMarks}`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/assignments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "grade", submissionId, grade: Number(gradeValue), feedback: feedbackValue, facultyUserId: facultyId }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Graded successfully")
      setGradingId(null)
      setGradeValue("")
      setFeedbackValue("")
      if (selectedAssignment) {
        openSubmissions(selectedAssignment)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openDetail(a: Assignment) {
    setSelectedAssignment(a)
    setViewSubmissions(false)
  }

  async function openSubmissions(a: Assignment) {
    setSelectedAssignment(a)
    setViewSubmissions(true)
    try {
      const res = await fetch(`/api/assignments?action=submissions&assignmentId=${a.id}`)
      const json = await res.json()
      if (json.success) setSelectedAssignment({ ...a, submissions: json.data })
    } catch { /* silent */ }
  }

  const filtered = assignments
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subject.code.toLowerCase().includes(search.toLowerCase()))
    .filter(a => statusFilter === "ALL" || a.status === statusFilter)
    .filter(a => !subjectFilter || a.subject.id === subjectFilter)

  const totalPending = filtered.filter(a => a.status === "PUBLISHED" && (a.submissionCount ?? 0) === 0).length
  const totalActive = filtered.filter(a => a.status === "PUBLISHED").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Assignments", value: assignments.length, color: "text-black" },
          { label: "Active", value: totalActive, color: "text-[#2F2FE4]" },
          { label: "Pending Review", value: totalPending, color: "text-amber-400" },
          { label: "Avg Grade", value: stats?.avgOverallGrade ?? "—", color: "text-[#2F2FE4]" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or subject code…" className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-black text-sm placeholder:text-gray-400" />
          </div>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-black text-xs">
          <option value="ALL">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-black text-xs">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
        </select>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5]">
          <Plus size={14} /> New Assignment
        </button>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
            <FileText size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No assignments found.</p>
          </div>
        ) : filtered.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-black font-bold text-sm">{a.title}</h4>
                <p className="text-gray-500 text-xs">{a.subject.code} - {a.subject.name} • Class {a.className} - {a.section}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : a.status === "CLOSED" ? "bg-red-500/10 text-red-400" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.priority === "HIGH" ? "bg-red-500/10 text-red-400" : a.priority === "MEDIUM" ? "bg-amber-500/10 text-amber-400" : "bg-gray-100 text-gray-500"}`}>{a.priority}</span>
                  <span className="text-gray-400 text-[10px]">Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openDetail(a)} title="View" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100"><Eye size={13} /></button>
                <button onClick={() => openSubmissions(a)} title="Submissions" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#2F2FE4] hover:bg-[#2F2FE4]/10"><FileText size={13} /></button>
                <button onClick={() => handleDelete(a.id)} title="Delete" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={13} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Total Marks</p><p className="text-black text-sm font-semibold">{a.totalMarks}</p></div>
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Submissions</p><p className="text-black text-sm font-semibold">{a.submissions.length}</p></div>
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Avg Grade</p><p className="text-black text-sm font-semibold">{a.avgGrade ?? "—"}</p></div>
              <div className="rounded-xl bg-gray-50 p-2"><p className="text-gray-400 text-[10px]">Status</p>
                <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)} className="bg-transparent text-black text-xs font-semibold outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Create Assignment" size="lg">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Title</label>
              <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" placeholder="Assignment title" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" placeholder="Assignment description" required />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Subject</label>
              <select value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Class / Section</label>
              <div className="flex gap-2">
                <select value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} className="flex-1 bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm">
                  {CLASS_NAMES.map(c => <option key={c} value={c}>Year {c}</option>)}
                </select>
                <select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-20 bg-gray-100 border border-gray-100 rounded-xl px-2 py-2 text-black text-sm">
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Semester</label>
              <select value={formData.semester} onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Academic Year</label>
              <input value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" placeholder="2025-2026" />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Due Date & Time</label>
              <input type="datetime-local" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" required />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Total Marks</label>
              <input type="number" value={formData.totalMarks} onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Attachment URL (optional)</label>
              <input value={formData.attachmentUrls[0] || ""} onChange={e => setFormData({ ...formData, attachmentUrls: e.target.value ? [e.target.value] : [] })} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm" placeholder="https://..." />
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-gray-700 text-xs">
                <input type="checkbox" checked={formData.allowResubmission} onChange={e => setFormData({ ...formData, allowResubmission: e.target.checked })} className="rounded bg-gray-100 border-gray-200" /> Allow Resubmission
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-xs">
                <input type="checkbox" checked={formData.plagiarismCheck} onChange={e => setFormData({ ...formData, plagiarismCheck: e.target.checked })} className="rounded bg-gray-100 border-gray-200" /> Plagiarism Check
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end pt-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50">
              <Save size={14} /> {saving ? "Creating…" : "Create Assignment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAssignment && !viewSubmissions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-gray-100 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-black font-bold">{selectedAssignment.title}</h3>
                <button onClick={() => setSelectedAssignment(null)} className="bg-gray-100 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-black transition-all w-8 h-8"><X size={19} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase">Subject</p>
                  <p className="text-black text-sm">{selectedAssignment.subject.code} - {selectedAssignment.subject.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">Description</p>
                  <p className="text-gray-700 text-sm">{selectedAssignment.description}</p>
                </div>
                {selectedAssignment.instructions && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase">Instructions</p>
                    <p className="text-gray-700 text-sm">{selectedAssignment.instructions}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-gray-500 text-xs">Due Date</p><p className="text-black text-sm">{new Date(selectedAssignment.dueDate).toLocaleString("en-IN")}</p></div>
                  <div><p className="text-gray-500 text-xs">Total Marks</p><p className="text-black text-sm">{selectedAssignment.totalMarks}</p></div>
                  <div><p className="text-gray-500 text-xs">Class / Section</p><p className="text-black text-sm">{selectedAssignment.className} - {selectedAssignment.section}</p></div>
                  <div><p className="text-gray-500 text-xs">Priority</p><p className="text-black text-sm">{selectedAssignment.priority}</p></div>
                </div>
                <button onClick={() => { setViewSubmissions(true); openSubmissions(selectedAssignment) }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5]">
                  <FileText size={14} /> View Submissions ({selectedAssignment.submissions.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submissions Modal */}
      <AnimatePresence>
        {selectedAssignment && viewSubmissions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-gray-100 border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h3 className="text-black font-bold">{selectedAssignment.title}</h3>
                  <p className="text-gray-500 text-xs">{selectedAssignment.submissions.length} submissions</p>
                </div>
                <button onClick={() => setSelectedAssignment(null)} className="bg-gray-100 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-black transition-all w-8 h-8"><X size={19} /></button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {selectedAssignment.submissions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No submissions yet.</p>
                ) : selectedAssignment.submissions.map((s: any) => (
                  <div key={s.id} className="rounded-xl bg-gray-100 border border-gray-100 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-black text-sm font-semibold">{s.student.user.name}</p>
                        <p className="text-gray-400 text-[10px]">{s.student.department?.code} • {s.student.course?.name} • Sem {s.student.semester} • Sec {s.student.section}</p>
                        <p className="text-gray-400 text-[10px]">Submitted: {new Date(s.submittedAt).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.isLate && <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold">Late</span>}
                        {s.grade != null && <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Graded: {s.grade}/{selectedAssignment.totalMarks}</span>}
                        {!s.grade && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">Pending</span>}
                        {!s.grade && gradingId !== s.id && (
                          <button onClick={() => { setGradingId(s.id); setGradeValue(""); setFeedbackValue(""); }} className="px-2 py-0.5 rounded bg-[#2F2FE4]/10 text-[#2F2FE4] text-[10px] font-bold hover:bg-[#2F2FE4]/10">Grade</button>
                        )}
                      </div>
                     </div>
                    {gradingId === s.id && (
                      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-gray-700 text-xs w-16">Grade</label>
                          <input type="number" min={0} max={selectedAssignment.totalMarks} value={gradeValue} onChange={e => setGradeValue(e.target.value)} className="w-24 bg-gray-100 border border-gray-100 rounded-lg px-2 py-1 text-black text-xs" placeholder={`0-${selectedAssignment.totalMarks}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-gray-700 text-xs w-16">Feedback</label>
                          <textarea value={feedbackValue} onChange={e => setFeedbackValue(e.target.value)} rows={2} className="flex-1 bg-gray-100 border border-gray-100 rounded-lg px-2 py-1 text-black text-xs" placeholder="Optional feedback…" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleGrade(s.id, selectedAssignment.totalMarks)} disabled={saving} className="px-3 py-1 rounded-lg bg-[#2F2FE4] text-white text-xs font-semibold hover:bg-[#2525c5] disabled:opacity-50">Save Grade</button>
                          <button onClick={() => setGradingId(null)} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs hover:bg-gray-100">Cancel</button>
                        </div>
                      </div>
                    )}
                    {s.submissionText && <p className="text-gray-700 text-xs bg-gray-100 rounded-lg p-2">{s.submissionText}</p>}
                    {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#2F2FE4] text-xs hover:text-[#2525c5]"><Download size={12} /> Download Submission</a>}
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
