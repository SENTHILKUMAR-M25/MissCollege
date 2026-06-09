"use client"

import { useState, useMemo, useEffect } from "react"
import { CheckSquare, Save, Users, BookOpen, Calendar, TrendingUp, Edit2, Check, X } from "lucide-react"
import toast from "react-hot-toast"

type Student = {
  id: string
  registerNumber: string
  semester: number
  section: string
  user: { name: string | null }
}

type Subject = {
  id: string
  name: string
  code: string
  semester: number
  departmentId: string
}

type AttendanceRecord = {
  id: string
  date: string | Date
  status: "PRESENT" | "ABSENT"
  student: { id: string; registerNumber: string; user: { name: string | null } }
  subject: { name: string; code: string }
}

const sel = "bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50"

export default function AttendanceClient({
  facultyId,
  subjects,
  students,
  initialRecords,
}: {
  facultyId: string
  subjects: Subject[]
  students: Student[]
  initialRecords: AttendanceRecord[]
}) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || "")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>({})
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords)
  const [semFilter, setSemFilter] = useState("All")
  const [secFilter, setSecFilter] = useState("All")
  const [editingRecord, setEditingRecord] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<"PRESENT" | "ABSENT">("PRESENT")

  const currentSubject = subjects.find(s => s.id === selectedSubject)

  // Filter students by subject semester + optional section
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const semMatch = currentSubject ? s.semester === currentSubject.semester : true
      const semFilterMatch = semFilter === "All" || s.semester.toString() === semFilter
      const secFilterMatch = secFilter === "All" || s.section === secFilter
      return semMatch && semFilterMatch && secFilterMatch
    })
  }, [students, currentSubject, semFilter, secFilter])

  // Load existing attendance for selected subject+date
  useEffect(() => {
    if (!selectedSubject || !selectedDate) return
    const existing = records.filter(r =>
      r.subject.code === currentSubject?.code &&
      new Date(r.date).toISOString().split("T")[0] === selectedDate
    )
    if (existing.length > 0) {
      const map: Record<string, "PRESENT" | "ABSENT"> = {}
      existing.forEach(r => { map[r.student.id] = r.status })
      setAttendance(map)
    } else {
      setAttendance({})
    }
  }, [selectedSubject, selectedDate])

  const semesters = [...new Set(students.map(s => s.semester))].sort()
  const sections = [...new Set(students.map(s => s.section))].sort()

  const presentCount = Object.values(attendance).filter(v => v === "PRESENT").length
  const absentCount = Object.values(attendance).filter(v => v === "ABSENT").length
  const unmarked = filteredStudents.length - Object.keys(attendance).filter(id =>
    filteredStudents.some(s => s.id === id)
  ).length

  function markAll(status: "PRESENT" | "ABSENT") {
    const map: Record<string, "PRESENT" | "ABSENT"> = {}
    filteredStudents.forEach(s => { map[s.id] = status })
    setAttendance(prev => ({ ...prev, ...map }))
    toast.success(`All ${filteredStudents.length} students marked as ${status}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSubject) return toast.error("Select a subject")
    if (!selectedDate) return toast.error("Select a date")
    if (filteredStudents.length === 0) return toast.error("No students found for this subject")

    const records_payload = filteredStudents.map(s => ({
      studentId: s.id,
      status: attendance[s.id] || "ABSENT",
    }))

    setLoading(true)
    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId,
          subjectId: selectedSubject,
          date: selectedDate,
          records: records_payload,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Attendance saved for ${filteredStudents.length} students`)
        // Refresh records in state
        const refreshed = await fetch(`/api/attendance/mark?facultyId=${facultyId}`)
        if (refreshed.ok) {
          const rdata = await refreshed.json()
          if (rdata.records) setRecords(rdata.records)
        }
      } else {
        toast.error(data.error || "Failed to save attendance")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleEditRecord(recordId: string, newStatus: "PRESENT" | "ABSENT") {
    try {
      const res = await fetch("/api/attendance/mark", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus } : r))
        toast.success("Attendance updated")
        setEditingRecord(null)
      } else {
        toast.error(data.error || "Failed to update")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  // Attendance summary per subject
  const subjectSummary = useMemo(() => {
    const map: Record<string, { present: number; total: number; name: string; code: string }> = {}
    records.forEach(r => {
      const key = r.subject.code
      if (!map[key]) map[key] = { present: 0, total: 0, name: r.subject.name, code: r.subject.code }
      map[key].total++
      if (r.status === "PRESENT") map[key].present++
    })
    return Object.values(map)
  }, [records])

  const recentRecords = useMemo(() =>
    [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30),
    [records]
  )

  return (
    <div className="space-y-6">

      {/* Summary cards */}
      {subjectSummary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <p className="text-slate-400 text-xs uppercase font-medium">Total Records</p>
            <p className="text-white text-2xl font-bold mt-1">{records.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <p className="text-slate-400 text-xs uppercase font-medium">Present</p>
            <p className="text-emerald-400 text-2xl font-bold mt-1">{records.filter(r => r.status === "PRESENT").length}</p>
          </div>
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <p className="text-slate-400 text-xs uppercase font-medium">Absent</p>
            <p className="text-red-400 text-2xl font-bold mt-1">{records.filter(r => r.status === "ABSENT").length}</p>
          </div>
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <p className="text-slate-400 text-xs uppercase font-medium">Subjects</p>
            <p className="text-teal-400 text-2xl font-bold mt-1">{subjectSummary.length}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Mark Attendance Form */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400"><BookOpen size={16} /></div>
            <div>
              <h3 className="text-white font-bold">Mark Attendance</h3>
              <p className="text-slate-500 text-xs">Select subject, date and mark students</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Subject *</label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={sel + " w-full"}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Date *</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={sel + " w-full"} />
              </div>
            </div>

            {/* Semester + Section filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Semester</label>
                <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className={sel + " w-full"}>
                  <option value="All">All Semesters</option>
                  {semesters.map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block font-medium">Section</label>
                <select value={secFilter} onChange={e => setSecFilter(e.target.value)} className={sel + " w-full"}>
                  <option value="All">All Sections</option>
                  {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
            </div>

            {/* Stats + bulk actions */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex gap-4 text-xs">
                <span className="text-slate-400">{filteredStudents.length} students</span>
                <span className="text-emerald-400 font-semibold">P: {presentCount}</span>
                <span className="text-red-400 font-semibold">A: {absentCount}</span>
                {unmarked > 0 && <span className="text-amber-400 font-semibold">Unmarked: {unmarked}</span>}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => markAll("PRESENT")}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all">
                  All Present
                </button>
                <button type="button" onClick={() => markAll("ABSENT")}
                  className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all">
                  All Absent
                </button>
              </div>
            </div>

            {/* Student list */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No students found. Check subject semester or filters.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredStudents.map((s, i) => (
                  <div key={s.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      attendance[s.id] === "PRESENT" ? "bg-emerald-500/5 border-emerald-500/20" :
                      attendance[s.id] === "ABSENT" ? "bg-red-500/5 border-red-500/20" :
                      "bg-white/5 border-white/5"
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 text-xs w-5 text-right">{i + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{s.user.name}</p>
                        <p className="text-slate-500 text-xs">{s.registerNumber} · S{s.semester}/{s.section}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button"
                        onClick={() => setAttendance(prev => ({ ...prev, [s.id]: "PRESENT" }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          attendance[s.id] === "PRESENT"
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}>P</button>
                      <button type="button"
                        onClick={() => setAttendance(prev => ({ ...prev, [s.id]: "ABSENT" }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          attendance[s.id] === "ABSENT"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        }`}>A</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading || filteredStudents.length === 0}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20">
              <Save size={15} /> {loading ? "Saving…" : "Save Attendance"}
            </button>
          </form>
        </div>

        {/* Right panel: subject summary + recent records */}
        <div className="space-y-5">

          {/* Subject-wise summary */}
          {subjectSummary.length > 0 && (
            <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-teal-400" />
                <h3 className="text-white font-bold text-sm">Subject-wise Summary</h3>
              </div>
              <div className="space-y-2">
                {subjectSummary.map(s => {
                  const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
                  return (
                    <div key={s.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{s.code} — {s.name}</span>
                        <span className={`font-bold ${pct >= 75 ? "text-emerald-400" : "text-red-400"}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-slate-600 text-[10px]">{s.present}/{s.total} classes</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent records with edit */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-teal-400" />
              <h3 className="text-white font-bold text-sm">Recent Records</h3>
              <span className="ml-auto text-slate-500 text-xs">{records.length} total</span>
            </div>

            {recentRecords.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Date", "Student", "Subject", "Status", ""].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-2 py-2 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </td>
                        <td className="px-2 py-2">
                          <p className="text-white text-xs font-medium">{r.student.user.name}</p>
                          <p className="text-slate-600 text-[10px]">{r.student.registerNumber}</p>
                        </td>
                        <td className="px-2 py-2 text-slate-400 text-xs">{r.subject.code}</td>
                        <td className="px-2 py-2">
                          {editingRecord === r.id ? (
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)}
                              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-white text-xs">
                              <option value="PRESENT">PRESENT</option>
                              <option value="ABSENT">ABSENT</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>{r.status}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingRecord === r.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleEditRecord(r.id, editStatus)}
                                className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30">
                                <Check size={11} />
                              </button>
                              <button onClick={() => setEditingRecord(null)}
                                className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30">
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingRecord(r.id); setEditStatus(r.status) }}
                              className="w-6 h-6 rounded-md bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all">
                              <Edit2 size={11} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
