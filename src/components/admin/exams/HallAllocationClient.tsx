"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Plus, Edit2, Trash2, Building2 } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

const HALLS = [
  { id: "1", name: "Hall A", capacity: 60, building: "Main Block", floor: "1st" },
  { id: "2", name: "Hall B", capacity: 45, building: "Main Block", floor: "2nd" },
]

export default function HallAllocationClient() {
  const [halls, setHalls] = useState(HALLS)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: "", capacity: 0, building: "", floor: "" })

  const resetForm = () => {
    setEditingId(null)
    setFormData({ name: "", capacity: 0, building: "", floor: "" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setHalls(prev => prev.map(h => h.id === editingId ? { ...h, ...formData, capacity: Number(formData.capacity) } : h))
      toast.success("Hall updated")
    } else {
      setHalls(prev => [...prev, { id: Date.now().toString(), ...formData, capacity: Number(formData.capacity) }])
      toast.success("Hall created")
    }
    setShowModal(false)
    resetForm()
  }

  const handleEdit = (hall: typeof HALLS[0]) => {
    setEditingId(hall.id)
    setFormData({ name: hall.name, capacity: hall.capacity, building: hall.building, floor: hall.floor })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setHalls(prev => prev.filter(h => h.id !== id))
    toast.success("Hall deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Hall Allocation</h1>
          <p className="text-gray-500 text-sm">Manage exam halls and seating capacity</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600"
        >
          <Plus size={16} /> Add Hall
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {halls.map((hall) => (
          <motion.div
            key={hall.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 border border-gray-100 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Building2 size={20} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(hall)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(hall.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-black font-semibold mb-1">{hall.name}</h3>
            <p className="text-gray-500 text-sm">{hall.building} • {hall.floor} Floor</p>
            <p className="text-gray-400 text-xs mt-1">Capacity: {hall.capacity} students</p>
          </motion.div>
        ))}
      </div>
      {halls.length === 0 && <div className="text-center text-gray-400 text-sm py-12">No halls configured. Add exam halls to get started.</div>}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title={editingId ? "Edit Hall" : "New Hall"} size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Hall Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" placeholder="e.g. Hall A" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Capacity *</label>
              <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Building *</label>
              <input type="text" value={formData.building} onChange={e => setFormData({ ...formData, building: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Floor</label>
              <input type="text" value={formData.floor} onChange={e => setFormData({ ...formData, floor: e.target.value })} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
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
