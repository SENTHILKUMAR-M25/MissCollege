import prisma from "@/lib/prisma"
import { Download, Users } from "lucide-react"

export default async function StudentReportsPage() {
  const [totalStudents, departments] = await Promise.all([
    prisma.student.count(),
    prisma.department.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
  ])

  const stats = [
    { label: "Total Students", value: totalStudents.toLocaleString(), trend: "Enrolled" },
    { label: "Total Departments", value: departments.length.toString(), trend: "Active" },
    { label: "Avg per Department", value: departments.length > 0 ? Math.round(totalStudents / departments.length).toString() : "0", trend: "Average" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Student Analytics & Reports</h2>
          <p className="text-slate-400 text-sm mt-0.5">Comprehensive insights on student population</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-emerald-500/25">
          <Download size={15} /> Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-slate-400 text-xs mb-1 relative z-10">{s.label}</p>
            <p className="text-white text-3xl font-black relative z-10 mb-1">{s.value}</p>
            <p className="text-amber-400 text-xs font-semibold relative z-10">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Users size={18} className="text-amber-400" /> Department-wise Student Strength
        </h3>
        {departments.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No department data available.</p>
        ) : (
          <div className="space-y-3">
            {departments.map((d) => {
              const pct = totalStudents > 0 ? Math.round((d._count.students / totalStudents) * 100) : 0
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <span className="w-48 text-sm text-slate-300 truncate">{d.name}</span>
                  <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-white font-bold text-sm">{d._count.students}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
