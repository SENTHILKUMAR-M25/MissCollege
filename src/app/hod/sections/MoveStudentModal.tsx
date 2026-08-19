"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { motion } from "motion/react"

export default function MoveStudentModal({
  onClose,
  onSubmit,
  sections,
  currentSectionId,
}: {
  onClose: () => void
  onSubmit: (toSectionId: string) => void
  sections: any[]
  currentSectionId: string
}) {
  const [toSectionId, setToSectionId] = useState("")

  const submit = () => {
    if (!toSectionId) return
    onSubmit(toSectionId)
    onClose()
  }

  const availableSections = sections.filter((s) => s.id !== currentSectionId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-gray-100 border border-gray-200 p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X size={18} />
        </button>
        <h3 className="text-black font-bold text-lg mb-4">Move Student</h3>
        <p className="text-gray-500 text-xs mb-4">Select destination section to move the student from current section</p>
        <select
          value={toSectionId}
          onChange={(e) => setToSectionId(e.target.value)}
          className="w-full rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm text-black outline-none mb-4"
        >
          <option value="">Select destination section...</option>
          {availableSections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.department?.name ? `${s.department.name}` : "Dept"} • {s.className} • {s.name} • Sem {s.semester}
            </option>
          ))}
        </select>
        {availableSections.length === 0 && <p className="text-gray-400 text-xs mb-4">No other sections available to move to</p>}
        <button
          onClick={submit}
          disabled={!toSectionId}
          className="w-full rounded-2xl bg-[#2F2FE4] py-3 text-sm font-semibold text-white hover:bg-[#2525c5] disabled:opacity-50 transition-colors"
        >
          Move Student
        </button>
      </motion.div>
    </div>
  )
}
