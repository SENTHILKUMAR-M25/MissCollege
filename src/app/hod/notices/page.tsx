import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Bell } from "lucide-react"
import { getHodNotices } from "@/actions/notices"

export default async function HodNoticesPage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const noticesResult = await getHodNotices(user.id)
  const notices = noticesResult.success ? noticesResult.data : []

  const audienceColors: Record<string, string> = {
    ALL: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    HOD: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    FACULTY: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    STUDENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <Bell size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Notice Board</h1>
          <p className="text-slate-400 text-sm mt-0.5">Announcements for HOD &amp; Faculty — {me.department.name}</p>
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <Bell size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No notices found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 hover:bg-slate-800/70 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold text-sm">{notice.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${audienceColors[notice.targetAudience] || audienceColors.ALL}`}>
                      {notice.targetAudience}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    By {notice.creator?.name || "Admin"} • {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">{notice.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
