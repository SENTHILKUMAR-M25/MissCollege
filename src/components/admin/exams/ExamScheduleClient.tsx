"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Plus, Edit2, Trash2, CalendarDays } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

const SCHEDULES = [
  { id: "1", examType: "Mid-term", date: "2026-05-15", startTime: "09:00", endTime: "12:00", className: "I", section: "A" },
  { id: "2", examType: "Semester End", date: "2026-06-01", startTime: "09:00", endTime: "12:00", className: "I", section: "B" },
]

export default function ExamScheduleClient() {
  const [schedules, setSchedules] = useState(SCHEDULES)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ examType: "", date: "", startTime: "", endTime: "", className: "", section: "A" })

  const resetForm = () => {
    setEditingId(null)
    setFormData({ examType: "", date: "", startTime: "", endTime: "", className: "", section: "A" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      setSchedules(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s))
      toast.success("Schedule updated")
    } else {
      setSchedules(prev => [...prev, { id: Date.now().toString(), ...formData }])
      toast.success("Schedule created")
    }
    setShowModal(false)
    resetForm()
  }

  const handleEdit = (schedule: typeof SCHEDULES[0]) => {
    setEditingId(schedule.id)
    setFormData({ examType: schedule.examType, date: schedule.date, startTime: schedule.startTime, endTime: schedule.endTime, className: schedule.className, section: schedule.section })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id))
    toast.success("Schedule deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Exam Schedule</h1>
          <p className="text-gray-500 text-sm">Manage exam dates and time slots</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600"
        >
          <Plus size={16} /> Add Schedule
        </button>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class/Section</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedules.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-black font-medium">{s.examType}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{s.date}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{s.startTime} - {s.endTime}</td>
                <td className="px-5 py-3 text-sm text-gray-700">Class {s.className} • Sec {s.section}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {schedules.length === 0 && <div className="px-5 py-12 text-center text-gray-400 text-sm">No exam schedules found. Create one to get started.</div>}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm() }} title={editingId ? "Edit Schedule" : "New Schedule"} size="lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <label className="text-gray-500 text-xs mb-1 block">Start Time *</label>
              <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">End Time *</label>
              <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Class *</label>
              <input type="text" value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} required className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm" placeholder="I, II, III..." />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Section *</label>
              <select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm">
                <option value="A" className="bg-gray-100">A</option>
                <option value="B" className="bg-gray-100">B</option>
                <option value="C" className="bg-gray-100">C</option>
                <option value="D" className="bg-gray-100">D</option>
              </select>
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
