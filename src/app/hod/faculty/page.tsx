import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { Users, BookOpen, Clock, Crown, Hourglass } from "lucide-react"

export default async function HodFacultyPage() {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = me.departmentId

  const facultyList = await prisma.faculty.findMany({
    where: { departmentId: deptId },
    include: {
      user: { select: { name: true, email: true } },
      subjects: { select: { id: true, name: true, code: true } },
      timetables: { select: { id: true } },
      hodAssignments: { where: { isActive: true }, select: { id: true } },
      facultySubjects: {
        where: { isActive: true },
        include: {
          subject: { select: { code: true, name: true, semester: true, totalHoursPerWeek: true } },
        },
      },
    },
    orderBy: { user: { createdAt: "asc" } },
  })

  const totalAssignedHours = facultyList.reduce((sum, f) => sum + f.facultySubjects.reduce((s, fs) => s + (fs.assignedHours || 0), 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-black text-2xl font-bold">Faculty Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Department of {me.department.name} • {facultyList.length} members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-gray-200 p-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Faculty</p>
          <p className="text-2xl font-bold text-black">{facultyList.length}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Assigned Subjects</p>
          <p className="text-2xl font-bold text-[#2F2FE4]">{facultyList.reduce((a, f) => a + f.facultySubjects.length, 0)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Allocated Hours</p>
          <p className="text-2xl font-bold text-emerald-400">{totalAssignedHours}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-black font-bold">Faculty Workload Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Faculty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Subjects</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hours Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Classes / Week</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500 text-sm">No faculty in this department.</td></tr>
              ) : (
                facultyList.map((f) => {
                  const hours = f.facultySubjects.reduce((sum, fs) => sum + (fs.assignedHours || 0), 0)
                  return (
                    <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white font-bold text-xs">
                            {f.user.name?.charAt(0) || "F"}
                          </div>
                          <div>
                            <p className="text-black text-sm font-medium flex items-center gap-1.5">
                              {f.user.name}
                              {f.hodAssignments.length > 0 && <Crown size={11} className="text-amber-400" />}
                            </p>
                            <p className="text-gray-400 text-xs">{f.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{f.designation}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {f.facultySubjects.length === 0 ? (
                            <span className="text-gray-400 text-xs">No subjects</span>
                          ) : (
                            f.facultySubjects.map((fs) => (
                              <span key={fs.id} className="px-1.5 py-0.5 rounded bg-[#2F2FE4]/10 text-[#2F2FE4] text-[10px] font-medium">
                                {fs.subject.code}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-gray-700 text-sm">{hours} hrs</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-sm">{f.timetables.length}</td>
                      <td className="px-4 py-3">
                        {f.hodAssignments.length > 0 ? (
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400">HoD</span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">Active</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
