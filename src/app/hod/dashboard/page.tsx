import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Users, GraduationCap, BookOpen, CalendarDays, FileText, ArrowRight, ShieldCheck, Clock, AlertCircle, UsersRound } from "lucide-react"

export default async function HodDashboardPage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId
  const deptName = me.department.name

  const [
    facultyCount, studentCount, subjectCount, timetableCount,
    recentLeaves, facultyList, unassignedCount,
    totalAllocatedHours, activeSubjectsCount, inactiveSubjectsCount,
    semesterCounts,
    classAssignmentStats,
  ] = await Promise.all([
    prisma.faculty.count({ where: { departmentId: deptId } }),
    prisma.student.count({ where: { departmentId: deptId } }),
    prisma.subject.count({ where: { departmentId: deptId } }),
    prisma.timetable.count({ where: { departmentId: deptId } }),
    prisma.leaveRequest.findMany({
      where: { departmentId: deptId },
      include: { faculty: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.faculty.findMany({
      where: { departmentId: deptId },
      include: {
        user: { select: { name: true, email: true } },
        subjects: { select: { code: true, id: true } },
        facultySubjects: { where: { isActive: true }, include: { subject: { select: { code: true, name: true, semester: true } } } },
        timetables: { select: { id: true } },
      },
      take: 5,
    }),
    prisma.subject.count({ where: { departmentId: deptId, isActive: true, OR: [{ facultyId: null }, { facultySubjects: { none: {} } }] } }),
    prisma.facultySubject.aggregate({
      where: { isActive: true, subject: { departmentId: deptId } },
      _sum: { assignedHours: true },
    }),
    prisma.subject.count({ where: { departmentId: deptId, isActive: true } }),
    prisma.subject.count({ where: { departmentId: deptId, isActive: false } }),
    (async () => {
      const counts: Record<number, number> = {}
      for (let s = 1; s <= 8; s++) {
        counts[s] = await prisma.subject.count({ where: { departmentId: deptId, semester: s, isActive: true } })
      }
      return counts
    })(),
    (async () => {
      const totalClasses = await prisma.student.findMany({
        where: { departmentId: deptId },
        select: { semester: true, section: true },
      })
      const uniqueClasses = new Set(totalClasses.map(s => `${s.semester}-${s.section}`))
      const assignedClasses = await prisma.classAssignment.count({ where: { departmentId: deptId, assignmentStatus: "ACTIVE" } })
      return {
        totalClasses: uniqueClasses.size,
        assignedClasses,
        unassignedClasses: uniqueClasses.size - assignedClasses,
        classAdvisorCount: Number(await prisma.$queryRaw<{ count: BigInt }>`SELECT COUNT(DISTINCT "facultyId")::bigint AS count FROM "ClassAssignment" WHERE "departmentId" = ${deptId} AND "assignmentStatus" = 'ACTIVE'`),
        recentAssignments: await prisma.classAssignment.findMany({
          where: { departmentId: deptId, assignmentStatus: "ACTIVE" },
          include: { faculty: { include: { user: { select: { name: true } } } } },
          orderBy: { assignedAt: "desc" },
          take: 5,
        }),
      }
    })(),
  ])

  const totalHours = totalAllocatedHours._sum.assignedHours || 0
  const stats = [
    { label: "Faculty Members", value: facultyCount, icon: Users, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Students", value: studentCount, icon: GraduationCap, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Active Subjects", value: activeSubjectsCount, icon: BookOpen, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Classes / Week", value: timetableCount, icon: CalendarDays, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Unassigned Subjects", value: unassignedCount, icon: AlertCircle, color: "from-red-500/20 to-rose-500/10 text-red-400" },
    { label: "Allocated Hours", value: totalHours, icon: Clock, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Total Classes", value: classAssignmentStats.totalClasses, icon: UsersRound, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Assigned Classes", value: classAssignmentStats.assignedClasses, icon: UsersRound, color: "from-[#2F2FE4]/10 to-[#2F2FE4]/5 text-[#2F2FE4]" },
    { label: "Unassigned Classes", value: classAssignmentStats.unassignedClasses, icon: AlertCircle, color: "from-amber-500/20 to-orange-500/10 text-amber-400" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black text-2xl font-bold">HOD Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Department of {deptName} overview</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold">
          <ShieldCheck size={14} /> Active HoD
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-black text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <Icon size={22} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-black font-bold text-base">Department Faculty</h3>
              <p className="text-gray-400 text-xs mt-0.5">Quick roster view</p>
            </div>
            <a href="/hod/faculty" className="text-xs text-[#2F2FE4] hover:text-[#4F6FE4] flex items-center gap-1 transition-all">
              View all <ArrowRight size={12} />
            </a>
          </div>

          <div className="divide-y divide-gray-100">
            {facultyList.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">No faculty members found in this department.</p>
            ) : (
              facultyList.map((f) => {
                const totalHours = f.facultySubjects.reduce((sum, fs) => sum + (fs.assignedHours || 0), 0)
                return (
                  <div key={f.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold text-xs">
                        {f.user.name?.charAt(0) || "F"}
                      </div>
                      <div>
                        <p className="text-black text-sm font-semibold">{f.user.name}</p>
                        <p className="text-gray-400 text-xs">{f.id} • {f.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="block text-gray-700 text-[10px]">{f.facultySubjects.length} subjects</span>
                        <span className="text-gray-400 text-[10px]">{totalHours} hrs/week</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4">
          <div>
            <h3 className="text-black font-bold text-base">Subject Overview</h3>
            <p className="text-gray-400 text-xs mt-0.5">Semester-wise distribution</p>
          </div>
          <div className="space-y-2">
            {Object.entries(semesterCounts).map(([sem, count]) => (
              <div key={sem} className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Semester {sem}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-[#2F2FE4]/70 rounded-full" style={{ width: `${count ? Math.max((count / (activeSubjectsCount || 1)) * 100, 4) : 0}%` }} />
                  </div>
                  <span className="text-black text-xs font-semibold w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <span>Active: {activeSubjectsCount}</span>
            <span>Inactive: {inactiveSubjectsCount}</span>
            <span>Unassigned: {unassignedCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-black font-bold text-base">Recent Class Assignments</h3>
            <p className="text-gray-400 text-xs mt-0.5">Latest class advisor assignments</p>
          </div>
          <a href="/hod/class-assignments" className="text-xs text-[#2F2FE4] hover:text-[#4F6FE4] flex items-center gap-1 transition-all">
            View all <ArrowRight size={12} />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Semester", "Section", "Academic Year", "Class Advisor", "Assigned Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classAssignmentStats.recentAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">No class assignments found.</td>
                </tr>
              ) : (
                classAssignmentStats.recentAssignments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-3 text-black text-sm font-medium">Semester {a.semester}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">Section {a.section}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{a.academicYear}</td>
                    <td className="px-4 py-3 text-black text-sm font-medium">{a.faculty.user.name}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-black font-bold text-base">Recent Leave Requests</h3>
            <p className="text-gray-400 text-xs mt-0.5">Latest leave submissions from your department</p>
          </div>
          <a href="/hod/leave" className="text-xs text-[#2F2FE4] hover:text-[#4F6FE4] flex items-center gap-1 transition-all">
            View all <ArrowRight size={12} />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Faculty Name", "Leave Type", "Start Date", "End Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLeaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">No leave requests found.</td>
                </tr>
              ) : (
                recentLeaves.map((l) => (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
                    <td className="px-4 py-3 text-black text-sm font-medium">{l.faculty.user.name}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{l.leaveType}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{new Date(l.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        l.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400"
                          : l.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
