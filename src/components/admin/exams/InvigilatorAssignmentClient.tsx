"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Plus, UserCheck, Search } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

const FACULTY_LIST = [
  { id: "f1", facultyId: "MISS-P-001", name: "Dr. Alan Turing", email: "turing@miss.edu" },
  { id: "f2", facultyId: "MISS-AP-001", name: "Dr. Priya Sharma", email: "priya@miss.edu" },
]

const ASSIGNMENTS = [
  { id: "1", faculty: "Dr. Alan Turing", examType: "Mid-term", date: "2026-05-15", time: "09:00 - 12:00", hall: "Hall A" },
]

export default function InvigilatorAssignmentClient({ userRole }: { userRole?: string }) {
  const [assignments, setAssignments] = useState(ASSIGNMENTS)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({ facultyId: "", examType: "", date: "", time: "", hall: "" })

  const filteredFaculty = FACULTY_LIST.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.facultyId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({ facultyId: "", examType: "", date: "", time: "", hall: "" })
    setSearchQuery("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const faculty = FACULTY_LIST.find(f => f.id === formData.facultyId)
    if (!faculty) return
    setAssignments(prev => [...prev, { id: Date.now().toString(), faculty: faculty.name, ...formData }])
    toast.success("Invigilator assigned")
    setShowModal(false)
    resetForm()
  }

  const handleUnassign = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id))
    toast.success("Invigilator unassigned")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Invigilator Assignment</h1>
          <p className="text-gray-500 text-sm">Assign faculty members as invigilators for exams</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600"
        >
          <Plus size={16} /> Assign Invigilator
        </button>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Faculty</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hall</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-black font-medium">{a.faculty}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{a.examType}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{a.date}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{a.time}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{a.hall}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleUnassign(a.id)} className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20">Unassign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && <div className="px-5 py-12 text-center text-gray-400 text-sm">No invigilator assignments yet.</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Assign Invigilator" size="lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Faculty *</label>
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm mb-2"
            />
            {searchQuery && (
              <div className="bg-white border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                {filteredFaculty.map(f => (
                  <div
                    key={f.id}
                    onClick={() => { setFormData({ ...formData, facultyId: f.id }); setSearchQuery(f.name) }}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${formData.facultyId === f.id ? "bg-amber-500/10 text-amber-400" : "text-gray-700"}`}
                  >
                    {f.name} ({f.facultyId})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Exam Type *</label>
              <input type="text" value={formData.examType} onChange={e => setFormData({ ...formData, examType: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Date *</label>
              <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Time Slot *</label>
              <input type="text" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" placeholder="09:00 - 12:00" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Hall *</label>
              <input type="text" value={formData.hall} onChange={e => setFormData({ ...formData, hall: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600 transition-colors">Assign</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
