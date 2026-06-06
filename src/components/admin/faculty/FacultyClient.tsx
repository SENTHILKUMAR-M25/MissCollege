"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Plus,
  Edit2,
  Eye,
  PauseCircle,
  Mail,
  Phone,
  BookOpen,
  User,
  X,
  FileText,
  ChevronRight,
  ChevronLeft,
  Shield,
  GraduationCap,
} from "lucide-react"
import { addFaculty, updateFaculty, suspendFaculty } from "@/actions/faculty"
import toast from "react-hot-toast"
import { ALERT } from "@/lib/alerts"

type DbDepartment = { id: string; name: string }
type DbSubject = { id: string; name: string; code: string; semester: number }
type DbFaculty = {
  id: string
  facultyId: string
  userId: string
  designation: string
  qualification: string
  phone: string | null
  accountStatus: boolean
  gender: string | null
  dateOfBirth: Date | string | null
  profilePhoto: string | null
  alternateNumber: string | null
  address: string | null
  specialization: string | null
  experience: number | null
  joiningDate: Date | string | null
  assignedSemesters: string | null
  assignedSections: string | null
  resumeUrl: string | null
  appointmentOrderUrl: string | null
  joiningLetterUrl: string | null
  eduCertificatesUrl: string | null
  experienceCertificatesUrl: string | null
  aadharCardUrl: string | null
  panCardUrl: string | null
  idCardUrl: string | null
  bankDetailsUrl: string | null
  relievingLetterUrl: string | null
  departmentId: string
  department: DbDepartment
  user: { name: string | null; email: string }
  subjects: DbSubject[]
}

const TABS = [
  { key: "basic", label: "Basic Details" },
  { key: "contact", label: "Contact Details" },
  { key: "professional", label: "Professional Details" },
  { key: "account", label: "Account Details" },
  { key: "academic", label: "Academic Assignment" },
  { key: "documents", label: "Documents" },
]

const REQUIRED_FIELDS: Record<string, string[]> = {
  basic: ["firstName", "lastName"],
  contact: ["email"],
  professional: ["departmentId", "designation", "qualification"],
  account: ["password"],
}

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Guest Lecturer",
  "Head of Department",
]

function splitName(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { firstName: parts[0] || "", lastName: "" }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") }
}

function formatDate(value?: Date | string | null) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function inputDate(value?: Date | string | null) {
  return value ? new Date(value).toISOString().split("T")[0] : ""
}

