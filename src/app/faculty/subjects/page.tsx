import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultySubjects, getFacultyTimetable } from "@/actions/faculty-portal"
import { BookOpen } from "lucide-react"

export default async function FacultySubjectsPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const [subjectsResult, timetableResult] = await Promise.all([
    getFacultySubjects(faculty.id),
    getFacultyTimetable(faculty.id),
  ])

  if (!subjectsResult.success) {
    return <div className="text-red-400">Failed to load subjects</div>
  }

  const subjects = subjectsResult.data
  const timetableEntries = timetableResult.success ? timetableResult.data : []

  const subjectClassCount: Record<string, number> = {}
  timetableEntries.forEach((t: any) => {
    if (t.subjectId) {
      subjectClassCount[t.subjectId] = (subjectClassCount[t.subjectId] || 0) + 1
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Subjects</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {faculty.department.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">No subjects assigned yet.</p>
          </div>
        ) : (
          subjects.map((s: any) => (
            <div key={s.id} className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3 hover:border-[#2F2FE4]/20 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-black font-bold text-sm">{s.name}</h3>
                  <p className="text-[#2F2FE4] text-xs font-mono">{s.code}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${s.semester % 2 === 0 ? "bg-[#2F2FE4]/10 text-[#2F2FE4]" : "bg-[#2F2FE4]/10 text-[#2F2FE4]"}`}>
                  Sem {s.semester}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{s.credits} Credits</span>
                <span>•</span>
                <span>Assigned Classes: {subjectClassCount[s.id] || 0}</span>
              </div>
              <p className="text-gray-400 text-xs">Subject description placeholder - teachings will be added here.</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
