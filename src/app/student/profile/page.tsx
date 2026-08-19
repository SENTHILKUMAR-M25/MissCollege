import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { requireStudent } from "@/lib/permissions"

export default async function StudentProfilePage() {
  const user = await requireStudent()
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      department: true,
      course: true,
      user: { select: { name: true, email: true, passwordChanged: true, createdAt: true, avatar: true } },
    },
  })
  if (!student) redirect("/unauthorized")

  const initials = student.user.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "ST"
  const age = student.dob ? (() => {
    const diff = Date.now() - new Date(student.dob).getTime()
    return Math.abs(new Date(diff).getUTCFullYear() - 1970)
  })() : "N/A"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
              {student.user.avatar ? (
                <img src={student.user.avatar} alt={student.user.name || ""} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h2 className="text-black text-lg font-bold">{student.user.name}</h2>
            <p className="text-[#2F2FE4] font-mono text-sm font-semibold mt-0.5">ID: {student.registerNumber}</p>
            <div className="mt-3">
              <span className="inline-block px-3 py-1 rounded-lg bg-[#2F2FE4]/10 text-[#2F2FE4] text-xs font-bold">
                {student.course?.name || "Student"}
              </span>
            </div>
          </div>
          <div className="w-full space-y-2 mt-2">
            <span className={`w-full block px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-center ${student.user.passwordChanged ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              {student.user.passwordChanged ? "Password Updated" : "Default Password Active"}
            </span>
            <Link href="/student/settings" className="block w-full px-3 py-1.5 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold text-center hover:bg-[#2F2FE4]/10 transition-colors">
              Change Password
            </Link>
          </div>
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6">
          <h3 className="text-black font-bold mb-5">Student Details</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Roll No</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{student.registerNumber}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Student Name</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{student.user.name}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Father / Guardian Name</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{student.parentName || "N/A"}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Date of Birth</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{student.dob ? new Date(student.dob).toLocaleDateString("en-IN") : "N/A"}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Gender</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{student.gender || "N/A"}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Age</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{age}</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-400 text-sm font-semibold w-52 shrink-0">Course Name</span>
              <span className="text-gray-500 text-sm mx-1">:</span>
              <span className="text-black text-sm">{student.course ? `${student.course.name} (${student.course.code})` : "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
