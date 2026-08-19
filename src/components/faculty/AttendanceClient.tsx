"use client"

import { useState, useMemo, useEffect } from "react"
import toast from "react-hot-toast"
import { Search, Users, BookOpen, Calendar, TrendingUp, Check, X, Edit2, Filter, Plus } from "lucide-react"
import { CheckSquare, Save, Printer } from "lucide-react"
import Modal from "@/components/ui/Modal"

type Subject = { id: string; name: string; code: string; semester: number; departmentId: string }
type Student = { id: string; registerNumber: string; semester: number; section: string; user: { id?: string; name: string | null } }
type Record = {
  id: string
  date: string | Date
  periodNumber: number
  startTime?: string | null
  endTime?: string | null
  status: "PRESENT" | "ABSENT" | "OD" | "LEAVE"
  student: { id: string; registerNumber: string; user: { name: string | null } }
  subject: { id: string; name: string; code: string }
}

type TimetableEntry = {
  id: string
  dayOfWeek: number
  periodNumber: number
  startTime: string
  endTime: string
  className: string
  section: string
  subject: { id: string; name: string; code: string; semester?: number }
  department: { id: string; name: string; code: string } | null
  course: { id: string; name: string; code: string } | null
}

const sel =
  "bg-white border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50"

const STATUS_OPTIONS = [
  { label: "P", value: "PRESENT", color: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" },
  { label: "A", value: "ABSENT", color: "bg-red-500 text-white shadow-lg shadow-red-500/25" },
  { label: "OD", value: "OD", color: "bg-[#2F2FE4] text-white shadow-lg shadow-[#2F2FE4]/20" },
  { label: "L", value: "LEAVE", color: "bg-amber-500 text-white shadow-lg shadow-[#2F2FE4]/20" },
] as const

const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type ReportTab = "recent" | "subject" | "period" | "student" | "month" | "section"

export default function AttendanceClient({
  facultyId,
  departmentId,
  subjects,
  initialRecords,
  timetable,
  periods,
  summary,
}: {
  facultyId: string
  departmentId: string
  subjects: Subject[]
  initialRecords: Record[]
  timetable: TimetableEntry[]
  periods: { id: string; periodNumber: number; name: string; startTime: string; endTime: string }[]
  summary?: {
    subjectWise: Array<{ code: string; present: number; absent: number; od: number; leave: number; total: number }>
    periodWise: Array<{ periodNumber: number; present: number; absent: number; od: number; leave: number; total: number }>
    monthWise: Array<{ month: string; present: number; absent: number; od: number; leave: number; total: number }>
    studentWise: Array<{ id: string; name: string; present: number; total: number }>
    sectionWise: Array<{ id: string; section: string; present: number; total: number }>
  }
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || "")
  const [selectedPeriod, setSelectedPeriod] = useState<number | "">("")
  const [search, setSearch] = useState("")
  const [semFilter, setSemFilter] = useState("All")
  const [secFilter, setSecFilter] = useState("All")
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<Record[]>(initialRecords)
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT" | "OD" | "LEAVE">>({})
  const [reportTab, setReportTab] = useState<ReportTab>("recent")
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

  const currentSubject = subjects.find((s) => s.id === selectedSubject)

  const availablePeriods = useMemo(() => {
    if (!selectedDate) return []
    const dateObj = new Date(selectedDate)
    return periods
  }, [selectedDate, periods])

  const classSectionSet = useMemo(() => {
    const set = new Set<string>()
    timetable.forEach((t) => {
      const key = `${t.className}-${t.section}`
      set.add(key)
    })
    return Array.from(set).sort()
  }, [timetable])

  const [selectedClassSection, setSelectedClassSection] = useState<string>("")

  useEffect(() => {
    if (classSectionSet.length && !selectedClassSection) setSelectedClassSection(classSectionSet[0])
  }, [classSectionSet])

  const filteredStudents = useMemo(() => {
    if (!selectedClassSection) return []
    const [cls, sec] = selectedClassSection.split("-")
    let list: Student[] = []
    const subjectSem = currentSubject?.semester
    const rows = timetable.filter((t) => {
      const classMatch = !t.className || t.className === cls
      const secMatch = !t.section || t.section === sec
      const subjMatch = !currentSubject || t.subject?.id === currentSubject.id
      return classMatch && secMatch && subjMatch
    })
    const seen = new Set<string>()
    for (const entry of rows) {
      // query students server-side using class filters would need an API; here I derive from filtered portal query
    }
    // Fallback: cannot fetch students client-side directly. We fetch via a ref later.
    return list
  }, [selectedClassSection, currentSubject, timetable])

  async function fetchStudents() {
    if (!selectedClassSection || !currentSubject) return []
    const [cls, sec] = selectedClassSection.split("-")
    const res = await fetch(`/api/attendance/students?departmentId=${encodeURIComponent(departmentId)}&semester=${currentSubject.semester}&section=${encodeURIComponent(sec)}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.students || []
  }

  async function loadAttendanceForSlot() {
    if (!selectedSubject || !selectedDate || !selectedPeriod) return
    const slotRecords = records.filter((r) => {
      const d = new Date(r.date).toISOString().split("T")[0]
      return r.subject.id === selectedSubject && d === selectedDate && r.periodNumber === selectedPeriod
    })
    const map: Record<string, "PRESENT" | "ABSENT" | "OD" | "LEAVE"> = {}
    slotRecords.forEach((r) => {
      map[r.student.id] = r.status
    })
    setAttendance(map)
  }

  useEffect(() => {
    loadAttendanceForSlot()
  }, [selectedSubject, selectedDate, selectedPeriod])

  function markAll(status: "PRESENT" | "ABSENT" | "OD" | "LEAVE") {
    const map: Record<string, "PRESENT" | "ABSENT" | "OD" | "LEAVE"> = {}
    filteredStudents.forEach((s) => {
      map[s.id] = status
    })
    setAttendance((prev) => ({ ...prev, ...map }))
    toast.success(`Marked all as ${status}`)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSubject || !selectedDate || !selectedPeriod) return toast.error("Select subject, date and period")
    setLoading(true)
    try {
      const students = await fetchStudents()
      if (!students.length) return toast.error("No students found for selected class")
      const payload = students.map((s: Student) => ({ studentId: s.id, status: attendance[s.id] || "ABSENT" }))

      const slotEntry = availablePeriods.find((p) => p.periodNumber === selectedPeriod)
      const startTime = slotEntry?.startTime || periods.find((p) => p.periodNumber === selectedPeriod)?.startTime || ""
      const endTime = slotEntry?.endTime || periods.find((p) => p.periodNumber === selectedPeriod)?.endTime || ""

      const res = await fetch("/api/faculty/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId,
          subjectId: selectedSubject,
          date: selectedDate,
          periodNumber: selectedPeriod,
          startTime,
          endTime,
          records: payload,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Saved attendance for period ${selectedPeriod}`)
        const refreshed = await fetch(`/api/faculty/attendance/records?facultyId=${facultyId}&startDate=${selectedDate}&endDate=${selectedDate}`)
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

  const stats = useMemo(() => {
    const present = Object.values(attendance).filter((v) => v === "PRESENT").length
    const absent = Object.values(attendance).filter((v) => v === "ABSENT").length
    const od = Object.values(attendance).filter((v) => v === "OD").length
    const leave = Object.values(attendance).filter((v) => v === "LEAVE").length
    const total = present + absent + od + leave
    return { present, absent, od, leave, total }
  }, [attendance])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Attendance</h1>
          <p className="text-gray-500 text-sm">Mark and review attendance for your classes</p>
        </div>
        <button onClick={() => setShowAttendanceModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5]">
          <Plus size={16} /> Mark Attendance
        </button>
      </div>

      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Mark Attendance" size="xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Date *</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className={sel + " w-full"} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Subject *</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={sel + " w-full"}>
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Class / Section *</label>
              <select value={selectedClassSection} onChange={(e) => setSelectedClassSection(e.target.value)} className={sel + " w-full"}>
                {classSectionSet.map((cs) => {
                  const [cls, sec] = cs.split("-")
                  return (
                    <option key={cs} value={cs}>
                      {cls} / {sec}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-medium">Period *</label>
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(Number(e.target.value))} className={sel + " w-full"}>
                <option value="">Select Period</option>
                {availablePeriods.map((entry) => (
                  <option key={entry.id} value={entry.periodNumber}>
                    {entry.periodNumber} ({DAYS[entry.dayOfWeek]}) {entry.startTime}-{entry.endTime}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedPeriod && (
            <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
              <p className="text-black text-xs font-semibold">
                Selected: Period {selectedPeriod} — {DAYS[new Date(selectedDate).getDay() === 0 ? 7 : new Date(selectedDate).getDay()]} |{" "}
                {new Date(selectedDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
              <p className="text-gray-500 text-xs">
                {currentSubject?.name || ""} ({currentSubject?.code}) | {selectedClassSection}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex gap-4 text-xs">
              <span className="text-gray-500">P:{summary?.present || 0} A:{summary?.absent || 0} OD:{summary?.od || 0} L:{summary?.leave || 0}</span>
            </div>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => markAll(opt.value)} className="px-2 py-1 rounded-lg bg-gray-100 text-black text-xs font-semibold hover:bg-gray-100 transition-colors">
                  All {opt.label}
                </button>
              ))}
            </div>
          </div>

          <StudentTable facultyId={facultyId} selectedClassSection={selectedClassSection} currentSubject={currentSubject} fetchStudents={fetchStudents} search={search} semFilter={semFilter} secFilter={secFilter} setSearch={setSearch} setSemFilter={setSemFilter} setSecFilter={setSecFilter} attendance={attendance} setAttendance={setAttendance} />

          <button type="submit" disabled={loading || !selectedSubject || !selectedDate || !selectedPeriod} className="w-full py-2.5 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-[#2F2FE4]/20">
            <Save size={15} /> {loading ? "Saving…" : "Save Attendance"}
          </button>
        </form>
      </Modal>

      {/* Right: reports */}
      <div className="space-y-5">
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-[#2F2FE4]" />
            <h3 className="text-black font-bold text-sm">Reports</h3>
            <div className="ml-auto flex gap-1">
              {(["recent", "subject", "period", "student", "month", "section"] as ReportTab[]).map((tab) => (
                <button key={tab} onClick={() => setReportTab(tab)} className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${reportTab === tab ? "bg-[#2F2FE4]/10 text-[#2F2FE4] border border-[#2F2FE4]/20" : "text-gray-500 hover:text-black bg-gray-100"}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <ReportPanel summary={summary} records={records} reportTab={reportTab} />
        </div>
      </div>
    </div>
  )
}

function StudentTable({
  facultyId,
  selectedClassSection,
  currentSubject,
  fetchStudents,
  search,
  semFilter,
  secFilter,
  setSearch,
  setSemFilter,
  setSecFilter,
  attendance,
  setAttendance,
}: {
  facultyId: string
  selectedClassSection: string
  currentSubject: Subject | undefined
  fetchStudents: () => Promise<Student[]>
  search: string
  semFilter: string
  secFilter: string
  setSearch: (v: string) => void
  setSemFilter: (v: string) => void
  setSecFilter: (v: string) => void
  attendance: Record<string, "PRESENT" | "ABSENT" | "OD" | "LEAVE">
  setAttendance: (v: Record<string, "PRESENT" | "ABSENT" | "OD" | "LEAVE">) => void
}) {
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    fetchStudents().then(setStudents)
  }, [fetchStudents, selectedClassSection, currentSubject])

  const [cls, sec] = selectedClassSection ? selectedClassSection.split("-") : ["", ""]
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const searchMatch = !search || s.user.name?.toLowerCase().includes(search.toLowerCase()) || s.registerNumber.toLowerCase().includes(search.toLowerCase())
      const semMatch = semFilter === "All" || s.semester.toString() === semFilter
      const secMatch = secFilter === "All" || s.section === secFilter
      return searchMatch && semMatch && secMatch
    })
  }, [students, search, semFilter, secFilter])

  const stat = (key: "PRESENT" | "ABSENT" | "OD" | "LEAVE") => {
    const icons: Record<string, { active: string; inactive: string }> = {
      PRESENT: { active: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25", inactive: "bg-emerald-500/10 text-emerald-400" },
      ABSENT: { active: "bg-red-500 text-white shadow-lg shadow-red-500/25", inactive: "bg-red-500/10 text-red-400" },
      OD: { active: "bg-[#2F2FE4] text-white shadow-lg shadow-[#2F2FE4]/20", inactive: "bg-[#2F2FE4]/10 text-[#2F2FE4]" },
      LEAVE: { active: "bg-amber-500 text-white shadow-lg shadow-[#2F2FE4]/20", inactive: "bg-amber-500/10 text-amber-400" },
    }
    return icons[key]
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50"
          />
        </div>
        <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className={sel}>
          <option value="All">All Semesters</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
        </select>
        <select value={secFilter} onChange={(e) => setSecFilter(e.target.value)} className={sel}>
          <option value="All">All Sections</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      </div>

      {filtered.length === 0 && <p className="text-gray-400 text-sm text-center py-6">No students available. Check filters.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto">
        {filtered.map((s) => {
          const currentStatus = (attendance[s.id] || "PRESENT") as "PRESENT" | "ABSENT" | "OD" | "LEAVE"
          const statusLabel = currentStatus === "PRESENT" ? "P" : currentStatus
          const cls = stat(currentStatus).active
          return (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                setAttendance((prev) => {
                  const order = ["PRESENT", "ABSENT", "OD", "LEAVE"] as const
                  const idx = order.indexOf(currentStatus)
                  const next = { ...prev }
                  next[s.id] = order[(idx + 1) % order.length]
                  return next
                })
              }
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                true ? "border-gray-200 bg-gray-100" : "border-gray-100 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-5 text-right">{s.registerNumber.slice(-3)}</span>
                <div className="text-left">
                  <p className="text-black text-sm font-medium">{s.user.name}</p>
                  <p className="text-gray-400 text-[10px]">
                    {s.registerNumber} · S{s.semester}/{s.section}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[11px] font-bold ${cls}`}>{statusLabel}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReportPanel({
  records,
  summary,
  reportTab,
}: {
  records: Record[]
  summary?: {
    subjectWise: Array<{ code: string; present: number; absent: number; od: number; leave: number; total: number }>
    periodWise: Array<{ periodNumber: number; present: number; absent: number; od: number; leave: number; total: number }>
    monthWise: Array<{ month: string; present: number; absent: number; od: number; leave: number; total: number }>
    studentWise: Array<{ id: string; name: string; present: number; total: number }>
    sectionWise: Array<{ id: string; section: string; present: number; total: number }>
  }
  reportTab: ReportTab
}) {
  const recent = useMemo(() => [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20), [records])

  return (
    <div className="space-y-3">
      {reportTab === "recent" && (
        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {recent.length === 0 && <p className="text-gray-400 text-xs text-center py-4">No records yet.</p>}
          {recent.map((r) => {
            const pct = r.subject ? Math.round(((r.status === "PRESENT" ? 1 : 0) / 1) * 100) : 0
            return (
              <div key={r.id} className="p-3 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-black text-xs font-medium">{r.student.user.name}</p>
                  <p className="text-gray-400 text-[10px]">
                    {r.subject.code} · Period {r.periodNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.status === "PRESENT"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : r.status === "ABSENT"
                        ? "bg-red-500/10 text-red-400"
                        : r.status === "OD"
                        ? "bg-[#2F2FE4]/10 text-[#2F2FE4]"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {r.status}
                  </span>
                  <p className="text-gray-400 text-[10px]">
                    {new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reportTab === "subject" && (
        <ReportTable
          columns={["Code", "Present", "Absent", "OD", "Leave", "Total", "%"]}
          rows={(summary?.subjectWise || []).map((s) => {
            const pct = s.total ? Math.round((s.present / s.total) * 100) : 0
            return { code: s.code, cols: [s.present, s.absent, s.od, s.leave, s.total, `${pct}%`], pct }
          })}
        />
      )}

      {reportTab === "period" && (
        <ReportTable
          columns={["Period", "Present", "Absent", "OD", "Leave", "Total", "%"]}
          rows={(summary?.periodWise || []).map((p) => {
            const pct = p.total ? Math.round((p.present / p.total) * 100) : 0
            return { code: `Period ${p.periodNumber}`, cols: [p.present, p.absent, p.od, p.leave, p.total, `${pct}%`], pct }
          })}
        />
      )}

      {reportTab === "month" && (
        <ReportTable
          columns={["Month", "Present", "Absent", "OD", "Leave", "Total", "%"]}
          rows={(summary?.monthWise || []).map((m) => {
            const pct = m.total ? Math.round((m.present / m.total) * 100) : 0
            return { code: m.month, cols: [m.present, m.absent, m.od, m.leave, m.total, `${pct}%`], pct }
          })}
        />
      )}

      {reportTab === "student" && (
        <ReportTable
          columns={["Student", "Present", "Total", "%"]}
          rows={(summary?.studentWise || []).map((s) => {
            const pct = s.total ? Math.round((s.present / s.total) * 100) : 0
            return { code: s.name, cols: [s.present, s.total, `${pct}%`], pct }
          })}
        />
      )}

      {reportTab === "section" && (
        <ReportTable
          columns={["Section", "Present", "Total", "%"]}
          rows={(summary?.sectionWise || []).map((s) => {
            const pct = s.total ? Math.round((s.present / s.total) * 100) : 0
            return { code: s.section, cols: [s.present, s.total, `${pct}%`], pct }
          })}
        />
      )}
    </div>
  )
}

function ReportTable({ columns, rows }: { columns: string[]; rows: Array<{ code: string; cols: any[]; pct: number }> }) {
  return (
    <div className="overflow-x-auto max-h-[320px]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-2 py-2 text-gray-500 text-[10px] uppercase font-semibold">{columns[0]}</th>
            {columns.slice(1).map((c) => (
              <th key={c} className="px-2 py-2 text-gray-500 text-[10px] uppercase font-semibold text-right">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-2 py-4 text-gray-400 text-xs text-center">
                No data
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.code + i} className="border-b border-gray-100">
              <td className="px-2 py-2 text-black text-xs">{r.code}</td>
              {r.cols.map((c, idx) => (
                <td key={idx} className="px-2 py-2 text-right text-gray-700 text-xs">
                  {idx === columns.length - 2 ? (
                    <span className={`font-bold ${(r.pct || 0) >= 75 ? "text-emerald-400" : "text-red-400"}`}>{c as string}</span>
                  ) : (
                    c
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
