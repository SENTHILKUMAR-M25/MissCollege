"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Search, Save, FileSpreadsheet, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { upsertMark } from "@/actions/marks"
import type { MarkRecord } from "@/actions/marks"

type Props = {
  records: MarkRecord[]
  departments: { id: string; name: string }[]
  subjects: { id: string; name: string; code: string; semester: number; departmentId: string }[]
}

export default function MarksClient({ records, departments, subjects }: Props) {
  const [search, setSearch] = useState("")
  const [dept, setDept] = useState("All")
  const [sem, setSem] = useState("All")
  const [subj, setSubj] = useState("All")
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const editRefs = useRef<Record<string, { cat1: number; cat2: number; assignment: number }>>({})

  const sems = ["1", "2", "3", "4", "5", "6"]
  const depts = ["All", ...departments.map((d) => d.name)]

  const filteredSubjects = subjects.filter((s) =>
    (dept === "All" || departments.find((d) => d.id === s.departmentId)?.name === dept) &&
    (sem === "All" || s.semester.toString() === sem)
  )

  const filtered = records.filter((m) =>
    (dept === "All" || m.department === dept) &&
    (sem === "All" || m.semester.toString() === sem) &&
    (subj === "All" || m.subjectCode === subj) &&
    (m.studentName.toLowerCase().includes(search.toLowerCase()) || m.registerNumber.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleSave(record: MarkRecord) {
    setSaving(true)
    const vals = editRefs.current[record.id] ?? { cat1: record.cat1, cat2: record.cat2, assignment: record.assignment }
    await upsertMark({
      studentId: record.studentId,
      subjectId: record.subjectId,
      cat1: vals.cat1,
      cat2: vals.cat2,
      assignment: vals.assignment,
    })
    setSaving(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Internal Marks Entry</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage continuous internal assessments</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
            <FileSpreadsheet size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-4 bg-slate-800/50 border border-white/5 rounded-2xl">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs text-slate-400 font-medium">Department</label>
          <select value={dept} onChange={(e) => { setDept(e.target.value); setSubj("All") }}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none">
            {depts.map((d) => <option key={d} className="bg-slate-800">{d}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 w-32">
          <label className="text-xs text-slate-400 font-medium">Semester</label>
          <select value={sem} onChange={(e) => { setSem(e.target.value); setSubj("All") }}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none">
            <option value="All">All</option>
            {sems.map((s) => <option key={s} value={s} className="bg-slate-800">Sem {s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-xs text-slate-400 font-medium">Subject</label>
          <select value={subj} onChange={(e) => setSubj(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none">
            <option value="All">All Subjects</option>
            {filteredSubjects.map((s) => <option key={s.code} value={s.code} className="bg-slate-800">{s.code} - {s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[250px]">
          <label className="text-xs text-slate-400 font-medium">Search Student</label>
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 w-full">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Reg No or Name..."
              className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
            {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-500" /></button>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">CAT 1 (30)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">CAT 2 (30)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide w-28">Assign (10)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Total (70)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500 text-sm">No mark records found for the selected filters.</td></tr>
              ) : filtered.map((m, idx) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                  className={cn("border-b border-white/5 transition-colors", editing === m.id ? "bg-amber-500/5" : "hover:bg-white/5")}>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{m.studentName}</p>
                    <p className="text-amber-400 text-xs font-mono">{m.registerNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-300 text-sm">{m.subjectCode}</p>
                    <p className="text-slate-500 text-xs">{m.subjectName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number"
                      defaultValue={m.cat1} disabled={editing !== m.id} max={30} min={0}
                      onChange={(e) => {
                        if (!editRefs.current[m.id]) editRefs.current[m.id] = { cat1: m.cat1, cat2: m.cat2, assignment: m.assignment }
                        editRefs.current[m.id].cat1 = Number(e.target.value)
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white text-sm font-semibold disabled:bg-transparent disabled:border-transparent focus:border-amber-500 focus:outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number"
                      defaultValue={m.cat2} disabled={editing !== m.id} max={30} min={0}
                      onChange={(e) => {
                        if (!editRefs.current[m.id]) editRefs.current[m.id] = { cat1: m.cat1, cat2: m.cat2, assignment: m.assignment }
                        editRefs.current[m.id].cat2 = Number(e.target.value)
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white text-sm font-semibold disabled:bg-transparent disabled:border-transparent focus:border-amber-500 focus:outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="number"
                      defaultValue={m.assignment} disabled={editing !== m.id} max={10} min={0}
                      onChange={(e) => {
                        if (!editRefs.current[m.id]) editRefs.current[m.id] = { cat1: m.cat1, cat2: m.cat2, assignment: m.assignment }
                        editRefs.current[m.id].assignment = Number(e.target.value)
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white text-sm font-semibold disabled:bg-transparent disabled:border-transparent focus:border-amber-500 focus:outline-none" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("px-2.5 py-1 rounded-lg text-sm font-bold",
                      m.total >= 35 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                      {m.total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === m.id ? (
                      <button onClick={() => handleSave(m)} disabled={saving}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-colors disabled:opacity-50">
                        {saving ? "Saving…" : "Save"}
                      </button>
                    ) : (
                      <button onClick={() => setEditing(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10 transition-colors">
                        Edit
                      </button>
                    )}
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
