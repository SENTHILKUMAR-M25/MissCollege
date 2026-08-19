"use client"

import { useState, useTransition } from "react"
import { updateEnquiryStatus, deleteEnquiry } from "@/actions/admissions"
import toast from "react-hot-toast"
import { Search, Eye, Trash2, X, Clock, CheckCircle, MessageSquare, RefreshCw, ChevronDown } from "lucide-react"

type AuditLog = { id: string; action: string; fromStatus: string | null; toStatus: string | null; remarks: string | null; doneByName: string | null; createdAt: Date | string }
type Enquiry = {
  id: string; name: string; email: string; phone: string; course: string; message: string
  status: string; remarks: string | null; assignedTo: string | null
  createdAt: Date | string; respondedAt: Date | string | null; closedAt: Date | string | null
  auditLogs: AuditLog[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  REVIEWED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESPONDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-slate-500/10 text-gray-500 border-slate-500/20",
}

const STATUS_OPTIONS = ["PENDING", "REVIEWED", "RESPONDED", "CLOSED"]

export default function EnquiriesClient({
  enquiries: initial, total, stats
}: {
  enquiries: Enquiry[]
  total: number
  stats: { totalEnquiries: number; pendingEnquiries: number; reviewedEnquiries: number; closedEnquiries: number }
}) {
  const [enquiries, setEnquiries] = useState(initial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [remarks, setRemarks] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  const filtered = enquiries.filter(e => {
    const matchStatus = statusFilter === "ALL" || e.status === statusFilter
    const matchSearch = !search || [e.name, e.email, e.phone, e.course].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  function openDetail(e: Enquiry) {
    setSelected(e); setRemarks(e.remarks || ""); setNewStatus(e.status)
  }

  async function handleUpdateStatus() {
    if (!selected) return
    setLoading(true)
    const res = await updateEnquiryStatus(selected.id, newStatus, remarks)
    if (res.success) {
      toast.success("Enquiry updated")
      setEnquiries(prev => prev.map(e => e.id === selected.id ? { ...e, status: newStatus, remarks } : e))
      setSelected(prev => prev ? { ...prev, status: newStatus, remarks } : null)
    } else {
      toast.error(res.error || "Failed")
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this enquiry?")) return
    const res = await deleteEnquiry(id)
    if (res.success) {
      toast.success("Deleted")
      setEnquiries(prev => prev.filter(e => e.id !== id))
      if (selected?.id === id) setSelected(null)
    } else {
      toast.error(res.error || "Failed")
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Enquiries", value: stats.totalEnquiries, color: "text-black" },
          { label: "Pending", value: stats.pendingEnquiries, color: "text-amber-400" },
          { label: "Reviewed", value: stats.reviewedEnquiries, color: "text-blue-400" },
          { label: "Closed", value: stats.closedEnquiries, color: "text-gray-500" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-200 border border-gray-100 p-4">
            <p className="text-gray-500 text-xs uppercase font-medium">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex-1 min-w-52">
          <Search size={14} className="text-gray-500 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, course..."
            className="bg-transparent text-black text-sm placeholder:text-gray-400 outline-none flex-1" />
        </div>
        <div className="flex gap-2">
          {["ALL", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${statusFilter === s ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-white border border-gray-200 border-gray-100 text-gray-500 hover:text-black"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Name", "Course", "Phone", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No enquiries found.</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-black text-sm font-medium">{e.name}</p>
                    <p className="text-gray-500 text-xs">{e.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm max-w-[150px] truncate">{e.course}</td>
                  <td className="px-4 py-3 text-gray-700 text-sm">{e.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${STATUS_COLORS[e.status] || STATUS_COLORS.PENDING}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(e)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-all"><Eye size={13} /></button>
                      <button onClick={() => handleDelete(e.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400"><MessageSquare size={16} /></div>
                <div>
                  <h2 className="text-black font-bold">Enquiry Details</h2>
                  <p className="text-gray-500 text-xs">{selected.name} · {new Date(selected.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={14} /></button>
            </div>
            <div className="overflow-y-auto p-6 flex-1 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Name", selected.name], ["Email", selected.email],
                  ["Phone", selected.phone], ["Course", selected.course],
                ].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-[10px] uppercase font-semibold">{l}</p>
                    <p className="text-black text-sm mt-0.5">{v}</p>
                  </div>
                ))}
                <div className="col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-[10px] uppercase font-semibold">Message</p>
                  <p className="text-black text-sm mt-0.5 whitespace-pre-wrap">{selected.message || "—"}</p>
                </div>
              </div>

              {/* Update status */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-black text-sm font-semibold">Update Status</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">New Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Remarks / Response</label>
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                    placeholder="Add remarks or response for this enquiry..."
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm resize-none placeholder:text-gray-400" />
                </div>
                <button onClick={handleUpdateStatus} disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600 disabled:opacity-50">
                  <RefreshCw size={14} /> {loading ? "Updating..." : "Update Enquiry"}
                </button>
              </div>

              {/* Audit Trail */}
              {selected.auditLogs?.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <p className="text-black text-sm font-semibold flex items-center gap-2"><Clock size={14} className="text-amber-400" /> Audit Trail</p>
                  <div className="space-y-2">
                    {selected.auditLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-black text-xs font-medium">{log.action.replace(/_/g, " ")}</p>
                          {log.remarks && <p className="text-gray-500 text-[11px] mt-0.5">{log.remarks}</p>}
                          <p className="text-gray-400 text-[10px] mt-1">{log.doneByName || "System"} · {new Date(log.createdAt).toLocaleString("en-IN")}</p>
                        </div>
                        {log.toStatus && <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[log.toStatus] || STATUS_COLORS.PENDING}`}>{log.toStatus}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
