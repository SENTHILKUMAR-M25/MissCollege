"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, Plus, Edit2, Trash2, Eye, X, GraduationCap, Calendar,
  Phone, Mail, Users, BookOpen, Building2, Shield, AlertCircle,
  CheckCircle2, Key
} from "lucide-react"
import { addStudent, updateStudent, deleteStudent, resetStudentPassword } from "@/actions/students"
import toast from "react-hot-toast"

type Dept = { id: string; name: string; code: string }
type Course = { id: string; name: string; code: string; departmentId?: string }
type Student = {
  id: string
  registerNumber: string
  userId: string
  semester: number
  section: string
  admissionYear: number
  phone: string | null
  dob: Date | string | null
  gender: string | null
  departmentId: string
  department: Dept
  courseId: string
  course: Course
  user: { name: string | null; email: string; isActive: boolean; passwordChanged: boolean; createdAt: Date | string }
}
type Stats = {
  total: number
  active: number
  deptStats: { id: string; name: string; code: string; count: number }[]
  semStats: { semester: number; count: number }[]
} | null

const SEMESTERS = [1, 2, 3, 4, 5, 6]
const SECTIONS = ["A", "B", "C", "D"]
const GENDERS = ["Male", "Female", "Other"]

const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder:text-slate-500"
const sel = "w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-slate-400 text-xs mb-1.5 block font-medium">{label}</label>
      {children}
    </div>
  )
}

// Blank form state
function blankForm() {
  return {
    name: "", email: "", phone: "", dob: "", gender: "",
    departmentId: "", courseId: "", registerNumber: "",
    academicYear: "", semester: "1", section: "A",
    admissionYear: new Date().getFullYear().toString(),
    parentName: "", parentPhone: "", address: "",
  }
}

type FormState = ReturnType<typeof blankForm>

