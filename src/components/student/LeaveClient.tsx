"use client"

import { useState } from "react"
import { Bell, Plus, ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

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
        setShowModal(false)
        resetForm()
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
  }[s] || "bg-gray-100 text-gray-500")

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
        <button onClick={() => { resetForm(); setShowModal(true) }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10">
          <Plus size={12} /> Apply Leave
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Apply for Leave" size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Leave Type</label>
            <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none">
              <option value="CL">Casual Leave (CL)</option>
              <option value="SL">Sick Leave (SL)</option>
              <option value="ML">Medical Leave (ML)</option>
              <option value="OD">On Duty (OD)</option>
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Reason *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} required placeholder="State your reason..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none resize-none" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 md:flex-none py-2 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-sm font-semibold disabled:opacity-50 transition-colors">
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>

      {leaves.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
          <Bell size={32} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No leave requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="rounded-2xl bg-white border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-black font-semibold text-sm">{l.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor(l.status)}`}>{l.status}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{new Date(l.startDate).toLocaleDateString("en-IN")} to {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                </div>
                <button onClick={() => setExpanded(expanded === l.id ? null : l.id)} className="text-gray-400 hover:text-black">
                  {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
              {expanded === l.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-gray-500 text-xs"><span className="font-semibold text-gray-700">Reason:</span> {l.reason}</p>
                  {l.reviewRemarks && <p className="text-gray-500 text-xs"><span className="font-semibold text-gray-700">Remarks:</span> {l.reviewRemarks}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
