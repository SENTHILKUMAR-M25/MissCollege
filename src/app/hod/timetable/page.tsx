import { requireHod } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import HodTimetableClient from "@/components/hod/HodTimetableClient"
import { CalendarDays } from "lucide-react"

export default async function HodTimetablePage() {
  const user = await requireHod()

  const hod = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!hod) return redirect("/unauthorized")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <CalendarDays size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Timetable Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Generate and manage class timetables</p>
        </div>
      </div>

      <HodTimetableClient departmentName={hod.department.name} departmentId={hod.departmentId} />
    </div>
  )
}
