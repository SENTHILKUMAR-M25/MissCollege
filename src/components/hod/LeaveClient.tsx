"use client"

import { useState } from "react"
import { approveLeave, rejectLeave } from "@/actions/hod-actions"
import toast from "react-hot-toast"
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react"

type LeaveRequest = {
  id: string
  leaveType: string
  startDate: Date | string
  endDate: Date | string
  reason: string
  status: string
  reviewRemarks?: string | null
  createdAt: Date | string
  faculty: {
    facultyId: string
    designation: string
    phone?: string | null
    user: { name?: string | null; email: string }
  }
  department: { name: string; code: string }
}

export default function LeaveClient({ initialLeaves }: { initialLeaves: LeaveRequest[] }) {
  const [leaves, setLeaves] = useState(initialLeaves)
  const [loading, setLoading] = useState<string | null>(null)
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setLoading(id)
    const result = await approveLeave(id, remarks[id] || undefined)
    if (result.success) {
      toast.success("Leave request approved!")
      setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, status: "APPROVED", reviewRemarks: remarks[id] || null } : l))
    } else {
      toast.error(result.error || "Failed to approve")
    }
    setLoading(null)
  }

  async function handleReject(id: string) {
    if (!remarks[id]?.trim()) {
      toast.error("Rejection remarks are required")
      return
    }
    setLoading(id)
    const result = await rejectLeave(id, remarks[id])
    if (result.success) {
      toast.success("Leave request rejected")
      setLeaves((prev) => prev.map((l) => l.id === id ? { ...l, status: "REJECTED", reviewRemarks: remarks[id] } : l))
    } else {
      toast.error(result.error || "Failed to reject")
    }
    setLoading(null)
  }

  const pending = leaves.filter((l) => l.status === "PENDING")
  const processed = leaves.filter((l) => l.status !== "PENDING")

  const LeaveCard = ({ l }: { l: LeaveRequest }) => (
    <div className={`rounded-2xl border p-5 transition-all ${
      l.status === "PENDING"
        ? "bg-slate-800/60 border-amber-500/20"
        : l.status === "APPROVED"
        ? "bg-slate-800/40 border-emerald-500/10"
        : "bg-slate-800/40 border-red-500/10"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {l.faculty.user.name?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{l.faculty.user.name}</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {l.faculty.facultyId} • {l.faculty.designation} • {l.department.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
            l.status === "PENDING"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : l.status === "APPROVED"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}>
            {l.status}
          </span>
          <button
            onClick={() => setExpanded(expanded === l.id ? null : l.id)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {expanded === l.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold">Leave Type</p>
          <p className="text-white text-sm mt-0.5 font-medium">{l.leaveType}</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold">From</p>
          <p className="text-white text-sm mt-0.5">{new Date(l.startDate).toLocaleDateString("en-IN")}</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold">To</p>
          <p className="text-white text-sm mt-0.5">{new Date(l.endDate).toLocaleDateString("en-IN")}</p>
        </div>
        <div>
          <p className="text-slate-500 text-[10px] uppercase font-semibold">Applied On</p>
          <p className="text-white text-sm mt-0.5">{new Date(l.createdAt).toLocaleDateString("en-IN")}</p>
        </div>
      </div>

      {expanded === l.id && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
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

      {l.status === "PENDING" && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <textarea
            value={remarks[l.id] || ""}
            onChange={(e) => setRemarks((prev) => ({ ...prev, [l.id]: e.target.value }))}
            placeholder="Add remarks (required for rejection)..."
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(l.id)}
              disabled={loading === l.id}
              className="flex-1 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle size={14} />
              {loading === l.id ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => handleReject(l.id)}
              disabled={loading === l.id}
              className="flex-1 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle size={14} />
              {loading === l.id ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", count: pending.length, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
          { label: "Approved", count: leaves.filter((l) => l.status === "APPROVED").length, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Rejected", count: leaves.filter((l) => l.status === "REJECTED").length, color: "text-red-400 bg-red-500/10 border-red-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color} flex items-center justify-between`}>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{s.label}</span>
            <span className="text-2xl font-bold">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Pending Requests</h2>
          {pending.map((l) => <LeaveCard key={l.id} l={l} />)}
        </div>
      )}

      {/* Processed */}
      {processed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Past Requests</h2>
          {processed.map((l) => <LeaveCard key={l.id} l={l} />)}
        </div>
      )}

      {leaves.length === 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <p className="text-slate-400 text-sm">No leave requests found for your department.</p>
        </div>
      )}
    </div>
  )
}
