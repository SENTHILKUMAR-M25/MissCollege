"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
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
import Modal from "@/components/ui/Modal"
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

const deptImageMap: Record<string, string> = {
  "Computer Science": "/department/Computer-Science.jpg",
  "Commerce": "/department/Commerce.jpg",
  "Management Studies": "/department/Management-Studies.jpg",
  "English": "/department/English.jpg",
  "Psychology": "/department/Psychology.jpg",
  "Diploma": "/department/Diploma.png",
}

function getDeptImage(name: string) {
  return deptImageMap[name] || "/department/Computer-Science.jpg"
}

export default function DepartmentsClient({ departments }: { departments: DbDepartment[] }) {
  const router = useRouter()
  const [modal, setModal] = useState<{ mode: "add" | "edit"; dept?: DbDepartment } | null>(null)

  const totalStudents = departments.reduce((a, d) => a + (d._count?.students || 0), 0)
  const totalFaculty = departments.reduce((a, d) => a + (d._count?.faculty || 0), 0)

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this department?")) return
    const res = await deleteDepartment(id)
    if (res.success) toast.success("Deleted successfully")
    else toast.error("Failed to delete")
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-black font-bold text-xl">Departments</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {departments.length} departments · {totalStudents.toLocaleString()} students · {totalFaculty} faculty
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] text-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-[#2F2FE4]/20"
        >
          <Plus size={15} /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Departments", value: departments.length, icon: Building2, color: "text-amber-400 bg-amber-500/10" },
          { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-violet-400 bg-violet-500/10" },
          { label: "Total Faculty", value: totalFaculty, icon: Users, color: "text-blue-400 bg-blue-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-200 border border-gray-100 p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.color)}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-black font-bold text-xl">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {departments.map((dept, idx) => {
          const colorKey = colorMap[idx % colorMap.length]
          const activeHod = (dept.hodAssignments || [])[0]
          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 flex flex-col"
            >
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getDeptImage(dept.name)})` }} />
              <div className="absolute inset-0 bg-gray-100/70" />

              <div className="relative p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-black font-black text-lg shadow-lg shrink-0">
                    {dept.code}
                  </div>
                  <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal({ mode: "edit", dept })}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center text-gray-500 transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-gray-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <h3 className="text-black font-bold text-sm mb-0.5 line-clamp-1">{dept.name}</h3>
                  <p className="text-gray-400 text-xs mb-4 flex-1 line-clamp-2">
                    {dept.description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Students", value: (dept._count?.students || 0).toLocaleString(), icon: Users },
                      { label: "Faculty", value: dept._count?.faculty || 0, icon: Users },
                      { label: "Courses", value: dept._count?.courses || 0, icon: Library },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-black font-black text-lg">{s.value}</p>
                        <p className="text-gray-400 text-[10px]">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400 text-[10px] font-semibold">HOD</span>
                      {activeHod ? (
                        <span className="text-black text-[10px] font-medium truncate">
                          {activeHod.faculty?.user?.name || activeHod.facultyId}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Not assigned</span>
                      )}
                    </div>
                    <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border", bgMap[colorKey])}>Active</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {modal && (
          <Modal
            isOpen={!!modal}
            title={modal.mode === "add" ? "Add Department" : "Edit Department"}
            size="md"
            onClose={() => setModal(null)}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                if (modal.mode === "edit" && modal.dept?.id) {
                  formData.append("id", modal.dept.id)
                  const res = await updateDepartment(formData)
                  if (res.success) {
                    toast.success("Department updated")
                    setModal(null)
                    router.refresh()
                  } else {
                    toast.error(res.error || "Failed to update")
                  }
                } else {
                  const res = await addDepartment(formData)
                  if (res.success) {
                    toast.success("Department created")
                    setModal(null)
                    router.refresh()
                  } else {
                    toast.error(res.error || "Failed to create")
                  }
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">Department Name</label>
                <input
                  name="name"
                  defaultValue={modal.dept?.name}
                  placeholder="e.g. Computer Science"
                  required
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">Department Code</label>
                <input
                  name="code"
                  defaultValue={modal.dept?.code}
                  placeholder="e.g. CS"
                  required
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">Description</label>
                <textarea
                  name="description"
                  defaultValue={modal.dept?.description || ""}
                  placeholder="Description..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] text-black text-sm font-semibold hover:opacity-90"
                >
                  {modal.mode === "add" ? "Create" : "Save Changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
