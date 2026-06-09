"use client"

import { useState } from "react"
import { Bell, Plus, ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"

type Leave = {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: string
  reviewRemarks: string | null
  createdAt: string
}

export default function StudentLeaveClient({ leaves, facultyId, departmentId }: { leaves: Leave[], facultyId: string, departmentId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [leaveType, setLeaveType] = useState("CL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("facultyId", facultyId)
      fd.append("departmentId", departmentId)
      fd.append("leaveType", leaveType)
      fd.append("startDate", startDate)
      fd.append("endDate", endDate)
      fd.append("reason", reason)
      const res = await fetch("/api/student/leave", { method: "POST", body: fd })
      const data = await res.json()
      if (data.success) {
        toast.success("Leave application submitted")
        setShowForm(false)
        setReason("")
        setStartDate("")
        setEndDate("")
        window.location.reload()
      } else {
        toast.error(data.error || "Failed")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setLoading(false)
  }

  const statusColor = (s: string) => ({
    PENDING: "bg-amber-500/10 text-amber-400",
    APPROVED: "bg-emerald-500/10 text-emerald-400",
    REJECTED: "bg-red-500/10 text-red-400",
  }[s] || "bg-slate-500/10 text-slate-400")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["PENDING", "APPROVED", "REJECTED"].map((s) => (
            <span key={s} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusColor(s)}`}>
              {s}: {leaves.filter(l => l.status === s).length}
            </span>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold hover:bg-teal-500/20">
          <Plus size={12} /> Apply Leave
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-4">
          <h3 className="text-white font-bold">Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Leave Type</label>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                <option value="CL">Casual Leave (CL)</option>
                <option value="SL">Sick Leave (SL)</option>
                <option value="ML">Medical Leave (ML)</option>
                <option value="OD">On Duty (OD)</option>
              </select>
            </div>
            <div />
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-xs mb-1 block">Reason *</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} required placeholder="State your reason..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none resize-none" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded-xl bg-teal-500/20 border border-teal-500/20 text-teal-400 text-sm font-semibold disabled:opacity-50">
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {leaves.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <Bell size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No leave requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{l.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{new Date(l.startDate).toLocaleDateString("en-IN")} to {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-slate-500 hover:text-white">
                  {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {expanded === l.id && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                  <p className="text-slate-400 text-xs"><span className="font-semibold text-slate-300">Reason:</span> {l.reason}</p>
                  {l.reviewRemarks && <p className="text-slate-400 text-xs"><span className="font-semibold text-slate-300">Remarks:</span> {l.reviewRemarks}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
