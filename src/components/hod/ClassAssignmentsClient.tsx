"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Plus, Pencil, Trash2, X, Search,
  Check, UserPlus, UserMinus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { assignClassToFaculty, transferClassAssignment, removeClassAssignment, updateClassAssignment } from "@/actions/class-assignments"

interface ClassAssignmentsClientProps {
  departmentId: string
  departmentName: string
  initialAssignments: any[]
  initialStats: any
  initialUnassigned: { semester: number; section: string }[]
  faculty: { id: string; userId: string; facultyId: string; user: { name: string; email: string } }[]
}

const SEMESTERS = Array.from({ length: 8 }, (_, i) => i + 1)
const SECTIONS = ["A", "B", "C", "D"]
const ACADEMIC_YEARS = ["2024-25", "2025-26", "2023-24"]

function AssignmentFilter({
  semesterFilter,
  setSemesterFilter,
  sectionFilter,
  setSectionFilter,
  searchQuery,
  setSearchQuery,
}: {
  semesterFilter: number | null
  setSemesterFilter: (s: number | null) => void
  sectionFilter: string
  setSectionFilter: (s: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by faculty name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-4 py-2 rounded-xl bg-slate-800/50 border border-white/5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40 w-48"
        />
      </div>
      <select
        value={semesterFilter ?? ""}
        onChange={(e) => setSemesterFilter(e.target.value ? Number(e.target.value) : null)}
        className="px-3 py-2 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 text-sm focus:outline-none focus:border-violet-500/40 appearance-none cursor-pointer"
      >
        <option value="">All Semesters</option>
        {SEMESTERS.map((s) => (
          <option key={s} value={s}>Semester {s}</option>
        ))}
      </select>
      <select
        value={sectionFilter}
        onChange={(e) => setSectionFilter(e.target.value)}
        className="px-3 py-2 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 text-sm focus:outline-none focus:border-violet-500/40 appearance-none cursor-pointer"
      >
        <option value="">All Sections</option>
        {SECTIONS.map((s) => (
          <option key={s} value={s}>Section {s}</option>
        ))}
      </select>
    </div>
  )
}

function AssignmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  departmentId,
  faculty,
  initialData,
  mode,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  departmentId: string
  faculty: any[]
  initialData?: any
  mode: "create" | "edit"
}) {
  const [selectedFaculty, setSelectedFaculty] = useState(initialData?.facultyId || faculty[0]?.id || "")
  const [selectedSemester, setSelectedSemester] = useState<number>(initialData?.semester || 1)
  const [selectedSection, setSelectedSection] = useState(initialData?.section || "A")
  const [selectedYear, setSelectedYear] = useState(initialData?.academicYear || ACADEMIC_YEARS[0])

  useEffect(() => {
    if (initialData && mode === "edit") {
      setSelectedFaculty(initialData.facultyId || faculty[0]?.id || "")
      setSelectedSemester(initialData.semester || 1)
      setSelectedSection(initialData.section || "A")
      setSelectedYear(initialData.academicYear || ACADEMIC_YEARS[0])
    }
  }, [initialData, mode, faculty])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: any = {
      facultyId: selectedFaculty,
      departmentId,
      academicYear: selectedYear,
      semester: selectedSemester,
      section: selectedSection,
      classAssignmentId: initialData?.id,
    }
    onSubmit(payload)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">
            {mode === "create" ? "Assign Class Advisor" : "Edit Assignment"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/40"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/40"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/40"
            >
              {SECTIONS.map((s) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Faculty Member</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/40"
            >
              <option value="">Select a faculty member</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.facultyId} - {f.user.name} ({f.user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
            >
              {mode === "create" ? "Assign" : "Update"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function TransferFormModal({
  isOpen,
  onClose,
  onSubmit,
  currentAssignment,
  faculty,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { newFacultyId: string; transferReason?: string }) => void
  currentAssignment: any
  faculty: any[]
}) {
  const [newFacultyId, setNewFacultyId] = useState("")
  const [transferReason, setTransferReason] = useState("")

  useEffect(() => {
    if (isOpen) {
      setNewFacultyId("")
      setTransferReason("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ newFacultyId, transferReason })
  }

  if (!isOpen || !currentAssignment) return null

  const availableFaculty = faculty.filter((f) => f.id !== currentAssignment.facultyId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Transfer Class Advisor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-400 text-xs font-medium">Current Assignment</p>
          <p className="text-white text-sm mt-1">
            {currentAssignment.faculty?.user?.name || "Unknown"} — Semester {currentAssignment.semester}, Section {currentAssignment.section}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">New Advisor</label>
            <select
              value={newFacultyId}
              onChange={(e) => setNewFacultyId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500/40"
            >
              <option value="">Select new advisor</option>
              {availableFaculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.facultyId} - {f.user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium uppercase tracking-wide mb-1.5">Transfer Reason (Optional)</label>
            <textarea
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              rows={2}
              placeholder="Reason for transfer..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/40 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newFacultyId}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transfer
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function ClassAssignmentsClient({
  departmentId,
  departmentName,
  initialAssignments,
  initialStats,
  initialUnassigned,
  faculty,
}: ClassAssignmentsClientProps) {
  const [assignments, setAssignments] = useState<any[]>(initialAssignments)
  const [stats, setStats] = useState(initialStats)
  const [unassigned, setUnassigned] = useState(initialUnassigned)
  const [facultyList, setFacultyList] = useState(faculty)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const [transferringAssignment, setTransferringAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [semesterFilter, setSemesterFilter] = useState<number | null>(null)
  const [sectionFilter, setSectionFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [assignmentsRes, statsRes, facultyRes] = await Promise.all([
        fetch(`/api/class-assignments?departmentId=${departmentId}`).then(r => r.json()),
        fetch(`/api/class-assignments/stats?departmentId=${departmentId}`).then(r => r.json()),
        fetch(`/api/class-assignments/faculty?departmentId=${departmentId}`).then(r => r.json()),
      ])

      if (assignmentsRes?.success) {
        setAssignments(assignmentsRes.data.assignments || [])
        setUnassigned(assignmentsRes.data.unassignedSections || [])
      }
      if (statsRes?.success) setStats(statsRes.data)
      if (facultyRes?.success) setFacultyList(facultyRes.data || [])
    } catch (err) {
      console.error("Refresh failed", err)
    } finally {
      setLoading(false)
    }
  }, [departmentId])

  const handleCreate = async (data: any) => {
    setLoading(true)
    const result = await assignClassToFaculty(data)
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setShowCreateModal(false)
      await refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to assign class" })
    }
    setLoading(false)
  }

  const handleEdit = async (data: any) => {
    setLoading(true)
    const result = await updateClassAssignment(data)
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setShowEditModal(false)
      setEditingAssignment(null)
      await refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update assignment" })
    }
    setLoading(false)
  }

  const handleTransfer = async (data: { newFacultyId: string; transferReason?: string }) => {
    if (!transferringAssignment) return
    setLoading(true)
    const result = await transferClassAssignment({
      classAssignmentId: transferringAssignment.id,
      newFacultyId: data.newFacultyId,
      transferReason: data.transferReason,
    })
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setShowTransferModal(false)
      setTransferringAssignment(null)
      await refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to transfer assignment" })
    }
    setLoading(false)
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure you want to remove this class assignment?")) return
    setLoading(true)
    const result = await removeClassAssignment(id)
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      await refresh()
    } else {
      setMessage({ type: "error", text: result.error || "Failed to remove assignment" })
    }
    setLoading(false)
  }

  const filteredAssignments = assignments.filter((a) => {
    if (semesterFilter !== null && a.semester !== semesterFilter) return false
    if (sectionFilter && a.section !== sectionFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        (a.faculty?.user?.name || "").toLowerCase().includes(q) ||
        (a.faculty?.facultyId || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  const unassignedFiltered = unassigned.filter((u) => {
    if (semesterFilter !== null && u.semester !== semesterFilter) return false
    if (sectionFilter && u.section !== sectionFilter) return false
    return true
  })

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div className="space-y-6">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-3 rounded-xl border text-sm font-medium",
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {message.text}
        </motion.div>
      )}

      <AssignmentFilter
        semesterFilter={semesterFilter}
        setSemesterFilter={setSemesterFilter}
        sectionFilter={sectionFilter}
        setSectionFilter={setSectionFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-bold text-base">Class Assignments</h3>
          <span className="text-slate-500 text-xs">({filteredAssignments.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800/50 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <svg className={cn("w-4 h-4", loading && "animate-spin")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button
            onClick={() => {
              setEditingAssignment(null)
              setShowCreateModal(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus size={14} />
            New Assignment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/20">
                  {["Semester", "Section", "Academic Year", "Class Advisor", "Faculty ID", "Assigned Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No class assignments found. Create a new assignment to get started.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-sm font-medium">Semester {a.semester}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{a.section}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{a.academicYear}</td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium">{a.faculty?.user?.name}</p>
                        <p className="text-slate-500 text-xs">{a.department?.code}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{a.faculty?.facultyId}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingAssignment(a)
                              setShowEditModal(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setTransferringAssignment(a)
                              setShowTransferModal(true)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                            title="Transfer"
                          >
                            <UserPlus size={12} />
                          </button>
                          <button
                            onClick={() => handleRemove(a.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Remove"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-sm">Unassigned Classes</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400">
                {unassignedFiltered.length}
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1.5">
              {unassignedFiltered.length === 0 ? (
                <p className="text-slate-500 text-xs py-2">All classes have advisors assigned.</p>
              ) : (
                unassignedFiltered.map((u, i) => (
                  <button
                    key={`${u.semester}-${u.section}-${i}`}
                    onClick={() => {
                      setEditingAssignment({
                        id: `new-${u.semester}-${u.section}`,
                        semester: u.semester,
                        section: u.section,
                      })
                      setShowCreateModal(true)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/20 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-xs">⚠</span>
                      <span className="text-slate-300 text-xs">Semester {u.semester}, Section {u.section}</span>
                    </div>
                    <Plus size={10} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <AssignmentFormModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false)
              setEditingAssignment(null)
            }}
            onSubmit={handleCreate}
            departmentId={departmentId}
            faculty={facultyList}
            initialData={editingAssignment && editingAssignment.id?.startsWith("new-") ? undefined : editingAssignment}
            mode="create"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editingAssignment && (
          <AssignmentFormModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingAssignment(null)
            }}
            onSubmit={handleEdit}
            departmentId={departmentId}
            faculty={facultyList}
            initialData={editingAssignment}
            mode="edit"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransferModal && transferringAssignment && (
          <TransferFormModal
            isOpen={showTransferModal}
            onClose={() => {
              setShowTransferModal(false)
              setTransferringAssignment(null)
            }}
            onSubmit={handleTransfer}
            currentAssignment={transferringAssignment}
            faculty={facultyList}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
