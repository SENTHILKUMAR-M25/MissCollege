import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { redirect } from "next/navigation"
import {
  BookOpen, ClipboardCheck, FileText, Award, AlertCircle,
  Bell, CalendarDays, GraduationCap, TrendingUp
} from "lucide-react"
import Link from "next/link"

const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function AttBadge({ pct }: { pct: number }) {
  const color = pct >= 75 ? "text-emerald-400 bg-emerald-500/10" : pct >= 60 ? "text-amber-400 bg-amber-500/10" : "text-red-400 bg-red-500/10"
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>{pct}%</span>
}

export default async function StudentDashboard() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { student, attendancePct, subjectAttendance, assignments, notices, timetable } = result.data
  const today = new Date().getDay() === 0 ? 7 : new Date().getDay()
  const todayClasses = timetable.filter((t: any) => t.dayOfWeek === today)
  const pending = assignments.filter((a: any) => a.submissions.length === 0)
  const lowAtt = subjectAttendance.filter((s: any) => s.pct < 75)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-white border border-[#2F2FE4]/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-black text-2xl font-bold">Welcome, {student.user.name?.split(" ")[0]}!</h1>
            <p className="text-[#2F2FE4] text-sm mt-1">{student.department.name} · {student.course.name} · Sem {student.semester} · Sec {student.section}</p>
            <p className="text-gray-500 text-xs mt-0.5">{student.registerNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs">Overall Attendance</p>
            <p className={`text-3xl font-bold mt-1 ${attendancePct >= 75 ? "text-emerald-400" : attendancePct >= 60 ? "text-amber-400" : "text-red-400"}`}>{attendancePct}%</p>
            {attendancePct < 75 && <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1 justify-end"><AlertCircle size={10} /> Below minimum</p>}
          </div>
        </div>
      </div>

      {/* Password change alert */}
      {!student.user.passwordChanged && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-300 text-sm font-semibold">Default Password Active</p>
            <p className="text-amber-400/70 text-xs">Please change your password for account security.</p>
          </div>
          <Link href="/student/settings" className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors">Change Now</Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Subjects", value: subjectAttendance.length, icon: BookOpen, color: "bg-[#2F2FE4]/10 text-[#2F2FE4]" },
          { label: "Attendance", value: `${attendancePct}%`, icon: ClipboardCheck, color: "bg-emerald-500/10 text-emerald-400" },
          { label: "Pending Assignments", value: pending.length, icon: FileText, color: "bg-amber-500/10 text-amber-400" },
          { label: "Low Attendance Subjects", value: lowAtt.length, icon: AlertCircle, color: lowAtt.length > 0 ? "bg-red-500/10 text-red-400" : "bg-gray-100 text-gray-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
              <p className="text-black text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-black font-bold flex items-center gap-2"><CalendarDays size={16} className="text-[#2F2FE4]" /> Today&apos;s Classes</h3>
            <Link href="/student/timetable" className="text-[#2F2FE4] text-xs hover:text-[#2F2FE4]">View All</Link>
          </div>
          {todayClasses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No classes scheduled today.</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 border border-gray-100">
                  <div>
                    <p className="text-black text-sm font-semibold">{t.subject?.name || "Class"}</p>
                    <p className="text-gray-500 text-xs">{t.faculty?.user?.name} · {t.classroom}</p>
                  </div>
                  <p className="text-[#2F2FE4] text-xs font-medium">{t.startTime} - {t.endTime}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject-wise Attendance */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-black font-bold flex items-center gap-2"><TrendingUp size={16} className="text-[#2F2FE4]" /> Subject Attendance</h3>
            <Link href="/student/attendance" className="text-[#2F2FE4] text-xs hover:text-[#2F2FE4]">Details</Link>
          </div>
          {subjectAttendance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No attendance data yet.</p>
          ) : (
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {subjectAttendance.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-xs font-medium truncate">{s.name}</p>
                    <p className="text-gray-400 text-[10px]">{s.present}/{s.total} classes</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      {/* <div className={`h-full rounded-full ${s.pct >= 75 ? "bg-emerald-400" : s.pct >= 60 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${s.pct}%` }} /> */}
                    </div>
                    <AttBadge pct={s.pct} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notices */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
          <h3 className="text-black font-bold flex items-center gap-2"><Bell size={16} className="text-[#2F2FE4]" /> Notices</h3>
          {notices.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No notices.</p>
          ) : (
            <div className="space-y-2">
              {notices.map((n: any) => (
                <div key={n.id} className="p-3 rounded-xl bg-gray-100 border border-gray-100">
                  <p className="text-black text-sm font-semibold">{n.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{n.description}</p>
                  <p className="text-gray-400 text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Assignments */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-black font-bold flex items-center gap-2"><FileText size={16} className="text-[#2F2FE4]" /> Pending Assignments</h3>
            <Link href="/student/assignments" className="text-[#2F2FE4] text-xs hover:text-[#2F2FE4]">View All</Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">All assignments submitted!</p>
          ) : (
            <div className="space-y-2">
              {pending.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-100 border border-gray-100">
                  <div>
                    <p className="text-black text-sm font-semibold">{a.title}</p>
                    <p className="text-gray-500 text-xs">{a.subject?.name}</p>
                  </div>
                  <p className="text-amber-400 text-xs font-medium">Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