export default function FacultyClient({
  faculty,
  departments,
  subjects,
}: {
  faculty: DbFaculty[]
  departments: DbDepartment[]
  subjects: DbSubject[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("All")
  const [modal, setModal] = useState<{ mode: "add" | "edit" | "view"; data?: DbFaculty } | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [loading, setLoading] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const filtered = faculty.filter((f) => {
    const query = search.toLowerCase()
    const matchesDepartment = deptFilter === "All" || f.department.name === deptFilter
    const matchesSearch =
      !query ||
      f.facultyId.toLowerCase().includes(query) ||
      (f.user.name || "").toLowerCase().includes(query) ||
      f.designation.toLowerCase().includes(query) ||
      f.department.name.toLowerCase().includes(query)

    return matchesDepartment && matchesSearch
  })

  const handleOpenModal = (mode: "add" | "edit" | "view", data?: DbFaculty) => {
    setActiveTab("basic")
    setSelectedSubjects(data?.subjects?.map((s) => s.id) || [])
    setModal({ mode, data })
  }

  async function handleSuspend(facultyMember: DbFaculty) {
    if (!confirm(`Suspend ${facultyMember.user.name || facultyMember.facultyId}?`)) return

    const res = await suspendFaculty(facultyMember.id)
    if (res.success) {
      toast.success("Faculty suspended")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to suspend")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    for (const tab of TABS) {
      const fields = REQUIRED_FIELDS[tab.key] || []
      const missingField = fields.find((field) => {
        if (field === "password" && modal?.mode === "edit") return false
        const value = formData.get(field)
        return typeof value !== "string" || value.trim() === ""
      })

      if (missingField) {
        setActiveTab(tab.key)
        toast.error(`Please complete ${tab.label}.`)
        return
      }
    }

    setLoading(true)
    formData.set("assignedSubjects", selectedSubjects.join(","))

    try {
      let res
      if (modal?.mode === "edit" && modal.data?.id) {
        formData.append("id", modal.data.id)
        res = await updateFaculty(formData)
      } else {
        res = await addFaculty(formData)
      }

      if (res.success) {
        toast.success(modal?.mode === "edit" ? "Faculty updated!" : "Faculty hired!")
        setModal(null)
        setSelectedSubjects([])
        router.refresh()
      } else {
        toast.error(res.error || "Failed to save")
      }
    } finally {
      setLoading(false)
    }
  }

  const tabIdx = TABS.findIndex((t) => t.key === activeTab)
  const goNext = () => tabIdx < TABS.length - 1 && setActiveTab(TABS[tabIdx + 1].key)
  const goPrev = () => tabIdx > 0 && setActiveTab(TABS[tabIdx - 1].key)
  const toggleSubject = (id: string) =>
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )

  const inp = "w-full bg-[#111844]/60 border border-[#4B5694]/40 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4B5694] transition placeholder:text-slate-500"
  const lbl = "text-slate-400 text-xs font-medium mb-1.5 block"
  const selectedFaculty = modal?.data
  const split = splitName(selectedFaculty?.user.name)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Faculty Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} faculty members found</p>
        </div>
        <button
          onClick={() => handleOpenModal("add")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4B5694] to-[#7288DA] text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-[#4B5694]/25 transition"
        >
          <Plus size={15} /> Hire Faculty
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#111844]/60 border border-[#4B5694]/30 rounded-xl px-3 py-2 flex-1 min-w-56">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty ID, name, department, or designation"
            className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-[#111844]/60 border border-[#4B5694]/30 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none"
        >
          <option value="All">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name} className="bg-[#111844]">
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#4B5694]/20 bg-[#111844]/40">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-[#0d1233]/90 text-slate-400 text-xs uppercase">
            <tr>
              {["Faculty ID", "Name", "Department", "Designation", "Qualification", "Experience", "Email", "Phone", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((f) => (
              <tr key={f.id} className="text-sm text-slate-300 hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-[#7288DA] font-semibold">{f.facultyId}</td>
                <td className="px-4 py-3 text-white">{f.user.name}</td>
                <td className="px-4 py-3">{f.department.name}</td>
                <td className="px-4 py-3">{f.designation}</td>
                <td className="px-4 py-3">{f.qualification}</td>
                <td className="px-4 py-3">{f.experience ?? 0} yrs</td>
                <td className="px-4 py-3">{f.user.email}</td>
                <td className="px-4 py-3">{f.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                    f.accountStatus ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {f.accountStatus ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button title="View" onClick={() => handleOpenModal("view", f)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#4B5694]/30 text-slate-400 hover:text-[#7288DA] flex items-center justify-center transition">
                      <Eye size={14} />
                    </button>
                    <button title="Edit" onClick={() => handleOpenModal("edit", f)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#4B5694]/30 text-slate-400 hover:text-[#7288DA] flex items-center justify-center transition">
                      <Edit2 size={14} />
                    </button>
                    <button title="Suspend" onClick={() => handleSuspend(f)} disabled={!f.accountStatus} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 disabled:opacity-30 flex items-center justify-center transition">
                      <PauseCircle size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center border border-[#4B5694]/20 rounded-xl bg-[#111844]/30">
          <p className="text-slate-400 text-sm">No faculty members found.</p>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl bg-[#0d1233] border border-[#4B5694]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#4B5694]/20 shrink-0">
                <h2 className="text-white font-bold text-lg">
                  {modal.mode === "add" ? "Hire Faculty" : modal.mode === "edit" ? "Edit Faculty" : "Faculty Profile"}
                </h2>
                <button type="button" onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">
                  <X size={15} />
                </button>
              </div>

              {modal.mode === "view" && selectedFaculty ? (
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center mb-6">
                    {selectedFaculty.profilePhoto ? (
                      <img src={selectedFaculty.profilePhoto} alt={selectedFaculty.user.name || "Faculty"} className="w-24 h-24 rounded-full object-cover ring-2 ring-[#7288DA]/50" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4B5694] to-[#7288DA] flex items-center justify-center text-white text-3xl font-bold">
                        {selectedFaculty.user.name?.charAt(0) || "F"}
                      </div>
                    )}
                    <div>
                      <p className="text-[#7288DA] text-sm font-semibold">{selectedFaculty.facultyId}</p>
                      <h3 className="text-white text-2xl font-bold">{selectedFaculty.user.name}</h3>
                      <p className="text-slate-300 mt-1">{selectedFaculty.designation} - {selectedFaculty.department.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {[
                      ["Faculty ID", selectedFaculty.facultyId],
                      ["Department", selectedFaculty.department.name],
                      ["Designation", selectedFaculty.designation],
                      ["Qualification", selectedFaculty.qualification],
                      ["Experience", `${selectedFaculty.experience ?? 0} years`],
                      ["Assigned Classes", selectedFaculty.assignedSections || "Not assigned"],
                      ["Assigned Semesters", selectedFaculty.assignedSemesters || "Not assigned"],
                      ["Joining Date", formatDate(selectedFaculty.joiningDate)],
                      ["Email", selectedFaculty.user.email],
                      ["Phone", selectedFaculty.phone || "Not set"],
                      ["Alternate Phone", selectedFaculty.alternateNumber || "Not set"],
                      ["Status", selectedFaculty.accountStatus ? "Active" : "Suspended"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-[#4B5694]/20 bg-[#111844]/45 p-4">
                        <p className="text-slate-500 text-xs uppercase font-semibold mb-1">{label}</p>
                        <p className="text-white">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-[#4B5694]/20 bg-[#111844]/45 p-4">
                    <p className="text-slate-500 text-xs uppercase font-semibold mb-3">Assigned Subjects</p>
                    {selectedFaculty.subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedFaculty.subjects.map((s) => (
                          <span key={s.id} className="px-3 py-1.5 rounded-lg bg-[#4B5694]/20 text-[#c7d2fe] text-xs">
                            {s.code} - {s.name} (Sem {s.semester})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No subjects assigned.</p>
                    )}
                  </div>

                  <div className="mt-5 rounded-xl border border-[#4B5694]/20 bg-[#111844]/45 p-4">
                    <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Contact Information</p>
                    <p className="text-slate-300 text-sm">{selectedFaculty.address || "Address not set"}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-4 pt-3 flex gap-1 border-b border-[#4B5694]/20 overflow-x-auto shrink-0 hide-scrollbar">
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 pb-3 text-xs font-semibold transition-colors whitespace-nowrap border-b-2 ${
                          activeTab === tab.key ? "text-[#7288DA] border-[#7288DA]" : "text-slate-500 border-transparent hover:text-slate-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden flex-1">
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                      <div className={activeTab === "basic" ? "grid grid-cols-2 gap-5" : "hidden"}>
                        <div className="col-span-2">
                          <label className={lbl}>Faculty ID</label>
                          <input readOnly value={selectedFaculty?.facultyId || "Generated after saving"} className={`${inp} opacity-50 cursor-not-allowed`} />
                        </div>
                        <div>
                          <label className={lbl}>First Name *</label>
                          <input name="firstName" defaultValue={split.firstName} required placeholder="Senthil" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Last Name *</label>
                          <input name="lastName" defaultValue={split.lastName} required placeholder="Kumar" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Gender</label>
                          <select name="gender" defaultValue={selectedFaculty?.gender || ""} className={inp}>
                            <option value="">Select Gender</option>
                            <option value="Male" className="bg-[#0d1233]">Male</option>
                            <option value="Female" className="bg-[#0d1233]">Female</option>
                            <option value="Other" className="bg-[#0d1233]">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Date of Birth</label>
                          <input name="dateOfBirth" type="date" defaultValue={inputDate(selectedFaculty?.dateOfBirth)} className={inp} />
                        </div>
                        <div className="col-span-2">
                          <label className={lbl}>Profile Photo</label>
                          {selectedFaculty?.profilePhoto && (
                            <a href={selectedFaculty.profilePhoto} target="_blank" rel="noreferrer" className="text-[#7288DA] text-xs mb-2 flex items-center gap-1 hover:underline w-fit">
                              <FileText size={12} /> View Current Photo
                            </a>
                          )}
                          <input name="profilePhoto" type="file" accept="image/*" className={`${inp} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#4B5694]/30 file:text-[#7288DA] hover:file:bg-[#4B5694]/50 cursor-pointer`} />
                        </div>
                      </div>

                      <div className={activeTab === "contact" ? "grid grid-cols-2 gap-5" : "hidden"}>
                        <div className="col-span-2">
                          <label className={lbl}>Email Address *</label>
                          <input name="email" type="email" defaultValue={selectedFaculty?.user.email || ""} required placeholder="senthil@college.edu" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Phone *</label>
                          <input name="phone" defaultValue={selectedFaculty?.phone || ""} placeholder="9876543210" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Alternate Number</label>
                          <input name="alternateNumber" defaultValue={selectedFaculty?.alternateNumber || ""} placeholder="9876543210" className={inp} />
                        </div>
                        <div className="col-span-2">
                          <label className={lbl}>Address</label>
                          <textarea name="address" defaultValue={selectedFaculty?.address || ""} rows={3} className={inp} placeholder="Full residential address" />
                        </div>
                      </div>

                      <div className={activeTab === "professional" ? "grid grid-cols-2 gap-5" : "hidden"}>
                        <div>
                          <label className={lbl}>Department *</label>
                          <select name="departmentId" defaultValue={selectedFaculty?.departmentId || ""} required className={inp}>
                            <option value="" disabled>Select Department</option>
                            {departments.map((d) => (
                              <option key={d.id} value={d.id} className="bg-[#0d1233]">{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Designation *</label>
                          <select name="designation" defaultValue={selectedFaculty?.designation || ""} required className={inp}>
                            <option value="" disabled>Select Designation</option>
                            {DESIGNATIONS.map((designation) => (
                              <option key={designation} value={designation} className="bg-[#0d1233]">{designation}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className={lbl}>Qualification *</label>
                          <input name="qualification" defaultValue={selectedFaculty?.qualification || ""} required placeholder="M.Tech" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Specialization</label>
                          <input name="specialization" defaultValue={selectedFaculty?.specialization || ""} placeholder="Artificial Intelligence" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Experience (Years) *</label>
                          <input name="experience" type="number" min="0" defaultValue={selectedFaculty?.experience ?? ""} className={inp} />
                        </div>
                        <div className="col-span-2">
                          <label className={lbl}>Joining Date *</label>
                          <input name="joiningDate" type="date" defaultValue={inputDate(selectedFaculty?.joiningDate) || "2026-06-05"} className={inp} />
                        </div>
                      </div>

                      <div className={activeTab === "account" ? "space-y-5" : "hidden"}>
                        <div className="p-4 rounded-xl bg-[#4B5694]/10 border border-[#4B5694]/20 grid grid-cols-2 gap-4">
                          <div>
                            <label className={lbl}>Login Email</label>
                            <input readOnly value={selectedFaculty?.user.email || "Set from Contact Details"} className={`${inp} opacity-50 cursor-not-allowed`} />
                          </div>
                          <div>
                            <label className={lbl}>Role</label>
                            <input readOnly value="FACULTY" className={`${inp} opacity-50 cursor-not-allowed text-[#7288DA] font-semibold`} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <div className="col-span-2">
                            <label className={lbl}>Password {modal.mode === "edit" ? "(Leave blank to keep current)" : "*"}</label>
                            <input name="password" type="password" required={modal.mode === "add"} placeholder={modal.mode === "edit" ? "Leave blank to keep unchanged" : "Enter password"} autoComplete="new-password" className={inp} />
                          </div>
                          <div className="col-span-2">
                            <label className={lbl}>Status</label>
                            <select name="accountStatus" defaultValue={selectedFaculty?.accountStatus === false ? "false" : "true"} className={inp}>
                              <option value="true" className="bg-[#0d1233]">Active</option>
                              <option value="false" className="bg-[#0d1233]">Suspended</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#4B5694]/10 border border-[#4B5694]/20">
                          <Shield size={16} className="text-[#7288DA] mt-0.5 shrink-0" />
                          <p className="text-slate-400 text-xs leading-relaxed">A welcome email is sent when SMTP settings are configured.</p>
                        </div>
                      </div>

                      <div className={activeTab === "academic" ? "space-y-5" : "hidden"}>
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label className={lbl}>Assigned Semesters</label>
                            <input name="assignedSemesters" defaultValue={selectedFaculty?.assignedSemesters || ""} placeholder="1,2,3" className={inp} />
                          </div>
                          <div>
                            <label className={lbl}>Assigned Classes</label>
                            <input name="assignedSections" defaultValue={selectedFaculty?.assignedSections || ""} placeholder="A,B" className={inp} />
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>Assigned Subjects</label>
                          {subjects.length === 0 ? (
                            <p className="text-slate-500 text-sm p-3 rounded-xl bg-[#4B5694]/10 border border-[#4B5694]/20">No subjects found. Please add subjects first.</p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                              {subjects.map((s) => (
                                <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedSubjects.includes(s.id) ? "bg-[#4B5694]/20 border-[#4B5694]/60 text-white" : "bg-[#111844]/40 border-[#4B5694]/20 text-slate-400 hover:border-[#4B5694]/40"}`}>
                                  <input type="checkbox" checked={selectedSubjects.includes(s.id)} onChange={() => toggleSubject(s.id)} className="rounded accent-[#7288DA]" />
                                  <GraduationCap size={14} className="shrink-0 text-[#7288DA]" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{s.name}</p>
                                    <p className="text-xs text-slate-500">{s.code} - Sem {s.semester}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={activeTab === "documents" ? "grid grid-cols-2 gap-5" : "hidden"}>
                        {[
                          { label: "Resume / CV", name: "resumeUrl" },
                          { label: "Appointment Order", name: "appointmentOrderUrl" },
                          { label: "Joining Letter", name: "joiningLetterUrl" },
                          { label: "Educational Certificates", name: "eduCertificatesUrl" },
                          { label: "Experience Certificates", name: "experienceCertificatesUrl" },
                          { label: "Aadhar Card", name: "aadharCardUrl" },
                          { label: "PAN Card", name: "panCardUrl" },
                          { label: "Identity Card Copy", name: "idCardUrl" },
                          { label: "Bank Account Details", name: "bankDetailsUrl" },
                          { label: "Relieving Letter", name: "relievingLetterUrl" },
                        ].map((doc) => (
                          <div key={doc.name}>
                            <label className={lbl}>{doc.label}</label>
                            {(selectedFaculty as any)?.[doc.name] && (
                              <a href={(selectedFaculty as any)[doc.name]} target="_blank" rel="noreferrer" className="text-[#7288DA] text-xs mb-2 flex items-center gap-1 hover:underline w-fit">
                                <FileText size={12} /> View Current
                              </a>
                            )}
                            <input type="file" name={doc.name} className={`${inp} file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#4B5694]/30 file:text-[#7288DA] hover:file:bg-[#4B5694]/50 cursor-pointer`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#4B5694]/20 bg-[#0d1233]/60 shrink-0">
                      <div className="flex gap-2">
                        <button type="button" onClick={goPrev} disabled={tabIdx === 0} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">
                          <ChevronLeft size={14} /> Prev
                        </button>
                        <button type="button" onClick={goNext} disabled={tabIdx === TABS.length - 1} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:border-white/20 hover:text-white transition">
                          Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4B5694] to-[#7288DA] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-[#4B5694]/20">
                          {loading ? "Saving..." : modal.mode === "add" ? "Save Faculty" : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
