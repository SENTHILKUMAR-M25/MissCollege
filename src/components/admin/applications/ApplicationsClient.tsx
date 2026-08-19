"use client"

import { useState } from "react"
import { updateApplicationStatus, deleteApplication } from "@/actions/admissions"
import toast from "react-hot-toast"
import { Search, Eye, Trash2, X, Clock, CheckCircle, XCircle, AlertCircle, FileText, RefreshCw } from "lucide-react"

type AuditLog = { id: string; action: string; fromStatus: string | null; toStatus: string | null; remarks: string | null; doneByName: string | null; createdAt: Date | string }
type Application = {
  id: string; applicationNo: string; name: string; email: string; phone: string
  dob: string | null; gender: string | null; address: string | null
  courseApplied: string; qualification: string | null
  previousSchool: string | null; previousBoard: string | null; previousPercent: string | null
  parentName: string | null; parentPhone: string | null; parentOccupation: string | null
  status: string; remarks: string | null; correctionNote: string | null
  createdAt: Date | string; reviewedAt: Date | string | null; decidedAt: Date | string | null
  auditLogs: AuditLog[]
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  UNDER_REVIEW: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  SHORTLISTED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  CORRECTION_NEEDED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
}
const STATUS_OPTIONS = ["SUBMITTED","UNDER_REVIEW","SHORTLISTED","APPROVED","REJECTED","CORRECTION_NEEDED"]

