"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Plus, Edit2, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { addSubject, updateSubject, deleteSubject } from "@/actions/subjects"
import toast from "react-hot-toast"

type DbFaculty = { id: string; user: { name: string | null } }
type DbDepartment = { id: string; name: string }
type DbSubject = {
  id: string
  name: string
  code: string
  credits: number
  semester: number
  departmentId: string
  department: DbDepartment
  facultyId: string | null
  faculty: DbFaculty | null
}

const sems = ["All", "1", "2", "3", "4", "5", "6", "7", "8"]

export default function SubjectsClient({ subjects, departments, faculties }: { subjects: DbSubject[], departments: DbDepartment[], faculties: DbFaculty[] }) {
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("All")
  const [semFilter, setSemFilter] = useState("All")
  const [modal, setModal] = useState<{ mode: "add" | "edit"; subject?: DbSubject } | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = subjects.filter((s) =>
    (deptFilter === "All" || s.department.name === deptFilter) &&
    (semFilter === "All" || s.semester.toString() === semFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this subject?")) {
      const res = await deleteSubject(id)
      if (res.success) toast.success("Deleted successfully")
      else toast.error("Failed to delete")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (modal?.mode === "edit" && modal.subject?.id) {
      formData.append("id", modal.subject.id)
      const res = await updateSubject(formData)
      if (res.success) {
        toast.success("Subject updated!")
        setModal(null)
      } else {
        toast.error(res.error || "Failed to update")
      }
    } else {
      const res = await addSubject(formData)
      if (res.success) {
        toast.success("Subject created!")
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
          <h2 className="text-black font-bold text-xl">Subjects</h2>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} subjects found</p>
        </div>
        <button onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] text-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-[#2F2FE4]/20">
          <Plus size={15} /> Add Subject
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 flex-1 min-w-48">
          <Search size={15} className="text-gray-500 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects…"
            className="bg-transparent text-black text-sm placeholder:text-gray-400 outline-none flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-gray-400" /></button>}
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-700 text-sm focus:outline-none">
          <option value="All">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.name} className="bg-white">{d.name}</option>)}
        </select>
        <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-gray-700 text-sm focus:outline-none">
          {sems.map((s) => <option key={s} value={s} className="bg-white">{s === "All" ? "All Semesters" : `Semester ${s}`}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Code", "Subject Name", "Department", "Semester", "Credits", "Faculty", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-amber-400 text-sm font-mono font-semibold">{s.code}</td>
                  <td className="px-4 py-3 text-black text-sm font-medium whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3 text-gray-700 text-sm whitespace-nowrap">{s.department.name}</td>
                  <td className="px-4 py-3 text-gray-700 text-sm text-center">Sem {s.semester}</td>
                  <td className="px-4 py-3">
                    <span className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-bold flex items-center justify-center">{s.credits}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm whitespace-nowrap">{s.faculty?.user?.name || "Not Assigned"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ mode: "edit", subject: s })} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No subjects found.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-black font-bold">{modal.mode === "add" ? "Add New Subject" : "Edit Subject"}</h2>
                <button type="button" onClick={() => setModal(null)} className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-100 text-gray-500 hover:text-black transition-all border border-gray-200" title="Close"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">Subject Code</label>
                    <input name="code" defaultValue={modal.subject?.code} required placeholder="CS301" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">Subject Name</label>
                    <input name="name" defaultValue={modal.subject?.name} required placeholder="Data Structures" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">Credits</label>
                    <input name="credits" type="number" defaultValue={modal.subject?.credits} required placeholder="4" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">Semester</label>
                    <input name="semester" type="number" defaultValue={modal.subject?.semester} required placeholder="3" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">Department</label>
                    <select name="departmentId" defaultValue={modal.subject?.departmentId} required className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50">
                      <option value="" disabled>Select Department</option>
                      {departments.map((d) => <option key={d.id} value={d.id} className="bg-white">{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1.5 block">Assigned Faculty (Optional)</label>
                    <select name="facultyId" defaultValue={modal.subject?.facultyId || ""} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50">
                      <option value="">None</option>
                      {faculties.map((f) => <option key={f.id} value={f.id} className="bg-white">{f.user.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                    {loading ? "Saving..." : modal.mode === "add" ? "Add Subject" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
