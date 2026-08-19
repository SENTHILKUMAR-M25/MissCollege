"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, Plus, X, Save, Trash2, FileText, Award, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

type Subject = { id: string; name: string; code: string; semester: number; credits: number }
type StudentMark = { studentId: string; registerNumber: string; name: string; mark: number; maxMark: number; absent: boolean }

const EXAM_TYPES = [
  { value: "CAT1", label: "Internal Test 1", max: 50 },
  { value: "CAT2", label: "Internal Test 2", max: 50 },
  { value: "ASSIGNMENT", label: "Assignment", max: 10 },
  { value: "SEMINAR", label: "Seminar", max: 10 },
  { value: "PRACTICAL", label: "Practical", max: 30 },
  { value: "MODEL_EXAM", label: "Model Exam", max: 70 },
  { value: "INTERNAL_TEST_1", label: "Internal Test 1 (Alt)", max: 50 },
  { value: "INTERNAL_TEST_2", label: "Internal Test 2 (Alt)", max: 50 },
]

export default function FacultyMarksClient({ facultyId, facultyUserId, departmentName, initialSubjects }: { facultyId: string; facultyUserId: string; departmentName: string; initialSubjects: Subject[] }) {
  const [subjects] = useState<Subject[]>(initialSubjects)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedExamType, setSelectedExamType] = useState<string>("")
  const [students, setStudents] = useState<StudentMark[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [marksModalOpen, setMarksModalOpen] = useState(false)

  const selectedExam = EXAM_TYPES.find(e => e.value === selectedExamType)
  const defaultMax = selectedExam?.max || 100

  useEffect(() => {
    if (!selectedSubject || !selectedExamType) return
    loadStudents()
  }, [selectedSubject, selectedExamType])

  async function loadStudents() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ subjectId: selectedSubject, action: "students" })
      const res = await fetch(`/api/faculty/marks?${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      const data = json.data
      setStudents(data.students.map((s: any) => ({ studentId: s.id, registerNumber: s.registerNumber, name: s.name, mark: s.marks[selectedExamType?.toLowerCase()] || 0, maxMark: defaultMax, absent: false })))
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!selectedSubject || !selectedExamType || students.length === 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/faculty/marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", subjectId: selectedSubject, examType: selectedExamType, marks: students.map(s => ({ studentId: s.studentId, mark: s.absent ? 0 : Math.min(s.mark, s.maxMark), maxMark: s.maxMark })) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(json.message || "Marks saved successfully")
      await loadStudents()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  function updateMark(studentId: string, value: number) {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, mark: Math.max(0, Math.min(value, s.maxMark)) } : s))
  }

  function toggleAbsent(studentId: string) {
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, absent: !s.absent } : s))
  }

  function filteredStudents() {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s => s.name.toLowerCase().includes(q) || s.registerNumber.toLowerCase().includes(q))
  }

  const totalPresent = students.filter(s => !s.absent).length
  const totalAbsent = students.filter(s => s.absent).length
  const avgMark = totalPresent > 0 ? Math.round(students.filter(s => !s.absent).reduce((a, b) => a + b.mark, 0) / totalPresent) : 0

  const canOpenMarks = selectedSubject && selectedExamType && students.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Faculty Marks</h1>
          <p className="text-gray-500 text-sm">Enter and manage marks for your subjects</p>
        </div>
        <button
          onClick={() => setMarksModalOpen(true)}
          disabled={!canOpenMarks}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Open Marks Entry
        </button>
      </div>

      <Modal
        isOpen={marksModalOpen}
        onClose={() => setMarksModalOpen(false)}
        title="Marks Entry"
        size="xl"
      >
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-gray-500 text-xs font-medium mb-1 block">Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-black text-sm">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name} (Sem {s.semester})</option>)}
              </select>
            </div>
            <div className="min-w-[180px]">
              <label className="text-gray-500 text-xs font-medium mb-1 block">Assessment Type</label>
              <select value={selectedExamType} onChange={e => setSelectedExamType(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-black text-sm">
                <option value="">Select Type</option>
                {EXAM_TYPES.map(e => <option key={e.value} value={e.value}>{e.label} (/ {e.max})</option>)}
              </select>
            </div>
            {selectedSubject && selectedExamType && (
              <div className="flex-1 min-w-[250px]">
                <label className="text-gray-500 text-xs font-medium mb-1 block">Search Student</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or reg no…" className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-black text-sm placeholder:text-gray-400" />
                </div>
              </div>
            )}
          </div>

          {selectedSubject && selectedExamType && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Students", value: students.length, color: "text-black" },
                  { label: "Present", value: totalPresent, color: "text-emerald-400" },
                  { label: "Absent", value: totalAbsent, color: "text-red-400" },
                  { label: "Class Avg", value: avgMark, color: "text-[#2F2FE4]" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">{filteredStudents().length} students showing</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStudents(prev => prev.map(s => ({ ...s, absent: false, mark: 0 })))} className="px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-gray-700 text-xs hover:text-black">Clear All</button>
                  <button onClick={() => setStudents(prev => prev.map(s => ({ ...s, absent: false })))} className="px-3 py-1.5 rounded-lg bg-white border border-gray-100 text-gray-700 text-xs hover:text-black">Mark All Present</button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50 flex items-center gap-2">
                    <Save size={14} /> {saving ? "Saving..." : "Save Marks"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="p-16 text-center text-gray-400 text-sm">Loading students…</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Register No</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Mark (/{defaultMax})</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents().length === 0 ? (
                          <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">No students found.</td></tr>
                        ) : filteredStudents().map((s, i) => (
                          <motion.tr key={s.studentId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${s.absent ? "bg-red-500/5" : ""}`}>
                            <td className="px-4 py-3 text-[#2F2FE4] text-xs font-mono font-semibold">{s.registerNumber}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2F2FE4] flex items-center justify-center text-white font-bold text-xs shrink-0">
                                  {s.name.charAt(0)}
                                </div>
                                <p className="text-black text-sm font-medium">{s.name}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => toggleAbsent(s.studentId)} className={`px-3 py-1 rounded-lg text-xs font-semibold ${s.absent ? "bg-red-500/20 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                                {s.absent ? "Absent" : "Present"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <input type="number" min="0" max={s.maxMark} value={s.absent ? 0 : s.mark} onChange={e => updateMark(s.studentId, Number(e.target.value))} disabled={s.absent}
                                className="w-20 bg-gray-100 border border-gray-100 rounded-lg px-3 py-1.5 text-black text-sm text-center focus:outline-none disabled:opacity-50" />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
