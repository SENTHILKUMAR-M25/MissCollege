import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"

export default async function HodAttendancePage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const facultyList = await prisma.faculty.findMany({
    where: { departmentId: deptId },
    include: {
      user: { select: { name: true, email: true } },
      attendance: {
        where: { date: { gte: today } },
        select: { status: true },
      },
    },
    orderBy: { user: { name: "asc" } },
  })

  const students = await prisma.student.findMany({
    where: { departmentId: deptId },
    include: {
      user: { select: { name: true } },
      attendance: {
        where: { date: { gte: thirtyDaysAgo } },
        select: { status: true, date: true },
      },
    },
    orderBy: [{ semester: "asc" }, { user: { name: "asc" } }],
  })

  const getAttendancePercent = (records: { status: string }[]) => {
    if (records.length === 0) return null
    const present = records.filter((r) => r.status === "PRESENT").length
    return Math.round((present / records.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Attendance Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {me.department.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Faculty Attendance Today */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30">
            <h3 className="text-white font-bold">Faculty Present Today</h3>
            <p className="text-slate-500 text-xs mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div className="p-4">
            {facultyList.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No faculty in department.</p>
            ) : (
              <div className="space-y-2">
                {facultyList.map((f) => {
                  const status = f.attendance[0]?.status
                  const isPresent = status === "PRESENT"
                  const isAbsent = status === "ABSENT"
                  return (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                          {f.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{f.user.name}</p>
                          <p className="text-slate-500 text-xs">{f.facultyId}</p>
                        </div>
                      </div>
                      {isPresent && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">Present</span>}
                      {isAbsent && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/10 text-red-400">Absent</span>}
                      {!status && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400">Not Marked</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Student Attendance Summary */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30">
            <h3 className="text-white font-bold">Student Attendance (Last 30 Days)</h3>
            <p className="text-slate-500 text-xs mt-0.5">{students.length} students tracked</p>
          </div>
          <div className="p-4">
            {students.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No students in department.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {students.map((s) => {
                  const pct = getAttendancePercent(s.attendance)
                  const low = pct !== null && pct < 60
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-xs">
                          {s.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{s.user.name}</p>
                          <p className="text-slate-500 text-xs">{s.registerNumber} • Sem {s.semester} • {s.section || "N/A"}</p>
                        </div>
                      </div>
                      {pct === null ? (
                        <span className="text-slate-500 text-xs">No data</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-slate-700">
                            <div className={`h-1.5 rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-semibold ${low ? "text-red-400" : "text-emerald-400"}`}>{pct}%</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
