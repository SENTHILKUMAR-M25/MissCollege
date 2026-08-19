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
      color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4] border-[#2F2FE4]/10",
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
      color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4] border-[#2F2FE4]/10",
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
      color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4] border-[#2F2FE4]/10",
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
      color: "from-[#2F2FE4]/10 to-[#4F6FE4]/5 text-[#2F2FE4] border-[#2F2FE4]/10",
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
      color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4] border-[#2F2FE4]/10",
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
      color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4] border-[#2F2FE4]/10",
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
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <TrendingUp size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Reports &amp; Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {me.department.name} — Overview</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-black font-bold">{me.department.name}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
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
              className={`rounded-2xl bg-white border p-5 hover:scale-[1.02] transition-all group ${card.color}`}
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
                    <p className="text-black text-lg font-bold">{stat.value}</p>
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
