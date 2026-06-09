"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { motion } from "framer-motion"
import { assignStudentToSection } from "@/actions/sections"

export default function StudentModal({ onClose, onSubmit, unassignedStudents, sectionId }: { onClose: () => void; onSubmit: (data: { studentId: string; sectionId: string }) => void; unassignedStudents: any[]; sectionId: string }) {
  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    if (!selectedStudentId) {
      setError("Please select a student")
      return
    }
    setSubmitting(true)
    const res = await assignStudentToSection({ sectionId, studentId: selectedStudentId })
    if (!res.success) {
      setError(res.error || "Failed to assign student")
      setSubmitting(false)
      return
    }
    onSubmit({ studentId: selectedStudentId, sectionId })
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={18} />
        </button>
        <h3 className="text-white font-bold text-lg mb-4">Assign Student to Section</h3>
        <p className="text-slate-400 text-xs mb-4">Select an unassigned student</p>
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none mb-4"
        >
          <option value="">Select student...</option>
          {unassignedStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.user.name} • {s.registerNumber} • {s.course.code}
            </option>
          ))}
        </select>
        {unassignedStudents.length === 0 && <p className="text-slate-500 text-xs mb-4">No unassigned students available</p>}
        <button
          onClick={submit}
          disabled={submitting || !selectedStudentId}
          className="w-full rounded-2xl bg-violet-500 py-3 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Assigning..." : "Assign Student"}
        </button>
      </motion.div>
    </div>
  )
}
