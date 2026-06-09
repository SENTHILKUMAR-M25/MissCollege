"use client"

import { useState } from "react"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { applyFacultyLeave } from "@/actions/faculty-portal"
import toast from "react-hot-toast"

export default function LeaveClient({
  initialLeaves,
  facultyId,
  departmentId,
}: {
  initialLeaves: any[]
  facultyId: string
  departmentId: string
}) {
  const [leaveType, setLeaveType] = useState("CL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("facultyId", facultyId)
    formData.append("departmentId", departmentId)
    formData.append("leaveType", leaveType)
    formData.append("startDate", startDate)
    formData.append("endDate", endDate)
    formData.append("reason", reason)

    const res = await applyFacultyLeave(formData)
    if (res.success) {
      toast.success("Leave request submitted")
      setLeaveType("CL")
      setStartDate("")
      setEndDate("")
      setReason("")
      setShowForm(false)
      window.location.reload()
    } else {
      toast.error(res.error || "Failed to submit")
    }
    setLoading(false)
  }

  const pending = initialLeaves.filter((l) => l.status === "PENDING")
  const processed = initialLeaves.filter((l) => l.status !== "PENDING")

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      case "APPROVED": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      case "REJECTED": return "bg-red-500/10 text-red-400 border border-red-500/20"
      default: return "bg-slate-500/10 text-slate-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <span key={s} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor(s)}`}>
              {s}: {s === "PENDING" ? pending.length : s === "APPROVED" ? processed.filter((p) => p.status === "APPROVED").length : processed.filter((p) => p.status === "REJECTED").length}
            </span>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-all flex items-center gap-1"
        >
          <Plus size={12} /> New Request
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
          <h3 className="text-white font-bold text-base">Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="facultyId" value={facultyId} />
            <input type="hidden" name="departmentId" value={departmentId} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Leave Type *</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50">
                  <option value="CL">Casual Leave (CL)</option>
                  <option value="SL">Sick Leave (SL)</option>
                  <option value="ML">Medical Leave (ML)</option>
                  <option value="OD">On Duty (OD)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Start Date *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">End Date *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Reason *</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave" rows={3} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50 resize-none" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Pending Requests</h2>
          {pending.map((l: any) => (
            <div key={l.id} className="rounded-2xl bg-slate-800/60 border border-amber-500/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">{l.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{new Date(l.startDate).toLocaleDateString("en-IN")} to {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-slate-500 hover:text-white transition-colors">
                  {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {expanded === l.id && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-slate-500 text-[10px] uppercase font-semibold">Reason</p>
                  <p className="text-slate-300 text-sm mt-1">{l.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Past Requests</h2>
          {processed.map((l: any) => (
            <div key={l.id} className="rounded-2xl bg-slate-800/40 border border-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">{l.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{new Date(l.startDate).toLocaleDateString("en-IN")} to {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-slate-500 hover:text-white transition-colors">
                  {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {expanded === l.id && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Reason</p>
                    <p className="text-slate-300 text-sm mt-1">{l.reason}</p>
                  </div>
                  {l.reviewRemarks && (
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-semibold">Remarks</p>
                      <p className="text-slate-400 text-sm mt-1">{l.reviewRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {initialLeaves.length === 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <p className="text-slate-400 text-sm">No leave requests found.</p>
        </div>
      )}
    </div>
  )
}
