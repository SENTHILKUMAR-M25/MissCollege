"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Edit2, Trash2, ClipboardList } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

const ASSESSMENTS = [
  { id: "1", name: "Continuous Assessment", weightage: 30, maxMarks: 30, description: "Regular class tests and assignments" },
  { id: "2", name: "Mid Semester Exam", weightage: 20, maxMarks: 20, description: "Mid-term examination" },
  { id: "3", name: "Semester End Exam", weightage: 50, maxMarks: 50, description: "Final semester examination" },
]

export default function AssessmentSetupClient() {
  const [assessments, setAssessments] = useState(ASSESSMENTS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", weightage: 0, maxMarks: 0, description: "" })

  const resetForm = () => {
    setEditingId(null)
    setFormData({ name: "", weightage: 0, maxMarks: 0, description: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setAssessments(prev => prev.map(a => a.id === editingId ? { ...a, ...formData, weightage: Number(formData.weightage), maxMarks: Number(formData.maxMarks) } : a))
      toast.success("Assessment updated")
    } else {
      setAssessments(prev => [...prev, { id: Date.now().toString(), ...formData, weightage: Number(formData.weightage), maxMarks: Number(formData.maxMarks) }])
      toast.success("Assessment created")
    }
    setShowModal(false)
    resetForm()
  }

  const handleEdit = (item: typeof ASSESSMENTS[0]) => {
    setEditingId(item.id)
    setFormData({ name: item.name, weightage: item.weightage, maxMarks: item.maxMarks, description: item.description })
    setShowModal(true)
  }

  const totalWeightage = assessments.reduce((sum, a) => sum + a.weightage, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Assessment Setup</h1>
          <p className="text-gray-500 text-sm">Configure assessment weightages and marking schemes</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600"
        >
          <Plus size={16} /> Add Assessment
        </button>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList size={18} className="text-amber-400" />
          <span className="text-black font-semibold">Total Weightage:</span>
          <span className={`text-2xl font-bold ${totalWeightage === 100 ? "text-emerald-400" : "text-red-400"}`}>{totalWeightage}%</span>
        </div>
        <p className="text-gray-400 text-xs">Total weightage must equal 100% for proper grading</p>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Weightage</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Max Marks</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assessments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-black font-medium">{a.name}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{a.weightage}%</td>
                <td className="px-5 py-3 text-sm text-gray-700">{a.maxMarks}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{a.description || "-"}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black"><Edit2 size={14} /></button>
                    <button onClick={() => { setAssessments(prev => prev.filter(x => x.id !== a.id)); toast.success("Deleted") }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title={editingId ? "Edit Assessment" : "New Assessment"} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Weightage (%) *</label>
              <input type="number" value={formData.weightage} onChange={e => setFormData({ ...formData, weightage: parseInt(e.target.value) || 0 })} required min={0} max={100} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Max Marks *</label>
              <input type="number" value={formData.maxMarks} onChange={e => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Description</label>
            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
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