export default function StudentsClient({ students, departments, courses, stats }: {
  students: Student[]
  departments: Dept[]
  courses: Course[]
  stats: Stats
}) {
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("All")
  const [semFilter, setSemFilter] = useState("All")
  const [secFilter, setSecFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [modal, setModal] = useState<{ mode: "add" | "edit" | "view" | "reset"; data?: Student } | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoId, setAutoId] = useState("")
  const [form, setForm] = useState<FormState>(blankForm())
  const [resetDob, setResetDob] = useState("")

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }))

  // Preview auto-generated ID when dept or year changes in add mode
  useEffect(() => {
    if (modal?.mode === "add" && form.departmentId && form.admissionYear) {
      setAutoId("")
      fetch(`/api/student/generate-id?departmentId=${form.departmentId}&year=${form.admissionYear}`)
        .then(r => r.json())
        .then(j => { if (j.success) setAutoId(j.data) })
        .catch(() => {})
    }
  }, [form.departmentId, form.admissionYear, modal?.mode])

  const filteredCourses = useMemo(
    () => form.departmentId ? courses.filter(c => c.departmentId === form.departmentId) : courses,
    [form.departmentId, courses]
  )

  const filtered = useMemo(() =>
    students.filter(s =>
      (deptFilter === "All" || s.departmentId === deptFilter) &&
      (semFilter === "All" || s.semester.toString() === semFilter) &&
      (secFilter === "All" || s.section === secFilter) &&
      (statusFilter === "All" || (statusFilter === "Active" ? s.user.isActive : !s.user.isActive)) &&
      (!search ||
        s.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.user.email.toLowerCase().includes(search.toLowerCase()))
    ), [students, deptFilter, semFilter, secFilter, statusFilter, search]
  )

  function openAdd() {
    setForm(blankForm())
    setAutoId("")
    setModal({ mode: "add" })
  }

  function openEdit(s: Student) {
    setForm({
      name: s.user.name || "",
      email: s.user.email,
      phone: s.phone || "",
      dob: s.dob ? new Date(s.dob).toISOString().split("T")[0] : "",
      gender: s.gender || "",
      departmentId: s.departmentId,
      courseId: s.courseId,
      registerNumber: s.registerNumber,
      academicYear: "",
      semester: s.semester.toString(),
      section: s.section,
      admissionYear: s.admissionYear.toString(),
      parentName: "", parentPhone: "", address: "",
    })
    setModal({ mode: "edit", data: s })
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this student? This cannot be undone.")) return
    const res = await deleteStudent(id)
    res.success ? toast.success("Student deleted") : toast.error(res.error || "Failed to delete")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (modal?.mode === "edit" && modal.data?.id) {
      const res = await updateStudent({
        id: modal.data.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        registerNumber: form.registerNumber,
        departmentId: form.departmentId,
        courseId: form.courseId,
        semester: parseInt(form.semester),
        section: form.section,
        admissionYear: parseInt(form.admissionYear),
      })
      res.success ? (toast.success("Student updated"), setModal(null)) : toast.error(res.error || "Failed")
    } else {
      const res = await addStudent({
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        departmentId: form.departmentId,
        courseId: form.courseId,
        semester: parseInt(form.semester),
        section: form.section,
        admissionYear: parseInt(form.admissionYear),
      })
      if (res.success) {
        toast.success(`Student enrolled — Reg No: ${(res as any).registerNumber}`)
        setModal(null)
      } else {
        toast.error(res.error || "Failed")
      }
    }
    setLoading(false)
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!resetDob) return toast.error("Please enter date of birth")
    setLoading(true)
    const res = await resetStudentPassword(modal!.data!.id, resetDob)
    res.success ? (toast.success("Password reset to DOB (DDMMYYYY)"), setModal(null)) : toast.error(res.error || "Failed")
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={stats.total} icon={Users} color="bg-amber-500/10 text-amber-400" />
          <StatCard label="Active Students" value={stats.active} icon={CheckCircle2} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Departments" value={stats.deptStats.length} icon={Building2} color="bg-blue-500/10 text-blue-400" />
          <StatCard label="Semesters Active" value={stats.semStats.length} icon={BookOpen} color="bg-violet-500/10 text-violet-400" />
        </div>
      )}

      {/* Dept breakdown chips */}
      {stats?.deptStats && stats.deptStats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.deptStats.map(d => (
            <button key={d.id} onClick={() => setDeptFilter(deptFilter === d.id ? "All" : d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${deptFilter === d.id ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-slate-800/50 border-white/5 text-slate-400 hover:text-white"}`}>
              {d.code}: {d.count}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white font-bold text-xl">Students Directory</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} of {students.length} students</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
          <Plus size={15} /> Enroll Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, reg no, email…"
            className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className={sel + " min-w-36"}>
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={semFilter} onChange={e => setSemFilter(e.target.value)} className={sel}>
          <option value="All">All Sems</option>
          {SEMESTERS.map(s => <option key={s} value={s.toString()}>Sem {s}</option>)}
        </select>
        <select value={secFilter} onChange={e => setSecFilter(e.target.value)} className={sel}>
          <option value="All">All Sections</option>
          {SECTIONS.map(s => <option key={s} value={s}>Sec {s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={sel}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/20">
                {["Student ID", "Name", "Department", "Course", "Sem / Sec", "Admission", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500 text-sm">No students found.</td></tr>
              ) : filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-amber-400 text-xs font-mono font-semibold whitespace-nowrap">{s.registerNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {s.user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.user.name}</p>
                        <p className="text-slate-400 text-xs">{s.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm whitespace-nowrap">{s.department.code}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-[120px] truncate">{s.course.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-slate-900 text-slate-300 text-xs font-semibold border border-white/5">S{s.semester} / {s.section}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{s.admissionYear}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit ${s.user.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {s.user.isActive ? "Active" : "Inactive"}
                      </span>
                      {!s.user.passwordChanged && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit bg-amber-500/10 text-amber-400">Default Pass</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ mode: "view", data: s })} title="View" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye size={13} /></button>
                      <button onClick={() => openEdit(s)} title="Edit" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => { setResetDob(""); setModal({ mode: "reset", data: s }) }} title="Reset Password" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Key size={13} /></button>
                      <button onClick={() => handleDelete(s.id)} title="Delete" className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-3xl bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400"><GraduationCap size={16} /></div>
                  <h2 className="text-white font-bold">
                    {modal.mode === "add" ? "Enroll New Student" : modal.mode === "edit" ? "Edit Student" : modal.mode === "reset" ? "Reset Password" : "Student Profile"}
                  </h2>
                </div>
                <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
              </div>

              <div className="overflow-y-auto p-6 flex-1">

                {/* VIEW */}
                {modal.mode === "view" && modal.data && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                        {modal.data.user.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{modal.data.user.name}</h3>
                        <p className="text-amber-400 font-mono text-sm font-semibold">{modal.data.registerNumber}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${modal.data.user.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {modal.data.user.isActive ? "Active" : "Inactive"}
                          </span>
                          {!modal.data.user.passwordChanged && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 flex items-center gap-1"><AlertCircle size={10} /> Default Password</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Email", value: modal.data.user.email, icon: Mail },
                        { label: "Phone", value: modal.data.phone || "N/A", icon: Phone },
                        { label: "Date of Birth", value: modal.data.dob ? new Date(modal.data.dob).toLocaleDateString("en-IN") : "N/A", icon: Calendar },
                        { label: "Gender", value: modal.data.gender || "N/A", icon: Users },
                        { label: "Department", value: `${modal.data.department.name} (${modal.data.department.code})`, icon: Building2 },
                        { label: "Course", value: modal.data.course.name, icon: BookOpen },
                        { label: "Semester", value: `Semester ${modal.data.semester}`, icon: GraduationCap },
                        { label: "Section", value: modal.data.section, icon: Users },
                        { label: "Admission Year", value: modal.data.admissionYear.toString(), icon: Calendar },
                        { label: "Portal Access", value: "Enabled", icon: Shield },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5">
                          <p className="text-slate-500 text-[10px] uppercase font-semibold mb-1">{label}</p>
                          <p className="text-white text-sm font-medium flex items-center gap-2"><Icon size={13} className="text-amber-400 shrink-0" /> {value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RESET PASSWORD */}
                {modal.mode === "reset" && modal.data && (
                  <form id="main-form" onSubmit={handleResetPassword} className="space-y-5">
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                      Resetting password for <strong>{modal.data.user.name}</strong> ({modal.data.registerNumber}). New password = DOB in DDMMYYYY format.
                    </div>
                    <Field label="Date of Birth">
                      <input type="date" value={resetDob} onChange={e => setResetDob(e.target.value)} required className={inp} />
                    </Field>
                  </form>
                )}

                {/* ADD / EDIT */}
                {(modal.mode === "add" || modal.mode === "edit") && (
                  <form id="main-form" onSubmit={handleSubmit} className="space-y-6">

                    {modal.mode === "add" && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <Shield size={14} className="text-amber-400 shrink-0" />
                        <div>
                          <p className="text-amber-300 text-xs font-semibold">Register Number (Auto-Generated)</p>
                          <p className="text-white font-mono font-bold text-lg">
                            {autoId || (form.departmentId && form.admissionYear ? "Generating…" : "Select dept & year")}
                          </p>
                        </div>
                        <p className="text-slate-400 text-xs ml-auto">Format: YY + Dept + Seq</p>
                      </div>
                    )}

                    {/* Personal */}
                    <div>
                      <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Users size={12} /> Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Full Name *">
                          <input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="e.g. Ravi Kumar" className={inp} />
                        </Field>
                        <Field label="Email Address *">
                          <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="student@email.com" className={inp} />
                        </Field>
                        <Field label="Mobile Number">
                          <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit mobile" className={inp} />
                        </Field>
                        <Field label="Date of Birth (sets default password)">
                          <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className={inp} />
                        </Field>
                        <Field label="Gender">
                          <select value={form.gender} onChange={e => set("gender", e.target.value)} className={sel}>
                            <option value="">Select Gender</option>
                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </Field>
                        <Field label="Admission Year *">
                          <input type="number" value={form.admissionYear} onChange={e => set("admissionYear", e.target.value)} required className={inp} />
                        </Field>
                      </div>
                    </div>

                    {/* Academic */}
                    <div>
                      <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={12} /> Academic Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Department *">
                          <select value={form.departmentId} onChange={e => { set("departmentId", e.target.value); set("courseId", "") }} required className={sel}>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </Field>
                        <Field label="Course *">
                          <select value={form.courseId} onChange={e => set("courseId", e.target.value)} required className={sel}>
                            <option value="">Select Course</option>
                            {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          {form.departmentId && filteredCourses.length === 0 && (
                            <p className="text-red-400 text-xs mt-1">No courses found for this department. Add courses first.</p>
                          )}
                        </Field>
                        <Field label="Academic Year">
                          <input value={form.academicYear} onChange={e => set("academicYear", e.target.value)} placeholder="e.g. 2025-2026" className={inp} />
                        </Field>
                        <Field label="Semester *">
                          <select value={form.semester} onChange={e => set("semester", e.target.value)} required className={sel}>
                            {SEMESTERS.map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                          </select>
                        </Field>
                        <Field label="Section *">
                          <select value={form.section} onChange={e => set("section", e.target.value)} required className={sel}>
                            {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                          </select>
                        </Field>
                      </div>
                    </div>

                    {/* Parent */}
                    <div>
                      <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Shield size={12} /> Parent / Guardian Info</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Parent/Guardian Name">
                          <input value={form.parentName} onChange={e => set("parentName", e.target.value)} placeholder="Parent full name" className={inp} />
                        </Field>
                        <Field label="Parent Mobile">
                          <input value={form.parentPhone} onChange={e => set("parentPhone", e.target.value)} placeholder="Parent mobile number" className={inp} />
                        </Field>
                        <div className="col-span-2">
                          <Field label="Address">
                            <textarea value={form.address} onChange={e => set("address", e.target.value)} rows={2} placeholder="Full residential address" className={inp + " resize-none"} />
                          </Field>
                        </div>
                      </div>
                    </div>

                    {modal.mode === "add" && (
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-400 space-y-1">
                        <p className="flex items-center gap-2 text-amber-400 font-semibold"><Key size={12} /> Default Password Info</p>
                        <p>• Password = DOB in <strong className="text-white">DDMMYYYY</strong> format (e.g. 16061998)</p>
                        <p>• If no DOB entered, default password is <strong className="text-white">12345678</strong></p>
                        <p>• Register number format: <strong className="text-white">YY + Dept Code + Seq</strong> (e.g. 22CS001)</p>
                        <p>• Student must change password on first login</p>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {modal.mode !== "view" && (
                <div className="flex gap-3 px-6 py-4 border-t border-white/5 bg-slate-900/30 shrink-0">
                  <button type="button" onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:text-white transition-colors">Cancel</button>
                  <button type="submit" form="main-form" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {loading ? "Saving..." : modal.mode === "add" ? "Enroll Student" : modal.mode === "reset" ? "Reset Password" : "Save Changes"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
