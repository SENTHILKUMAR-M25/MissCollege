"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  CalendarDays, Play, AlertTriangle, CheckCircle2, Settings, RefreshCw,
  Trash2, Clock, Users, Save, Plus, GripVertical, Printer, BarChart3,
  FileSpreadsheet, FileText, X, Edit2,
} from "lucide-react"
import toast from "react-hot-toast"

type Period = { id: string; periodNumber: number; name: string; startTime: string; endTime: string; isBreak: boolean; displayOrder: number }
type SubjectHours = { id: string; code: string; name: string; credits: number; totalHoursPerWeek?: number | null; facultyId?: string | null; facultyName: string }
type TimetableEntry = {
  id: string
  dayOfWeek: number
  periodNumber?: number | null
  startTime: string
  endTime: string
  classroom: string
  subject: { id: string; name: string; code: string; subjectType?: string }
  faculty: { user: { name: string }; id: string }
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const SECTIONS = ["A", "B", "C", "D"]
const CLASS_NAMES = ["I", "II", "III", "IV"]

const SUBJECT_COLORS: Record<string, string> = {
  THEORY: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
  LAB: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
  ELECTIVE: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
  PROJECT: "bg-orange-500/10 border-orange-400/30 text-orange-600",
  default: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
}

const BREAK_COLOR = "bg-gray-100 border-gray-300 text-gray-400"
const EMPTY_COLOR = "border-dashed border-gray-100 text-gray-400"

type EditCell = { day: number; periodNum: number } | null

export default function HodTimetableClient({ departmentName, departmentId }: { departmentName: string; departmentId: string }) {
  const [courses, setCourses] = useState<{ id: string; name: string; code: string }[]>([])
  const [subjects, setSubjects] = useState<SubjectHours[]>([])
  const [facultyList, setFacultyList] = useState<{ id: string; name: string }[]>([])
  const [rooms, setRooms] = useState<string[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [periods, setPeriods] = useState<Period[]>([])
  const [conflicts, setConflicts] = useState<{ faculty: any[]; classroom: any[]; totalConflicts: number }>({ faculty: [], classroom: [], totalConflicts: 0 })

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

  // Cell editing state
  const [editingCell, setEditingCell] = useState<EditCell>(null)
  const [editSubject, setEditSubject] = useState("")
  const [editFaculty, setEditFaculty] = useState("")
  const [editRoom, setEditRoom] = useState("")
  const [savingCell, setSavingCell] = useState(false)

  // Stats
  const [stats, setStats] = useState({ totalAssigned: 0, totalRequired: 0, remainingSubjects: 0, facultyLoad: 0, roomUtilization: 0 })

  const editCellRef = useRef<HTMLTableCellElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [subjRes, ttRes, conflictRes, periodsRes, coursesRes, facultyRes, roomsRes] = await Promise.all([
        fetch(`/api/timetable?action=subject-hours&semester=${semester}`),
        fetch(`/api/timetable?className=${className}&section=${section}&semester=${semester}&academicYear=${academicYear}`),
        fetch(`/api/timetable?action=conflicts`),
        fetch(`/api/timetable?action=periods`),
        fetch(`/api/timetable?action=courses`),
        fetch(`/api/timetable?action=faculty`),
        fetch(`/api/timetable?action=rooms&departmentId=${departmentId}`),
      ])
      const [subjJson, ttJson, conflictJson, periodsJson, coursesJson, facultyJson, roomsJson] = await Promise.all([
        subjRes.json(), ttRes.json(), conflictRes.json(), periodsRes.json(), coursesRes.json(), facultyRes.json(), roomsRes.json()
      ])
      if (subjJson.success) setSubjects(subjJson.data.subjects)
      if (ttJson.success) {
        setTimetable(ttJson.data.timetable)
        computeStats(ttJson.data.timetable, subjJson.data?.subjects)
      }
      if (conflictJson.success) {
        const data = conflictJson.data
        setConflicts({ faculty: data.facultyConflicts || [], classroom: data.classroomConflicts || [], totalConflicts: data.totalConflicts || 0 })
      }
      if (periodsJson.success) {
        setPeriods(periodsJson.data)
        setPeriodsConfigured(periodsJson.data.length > 0)
        setDraftPeriods(periodsJson.data)
      }
      if (coursesJson.success) setCourses(coursesJson.data)
      if (facultyJson.success) setFacultyList(facultyJson.data)
      if (roomsJson.success) setRooms(roomsJson.data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const computeStats = useCallback((tt: TimetableEntry[], subjList: SubjectHours[] | undefined) => {
    const totalAssigned = tt.length
    const totalRequired = (subjList || subjects).reduce((sum, s) => sum + (s.totalHoursPerWeek || Math.max(1, Math.ceil(s.credits))), 0)
    const assignedSubjectIds = new Set(tt.map(t => t.subject.id))
    const remainingSubjects = (subjList || subjects).filter(s => !assignedSubjectIds.has(s.id)).length
    const uniqueFaculty = new Set(tt.map(t => t.faculty.id)).size
    const uniqueRooms = new Set(tt.map(t => t.classroom)).size
    const roomUtilization = rooms.length > 0 ? Math.round((uniqueRooms / rooms.length) * 100) : 0
    setStats({
      totalAssigned,
      totalRequired: Math.max(totalAssigned, totalRequired),
      remainingSubjects,
      facultyLoad: uniqueFaculty,
      roomUtilization,
    })
  }, [subjects, rooms])

  useEffect(() => { loadData() }, [semester, className, section, academicYear, departmentId])

  // Click outside to close edit cell
  useEffect(() => {
    if (!editingCell) return
    const handler = (e: MouseEvent) => {
      if (editCellRef.current && !editCellRef.current.contains(e.target as Node)) {
        cancelEdit()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [editingCell])

  const startEdit = (t: TimetableEntry) => {
    setEditSubject(t.subject.id)
    setEditFaculty(t.faculty.id)
    setEditRoom(t.classroom)
    setEditingCell({ day: t.dayOfWeek, periodNum: t.periodNumber || 0 })
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditSubject("")
    setEditFaculty("")
    setEditRoom("")
  }

  const saveCell = async () => {
    if (!editingCell) return
    if (!editSubject || !editFaculty) { toast.error("Select subject and faculty"); return }
    const period = periods.find(p => p.periodNumber === editingCell.periodNum)
    if (!period) return
    setSavingCell(true)
    try {
      const existingEntry = timetable.find(
        t => t.dayOfWeek === editingCell.day && (t.periodNumber ?? 0) === editingCell.periodNum
      )
      const payload = {
        departmentId,
        className,
        section,
        semester: Number(semester),
        dayOfWeek: editingCell.day,
        startTime: period.startTime,
        endTime: period.endTime,
        classroom: editRoom || `CR-${editSubject.slice(-4).toUpperCase()}`,
        subjectId: editSubject,
        facultyId: editFaculty,
      }
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existingEntry
          ? { action: "update", id: existingEntry.id, ...payload }
          : { action: "create", ...payload }
        ),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(existingEntry ? "Entry updated" : "Entry added")
        cancelEdit()
        loadData()
      } else {
        toast.error(json.error || "Failed to save")
      }
    } finally {
      setSavingCell(false)
    }
  }

  const removeEntry = async (entryId: string) => {
    if (!confirm("Remove this entry?")) return
    const res = await fetch("/api/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: entryId }),
    })
    const json = await res.json()
    if (json.success) {
      toast.success("Entry removed")
      loadData()
    } else {
      toast.error(json.error || "Failed to remove")
    }
  }

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
  const dayEntries = DAYS.map((day, i) => ({ day, dayNum: i + 1, entries: timetableGrouped[i + 1] || [] }))

  // Export helpers
  const handleExportPDF = () => {
    const jsPDF = require("jspdf").default
    const autoTable = require("jspdf-autotable").default
    const doc = new jsPDF({ orientation: "landscape" })
    doc.setFontSize(16)
    doc.text(`Timetable - ${className} Year Section ${section} Sem ${semester} (${academicYear})`, 14, 15)
    autoTable(doc, {
      startY: 22,
      head: [["Day", ...periods.map(p => p.name)]],
      body: dayEntries.map(({ day, entries }) => [
        day,
        ...periods.map(p => {
          if (p.isBreak) return p.name
          const entry = entries.find((e) => (e.periodNumber || e.startTime) === (p.periodNumber || e.startTime))
          return entry ? `${entry.subject.name} ${entry.classroom}` : "—"
        }),
      ]),
      styles: { fontSize: 7 },
    })
    doc.save(`timetable-${className}-${section}-sem${semester}.pdf`)
    toast.success("PDF downloaded")
  }

  const handleExportExcel = () => {
    const XLSX = require("xlsx")
    const data = [
      ["Day", ...periods.map(p => p.name)],
      ...dayEntries.map(({ day, entries }) => [
        day,
        ...periods.map(p => {
          if (p.isBreak) return p.name
          const entry = entries.find((e) => (e.periodNumber || e.startTime) === (p.periodNumber || e.startTime))
          return entry ? `${entry.subject.code}-${entry.faculty.user.name}-${entry.classroom}` : "—"
        }),
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Timetable")
    XLSX.writeFile(wb, `timetable-${className}-${section}-sem${semester}.xlsx`)
    toast.success("Excel downloaded")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:block">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <CalendarDays size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Timetable Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {departmentName} • Common period timings across institution</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Assigned Hours", value: stats.totalAssigned, color: "text-black", icon: Clock },
          { label: "Required Hours", value: stats.totalRequired, color: "text-[#2F2FE4]", icon: BarChart3 },
          { label: "Remaining Subjects", value: stats.remainingSubjects, color: stats.remainingSubjects > 0 ? "text-yellow-400" : "text-emerald-400", icon: CheckCircle2 },
          { label: "Faculty Load", value: stats.facultyLoad, color: "text-[#2F2FE4]", icon: Users },
          { label: "Room Utilization", value: `${stats.roomUtilization}%`, color: stats.roomUtilization > 80 ? "text-red-400" : "text-[#2F2FE4]", icon: BarChart3 },
          { label: "Conflicts", value: conflicts.totalConflicts, color: conflicts.totalConflicts > 0 ? "text-red-400" : "text-emerald-400", icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wide">{s.label}</p>
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

      {/* Configuration Card */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-[#2F2FE4]" />
            <h3 className="text-black text-sm font-semibold">Class, Section & Period Configuration</h3>
          </div>
          <button onClick={() => setEditingPeriods(!editingPeriods)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-gray-700 text-xs hover:text-black">
            <Settings size={12} /> {editingPeriods ? "Cancel" : "Manage Periods"}
          </button>
        </div>

        {editingPeriods && (
          <div className="space-y-3">
            {!periodsConfigured && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-400 text-xs flex-1">No periods configured. Initialize with default timings or create custom.</p>
                <button onClick={handleInitPeriods} disabled={savingPeriods} className="px-3 py-1.5 rounded-lg bg-[#2F2FE4] hover:bg-[#2525c5] text-white text-xs font-semibold disabled:opacity-50">Use Default</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {draftPeriods.map((p, idx) => (
                <div key={p.id || idx} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-2 py-1.5">
                  <GripVertical size={12} className="text-gray-400" />
                  <span className="text-black text-xs font-medium w-16">{p.name}</span>
                  <label className="flex items-center gap-1 text-gray-500 text-[10px]">
                    <input type="checkbox" checked={p.isBreak} onChange={(e) => { const next = [...draftPeriods]; next[idx] = { ...next[idx], isBreak: e.target.checked }; setDraftPeriods(next) }} className="rounded accent-amber-400" />
                    Break
                  </label>
                  <input type="time" value={p.startTime} onChange={(e) => { const next = [...draftPeriods]; next[idx] = { ...next[idx], startTime: e.target.value }; setDraftPeriods(next) }} className="bg-gray-100 border border-gray-100 rounded px-1.5 py-0.5 text-black text-[10px] w-20" />
                  <input type="time" value={p.endTime} onChange={(e) => { const next = [...draftPeriods]; next[idx] = { ...next[idx], endTime: e.target.value }; setDraftPeriods(next) }} className="bg-gray-100 border border-gray-100 rounded px-1.5 py-0.5 text-black text-[10px] w-20" />
                  <button onClick={() => setDraftPeriods(draftPeriods.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDraftPeriods([...draftPeriods, { id: "", periodNumber: draftPeriods.length + 1, name: `Period ${draftPeriods.length + 1}`, startTime: "15:00", endTime: "15:50", isBreak: false, displayOrder: draftPeriods.length + 1 }])} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-gray-200 text-gray-500 text-xs hover:text-black"><Plus size={12} /> Add Period</button>
              <button onClick={handleSavePeriods} disabled={savingPeriods || draftPeriods.length === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2F2FE4] hover:bg-[#2525c5] text-white text-xs font-semibold disabled:opacity-50"><Save size={12} /> {savingPeriods ? "Saving…" : "Save Periods"}</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Course</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-2 py-1.5 text-black text-xs">
              <option value="">Select Course</option>
              {(Array.isArray(courses) ? courses : []).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Class</label>
            <select value={className} onChange={(e) => setClassName(e.target.value)} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-2 py-1.5 text-black text-xs">
              {CLASS_NAMES.map((c) => <option key={c} value={c}>{c} Year</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Section</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-2 py-1.5 text-black text-xs">
              {SECTIONS.map((s) => <option key={s} value={s}>Sec {s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-2 py-1.5 text-black text-xs">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => <option key={s} value={s.toString()}>Sem {s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-[10px] font-medium uppercase mb-1 block">Academic Year</label>
            <input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="w-full bg-gray-100 border border-gray-100 rounded-xl px-2 py-1.5 text-black text-xs" placeholder="2025-2026" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-gray-500 text-[10px] font-medium uppercase">Working Days (M T W T F S)</p>
          <div className="flex gap-2">
            {DAYS.map((day, i) => {
              const dayNum = i + 1
              const active = workingDays.includes(dayNum)
              return (
                <button key={day} onClick={() => setWorkingDays((prev) => active ? prev.filter((d) => d !== dayNum) : [...prev, dayNum])} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${active ? "bg-[#2F2FE4]/10 text-[#2F2FE4] border-[#2F2FE4]/30" : "bg-gray-100 text-gray-400 border-gray-100"}`}>
                  {day.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button onClick={handleGenerate} disabled={generating || !periodsConfigured} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F2FE4] hover:bg-[#2525c5] text-white text-sm font-semibold disabled:opacity-50">
            <Play size={14} /> {generating ? "Generating…" : "Generate Timetable (AI)"}
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-700 text-sm hover:text-black">
            <Trash2 size={14} /> Clear
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-700 text-sm hover:text-black">
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="flex-1" />
          <button onClick={handlePrint} disabled={!periodsConfigured} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-700 text-xs hover:text-black disabled:opacity-50">
            <Printer size={12} /> Print
          </button>
          <button onClick={handleExportPDF} disabled={!periodsConfigured} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-700 text-xs hover:text-black disabled:opacity-50">
            <FileText size={12} /> PDF
          </button>
          <button onClick={handleExportExcel} disabled={!periodsConfigured} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 text-gray-700 text-xs hover:text-black disabled:opacity-50">
            <FileSpreadsheet size={12} /> Excel
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#2F2FE4]" />
          <h3 className="text-black text-sm font-semibold">{className} Year • Section {section} • Sem {semester}</h3>
          <span className="text-gray-500 text-xs">({timetable.filter((t) => !periods.find((p) => p.periodNumber === t.periodNumber)?.isBreak).length} periods scheduled)</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-3 h-3 rounded bg-[#2F2FE4]/10 border border-[#2F2FE4]/30" /> Theory</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-3 h-3 rounded bg-[#2F2FE4]/10 border border-purple-400/30" /> Lab</span>
            <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-3 h-3 rounded bg-white border border-slate-600/20" /> Break</span>
          </div>
        </div>

        {!periodsConfigured ? (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-8 text-center">
            <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
            <p className="text-amber-400 text-sm font-semibold">Period timings not configured</p>
            <p className="text-amber-400/70 text-xs mt-1">Click "Manage Periods" above to set up common institution-wide timings.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase w-24 sticky left-0 bg-gray-100 z-10">Day / Period</th>
                    {periods.map((p) => (
                      <th key={p.id || `p-${p.periodNumber}`} className={`px-3 py-2.5 text-center text-[10px] font-semibold uppercase min-w-[120px] ${p.isBreak ? "text-gray-400" : "text-gray-700"}`}>
                        {p.name}
                        {!p.isBreak && <div className="text-gray-400 normal-case font-normal">{p.startTime}-{p.endTime}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayEntries.map(({ day, dayNum, entries }) => (
                    <tr key={day} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-black text-xs font-semibold align-top sticky left-0 bg-gray-100 z-10 border-r border-gray-200">{day}</td>
                      {periods.map((p) => {
                        // Break column
                        if (p.isBreak) {
                          return (
                            <td key={`break-${day}-${p.periodNumber}`} className="px-2 py-2 align-top">
                              <div className={`rounded-lg p-2 text-center text-[10px] ${BREAK_COLOR}`}>{p.name}</div>
                            </td>
                          )
                        }

                        // Find entry for this cell
                        const entry = entries.find((e) => {
                          if (e.periodNumber && e.periodNumber === p.periodNumber) return true
                          if (!e.periodNumber) return e.startTime === p.startTime
                          return false
                        })

                        if (entry) {
                          const subjectType = entry.subject.subjectType || "default"
                          const colorClass = SUBJECT_COLORS[subjectType] || SUBJECT_COLORS.default
                          const isEditing = editingCell?.day === dayNum && editingCell?.periodNum === p.periodNumber

                          if (isEditing) {
                            return (
                              <td key={`edit-${day}-${p.periodNumber}`} className="px-2 py-2 align-top" ref={editCellRef}>
                                <div className="rounded-lg border border-[#2F2FE4]/40 bg-white p-2 space-y-1.5">
                                  <select value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className={`${"w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-black text-[10px]"}`}>
                                    <option value="">Select Subject</option>
                                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                                  </select>
                                  <select value={editFaculty} onChange={(e) => setEditFaculty(e.target.value)} className={`${"w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-black text-[10px]"}`}>
                                    <option value="">Select Faculty</option>
                                    {facultyList.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                  </select>
                                  <input value={editRoom} onChange={(e) => setEditRoom(e.target.value)} placeholder="Room" className={`${"w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-black text-[10px]"}`} />
                                  <div className="flex gap-1">
                                    <button onClick={saveCell} disabled={savingCell} className="flex-1 px-2 py-1 rounded bg-[#2F2FE4] hover:bg-[#2525c5] text-white text-[10px] font-semibold disabled:opacity-50">Save</button>
                                    <button onClick={cancelEdit} className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-[10px]">Cancel</button>
                                  </div>
                                </div>
                              </td>
                            )
                          }

                          return (
                            <td key={`cell-${day}-${p.periodNumber}-${entry.id}`} className="px-2 py-2 align-top">
                              <div className={`rounded-lg border p-2 space-y-0.5 ${colorClass}`}>
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-[11px] font-semibold leading-tight truncate">{entry.subject.name}</p>
                                  <div className="flex gap-0.5 shrink-0">
                                    <button onClick={() => startEdit(entry)} className="text-black/40 hover:text-black"><Edit2 size={10} /></button>
                                    <button onClick={() => removeEntry(entry.id)} className="text-red-400/60 hover:text-red-400"><X size={10} /></button>
                                  </div>
                                </div>
                                <p className="text-[10px] truncate">{entry.faculty.user.name}</p>
                                <p className="text-[10px] truncate opacity-70">Room: {entry.classroom}</p>
                              </div>
                            </td>
                          )
                        }

                        // Empty cell
                        return (
                          <td key={`empty-${day}-${p.periodNumber}`} className="px-2 py-2 align-top">
                            {editingCell?.day === dayNum && editingCell?.periodNum === p.periodNumber ? (
                              <div className="rounded-lg border border-[#2F2FE4]/40 bg-white p-2 space-y-1.5" ref={editCellRef}>
                                <select value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className={`${"w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-black text-[10px]"}`}>
                                  <option value="">Select Subject</option>
                                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                                </select>
                                <select value={editFaculty} onChange={(e) => setEditFaculty(e.target.value)} className={`${"w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-black text-[10px]"}`}>
                                  <option value="">Select Faculty</option>
                                  {facultyList.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                <input value={editRoom} onChange={(e) => setEditRoom(e.target.value)} placeholder="Room (e.g., CR-101)" className={`${"w-full bg-white border border-gray-200 rounded px-1.5 py-1 text-black text-[10px]"}`} />
                                <div className="flex gap-1">
                                  <button onClick={saveCell} disabled={savingCell} className="flex-1 px-2 py-1 rounded bg-[#2F2FE4] hover:bg-[#2525c5] text-white text-[10px] font-semibold disabled:opacity-50">Save</button>
                                  <button onClick={cancelEdit} className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-[10px]">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingCell({ day: dayNum, periodNum: p.periodNumber! }); setEditSubject(""); setEditFaculty(""); setEditRoom("") }} className={`w-full rounded-lg border ${EMPTY_COLOR} p-2 text-center text-[10px] hover:border-[#2F2FE4]/30 hover:text-[#2F2FE4] transition min-h-[60px]`}>+ Add</button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Subject Hours Reference */}
      {subjects.length > 0 && (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <h3 className="text-black text-sm font-semibold flex items-center gap-2"><BarChart3 size={14} className="text-[#2F2FE4]" /> Subject Hour Requirements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {subjects.map((s) => {
              const required = s.totalHoursPerWeek || Math.max(1, Math.ceil(s.credits))
              const assigned = timetable.filter((t) => t.subject.id === s.id).length
              const remaining = required - assigned
              return (
                <div key={s.id} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-black text-xs font-semibold truncate">{s.name}</p>
                  <p className="text-gray-400 text-[10px]">{s.code}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Req: {required}</span>
                    <span className={remaining > 0 ? "text-yellow-400" : "text-emerald-400"}>{remaining > 0 ? `${remaining} left` : "Complete"}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-white overflow-hidden">
                    <div className={`h-full rounded-full ${remaining === 0 ? "bg-emerald-400" : "bg-[#2F2FE4]"}`} style={{ width: `${Math.min(100, (assigned / required) * 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
