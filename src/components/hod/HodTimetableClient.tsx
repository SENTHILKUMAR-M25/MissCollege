"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Play, AlertTriangle, CheckCircle2, Settings, RefreshCw, Trash2, Clock, Users, Save, Plus, GripVertical } from "lucide-react"
import toast from "react-hot-toast"

type Period = { id: string; periodNumber: number; name: string; startTime: string; endTime: string; isBreak: boolean; displayOrder: number }
type SubjectHours = { id: string; code: string; name: string; credits: number; totalHoursPerWeek?: number | null; facultyId?: string | null; facultyName: string }
type TimetableEntry = { id: string; dayOfWeek: number; periodNumber?: number | null; startTime: string; endTime: string; classroom: string; subject: { id: string; name: string; code: string }; faculty: { user: { name: string } } }

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SECTIONS = ["A", "B", "C", "D"]
const CLASS_NAMES = ["I", "II", "III", "IV"]

export default function HodTimetableClient({ departmentName, departmentId }: { departmentName: string; departmentId: string }) {
  const [courses, setCourses] = useState<{ id: string; name: string; code: string }[]>([])
  const [subjects, setSubjects] = useState<SubjectHours[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [periods, setPeriods] = useState<Period[]>([])
  const [conflicts, setConflicts] = useState<{ faculty: any[]; classroom: any[] }>({ faculty: [], classroom: [] })

  const [className, setClassName] = useState("I")
  const [section, setSection] = useState("A")
  const [semester, setSemester] = useState("1")
  const [academicYear, setAcademicYear] = useState("2025-2026")
  const [courseId, setCourseId] = useState("")
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5])

  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [periodsConfigured, setPeriodsConfigured] = useState(false)
  const [editingPeriods, setEditingPeriods] = useState(false)
  const [draftPeriods, setDraftPeriods] = useState<Period[]>([])
  const [savingPeriods, setSavingPeriods] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [subjRes, ttRes, conflictRes, periodsRes, coursesRes] = await Promise.all([
        fetch(`/api/timetable?action=subject-hours&semester=${semester}`),
        fetch(`/api/timetable?className=${className}&section=${section}&semester=${semester}`),
        fetch(`/api/timetable?action=conflicts`),
        fetch(`/api/timetable?action=periods`),
        fetch(`/api/timetable?action=courses`),
      ])
      const [subjJson, ttJson, conflictJson, periodsJson, coursesJson] = await Promise.all([subjRes.json(), ttRes.json(), conflictRes.json(), periodsRes.json(), coursesRes.json()])
      if (subjJson.success) setSubjects(subjJson.data.subjects)
      if (ttJson.success) setTimetable(ttJson.data.timetable)
      if (conflictJson.success) setConflicts(conflictJson.data)
      if (periodsJson.success) {
        setPeriods(periodsJson.data)
        setPeriodsConfigured(periodsJson.data.length > 0)
        setDraftPeriods(periodsJson.data)
      }
      if (coursesJson.success) setCourses(coursesJson.data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [semester, className, section])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          departmentId,
          className,
          section,
          semester: Number(semester),
          academicYear,
          workingDays,
          courseId: courseId || undefined,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(json.message)
      await loadData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleClear() {
    if (!confirm(`Clear all timetable entries for ${className} - ${section} Sem ${semester}?`)) return
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear", departmentId, className, section, semester: Number(semester) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Timetable cleared")
      await loadData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleInitPeriods() {
    setSavingPeriods(true)
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "init-periods" }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Default periods initialized")
      await loadData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPeriods(false)
    }
  }

  async function handleSavePeriods() {
    setSavingPeriods(true)
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-periods", periods: draftPeriods }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Periods updated")
      setPeriods(draftPeriods)
      setEditingPeriods(false)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPeriods(false)
    }
  }

  const timetableGrouped = timetable.reduce<Record<number, TimetableEntry[]>>((acc, t) => { acc[t.dayOfWeek] = acc[t.dayOfWeek] || []; acc[t.dayOfWeek].push(t); return acc }, {})
  const totalPeriods = timetable.length
  const totalSubjects = new Set(timetable.map(t => t.subject.id)).size
  const activePeriods = periods.filter(p => !p.isBreak)

  const dayEntries = DAYS.map((day, i) => ({ day, dayNum: i + 1, entries: timetableGrouped[i + 1] || [] }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <CalendarDays size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Timetable Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {departmentName} • Common period timings across institution</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total Entries", value: totalPeriods, color: "text-white" }, { label: "Subjects", value: totalSubjects, color: "text-teal-400" }, { label: "Conflicts", value: conflicts.totalConflicts || 0, color: conflicts.totalConflicts > 0 ? "text-red-400" : "text-emerald-400" }, { label: "Faculty Assigned", value: new Set(timetable.map(t => t.faculty.user.name)).size, color: "text-blue-400" }].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {conflicts.totalConflicts > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={18} />
          <div>
            <p className="text-red-400 text-sm font-semibold">{conflicts.totalConflicts} scheduling conflict(s) detected</p>
            <p className="text-red-400/70 text-xs mt-1">Faculty or classroom overlaps exist. Review before publishing.</p>
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-teal-400" />
            <h3 className="text-white text-sm font-semibold">Class & Section Configuration</h3>
          </div>
          <button onClick={() => setEditingPeriods(!editingPeriods)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-white/5 text-slate-300 text-xs hover:text-white">
            <Settings size={12} /> {editingPeriods ? "Cancel" : "Manage Periods"}
          </button>
        </div>

        {editingPeriods && (
          <div className="space-y-3">
            {!periodsConfigured ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-400 text-xs flex-1">No periods configured. Initialize with default timings or create custom.</p>
                <button onClick={handleInitPeriods} disabled={savingPeriods} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold disabled:opacity-50">Use Default</button>
              </div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {draftPeriods.map((p, idx) => (
                <div key={p.id || idx} className="flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-xl px-2 py-1.5">
                  <GripVertical size={12} className="text-slate-500" />
                  <span className="text-white text-xs font-medium w-16">{p.name}</span>
                  <input type="time" value={p.startTime} onChange={e => { const next = [...draftPeriods]; next[idx] = { ...next[idx], startTime: e.target.value }; setDraftPeriods(next) }} className="bg-slate-900 border border-white/5 rounded px-1.5 py-0.5 text-white text-[10px] w-20" />
                  <input type="time" value={p.endTime} onChange={e => { const next = [...draftPeriods]; next[idx] = { ...next[idx], endTime: e.target.value }; setDraftPeriods(next) }} className="bg-slate-900 border border-white/5 rounded px-1.5 py-0.5 text-white text-[10px] w-20" />
                  <button onClick={() => setDraftPeriods(draftPeriods.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraftPeriods([...draftPeriods, { id: "", periodNumber: draftPeriods.length + 1, name: `Period ${draftPeriods.length + 1}`, startTime: "15:00", endTime: "15:50", isBreak: false, displayOrder: draftPeriods.length + 1 }])} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-white/10 text-slate-400 text-xs hover:text-white"><Plus size={12} /> Add Period</button>
              <button onClick={handleSavePeriods} disabled={savingPeriods || draftPeriods.length === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-semibold disabled:opacity-50"><Save size={12} /> {savingPeriods ? "Saving…" : "Save Periods"}</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-slate-400 text-[10px] font-medium uppercase mb-1 block">Course</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-white text-xs">
              <option value="">Select Course</option>
              {(Array.isArray(courses) ? courses : []).map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-[10px] font-medium uppercase mb-1 block">Class</label>
            <select value={className} onChange={e => setClassName(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-white text-xs">
              {CLASS_NAMES.map(c => <option key={c} value={c}>{c} Year</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-[10px] font-medium uppercase mb-1 block">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-white text-xs">
              {SECTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 text-[10px] font-medium uppercase mb-1 block">Semester</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-white text-xs">
              {Array.from({ length: 8 }, (_, i) => i + 1).map(s => <option key={s} value={s.toString()}>Sem {s}</option>)}
            </select>
          </div>
          <div className="col-span-2 md:col-span-4">
            <label className="text-slate-400 text-[10px] font-medium uppercase mb-1 block">Academic Year</label>
            <input value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-2 py-1.5 text-white text-xs" placeholder="2025-2026" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-medium uppercase">Working Days (M T W T F S)</p>
          <div className="flex gap-2">
            {DAYS.map((day, i) => {
              const dayNum = i + 1
              const active = workingDays.includes(dayNum)
              return (
                <button key={day} onClick={() => setWorkingDays(prev => active ? prev.filter(d => d !== dayNum) : [...prev, dayNum])} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${active ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-slate-900 text-slate-500 border-white/5"}`}>
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button onClick={handleGenerate} disabled={generating || !periodsConfigured} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50">
            <Play size={14} /> {generating ? "Generating…" : "Generate Timetable (AI)"}
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm hover:text-white">
            <Trash2 size={14} /> Clear
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm hover:text-white">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-teal-400" />
          <h3 className="text-white text-sm font-semibold">{className} Year • Section {section} • Sem {semester}</h3>
          <span className="text-slate-400 text-xs">({timetable.length} periods scheduled)</span>
        </div>

        {!periodsConfigured ? (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-8 text-center">
            <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
            <p className="text-amber-400 text-sm font-semibold">Period timings not configured</p>
            <p className="text-amber-400/70 text-xs mt-1">Click "Manage Periods" above to set up common institution-wide timings.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/40">
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase w-20">Day</th>
                    {periods.map(p => (
                      <th key={p.id || p.periodNumber} className={`px-3 py-2 text-left text-[10px] font-semibold uppercase ${p.isBreak ? "text-slate-500" : "text-slate-300"}`}>
                        {p.name}
                        {!p.isBreak && <div className="text-slate-500 normal-case">{p.startTime}-{p.endTime}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayEntries.map(({ day, dayNum, entries }) => (
                    <tr key={day} className="border-b border-white/5">
                      <td className="px-3 py-2 text-white text-xs font-semibold align-top">{day}</td>
                      {periods.map(p => {
                        if (p.isBreak) {
                          return <td key={p.id || `break-${p.periodNumber}`} className="px-2 py-2 align-top"><div className="rounded-lg bg-slate-900/40 border border-dashed border-white/5 p-1.5 text-center"><span className="text-slate-600 text-[10px] italic">{p.name}</span></div></td>
                        }
                        const entry = entries.find((e: any) => (e.periodNumber || getPeriodFromTime(e.startTime)) === p.periodNumber)
                        if (entry) {
                          return (
                            <td key={p.id || `slot-${p.periodNumber}`} className="px-2 py-2 align-top">
                              <div className="rounded-lg bg-teal-500/5 border border-teal-500/20 p-2 space-y-1">
                                <p className="text-white text-[11px] font-semibold leading-tight">{entry.subject.name}</p>
                                <p className="text-slate-400 text-[10px]">{entry.faculty.user.name}</p>
                                <p className="text-slate-500 text-[10px]">{entry.classroom}</p>
                              </div>
                            </td>
                          )
                        }
                        return <td key={p.id || `empty-${p.periodNumber}`} className="px-2 py-2 align-top"><div className="rounded-lg border border-dashed border-white/5 p-2 text-center"><span className="text-slate-600 text-[10px]">—</span></div></td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getPeriodFromTime(startTime: string): number {
  const [h] = startTime.split(":").map(Number)
  return h
}
