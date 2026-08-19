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
      case "MEDIUM": return "bg-[#2F2FE4]/10 text-[#2F2FE4] border border-[#2F2FE4]/20"
      case "LOW": return "bg-gray-100 text-gray-500 border border-gray-200"
      default: return "bg-gray-100 text-gray-500 border border-gray-200"
    }
  }

  const audienceColor = (audience: string) => {
    switch (audience?.toUpperCase()) {
      case "ALL": return "bg-[#2F2FE4]/10 text-[#2F2FE4] border border-[#2F2FE4]/20"
      case "FACULTY": return "bg-[#2F2FE4]/10 text-[#2F2FE4] border border-[#2F2FE4]/20"
      case "HOD": return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      case "STUDENT": return "bg-[#2F2FE4]/10 text-[#2F2FE4] border border-[#2F2FE4]/20"
      default: return "bg-gray-100 text-gray-500 border border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Notices</h1>
          <p className="text-gray-500 text-sm mt-0.5">Latest announcements and updates</p>
        </div>
      </div>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
            <p className="text-gray-400 text-sm">No notices available.</p>
          </div>
        ) : (
          notices.map((n: any) => (
            <div key={n.id} className="rounded-2xl bg-white border border-gray-200 p-5 space-y-3 hover:border-[#2F2FE4]/20 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-black font-bold text-sm">{n.title}</h3>
                  <p className="text-gray-700 text-xs mt-1 line-clamp-2">{n.description}</p>
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
                  <span className="text-gray-400 text-[10px]">By {n.creator?.name || "System"}</span>
                </div>
                <span className="text-gray-400 text-[10px]">{new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
