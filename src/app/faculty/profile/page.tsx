import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getFacultyProfile } from "@/actions/faculty-portal"
import { User, Mail, ShieldCheck } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function FacultyProfilePage() {
  const user = await requireFaculty()

  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true, code: true } } },
  })
  if (!faculty) return redirect("/unauthorized")

  const result = await getFacultyProfile(faculty.facultyId)
  if (!result.success || !result.data) {
    return <div className="text-red-400">Failed to load profile</div>
  }

  const profile = result.data

  const initials = (profile.user.name || "F").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-black text-2xl font-bold">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 p-6 space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#2F2FE4]/20 overflow-hidden relative">
              {profile.user.avatar ? (
                <img src={profile.user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
            </div>
            <h2 className="text-black text-lg font-bold mt-3">{profile.user.name}</h2>
            <p className="text-[#2F2FE4] text-sm font-medium">{profile.designation}</p>
            <p className="text-gray-500 text-xs">{profile.department.name} ({profile.department.code})</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
              <Mail size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Email</p>
                <p className="text-black text-xs truncate">{profile.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
              <ShieldCheck size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Faculty ID</p>
                <p className="text-black text-xs">{profile.facultyId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
              <ShieldCheck size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Account Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${profile.accountStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {profile.accountStatus === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-6 space-y-6">
          <div>
            <h3 className="text-black font-bold text-base">Personal Information</h3>
            <p className="text-gray-400 text-xs mt-0.5">Basic details from your account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Full Name</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">{profile.user.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Designation</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">{profile.designation}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Department</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">{profile.department.name} ({profile.department.code})</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Qualification</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">{profile.qualification}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Phone</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">{profile.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Experience</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">{profile.experience ? `${profile.experience} years` : "N/A"}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Link href="/faculty/settings" className="px-4 py-2 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10 transition-all">
              Edit Profile
            </Link>
            <Link href="/faculty/change-password" className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-all">
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
