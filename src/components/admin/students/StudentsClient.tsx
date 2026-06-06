"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Plus, Edit2, Trash2, Eye, X, GraduationCap, Calendar, User, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { addStudent, updateStudent, deleteStudent } from "@/actions/students"
import toast from "react-hot-toast"
import { ALERT } from "@/lib/alerts"

type DbDepartment = { id: string; name: string }
type DbCourse = { id: string; name: string }
type DbStudent = {
  id: string
  registerNumber: string
  userId: string
  semester: number
  section: string
  admissionYear: number
  phone: string | null
  departmentId: string
  department: DbDepartment
  courseId: string
  course: DbCourse
  user: {
    name: string | null
    email: string
  }
}

const sems = ["All", "1", "2", "3", "4", "5", "6"]

export default function StudentsClient({ students, departments, courses }: { students: DbStudent[], departments: DbDepartment[], courses: DbCourse[] }) {
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("All")
  const [semFilter, setSemFilter] = useState("All")
  const [modal, setModal] = useState<{ mode: "add" | "edit" | "view"; data?: DbStudent } | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = students.filter((s) =>
    (deptFilter === "All" || s.department.name === deptFilter) &&
    (semFilter === "All" || s.semester.toString() === semFilter) &&
    (s.user.name?.toLowerCase().includes(search.toLowerCase()) || s.registerNumber.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this student?")) {
      const res = await deleteStudent(id)
      if (res.success) toast.success("Deleted successfully")
      else toast.error("Failed to delete")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (modal?.mode === "edit" && modal.data?.id) {
      formData.append("id", modal.data.id)
      const res = await updateStudent(formData)
      if (res.success) {
        toast.success("Student updated!")
        setModal(null)
      } else {
        toast.error(res.error || "Failed to update")
      }
    } else if (modal?.mode === "add") {
      const res = await addStudent(formData)
      if (res.success) {
        toast.success("Student created!")
        setModal(null)
      } else {
        toast.error(res.error || "Failed to create")
      }
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Students Directory</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} students found</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
            <Plus size={15} /> Enroll Student
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or Reg No…"
            className="bg-transparent text-white text-sm placeholder:text-slate-500 outline-none flex-1" />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none">
          <option value="All">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.name} className="bg-slate-800">{d.name}</option>)}
        </select>
        <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)}
          className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none">
          <option value="All">All Semesters</option>
          {sems.filter(s => s !== "All").map((s) => <option key={s} value={s} className="bg-slate-800">Sem {s}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/20">
                {["Reg No", "Student Name", "Department", "Course", "Sem / Sec", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-amber-400 text-sm font-mono font-semibold">{s.registerNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                        {s.user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.user.name}</p>
                        <p className="text-slate-400 text-xs">{s.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{s.department.name}</td>
                  <td className="px-4 py-3 text-slate-300 text-sm">{s.course.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded bg-slate-900 text-slate-300 text-xs font-semibold border border-white/5">
                      S{s.semester} / {s.section}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                      Enrolled
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ mode: "view", data: s })} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"><Eye size={13} /></button>
                      <button onClick={() => setModal({ mode: "edit", data: s })} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">No students found.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <h2 className="text-white font-bold">
                  {modal.mode === "add" ? "Enroll New Student" : modal.mode === "edit" ? "Edit Student Details" : "Student Profile"}
                </h2>
                <button onClick={() => setModal(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
              </div>

              <div className="overflow-y-auto p-6 flex-1">
                {modal.mode === "view" && modal.data ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {modal.data.user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl">{modal.data.user.name}</h3>
                        <p className="text-amber-400 font-mono font-semibold">{modal.data.registerNumber}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-500 text-xs mb-1">Department</p>
                        <p className="text-white font-medium flex items-center gap-2"><GraduationCap size={14} className="text-amber-400" /> {modal.data.department.name}</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-500 text-xs mb-1">Course</p>
                        <p className="text-white font-medium">{modal.data.course.name}</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-500 text-xs mb-1">Academic Info</p>
                        <p className="text-white font-medium flex items-center gap-2">
                          <Calendar size={14} className="text-amber-400" /> Sem {modal.data.semester} - Sec {modal.data.section} (Batch {modal.data.admissionYear})
                        </p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <p className="text-slate-500 text-xs mb-1">Contact</p>
                        <div className="text-white font-medium text-sm space-y-1">
                          <p className="flex items-center gap-2"><Mail size={13} className="text-slate-400" /> {modal.data.user.email}</p>
                          {modal.data.phone && <p className="flex items-center gap-2"><Phone size={13} className="text-slate-400" /> {modal.data.phone}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form id="student-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                    <div className="space-y-4">
                      <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Personal Details</h3>
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Full Name</label>
                        <input name="name" defaultValue={modal.data?.user.name || ""} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Email Address (Login ID)</label>
                        <input name="email" type="email" defaultValue={modal.data?.user.email || ""} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Phone Number</label>
                        <input name="phone" defaultValue={modal.data?.phone || ""} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Academic Details</h3>
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Register Number</label>
                        <input name="registerNumber" defaultValue={modal.data?.registerNumber || ""} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Department</label>
                        <select name="departmentId" defaultValue={modal.data?.departmentId || ""} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                          <option value="" disabled>Select Department</option>
                          {departments.map((d) => <option key={d.id} value={d.id} className="bg-slate-800">{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1.5 block">Course</label>
                        <select name="courseId" defaultValue={modal.data?.courseId || ""} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                          <option value="" disabled>Select Course</option>
                          {courses.map((c) => <option key={c.id} value={c.id} className="bg-slate-800">{c.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1.5 block">Semester</label>
                          <input name="semester" type="number" defaultValue={modal.data?.semester || 1} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1.5 block">Section</label>
                          <input name="section" defaultValue={modal.data?.section || "A"} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1.5 block">Batch Year</label>
                          <input name="admissionYear" type="number" defaultValue={modal.data?.admissionYear || new Date().getFullYear()} required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {modal.mode !== "view" && (
                <div className="flex gap-3 px-6 py-4 border-t border-white/5 bg-slate-900/30 shrink-0">
                  <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
                  <button type="submit" form="student-form" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    {loading ? "Saving..." : modal.mode === "add" ? "Enroll Student" : "Save Changes"}
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
