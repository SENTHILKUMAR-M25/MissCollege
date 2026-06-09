"use client"

import { useState } from "react"
import { Plus, Eye, FileText } from "lucide-react"
import { createAssignment, getAssignmentSubmissions } from "@/actions/faculty-portal"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function AssignmentClient({
  facultyId,
  subjects,
  initialAssignments,
}: {
  facultyId: string
  subjects: any[]
  initialAssignments: any[]
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [className, setClassName] = useState("")
  const [section, setSection] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [totalMarks, setTotalMarks] = useState("100")
  const [priority, setPriority] = useState("MEDIUM")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await createAssignment({
      title, description, subjectId: selectedSubject, facultyId,
      className, section, dueDate, totalMarks: Number(totalMarks), priority,
    })
    if (res.success) {
      toast.success("Assignment created")
      setTitle("")
      setDescription("")
      setDueDate("")
      window.location.reload()
    } else {
      toast.error(res.error || "Failed to create assignment")
    }
    setLoading(false)
  }

  async function handleViewSubmissions(assignmentId: string) {
    router.push(`/faculty/assignments/${assignmentId}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
        <div>
          <h3 className="text-white font-bold text-base">Create New Assignment</h3>
          <p className="text-slate-500 text-xs mt-0.5">Fill in the details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block font-medium">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block font-medium">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the assignment..." rows={3} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Subject *</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50">
                {subjects.map((s: any) => (<option key={s.id} value={s.id}>{s.code} - {s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Class *</label>
              <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. II B.Sc" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Section *</label>
              <input type="text" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. A" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Due Date *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Total Marks</label>
              <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} min={1} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block font-medium">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50">
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
            <Plus size={14} /> {loading ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-bold text-base">My Assignments</h3>
        {initialAssignments.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-12 text-center">
            <p className="text-slate-500 text-sm">No assignments created yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialAssignments.map((a: any) => (
              <div key={a.id} onClick={() => handleViewSubmissions(a.id)} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 hover:border-teal-500/20 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{a.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-1">{a.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-teal-400 text-[10px] font-medium">{a.className} - {a.section}</span>
                      <span className="text-slate-500 text-[10px]">Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-medium flex items-center gap-1">
                      <Eye size={10} /> {a.submissions?.length || 0} subs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
