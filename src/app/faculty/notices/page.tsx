import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyNotices } from "@/actions/faculty-portal"
import { Bell } from "lucide-react"

export default async function FacultyNoticesPage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const result = await getFacultyNotices()
  if (!result.success) {
    return <div className="text-red-400">Failed to load notices</div>
  }

  const notices = result.data

  const priorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH": return "bg-red-500/10 text-red-400 border border-red-500/20"
      case "MEDIUM": return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      case "LOW": return "bg-slate-500/10 text-slate-400 border border-slate-500/20"
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20"
    }
  }

  const audienceColor = (audience: string) => {
    switch (audience?.toUpperCase()) {
      case "ALL": return "bg-violet-500/10 text-violet-400 border border-violet-500/20"
      case "FACULTY": return "bg-teal-500/10 text-teal-400 border border-teal-500/20"
      case "HOD": return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      case "STUDENT": return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Notices</h1>
          <p className="text-slate-400 text-sm mt-0.5">Latest announcements and updates</p>
        </div>
      </div>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
            <p className="text-slate-500 text-sm">No notices available.</p>
          </div>
        ) : (
          notices.map((n: any) => (
            <div key={n.id} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3 hover:border-teal-500/20 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm">{n.title}</h3>
                  <p className="text-slate-300 text-xs mt-1 line-clamp-2">{n.description}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${priorityColor(n.priority ?? "LOW")}`}>
                  {n.priority ?? ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${audienceColor(n.targetAudience)}`}>
                    {n.targetAudience}
                  </span>
                  <span className="text-slate-500 text-[10px]">By {n.creator?.name || "System"}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
