"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AttendanceSummary } from "@/actions/attendance"

type Props = {
  records: AttendanceSummary[]
  departments: { id: string; name: string }[]
}

const statusColor: Record<string, string> = {
  Safe: "bg-emerald-500/15 text-emerald-400",
  Warning: "bg-amber-500/15 text-amber-400",
  Defaulter: "bg-red-500/15 text-red-400",
}

export default function AttendanceClient({ records, departments }: Props) {
  const [search, setSearch] = useState("")
  const [dept, setDept] = useState("All")
  const [filter, setFilter] = useState<"All" | "Safe" | "Warning" | "Defaulter">("All")

  const depts = ["All", ...departments.map((d) => d.name)]

  const stats = [
    { label: "Safe", display: "Safe (≥85%)", count: records.filter((a) => a.status === "Safe").length, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
    { label: "Warning", display: "Warning (75-84%)", count: records.filter((a) => a.status === "Warning").length, color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
    { label: "Defaulter", display: "Defaulters (<75%)", count: records.filter((a) => a.status === "Defaulter").length, color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle },
  ]

  const filtered = records.filter((a) =>
    (dept === "All" || a.department === dept) &&
    (filter === "All" || a.status === filter) &&
    (a.studentName.toLowerCase().includes(search.toLowerCase()) || a.registerNumber.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Attendance Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">Track and manage student attendance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }}
            className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center gap-3 cursor-pointer"
            onClick={() => setFilter(s.label as any)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className={cn("text-2xl font-black", s.color)}>{s.count}</p>
              <p className="text-slate-400 text-xs">{s.display}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student…"
            className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-500" /></button>}
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)}
          className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none">
          {depts.map((d) => <option key={d} className="bg-slate-800">{d}</option>)}
        </select>
        <div className="flex rounded-xl overflow-hidden border border-white/5">
          {["All", "Safe", "Warning", "Defaulter"].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={cn("px-3 py-2 text-sm font-medium transition-colors", filter === f ? "bg-amber-500 text-white" : "bg-slate-800/60 text-slate-400 hover:bg-white/5")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Reg. Number", "Student Name", "Department", "Subject", "Sem", "Present", "Total", "Percentage", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500 text-sm">No attendance records found.</td></tr>
              ) : filtered.map((a, idx) => (
                <motion.tr key={`${a.studentId}|${a.subjectId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-amber-400 text-sm font-mono font-semibold">{a.registerNumber}</td>
                  <td className="px-4 py-3 text-white text-sm font-medium whitespace-nowrap">{a.studentName}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">{a.department}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm whitespace-nowrap">{a.subject}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm text-center">{a.semester}</td>
                  <td className="px-4 py-3 text-emerald-400 text-sm font-semibold">{a.present}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{a.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full min-w-16">
                        <div className={cn("h-full rounded-full", a.percentage >= 85 ? "bg-emerald-500" : a.percentage >= 75 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${a.percentage}%` }} />
                      </div>
                      <span className="text-xs text-slate-300 font-semibold">{a.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold", statusColor[a.status])}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />{a.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
