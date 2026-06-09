import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { GraduationCap } from "lucide-react"

export default async function HodStudentsPage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId

  const students = await prisma.student.findMany({
    where: { departmentId: deptId },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { name: true, code: true } },
      department: { select: { name: true, code: true } },
      attendance: {
        where: { date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
        select: { id: true, status: true },
      },
    },
    orderBy: [{ semester: "asc" }, { section: "asc" }],
  })

  const bySemester = students.reduce<Record<number, typeof students>>((acc, s) => {
    const sem = s.semester || 1
    acc[sem] = acc[sem] || []
    acc[sem].push(s)
    return acc
  }, {})

  const getAttendancePercent = (records: { status: string }[]) => {
    if (records.length === 0) return null
    const present = records.filter((r) => r.status === "PRESENT").length
    return Math.round((present / records.length) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Student Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Department of {me.department.name} • {students.length} students
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(bySemester).map(([sem, list]) => (
          <div key={sem} className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">Semester {sem}</p>
            <p className="text-2xl font-bold text-white mt-1">{list.length}</p>
            <p className="text-slate-400 text-xs mt-0.5">students</p>
          </div>
        ))}
      </div>

      {Object.entries(bySemester).map(([sem, list]) => (
        <div key={sem} className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">Semester {sem}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{list.length} students • {me.department.code}</p>
            </div>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              Sections: {[...new Set(list.map((s) => s.section))].filter(Boolean).join(", ") || "N/A"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/20">
                  {["Reg No", "Name", "Course", "Section", "Email", "Attendance (30d)"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((s) => {
                  const pct = getAttendancePercent(s.attendance)
                  return (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-violet-400 text-sm font-mono font-semibold">{s.registerNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                            {s.user.name?.charAt(0) || "S"}
                          </div>
                          <span className="text-white text-sm">{s.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{s.course.code}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{s.section || "–"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{s.user.email}</td>
                      <td className="px-4 py-3">
                        {pct === null ? (
                          <span className="text-slate-500 text-xs">No data</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-slate-700">
                              <div
                                className={`h-1.5 rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${pct >= 75 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400"}`}>
                              {pct}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {students.length === 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <GraduationCap size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No students found in your department.</p>
        </div>
      )}
    </div>
  )
}
