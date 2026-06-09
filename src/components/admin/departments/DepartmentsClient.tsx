"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Library,
  X,
  Building2,
  Crown,
  UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { addDepartment, updateDepartment, deleteDepartment } from "@/actions/departments"
import toast from "react-hot-toast"

type DbDepartment = {
  id: string
  name: string
  code: string
  description: string | null
  _count?: {
    courses: number
    faculty: number
    students: number
  }
  hodAssignments?: Array<{
    id: string
    facultyId: string
    faculty: {
      facultyId: string
      user: {
        name?: string | null
        email: string
      }
    }
    assignedAt: Date | string
    isActive: boolean
  }>
}

const colorMap = ["blue", "purple", "green", "orange", "red", "yellow", "pink", "teal"]
const gradientMap: Record<string, string> = {
  blue: "from-blue-500 to-indigo-600",
  purple: "from-purple-500 to-violet-600",
  green: "from-emerald-500 to-teal-600",
  orange: "from-orange-500 to-amber-600",
  red: "from-red-500 to-rose-600",
  yellow: "from-yellow-500 to-amber-500",
  pink: "from-pink-500 to-rose-500",
  teal: "from-teal-500 to-cyan-600",
}

const bgMap: Record<string, string> = {
  blue: "bg-blue-500/10 border-blue-500/20",
  purple: "bg-purple-500/10 border-purple-500/20",
  green: "bg-emerald-500/10 border-emerald-500/20",
  orange: "bg-orange-500/10 border-orange-500/20",
  red: "bg-red-500/10 border-red-500/20",
  yellow: "bg-yellow-500/10 border-yellow-500/20",
  pink: "bg-pink-500/10 border-pink-500/20",
  teal: "bg-teal-500/10 border-teal-500/20",
}

function Modal({ dept, mode, onClose }: { dept?: DbDepartment; mode: "add" | "edit"; onClose: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (mode === "edit" && dept?.id) {
      formData.append("id", dept.id)
      const res = await updateDepartment(formData)
      if (res.success) {
        toast.success("Department updated!")
        onClose()
      } else {
        toast.error(res.error || "Failed to update")
      }
    } else {
      const res = await addDepartment(formData)
      if (res.success) {
        toast.success("Department created!")
        onClose()
      } else {
        toast.error(res.error || "Failed to create")
      }
    }
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-bold">{mode === "add" ? "Add Department" : "Edit Department"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Department Name</label>
              <input name="name" defaultValue={dept?.name} required placeholder="e.g. Computer Science"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Department Code</label>
              <input name="code" defaultValue={dept?.code} required placeholder="e.g. CS"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Description</label>
              <textarea name="description" defaultValue={dept?.description || ""} placeholder="Description..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-white/5">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50">
              {loading ? "Saving..." : mode === "add" ? "Add Department" : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function DepartmentsClient({ departments }: { departments: DbDepartment[] }) {
  const [modal, setModal] = useState<{ mode: "add" | "edit"; dept?: DbDepartment } | null>(null)

  const totalStudents = departments.reduce((a, d) => a + (d._count?.students || 0), 0)
  const totalFaculty = departments.reduce((a, d) => a + (d._count?.faculty || 0), 0)

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this department?")) {
      const res = await deleteDepartment(id)
      if (res.success) toast.success("Deleted successfully")
      else toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Departments</h2>
          <p className="text-slate-400 text-sm mt-0.5">{departments.length} departments · {totalStudents.toLocaleString()} students · {totalFaculty} faculty</p>
        </div>
        <button onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
          <Plus size={15} /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Departments", value: departments.length, icon: Building2, color: "text-amber-400 bg-amber-500/10" },
          { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-violet-400 bg-violet-500/10" },
          { label: "Total Faculty", value: totalFaculty, icon: Users, color: "text-blue-400 bg-blue-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.color)}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {departments.map((dept, idx) => {
          const colorKey = colorMap[idx % colorMap.length]
          const activeHod = (dept.hodAssignments || [])[0]
          return (
            <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 p-5 group flex flex-col">
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", gradientMap[colorKey])} />

              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0", gradientMap[colorKey])}>
                  {dept.code}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ mode: "edit", dept })}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center text-slate-400 transition-all">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(dept.id)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-slate-400 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <h3 className="text-white font-bold text-sm mb-0.5 line-clamp-1">{dept.name}</h3>
              <p className="text-slate-500 text-xs mb-4 flex-1 line-clamp-2">{dept.description || "No description provided."}</p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Students", value: (dept._count?.students || 0).toLocaleString(), icon: Users },
                  { label: "Faculty", value: dept._count?.faculty || 0, icon: Users },
                  { label: "Courses", value: dept._count?.courses || 0, icon: Library },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-white font-black text-lg">{s.value}</p>
                    <p className="text-slate-500 text-[10px]">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-500 text-[10px] font-semibold">HOD</span>
                  {activeHod ? (
                    <span className="text-white text-[10px] font-medium truncate">{activeHod.faculty?.user?.name || activeHod.facultyId}</span>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Not assigned</span>
                  )}
                </div>
                <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", bgMap[colorKey])}>Active</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>{modal && <Modal dept={modal.dept} mode={modal.mode} onClose={() => setModal(null)} />}</AnimatePresence>
    </div>
  )
}
