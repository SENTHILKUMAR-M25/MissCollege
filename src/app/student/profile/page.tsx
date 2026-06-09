import { requireStudent } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { User, Mail, Phone, Building2, BookOpen, Calendar, GraduationCap, Shield } from "lucide-react"
import Link from "next/link"

export default async function StudentProfilePage() {
  const user = await requireStudent()
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      department: true,
      course: true,
      user: { select: { name: true, email: true, passwordChanged: true, createdAt: true } },
    },
  })
  if (!student) redirect("/unauthorized")

  const fields = [
    { label: "Full Name", value: student.user.name || "N/A", icon: User },
    { label: "Email Address", value: student.user.email, icon: Mail },
    { label: "Mobile Number", value: student.phone || "N/A", icon: Phone },
    { label: "Register Number", value: student.registerNumber, icon: Shield },
    { label: "Department", value: `${student.department.name} (${student.department.code})`, icon: Building2 },
    { label: "Course", value: `${student.course.name} (${student.course.code})`, icon: BookOpen },
    { label: "Current Semester", value: `Semester ${student.semester}`, icon: GraduationCap },
    { label: "Section", value: student.section, icon: User },
    { label: "Admission Year", value: student.admissionYear.toString(), icon: Calendar },
    { label: "Account Created", value: new Date(student.user.createdAt).toLocaleDateString("en-IN"), icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">View your personal and academic information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {student.user.name?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="text-white text-lg font-bold">{student.user.name}</h2>
            <p className="text-teal-400 font-mono text-sm font-semibold mt-0.5">{student.registerNumber}</p>
            <p className="text-slate-400 text-xs mt-1">{student.department.name}</p>
          </div>
          <div className="w-full space-y-2">
            <span className={`w-full block px-3 py-1.5 rounded-xl text-xs font-bold uppercase text-center ${student.user.passwordChanged ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
              {student.user.passwordChanged ? "Password Updated" : "Default Password Active"}
            </span>
            <Link href="/student/settings" className="block w-full px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold text-center hover:bg-teal-500/20 transition-colors">
              Change Password
            </Link>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-5">
          <h3 className="text-white font-bold">Personal & Academic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
                <p className="text-slate-500 text-[10px] uppercase font-semibold mb-1">{label}</p>
                <p className="text-white text-sm font-medium flex items-center gap-2">
                  <Icon size={13} className="text-teal-400 shrink-0" /> {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
