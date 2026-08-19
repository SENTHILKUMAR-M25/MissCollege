"use client"

import { useMemo } from "react"
import { CalendarDays } from "lucide-react"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const SUBJECT_COLORS: Record<string, string> = {
  THEORY: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
  LAB: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
  ELECTIVE: "bg-[#2F2FE4]/10 border-[#2F2FE4]/30 text-[#2F2FE4]",
  PROJECT: "bg-orange-500/10 border-orange-400/30 text-orange-300",
  default: "bg-[#2F2FE4]/10 border-gray-200 text-[#2F2FE4]",
}

const BREAK_COLOR = "bg-white border-gray-200 text-gray-400"

type Props = {
  student: any
  sortedPeriods: Array<{ id?: string; periodNumber: number; name: string; startTime: string; endTime: string; isBreak: boolean }>
  studentTimetable: any[]
}

export default function StudentTimetableClient({ student, sortedPeriods, studentTimetable }: Props) {
  const fullPeriods = useMemo(() => sortedPeriods, [sortedPeriods])

  const timetableMap = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const t of studentTimetable) {
      const key = `${t.dayOfWeek}-${t.periodNumber}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [studentTimetable])

  const workingDays = useMemo(() => {
    if (!studentTimetable.length) return [1, 2, 3, 4, 5]
    const days = new Set(studentTimetable.map((t) => t.dayOfWeek))
    return Array.from(days).sort((a, b) => a - b)
  }, [studentTimetable])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <CalendarDays size={20} />
        </div>
        <div>
          <h1 className="text-black text-xl font-bold">Timetable</h1>
          <p className="text-gray-500 text-sm">Weekly class schedule</p>
        </div>
      </div>

      {studentTimetable.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center">
          <p className="text-gray-500 text-sm">No timetable entries available.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase w-24 sticky left-0 bg-gray-100 z-10 border border-gray-100">Day / Period</th>
                  {fullPeriods.map((p) => (
                    <th
                      key={p.id || `p-${p.periodNumber}`}
                      className={`px-2 py-2.5 text-center text-[10px] font-semibold uppercase min-w-[120px] border border-gray-100 ${p.isBreak ? "text-gray-400" : "text-gray-700"}`}
                    >
                      {p.name}
                      {!p.isBreak && <div className="text-gray-400 normal-case font-normal">{p.startTime}-{p.endTime}</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workingDays.map((dayNum) => {
                  const dayLabel = DAYS[dayNum - 1] || `Day ${dayNum}`
                  return (
                    <tr key={dayNum} className="border-b border-gray-100">
                      <td className="px-3 py-2 text-black text-xs font-semibold align-top sticky left-0 bg-white z-10 border border-gray-100">{dayLabel}</td>
                      {fullPeriods.map((p) => {
                        if (p.isBreak) {
                          return (
                            <td key={`break-${dayNum}-${p.periodNumber}`} className="px-2 py-2 align-top">
                              <div className={`rounded-lg p-2 text-center text-[10px] font-bold ${BREAK_COLOR}`}>{p.name ?? "Break"}</div>
                            </td>
                          )
                        }

                        const entries = timetableMap.get(`${dayNum}-${p.periodNumber}`) || []
                        if (entries.length === 0) {
                          return (
                            <td key={`empty-${dayNum}-${p.periodNumber}`} className="px-2 py-2 align-top">
                              <div className="rounded-lg border border-dashed border-gray-100 bg-white p-2 text-center text-[10px] text-gray-400 min-h-[52px] flex items-center justify-center">
                                —
                              </div>
                            </td>
                          )
                        }

                        return (
                          <td key={`cell-${dayNum}-${p.periodNumber}`} className="px-2 py-2 align-top">
                            <div className="space-y-1.5">
                              {entries.map((entry, idx) => {
                                const subjType = entry.subject?.subjectType || "default"
                                const colorClass = SUBJECT_COLORS[subjType] || SUBJECT_COLORS.default
                                return (
                                  <div key={entry.id || `${dayNum}-${p.periodNumber}-${idx}`} className={`rounded-lg border p-2 ${colorClass}`}>
                                    <p className="text-[11px] font-semibold leading-tight truncate">{entry.subject?.name ?? entry.subject?.code ?? "—"}</p>
                                    <p className="text-[10px] truncate">{entry.subject?.code ?? ""}</p>
                                    <p className="text-[10px] truncate opacity-80">{entry.faculty?.user?.name ?? ""}</p>
                                    {entry.classroom && <p className="text-[10px] truncate opacity-70">Room: {entry.classroom}</p>}
                                  </div>
                                )
                              })}
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
    </div>
  )
}
