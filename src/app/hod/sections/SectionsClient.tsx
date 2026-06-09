"use client"

import type { Section, Student } from "@prisma/client"
import { useState, useEffect, useCallback } from "react"
import { Users, UserPlus, Trash2, ChevronRight, ChevronDown, Filter, Search, PlusCircle, GraduationCap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { deleteSection, getUnassignedStudents, getSections } from "@/actions/sections"
import SectionModal from "./SectionModal"
import StudentModal from "./StudentModal"
import MoveStudentModal from "./MoveStudentModal"

type SectionWithDetails = Section & {
  department: { id: string; name: string; code: string } | null
  studentSections: any[]
  availableSeats: number
}

type UnassignedStudent = Student & {
  user: { name: string; email: string }
  course: { name: string; code: string }
}

export default function SectionsClient({ loggedUserEmail }: { loggedUserEmail: string }) {
  const [sections, setSections] = useState<SectionWithDetails[]>([])
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({ academicYear: "" as string, semester: "" as string, className: "" as string })
  const [searchQuery, setSearchQuery] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("semester", activeFilters.semester)
    if (activeFilters.academicYear) params.set("academicYear", activeFilters.academicYear)
    const res = await fetch(`/api/sections?${params.toString()}`)
    const json = await res.json()
    if (json.success) {
      let filtered = json.data as SectionWithDetails[]
      if (activeFilters.className) {
        filtered = filtered.filter((s) => s.className.toLowerCase().includes(activeFilters.className.toLowerCase()))
      }
      if (searchQuery) {
        filtered = filtered.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }
      setSections(filtered)
    }
    const unassignedRes = await fetch(`/api/sections?semester=${activeFilters.semester}&mode=unassigned-students`)
    const unassignedJson = await unassignedRes.json()
    if (unassignedJson.success) {
      setUnassignedStudents(unassignedJson.data)
    }
    setLoading(false)
  }, [activeFilters, searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreateSection = async (data: any) => {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (json.success) {
      fetchData()
    } else {
      alert(json.error || "Failed to create section")
    }
  }

  const handleAssignStudent = async (data: { sectionId: string; studentId: string }) => {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", ...data }),
    })
    const json = await res.json()
    if (json.success) {
      fetchData()
    } else {
      alert(json.error || "Failed to assign student")
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return
    const res = await fetch(`/api/sections?sectionId=${sectionId}`, { method: "DELETE" })
    const json = await res.json()
    if (json.success) {
      fetchData()
    } else {
      alert(json.error || "Failed to delete section")
    }
  }

  const openMoveModal = (studentId: string, fromSectionId: string) => {
    setSelectedStudentId(studentId)
    setSelectedSectionId(fromSectionId)
    setShowMoveModal(true)
  }

  const handleMoveStudent = async (data: { studentId: string; fromSectionId: string; toSectionId: string }) => {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", ...data }),
    })
    const json = await res.json()
    if (json.success) {
      fetchData()
    } else {
      alert(json.error || "Failed to move student")
    }
  }

  const availableSemesters = Array.from(new Set(sections.map((s) => s.semester))).sort((a, b) => a - b)
  const availableYears = Array.from(new Set(sections.map((s) => s.academicYear))).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Section Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create sections, assign and move students across sections</p>
        </div>
        <button
          onClick={() => setShowSectionModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 transition-colors"
        >
          <PlusCircle size={16} />
          Create Section
        </button>
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Filter size={16} />
          <span className="font-semibold uppercase tracking-wider text-xs">Filters</span>
        </div>
        <select
          value={activeFilters.academicYear}
          onChange={(e) => setActiveFilters({ ...activeFilters, academicYear: e.target.value })}
          className="rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">All Years</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={activeFilters.semester}
          onChange={(e) => setActiveFilters({ ...activeFilters, semester: e.target.value })}
          className="rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="">All Semesters</option>
          {availableSemesters.map((sem) => (
            <option key={sem} value={String(sem)}>Semester {sem}</option>
          ))}
        </select>
        <input
          value={activeFilters.className}
          onChange={(e) => setActiveFilters({ ...activeFilters, className: e.target.value })}
          placeholder="Filter by class..."
          className="rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-sm text-white outline-none w-48"
        />
        <div className="relative ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search section..."
            className="rounded-xl bg-slate-900/50 border border-white/10 pl-9 pr-4 py-2 text-sm text-white outline-none w-52"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading sections...</p>
      ) : sections.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-12 text-center">
          <GraduationCap size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No sections found. Create one to start managing students.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <p className="text-white font-bold">{section.className} • {section.name}</p>
                      <p className="text-slate-500 text-xs">
                        {section.department?.name} • {section.academicYear} • Semester {section.semester} • Capacity {section.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      section.availableSeats === 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      section.availableSeats <= 5 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    )}>
                      {section.assignedStudents}/{section.capacity} students
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSectionId(section.id)
                        setShowAssignModal(true)
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600"
                    >
                      <UserPlus size={14} />
                      Add
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="rounded-xl bg-slate-900/50 border border-white/10 p-1.5 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-900/20">
                        {["Student", "Reg No", "Email", "Course"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.studentSections.slice(0, 5).map((ss: any) => (
                        <tr key={ss.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2.5 text-white text-sm flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs">
                              {ss.student.user.name?.charAt(0) || "S"}
                            </div>
                            {ss.student.user.name}
                          </td>
                          <td className="px-4 py-2.5 text-violet-400 text-sm font-mono font-semibold">{ss.student.registerNumber}</td>
                          <td className="px-4 py-2.5 text-slate-400 text-xs">{ss.student.user.email}</td>
                          <td className="px-4 py-2.5 text-slate-300 text-sm">{ss.student.course.code}</td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => openMoveModal(ss.studentId, section.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-white/10"
                            >
                              Move
                            </button>
                          </td>
                        </tr>
                      ))}
                      {section.studentSections.length > 5 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-xs text-slate-500">
                            Showing 5 of {section.studentSections.length} students
                          </td>
                        </tr>
                      )}
                      {section.studentSections.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500 text-sm">
                            No students assigned yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showSectionModal && (
        <SectionModal
          onClose={() => setShowSectionModal(false)}
          onSubmit={handleCreateSection}
          departmentOptions={[]}
        />
      )}
      {showAssignModal && selectedSectionId && (
        <StudentModal
          onClose={() => { setShowAssignModal(false); setSelectedSectionId(null) }}
          onSubmit={(data) => handleAssignStudent({ ...data, sectionId: selectedSectionId })}
          unassignedStudents={unassignedStudents}
          sectionId={selectedSectionId}
        />
      )}
      {showMoveModal && selectedStudentId && (
        <MoveStudentModal
          onClose={() => { setShowMoveModal(false); setSelectedStudentId(null); setSelectedSectionId(null) }}
          onSubmit={(toSectionId) => handleMoveStudent({ studentId: selectedStudentId, fromSectionId: selectedSectionId!, toSectionId })}
          sections={sections}
          currentSectionId={selectedSectionId!}
        />
      )}
    </div>
  )
}
