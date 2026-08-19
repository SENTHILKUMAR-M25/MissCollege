import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { redirect } from "next/navigation"
import { Award } from "lucide-react"

export default async function StudentExaminationsPage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { marks, subjects } = result.data

  const subjectMap = Object.fromEntries(subjects.map((s: any) => [s.id, s]))
  const grouped: Record<string, any[]> = {}
  marks.forEach((m: any) => {
    if (!grouped[m.subjectId]) grouped[m.subjectId] = []
    grouped[m.subjectId].push(m)
  })

  const avgMark = marks.length > 0 ? Math.round(marks.reduce((s: number, m: any) => s + m.mark, 0) / marks.length) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <Award size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Examinations</h1>
          <p className="text-gray-500 text-sm mt-0.5">Internal marks and academic performance</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Marks Entered", value: marks.length },
          { label: "Subjects with Marks", value: Object.keys(grouped).length },
          { label: "Average Mark", value: `${avgMark}/100` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-200 p-4 text-center">
            <p className="text-gray-500 text-xs uppercase">{label}</p>
            <p className="text-black text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
          <Award size={32} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No internal marks recorded yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([subjectId, subMarks]) => {
          const sub = subjectMap[subjectId] || subMarks[0]?.subject
          return (
            <div key={subjectId} className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-black font-bold">{subMarks[0]?.subjectName || sub?.name}</p>
                <p className="text-[#2F2FE4] text-xs font-mono">{subMarks[0]?.subjectCode || sub?.code} · Sem {subMarks[0]?.semester || sub?.semester}</p>
              </div>
              <div className="divide-y divide-gray-100">
                {subMarks.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3">
                    <p className="text-gray-700 text-sm">{m.examType}</p>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.mark >= 75 ? "bg-emerald-400" : m.mark >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${m.mark}%` }} />
                      </div>
                      <span className={`text-base font-bold ${m.mark >= 75 ? "text-emerald-400" : m.mark >= 50 ? "text-amber-400" : "text-red-400"}`}>{m.mark}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
