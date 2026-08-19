"use client"

import { useState } from "react"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { applyFacultyLeave } from "@/actions/faculty-portal"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

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
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setLeaveType("CL")
    setStartDate("")
    setEndDate("")
    setReason("")
  }

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
      setShowModal(false)
      resetForm()
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
      default: return "bg-gray-100 text-gray-500"
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
          onClick={() => { resetForm(); setShowModal(true) }}
          className="px-3 py-1.5 rounded-lg bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10 transition-all flex items-center gap-1"
        >
          <Plus size={12} /> New Request
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Apply for Leave" size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="facultyId" value={facultyId} />
          <input type="hidden" name="departmentId" value={departmentId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Leave Type *</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50">
                <option value="CL">Casual Leave (CL)</option>
                <option value="SL">Sick Leave (SL)</option>
                <option value="ML">Medical Leave (ML)</option>
                <option value="OD">On Duty (OD)</option>
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Start Date *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">End Date *</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Reason *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave" rows={3} required className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50 transition-colors">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-black font-bold text-sm uppercase tracking-wider">Pending Requests</h2>
          {pending.map((l: any) => (
            <div key={l.id} className="rounded-2xl bg-gray-50 border border-amber-500/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-black text-sm font-semibold">{l.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{new Date(l.startDate).toLocaleDateString("en-IN")} to {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-gray-400 hover:text-black transition-colors">
                  {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {expanded === l.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Reason</p>
                  <p className="text-gray-700 text-sm mt-1">{l.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-gray-500 font-bold text-sm uppercase tracking-wider">Past Requests</h2>
          {processed.map((l: any) => (
            <div key={l.id} className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-black text-sm font-semibold">{l.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{new Date(l.startDate).toLocaleDateString("en-IN")} to {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-gray-400 hover:text-black transition-colors">
                  {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {expanded === l.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-semibold">Reason</p>
                    <p className="text-gray-700 text-sm mt-1">{l.reason}</p>
                  </div>
                  {l.reviewRemarks && (
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-semibold">Remarks</p>
                      <p className="text-gray-500 text-sm mt-1">{l.reviewRemarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {initialLeaves.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
          <p className="text-gray-500 text-sm">No leave requests found.</p>
        </div>
      )}
    </div>
  )
}
