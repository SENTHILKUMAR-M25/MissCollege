import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyTimetable } from "@/actions/faculty-portal"
import { CalendarDays } from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default async function FacultyTimetablePage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const result = await getFacultyTimetable(faculty.id)
  if (!result.success) {
    return <div className="text-red-400">Failed to load timetable</div>
  }

  const entries = result.data
  const grouped: Record<number, any[]> = {}
  for (const t of entries) {
    if (!grouped[t.dayOfWeek]) grouped[t.dayOfWeek] = []
    grouped[t.dayOfWeek].push(t)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <CalendarDays size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Timetable</h1>
          <p className="text-gray-500 text-sm mt-0.5">Weekly schedule overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {DAYS.map((day, i) => {
          const dayNum = i + 1
          const dayEntries = grouped[dayNum] || []
          return (
            <div key={day} className="rounded-2xl bg-white border border-gray-200 p-4 space-y-3">
              <h3 className="text-black font-bold text-sm text-center pb-2 border-b border-gray-100">{day}</h3>
              {dayEntries.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">No classes</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-100 border border-gray-100 space-y-1">
                      <p className="text-black text-xs font-semibold">{t.subject?.name || "Class"}</p>
                      <p className="text-gray-500 text-[10px]">Class {t.className} - {t.section}</p>
                      <p className="text-[#2F2FE4] text-[10px]">{t.startTime} - {t.endTime}</p>
                      <p className="text-gray-400 text-[10px]">{t.classroom}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
