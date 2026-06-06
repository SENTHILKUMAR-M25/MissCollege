"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, FileSpreadsheet, Send, TrendingUp, TrendingDown, Award, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResultRecord } from "@/actions/results"

type Props = {
  results: ResultRecord[]
  stats: {
    total: number
    passed: number
    distinctions: number
    arrears: number
    passRate: number
  }
  passRateBySem: { semester: string; pass: number; fail: number }[]
  topRankers: { rank: number; name: string; reg: string; dept: string; cgpa: string }[]
  departments: { id: string; name: string }[]
}

const gradeColor: Record<string, string> = {
  O: "text-emerald-400 bg-emerald-500/10",
  "A+": "text-teal-400 bg-teal-500/10",
  A: "text-blue-400 bg-blue-500/10",
  "B+": "text-violet-400 bg-violet-500/10",
  B: "text-amber-400 bg-amber-500/10",
  C: "text-orange-400 bg-orange-500/10",
  F: "text-red-400 bg-red-500/10",
}

export default function ResultsClient({ results, stats, passRateBySem, topRankers, departments }: Props) {
  const [dept, setDept] = useState("All")
  const [sem, setSem] = useState("All")
  const [search, setSearch] = useState("")
  const sems = ["1", "2", "3", "4", "5", "6"]
  const depts = ["All", ...departments.map((d) => d.name)]

  const filtered = results.filter((r) =>
    (dept === "All" || r.department === dept) &&
    (sem === "All" || r.semester.toString() === sem) &&
    (r.registerNumber.toLowerCase().includes(search.toLowerCase()) || r.studentName.toLowerCase().includes(search.toLowerCase()))
  )

  const statCards = [
    { label: "Overall Pass %", value: `${stats.passRate}%`, trend: "+2.4%", isPositive: true },
    { label: "Total Records", value: stats.total.toLocaleString(), trend: `+${stats.total}`, isPositive: true },
    { label: "Distinctions", value: stats.distinctions.toLocaleString(), trend: "+15%", isPositive: true },
    { label: "Arrears", value: stats.arrears.toLocaleString(), trend: "-5%", isPositive: true },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Result Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">Publish and analyze semester results</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
            <FileSpreadsheet size={15} /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-emerald-500/25">
            <Send size={15} /> Publish Results
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-slate-400 text-xs mb-1 relative z-10">{s.label}</p>
            <p className="text-white text-3xl font-black relative z-10">{s.value}</p>
            <div className={cn("absolute bottom-5 right-5 text-xs font-bold flex items-center gap-1", s.isPositive ? "text-emerald-400" : "text-red-400")}>
              {s.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {s.trend}
            </div>
            <div className={cn("absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-10", s.isPositive ? "bg-emerald-500" : "bg-red-500")} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student reg no..."
            className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-500" /></button>}
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)}
          className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none">
          {depts.map((d) => <option key={d} className="bg-slate-800">{d}</option>)}
        </select>
        <select value={sem} onChange={(e) => setSem(e.target.value)}
          className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none">
          <option value="All">All Semesters</option>
          {sems.map((s) => <option key={s} value={s} className="bg-slate-800">Sem {s}</option>)}
        </select>
      </div>

      {/* Top rankers + Pass rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-white/5 p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Award size={18} className="text-amber-400" /> Top Rank Holders</h3>
          {topRankers.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No results data available.</p>
          ) : (
            <div className="space-y-3">
              {topRankers.map((s) => {
                const colors = ["from-amber-400 to-orange-500", "from-slate-300 to-slate-400", "from-amber-700 to-orange-800", "from-violet-400 to-purple-500", "from-blue-400 to-cyan-500"]
                return (
                  <div key={s.reg} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg bg-gradient-to-br shadow-lg", colors[s.rank - 1] ?? "from-slate-500 to-slate-600")}>
                      #{s.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{s.name}</p>
                      <p className="text-slate-400 text-xs">{s.reg} • {s.dept}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-black text-xl">{s.cgpa}</p>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider">CGPA</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5">
          <h3 className="text-white font-bold mb-4 text-sm">Pass Percentage by Semester</h3>
          <div className="space-y-4 mt-6">
            {passRateBySem.map((s) => (
              <div key={s.semester}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">{s.semester}</span>
                  <span className="text-emerald-400 font-bold">{s.pass}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${s.pass}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${s.fail}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full results table */}
      {filtered.length > 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-white font-semibold text-sm">Result Records ({filtered.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/50">
                  {["Reg. No", "Student", "Department", "Subject", "Sem", "Mark", "Grade"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((r, idx) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 text-amber-400 text-sm font-mono font-semibold">{r.registerNumber}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{r.studentName}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{r.department}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{r.subjectCode} - {r.subjectName}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm text-center">{r.semester}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm font-semibold">{r.mark}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", gradeColor[r.grade] ?? "text-slate-400 bg-slate-500/10")}>
                        {r.grade}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
