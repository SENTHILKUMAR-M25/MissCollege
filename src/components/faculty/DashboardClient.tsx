"use client"

import { CalendarDays, Bell } from "lucide-react"

function priorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "HIGH": return "bg-red-500/10 text-red-400 border border-red-500/20"
    case "MEDIUM": return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    case "LOW": return "bg-slate-500/10 text-slate-400 border border-slate-500/20"
    default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20"
  }
}

export default function DashboardClient({
  timetable,
  notices,
}: {
  timetable: any[]
  notices: any[]
}) {
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" })

  return (
    <>
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <CalendarDays size={16} className="text-teal-400" /> Today&apos;s Classes
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">{todayName} schedule</p>
        </div>
        {timetable.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No classes scheduled for today.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {timetable.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-white text-sm font-semibold">{t.subject?.name || "Class"}</p>
                  <p className="text-slate-400 text-xs">Class {t.className} - {t.section} • {t.classroom}</p>
                </div>
                <div className="text-right">
                  <p className="text-teal-400 text-xs font-medium">{t.startTime} - {t.endTime}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-4">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            <Bell size={16} className="text-teal-400" /> Recent Notices
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">Latest announcements</p>
        </div>
        {notices.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No notices available.</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notices.map((n: any) => (
              <div key={n.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{n.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{n.description}</p>
                  <p className="text-slate-500 text-[10px] mt-1">{n.creator?.name} • {new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${priorityColor(n.priority || "LOW")}`}>
                  {n.priority || "LOW"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
