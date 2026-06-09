import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Calendar } from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default async function HodTimetablePage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId

  const timetableEntries = await prisma.timetable.findMany({
    where: { departmentId: deptId },
    include: {
      faculty: { include: { user: { select: { name: true } } } },
      subject: { select: { name: true, code: true } },
      department: { select: { name: true, code: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  })

  const byDay = timetableEntries.reduce<Record<number, typeof timetableEntries>>((acc, t) => {
    acc[t.dayOfWeek] = acc[t.dayOfWeek] || []
    acc[t.dayOfWeek].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Calendar size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Timetable</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Department of {me.department.name} • {timetableEntries.length} classes/week
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {DAYS.map((dayName, idx) => {
          const dayNum = idx + 1
          const entries = byDay[dayNum] || []
          return (
            <div key={dayNum} className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
              <div className="px-6 py-3 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">{dayName}</h3>
                <span className="text-slate-500 text-xs">{entries.length} classes</span>
              </div>

              {entries.length === 0 ? (
                <p className="px-6 py-4 text-slate-500 text-sm">No classes scheduled</p>
              ) : (
                <div className="p-4 flex flex-wrap gap-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-1 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 min-w-[180px] hover:bg-violet-500/10 transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-violet-400 text-xs font-mono font-semibold">{entry.subject?.code || "N/A"}</span>
                        <span className="text-slate-400 text-[10px]">{entry.startTime} – {entry.endTime}</span>
                      </div>
                      <p className="text-white text-sm font-medium">{entry.subject?.name || "No Subject"}</p>
                      <p className="text-slate-400 text-xs">{entry.faculty.user.name}</p>
                      <p className="text-slate-500 text-[10px]">
                        Sem {entry.semester} {entry.section ? `• Sec ${entry.section}` : ""} • Room {entry.classroom}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {timetableEntries.length === 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <Calendar size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No timetable entries found for your department.</p>
        </div>
      )}
    </div>
  )
}
