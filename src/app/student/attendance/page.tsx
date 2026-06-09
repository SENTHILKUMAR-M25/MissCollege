import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { redirect } from "next/navigation"
import { ClipboardCheck, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"

export default async function StudentAttendancePage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { attendancePct, subjectAttendance } = result.data

  const low = subjectAttendance.filter((s: any) => s.pct < 75)
  const ok = subjectAttendance.filter((s: any) => s.pct >= 75)

  function classesNeeded(s: any) {
    if (s.pct >= 75) return 0
    // To reach 75%: (present + x) / (total + x) = 0.75
    let x = 0
    while (x < 100) {
      if ((s.present + x) / (s.total + x) >= 0.75) return x
      x++
    }
    return x
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <ClipboardCheck size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Attendance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Subject-wise attendance overview</p>
        </div>
      </div>

      {/* Overall */}
      <div className={`rounded-2xl p-6 border ${attendancePct >= 75 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium">Overall Attendance</p>
            <p className={`text-5xl font-bold mt-1 ${attendancePct >= 75 ? "text-emerald-400" : "text-red-400"}`}>{attendancePct}%</p>
            <p className="text-slate-400 text-xs mt-2">{attendancePct >= 75 ? "✓ Meeting minimum attendance requirement" : "⚠ Below 75% minimum requirement"}</p>
          </div>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${attendancePct >= 75 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
            {attendancePct >= 75 ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
          </div>
        </div>
      </div>

      {/* Shortage alerts */}
      {low.length > 0 && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 space-y-3">
          <h3 className="text-red-400 font-bold flex items-center gap-2"><AlertCircle size={15} /> Attendance Shortage ({low.length} subjects)</h3>
          {low.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20">
              <div>
                <p className="text-white text-sm font-semibold">{s.name}</p>
                <p className="text-slate-400 text-xs">{s.present}/{s.total} classes attended</p>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-bold">{s.pct}%</p>
                <p className="text-slate-400 text-[10px]">Need {classesNeeded(s)} more classes</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subject-wise table */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-white font-bold flex items-center gap-2"><TrendingUp size={15} /> Subject-Wise Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/20">
                {["Subject", "Code", "Present", "Total", "Percentage", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectAttendance.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No attendance records found.</td></tr>
              ) : subjectAttendance.map((s: any) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white text-sm font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-teal-400 text-xs font-mono">{s.code}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{s.present}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{s.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.pct >= 75 ? "bg-emerald-400" : s.pct >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${s.pct >= 75 ? "text-emerald-400" : s.pct >= 60 ? "text-amber-400" : "text-red-400"}`}>{s.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.pct >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {s.pct >= 75 ? "OK" : "Shortage"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