export default function ApplicationsClient({
  applications: initial, stats
}: {
  applications: Application[]
  stats: {
    totalApplications: number; submittedApps: number; underReviewApps: number
    shortlistedApps: number; approvedApps: number; rejectedApps: number
    correctionApps: number; pendingApplications: number
  }
}) {
  const [applications, setApplications] = useState(initial)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selected, setSelected] = useState<Application | null>(null)
  const [remarks, setRemarks] = useState("")
  const [correctionNote, setCorrectionNote] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = applications.filter(a => {
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter
    const matchSearch = !search || [a.name, a.email, a.phone, a.applicationNo, a.courseApplied].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  function openDetail(a: Application) {
    setSelected(a); setRemarks(a.remarks || ""); setCorrectionNote(a.correctionNote || ""); setNewStatus(a.status)
  }

  async function handleUpdate() {
    if (!selected) return
    setLoading(true)
    const res = await updateApplicationStatus(selected.id, newStatus, remarks, correctionNote)
    if (res.success) {
      toast.success("Application updated")
      setApplications(prev => prev.map(a => a.id === selected.id ? { ...a, status: newStatus, remarks, correctionNote } : a))
      setSelected(prev => prev ? { ...prev, status: newStatus, remarks, correctionNote } : null)
    } else {
      toast.error(res.error || "Failed")
    }
    setLoading(false)
  }

  async function quickAction(id: string, status: string) {
    setLoading(true)
    const res = await updateApplicationStatus(id, status, `Quick action: ${status}`)
    if (res.success) {
      toast.success(`Marked as ${status}`)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    } else {
      toast.error(res.error || "Failed")
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this application?")) return
    const res = await deleteApplication(id)
    if (res.success) {
      toast.success("Deleted")
      setApplications(prev => prev.filter(a => a.id !== id))
      if (selected?.id === id) setSelected(null)
    } else {
      toast.error(res.error || "Failed")
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {[
          { label: "Total", value: stats.totalApplications, color: "text-black" },
          { label: "Submitted", value: stats.submittedApps, color: "text-blue-400" },
          { label: "Under Review", value: stats.underReviewApps, color: "text-violet-400" },
          { label: "Shortlisted", value: stats.shortlistedApps, color: "text-cyan-400" },
          { label: "Approved", value: stats.approvedApps, color: "text-emerald-400" },
          { label: "Rejected", value: stats.rejectedApps, color: "text-red-400" },
          { label: "Corrections", value: stats.correctionApps, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-200 border border-gray-100 p-3">
            <p className="text-gray-400 text-[10px] uppercase font-medium">{s.label}</p>
            <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex-1 min-w-52">
          <Search size={14} className="text-gray-500 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, app no, course..."
            className="bg-transparent text-black text-sm placeholder:text-gray-400 outline-none flex-1" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["ALL", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${statusFilter === s ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-white border border-gray-200 border-gray-100 text-gray-500 hover:text-black"}`}>
              {s.replace("_", " ")}
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
                {["App No", "Applicant", "Course", "Qualification", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No applications found.</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-amber-400 font-mono text-xs font-bold">{a.applicationNo}</td>
                  <td className="px-4 py-3">
                    <p className="text-black text-sm font-medium">{a.name}</p>
                    <p className="text-gray-500 text-xs">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs max-w-[130px] truncate">{a.courseApplied}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.qualification || "—"}<br/>{a.previousPercent ? <span className="text-gray-700">{a.previousPercent}</span> : null}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${STATUS_COLORS[a.status] || STATUS_COLORS.SUBMITTED}`}>
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openDetail(a)} title="View" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-all"><Eye size={13} /></button>
                      {a.status === "SUBMITTED" && <button onClick={() => quickAction(a.id, "UNDER_REVIEW")} title="Mark Under Review" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-all"><RefreshCw size={13} /></button>}
                      {["UNDER_REVIEW","SHORTLISTED"].includes(a.status) && (
                        <>
                          <button onClick={() => quickAction(a.id, "APPROVED")} title="Approve" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"><CheckCircle size={13} /></button>
                          <button onClick={() => quickAction(a.id, "REJECTED")} title="Reject" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><XCircle size={13} /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(a.id)} title="Delete" className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
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
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400"><FileText size={16} /></div>
                <div>
                  <h2 className="text-black font-bold">Application — {selected.applicationNo}</h2>
                  <p className="text-gray-500 text-xs">{selected.name} · {new Date(selected.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={14} /></button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 space-y-5">
              {/* Personal */}
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Personal</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Name",selected.name],["Email",selected.email],["Phone",selected.phone],["DOB",selected.dob||"—"],["Gender",selected.gender||"—"],["Course Applied",selected.courseApplied]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-[10px] uppercase">{l}</p>
                      <p className="text-black text-xs mt-0.5 truncate">{v}</p>
                    </div>
                  ))}
                  {selected.address && <div className="col-span-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100"><p className="text-gray-400 text-[10px] uppercase">Address</p><p className="text-black text-xs mt-0.5">{selected.address}</p></div>}
                </div>
              </div>

              {/* Academic */}
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Academic</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Qualification",selected.qualification||"—"],["School/College",selected.previousSchool||"—"],["Board",selected.previousBoard||"—"],["Percentage",selected.previousPercent||"—"]].map(([l,v])=>(
                    <div key={l} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-[10px] uppercase">{l}</p>
                      <p className="text-black text-xs mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent */}
              {(selected.parentName || selected.parentPhone) && (
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-2">Parent</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[["Name",selected.parentName||"—"],["Phone",selected.parentPhone||"—"],["Occupation",selected.parentOccupation||"—"]].map(([l,v])=>(
                      <div key={l} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <p className="text-gray-400 text-[10px] uppercase">{l}</p>
                        <p className="text-black text-xs mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-black text-sm font-semibold">Update Status</p>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={2} placeholder="Remarks..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm resize-none placeholder:text-gray-400" />
                {newStatus === "CORRECTION_NEEDED" && (
                  <textarea value={correctionNote} onChange={e => setCorrectionNote(e.target.value)} rows={2} placeholder="Specify what corrections are needed..."
                    className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-200 text-sm resize-none placeholder:text-amber-500/50" />
                )}
                <div className="flex gap-3">
                  <button onClick={handleUpdate} disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-black text-sm font-semibold disabled:opacity-50 transition ${newStatus === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : newStatus === "REJECTED" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {newStatus === "APPROVED" ? <CheckCircle size={14} /> : newStatus === "REJECTED" ? <XCircle size={14} /> : <RefreshCw size={14} />}
                    {loading ? "Updating..." : `Set ${newStatus.replace("_"," ")}`}
                  </button>
                </div>
              </div>

              {/* Audit Trail */}
              {selected.auditLogs?.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <p className="text-black text-sm font-semibold flex items-center gap-2"><Clock size={14} className="text-blue-400" /> Audit Trail</p>
                  {selected.auditLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-black text-xs font-medium">{log.action.replace(/_/g," ")}</p>
                        {log.remarks && <p className="text-gray-500 text-[11px] mt-0.5">{log.remarks}</p>}
                        <p className="text-gray-400 text-[10px] mt-1">{log.doneByName||"System"} · {new Date(log.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      {log.toStatus && <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[log.toStatus]||STATUS_COLORS.SUBMITTED}`}>{log.toStatus.replace("_"," ")}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
