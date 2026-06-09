import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Award, BarChart2 } from "lucide-react"

export default async function HodExaminationsPage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId

  const subjects = await prisma.subject.findMany({
    where: { departmentId: deptId },
    include: {
      internalMarks: {
        include: {
          student: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: [{ semester: "asc" }, { name: "asc" }],
  })

  const totalMarks = subjects.reduce((a, s) => a + s.internalMarks.length, 0)
  const bySemester = subjects.reduce<Record<number, typeof subjects>>((acc, s) => {
    const sem = s.semester || 1
    acc[sem] = acc[sem] || []
    acc[sem].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <Award size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Examination Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Department of {me.department.name} • {totalMarks} internal mark records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Subjects", value: subjects.length, color: "text-white" },
          { label: "Mark Records", value: totalMarks, color: "text-orange-400" },
          { label: "Semesters", value: Object.keys(bySemester).length, color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center justify-between">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {Object.entries(bySemester).map(([sem, list]) => {
        const marksInSem = list.flatMap((s) => s.internalMarks)
        return (
          <div key={sem} className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Semester {sem}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{list.length} subjects • {marksInSem.length} records</p>
              </div>
            </div>

            {marksInSem.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-500 text-sm">No internal marks recorded for Semester {sem} yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/20">
                      {["Subject", "Code", "Student", "Exam Type", "Mark", "Out Of"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.flatMap((sub) =>
                      sub.internalMarks.map((mark) => {
                        const pct = Math.round(mark.mark)
                        return (
                          <tr key={mark.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-white text-sm font-medium">{sub.name}</td>
                            <td className="px-4 py-3 text-violet-400 text-xs font-mono font-semibold">{sub.code}</td>
                            <td className="px-4 py-3 text-slate-300 text-sm">{mark.student.user.name}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs">{mark.examType}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${pct >= 75 ? "text-emerald-400" : pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
                                  {mark.mark}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-sm">{mark.mark}/100</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}

      {subjects.length === 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <Award size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No subjects found in your department.</p>
        </div>
      )}
    </div>
  )
}
