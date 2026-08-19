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
          <h2 className="text-black font-bold text-xl">Student Analytics & Reports</h2>
          <p className="text-gray-500 text-sm mt-0.5">Comprehensive insights on student population</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-emerald-500/25">
          <Download size={15} /> Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 border border-gray-100 rounded-2xl p-5 relative overflow-hidden">
            <p className="text-gray-500 text-xs mb-1 relative z-10">{s.label}</p>
            <p className="text-black text-3xl font-black relative z-10 mb-1">{s.value}</p>
            <p className="text-[#2F2FE4] text-xs font-semibold relative z-10">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 border border-gray-100 rounded-2xl p-5">
        <h3 className="text-black font-bold mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#2F2FE4]" /> Department-wise Student Strength
        </h3>
        {departments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No department data available.</p>
        ) : (
          <div className="space-y-3">
            {departments.map((d) => {
              const pct = totalStudents > 0 ? Math.round((d._count.students / totalStudents) * 100) : 0
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <span className="w-48 text-sm text-gray-700 truncate">{d.name}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                    <div className="h-full bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 text-right text-black font-bold text-sm">{d._count.students}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
