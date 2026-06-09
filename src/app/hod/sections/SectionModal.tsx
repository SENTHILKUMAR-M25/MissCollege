"use client"

import { useState } from "react"
import { X, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function SectionModal({ onClose, onSubmit, departmentOptions }: { onClose: () => void; onSubmit: (data: any) => void; departmentOptions: any[] }) {
  const [form, setForm] = useState({
    departmentId: "",
    name: "",
    className: "",
    academicYear: new Date().getFullYear().toString(),
    semester: "",
    capacity: "",
    allocationMode: "AUTO" as "AUTO" | "MANUAL",
  })
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({ ...form, semester: Number(form.semester), capacity: Number(form.capacity) })
    setSubmitting(false)
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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <CheckCircle2 size={18} />
          </div>
          <h3 className="text-white font-bold text-lg">Create Section</h3>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Section Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none"
              placeholder="e.g., A, B, C"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Academic Year</label>
              <input
                type="number"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Class Name</label>
            <input
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none"
              placeholder="e.g., II-B.Sc CS"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Capacity</label>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Allocation Mode</label>
            <select
              value={form.allocationMode}
              onChange={(e) => setForm({ ...form, allocationMode: e.target.value as "AUTO" | "MANUAL" })}
              className="w-full rounded-xl bg-slate-800/50 border border-white/10 px-4 py-2.5 text-sm text-white outline-none"
            >
              <option value="AUTO">AUTO - Assign by student section field</option>
              <option value="MANUAL">MANUAL - Assign manually</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-violet-500 py-3 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating..." : "Create Section"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
