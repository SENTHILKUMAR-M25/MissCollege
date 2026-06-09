import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { redirect } from "next/navigation"
import { CalendarDays } from "lucide-react"

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default async function StudentTimetablePage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { timetable } = result.data
  const grouped: Record<number, any[]> = {}
  timetable.forEach((t: any) => {
    if (!grouped[t.dayOfWeek]) grouped[t.dayOfWeek] = []
    grouped[t.dayOfWeek].push(t)
  })

  const today = new Date().getDay() === 0 ? 7 : new Date().getDay()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <CalendarDays size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Timetable</h1>
          <p className="text-slate-400 text-sm mt-0.5">Weekly class schedule</p>
        </div>
      </div>

      {timetable.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <CalendarDays size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No timetable entries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((day) => {
            const entries = grouped[day] || []
            const isToday = day === today
            return (
              <div key={day} className={`rounded-2xl border p-4 space-y-3 ${isToday ? "bg-teal-500/10 border-teal-500/30" : "bg-slate-800/50 border-white/5"}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-bold text-sm ${isToday ? "text-teal-300" : "text-white"}`}>{DAYS[day]}</h3>
                  {isToday && <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-[10px] font-bold">Today</span>}
                </div>
                {entries.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">No classes</p>
                ) : (
                  entries.map((t: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <p className="text-white text-xs font-semibold">{t.subject?.name || "Class"}</p>
                      <p className="text-slate-400 text-[10px]">{t.faculty?.user?.name}</p>
                      <p className="text-teal-400 text-[10px] font-medium">{t.startTime} - {t.endTime}</p>
                      <p className="text-slate-500 text-[10px]">Room: {t.classroom}</p>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
