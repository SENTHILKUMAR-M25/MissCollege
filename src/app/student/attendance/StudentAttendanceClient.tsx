"use client"

import { useState, useMemo } from "react"
import { ClipboardCheck, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"

const STATUS_COLORS = {
  PRESENT: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  ABSENT: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  OD: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  LEAVE: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" },
}

const BREAK_COLOR = "bg-white border-gray-200 text-gray-400"
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type Props = {
  student: any
  dates: Array<{ key: string; label: string; dayName: string; dayOrder: number }>
  sortedPeriods: Array<{ id?: string; periodNumber: number; name: string; startTime: string; endTime: string; isBreak: boolean }>
  studentTimetable: any[]
  attendanceByDate: Map<string, any[]>
  subjectAttendance: any[]
  attendancePct: number
}

export default function StudentAttendanceClient({
  student,
  dates,
  sortedPeriods,
  studentTimetable,
  attendanceByDate,
  subjectAttendance,
  attendancePct,
}: Props) {
  const [view, setView] = useState<"period" | "subject">("period")

  const timetableMap = useMemo(() => {
    const map = new Map<string, any>()
    for (const t of studentTimetable) {
      map.set(`${t.dayOfWeek}-${t.periodNumber}`, t)
    }
    return map
  }, [studentTimetable])

  function matchTimetableEntry(dayOrder: number, period: { periodNumber: number; startTime?: string; endTime?: string }) {
    const direct = timetableMap.get(`${dayOrder}-${period.periodNumber}`)
    if (direct) return direct
    const byTime = studentTimetable.find((t: any) => {
      if (t.dayOfWeek !== dayOrder) return false
      const start = new Date(`2000-01-01T${t.startTime ?? "00:00"}`).getTime()
      const end = new Date(`2000-01-01T${t.endTime ?? "23:59"}`).getTime()
      const pStart = new Date(`2000-01-01T${period.startTime ?? "00:00"}`).getTime()
      const pEnd = new Date(`2000-01-01T${period.endTime ?? "23:59"}`).getTime()
      return start >= pStart - 60000 && end <= pEnd + 60000
    })
    return byTime || null
  }

  const overallPresent = studentTimetable.length
  const overallAbsent = 0
  const overallOD = 0
  const overallLeave = 0

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <h1 className="text-black text-xl font-bold">Attendance</h1>
            <p className="text-gray-500 text-sm">Class-wise attendance calendar</p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-white border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => setView("period")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              view === "period" ? "bg-[#2F2FE4] text-white shadow-lg shadow-[#2F2FE4]/20" : "text-gray-500 hover:text-black"
            }`}
          >
            📅 Period-wise
          </button>
          <button
            type="button"
            onClick={() => setView("subject")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              view === "subject" ? "bg-[#2F2FE4] text-white shadow-lg shadow-[#2F2FE4]/20" : "text-gray-500 hover:text-black"
            }`}
          >
            📚 Subject-wise
          </button>
        </div>
      </div>

      {view === "period" && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-center">
              <thead>
                <tr className="bg-[#2F2FE4] text-white">
                  <th className="px-3 py-3 font-semibold border border-gray-200">Date</th>
                  <th className="px-3 py-3 font-semibold border border-gray-200">Day</th>
                  {sortedPeriods.map((p) => (
                    <th key={p.id || p.periodNumber} className={`px-3 py-3 font-semibold border border-gray-200 ${p.isBreak ? "text-gray-700" : ""}`}>
                      {p.isBreak ? p.name : `Period ${p.periodNumber}`}
                      {!p.isBreak && <span className="block text-[10px] font-normal opacity-80">{p.startTime}-{p.endTime}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dates.map((date) => {
                  const dayAtt = attendanceByDate.get(date.key) || []
                  return (
                    <tr key={date.key} className="border-b border-gray-100">
                      <td className="px-3 py-3 text-black border border-gray-100">{date.label}</td>
                      <td className="px-3 py-3 text-black border border-gray-100">{date.dayName}</td>
                      {sortedPeriods.map((p) => {
                        if (p.isBreak) {
                          return (
                            <td key={`break-${date.key}-${p.periodNumber}`} className="px-2 py-2 border border-gray-100 align-top">
                              <div className={`rounded-lg p-2 text-center text-[10px] font-bold ${BREAK_COLOR}`}>{p.name}</div>
                            </td>
                          )
                        }

                        const ttEntry = matchTimetableEntry(date.dayOrder, p)
                        if (!ttEntry) {
                          return (
                            <td key={`empty-${date.key}-${p.periodNumber}`} className="px-2 py-3 border border-gray-100">
                              <span className="text-gray-400 text-xs">—</span>
                            </td>
                          )
                        }

                        const att = dayAtt.find((a: any) => a.periodNumber === p.periodNumber)
                        if (!att) {
                          return (
                            <td key={`noatt-${date.key}-${p.periodNumber}`} className="px-2 py-3 border border-gray-100 align-top">
                              <div className="rounded-md border border-dashed border-gray-200 bg-white p-2">
                                <p className="text-[11px] font-semibold text-gray-700">{ttEntry.subject?.code ?? "—"}</p>
                                <p className="text-[10px] text-gray-500">{ttEntry.faculty?.user?.name}</p>
                              </div>
                            </td>
                          )
                        }

                        const status = (att.status ?? "PRESENT") as string
                        const bg =
                          status === "PRESENT"
                            ? "bg-emerald-400/10"
                            : status === "ABSENT"
                            ? "bg-red-400/10"
                            : status === "OD"
                            ? "bg-orange-400/10"
                            : "bg-gray-100"
                        const abbr = status === "PRESENT" ? "P" : status === "ABSENT" ? "A" : status === "OD" ? "OD" : "L"
                        const textColor =
                          status === "PRESENT"
                            ? "text-emerald-400"
                            : status === "ABSENT"
                            ? "text-red-400"
                            : status === "OD"
                            ? "text-orange-400"
                            : "text-gray-500"

                        return (
                          <td key={`att-${date.key}-${p.periodNumber}`} className={`px-2 py-3 border border-gray-100 align-top ${bg}`}>
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-bold ${textColor}`}>[{abbr}]</span>
                              <span className="text-[11px] font-semibold text-red-300/90">[{ttEntry.subject?.code ?? "—"}]</span>
                              <span className="text-[11px] text-black">{ttEntry.faculty?.user?.name}</span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "subject" && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#2F2FE4] text-white">
                  <th className="px-4 py-3 font-semibold border border-gray-200">Subject Code</th>
                  <th className="px-4 py-3 font-semibold border border-gray-200">Subject Name</th>
                  <th className="px-4 py-3 font-semibold border border-gray-200">Faculty</th>
                  <th className="px-4 py-3 font-semibold text-right border border-gray-200">Conducted</th>
                  <th className="px-4 py-3 font-semibold text-right border border-gray-200">Present</th>
                  <th className="px-4 py-3 font-semibold text-right border border-gray-200">Absent</th>
                  <th className="px-4 py-3 font-semibold text-right border border-gray-200">%</th>
                  <th className="px-4 py-3 font-semibold border border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">No attendance records found.</td>
                  </tr>
                ) : (
                  subjectAttendance.map((s: any, i: number) => {
                    const pct = typeof s.pct === "number" ? s.pct : Math.round((s.present / s.total) * 100)
                    const color =
                      pct >= 75
                        ? "text-emerald-300"
                        : pct >= 60
                        ? "text-amber-300"
                        : "text-red-300"
                    const barColor = pct >= 75 ? "bg-emerald-400" : pct >= 60 ? "bg-amber-400" : "bg-red-400"
                    const statusLabel = pct >= 75 ? "Safe" : pct >= 60 ? "Warning" : "Critical"
                    return (
                      <tr key={s.id || i} className="border-b border-gray-100">
                        <td className={`px-4 py-3 font-medium text-black border border-gray-100 ${color}`}>{s.code}</td>
                        <td className="px-4 py-3 text-gray-700 border border-gray-100">{s.name ?? s.code}</td>
                        <td className="px-4 py-3 text-gray-700 border border-gray-100">{s.facultyName ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-gray-700 border border-gray-100">{s.total}</td>
                        <td className="px-4 py-3 text-right text-emerald-300 border border-gray-100">{s.present}</td>
                        <td className="px-4 py-3 text-right text-red-300 border border-gray-100">{s.total - s.present}</td>
                        <td className="px-4 py-3 text-right border border-gray-100">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                            <span className={`text-xs font-bold ${color}`}>{pct}%</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 border border-gray-100 ${color}`}>{statusLabel}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
