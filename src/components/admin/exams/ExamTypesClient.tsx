"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Plus, Edit2, Trash2, FileText } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

const EXAM_TYPES = [
  { id: "1", name: "Internal Assessment", code: "INT", description: "Mid-term and internal tests" },
  { id: "2", name: "Semester End Exam", code: "SEE", description: "Final semester examinations" },
  { id: "3", name: "Lab Practical", code: "LAB", description: "Practical laboratory exams" },
  { id: "4", name: "Viva Voce", code: "VIVA", description: "Oral examinations" },
  { id: "5", name: "Project Review", code: "PROJ", description: "Project presentation and review" },
]

export default function ExamTypesClient() {
  const [types, setTypes] = useState(EXAM_TYPES)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "", description: "" })

  const resetForm = () => {
    setEditingId(null)
    setFormData({ name: "", code: "", description: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setTypes(prev => prev.map(t => t.id === editingId ? { ...t, ...formData } : t))
      toast.success("Exam type updated")
    } else {
      setTypes(prev => [...prev, { id: Date.now().toString(), ...formData }])
      toast.success("Exam type created")
    }
    setShowModal(false)
    resetForm()
  }

  const handleEdit = (type: typeof EXAM_TYPES[0]) => {
    setEditingId(type.id)
    setFormData({ name: type.name, code: type.code, description: type.description })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setTypes(prev => prev.filter(t => t.id !== id))
    toast.success("Exam type deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Exam Types</h1>
          <p className="text-gray-500 text-sm">Manage exam type configurations</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600"
        >
          <Plus size={16} /> Add Type
        </button>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {types.map((type) => (
              <tr key={type.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-mono">
                    <FileText size={12} /> {type.code}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-black font-medium">{type.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{type.description || "-"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(type)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(type.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {types.length === 0 && (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">No exam types configured yet.</div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title={editingId ? "Edit Exam Type" : "New Exam Type"} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm"
              placeholder="e.g. Internal Assessment"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              required
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm"
              placeholder="e.g. INT"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm"
              placeholder="Brief description"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600 transition-colors">{editingId ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
