import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { TrendingUp, Users, GraduationCap, BookOpen, Calendar, Activity, ArrowRight } from "lucide-react"

export default async function HodReportsPage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId

  const [facultyCount, studentCount, subjectCount, timetableCount, pendingLeaves, totalLeaves] = await Promise.all([
    prisma.faculty.count({ where: { departmentId: deptId } }),
    prisma.student.count({ where: { departmentId: deptId } }),
    prisma.subject.count({ where: { departmentId: deptId } }),
    prisma.timetable.count({ where: { departmentId: deptId } }),
    prisma.leaveRequest.count({ where: { departmentId: deptId, status: "PENDING" } }),
    prisma.leaveRequest.count({ where: { departmentId: deptId } }),
  ])

  const subjectsWithFaculty = await prisma.subject.count({
    where: { departmentId: deptId, facultyId: { not: null } },
  })

  const reportCards = [
    {
      title: "Faculty Overview",
      icon: Users,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/10",
      stats: [
        { label: "Total Faculty", value: facultyCount },
        { label: "Subjects Covered", value: subjectsWithFaculty },
        { label: "Weekly Classes", value: timetableCount },
      ],
      href: "/hod/faculty",
    },
    {
      title: "Student Overview",
      icon: GraduationCap,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/10",
      stats: [
        { label: "Total Students", value: studentCount },
        { label: "Department", value: me.department.code },
        { label: "Subjects", value: subjectCount },
      ],
      href: "/hod/students",
    },
    {
      title: "Leave Summary",
      icon: Calendar,
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/10",
      stats: [
        { label: "Total Requests", value: totalLeaves },
        { label: "Pending", value: pendingLeaves },
        { label: "Approved", value: totalLeaves - pendingLeaves },
      ],
      href: "/hod/leave",
    },
    {
      title: "Curriculum",
      icon: BookOpen,
      color: "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/10",
      stats: [
        { label: "Total Subjects", value: subjectCount },
        { label: "Assigned", value: subjectsWithFaculty },
        { label: "Unassigned", value: subjectCount - subjectsWithFaculty },
      ],
      href: "/hod/subjects",
    },
    {
      title: "Timetable",
      icon: Activity,
      color: "from-cyan-500/20 to-sky-500/10 text-cyan-400 border-cyan-500/10",
      stats: [
        { label: "Classes/Week", value: timetableCount },
        { label: "Faculty", value: facultyCount },
        { label: "Dept", value: me.department.code },
      ],
      href: "/hod/timetable",
    },
    {
      title: "Attendance",
      icon: TrendingUp,
      color: "from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/10",
      stats: [
        { label: "Students", value: studentCount },
        { label: "Faculty", value: facultyCount },
        { label: "Reports", value: "View" },
      ],
      href: "/hod/attendance",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <TrendingUp size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Reports &amp; Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {me.department.name} — Overview</p>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold">{me.department.name}</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {facultyCount} faculty • {studentCount} students • {subjectCount} subjects
          </p>
        </div>
        <div className="text-right">
          {pendingLeaves > 0 && (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="text-lg font-bold">{pendingLeaves}</span>
              <span className="text-xs">pending leaves</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon
          return (
            <a
              key={card.title}
              href={card.href}
              className={`rounded-2xl bg-gradient-to-br border p-5 hover:scale-[1.02] transition-all group ${card.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Icon size={18} />
                  <h3 className="font-bold text-sm">{card.title}</h3>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {card.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-white text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
