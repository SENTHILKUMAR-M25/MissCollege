"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Award } from "lucide-react"

type Subject = { id: string; name: string; code: string; semester: number }
type MarkRow = {
  id: string
  mark: number
  examType: string
  student: { id: string; registerNumber: string; user: { name: string }; department: { code: string } }
  subject: { id: string; name: string; code: string; semester: number }
}

const EXAM_COLORS: Record<string, string> = {
  CAT1: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CAT2: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  ASSIGNMENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  SEMINAR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PRACTICAL: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MODEL_EXAM: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  INTERNAL_TEST_1: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  INTERNAL_TEST_2: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export default function HodMarksClient({ subjects, initialMarks }: { subjects: Subject[]; initialMarks: MarkRow[] }) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [search, setSearch] = useState("")
  const [marks] = useState<MarkRow[]>(initialMarks)

  const filtered = marks
    .filter(m => !selectedSubject || m.subject.id === selectedSubject)
    .filter(m => !search || m.student.user.name.toLowerCase().includes(search.toLowerCase()) || m.student.registerNumber.toLowerCase().includes(search.toLowerCase()))

  const stats = new Map<string, { count: number; total: number; max: number }>()
  for (const m of filtered) {
    const key = `${m.subject.id}|${m.examType}`
    if (!stats.has(key)) stats.set(key, { count: 0, total: 0, max: 0 })
    const entry = stats.get(key)!
    entry.count += 1
    entry.total += m.mark
    entry.max += 100
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-slate-400 text-xs font-medium mb-1 block">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-white text-sm">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="text-slate-400 text-xs font-medium mb-1 block">Search Student</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or reg no…" className="w-full bg-slate-800 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white text-sm placeholder:text-slate-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Records", value: filtered.length, color: "text-white" },
          { label: "Subjects", value: new Set(filtered.map(m => m.subject.id)).size, color: "text-teal-400" },
          { label: "Students", value: new Set(filtered.map(m => m.student.id)).size, color: "text-emerald-400" },
          { label: "Avg Mark", value: filtered.length > 0 ? Math.round(filtered.reduce((a, b) => a + b.mark, 0) / filtered.length) : 0, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from(stats.entries()).map(([key, st]) => {
          const [subjectId, examType] = key.split("|")
          const subject = subjects.find(s => s.id === subjectId)
          const avg = st.max > 0 ? Math.round((st.total / st.max) * 100) : 0
          return (
            <div key={key} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-white text-sm font-bold">{subject?.code} - {subject?.name}</p>
                  <p className="text-slate-400 text-xs">Sem {subject?.semester} • {examType}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-xs">Avg: <span className="text-white font-semibold">{avg}%</span></span>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${EXAM_COLORS[examType] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>{examType}</span>
                </div>
              </div>
            </div>
          )
        })}

        {stats.size === 0 && (
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
            <Award size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No marks available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
