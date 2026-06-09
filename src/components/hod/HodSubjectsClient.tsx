"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Edit, Trash, BookOpen, Plus, X, Clock } from "lucide-react"

type Subject = {
  id: string
  code: string
  name: string
  description?: string | null
  credits: number
  semester: number
  subjectType: string
  isActive: boolean
  academicYear?: string | null
  regulation?: string | null
  facultyId?: string | null
  totalHoursPerWeek?: number | null
  faculty?: { user: { name: string } } | null
  facultySubjects?: { id: string; facultyId: string; assignedHours?: number | null; faculty: { user: { name: string } } }[]
}

type FacultyOpt = { id: string; facultyId: string; user: { name: string; email: string }; designation: string }

const TYPE_STYLE: Record<string, string> = {
  THEORY: "bg-blue-500/10 text-blue-400",
  LAB: "bg-violet-500/10 text-violet-400",
  ELECTIVE: "bg-amber-500/10 text-amber-400",
  PROJECT: "bg-emerald-500/10 text-emerald-400",
}

export default function HodSubjectsClient({
  initialSubjects,
  initialFaculty,
  departmentName,
  facultyUserId,
}: {
  initialSubjects: Subject[]
  initialFaculty: FacultyOpt[]
  departmentName: string
  facultyUserId: string
}) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [faculty, setFaculty] = useState<FacultyOpt[]>(initialFaculty)
  const [search, setSearch] = useState("")
  const [semFilter, setSemFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showAllocate, setShowAllocate] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [allocatingSubject, setAllocatingSubject] = useState<Subject | null>(null)
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([])
  const [hoursMap, setHoursMap] = useState<Record<string, number>>({})

  const [formData, setFormData] = useState({ name: "", code: "", credits: "", semester: "", subjectType: "THEORY", description: "", totalHoursPerWeek: "", academicYear: "", regulation: "" })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "error" | "success"; msg: string } | null>(null)

  const showToast = (type: "error" | "success", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000) }

  const load = async () => {
    const r = await fetch("/api/hod-subjects")
    const j = await r.json()
    if (j.success) setSubjects(j.data.subjects)
  }
  const loadFaculty = async () => {
    const r = await fetch("/api/hod-departments/hod")
    const j = await r.json()
    if (j.success) setFaculty(j.data.faculty || [])
  }

  useEffect(() => { load(); loadFaculty() }, [facultyUserId])

  const filtered = subjects
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => semFilter === "ALL" || s.semester.toString() === semFilter)
    .filter((s) => typeFilter === "ALL" || s.subjectType === typeFilter)
    .filter((s) => statusFilter === "ALL" || (statusFilter === "ACTIVE" ? s.isActive : !s.isActive))

  const unassigned = subjects.filter((s) => !s.facultyId && (!s.facultySubjects || s.facultySubjects.length === 0)).length
  const active = subjects.filter((s) => s.isActive).length

  const handleCreate = async () => {
    if (!facultyUserId) return
    setSaving(true)
    try {
      const res = await fetch("/api/hod-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          credits: Number(formData.credits),
          semester: Number(formData.semester),
          totalHoursPerWeek: formData.totalHoursPerWeek ? Number(formData.totalHoursPerWeek) : null,
          facultyId: facultyUserId,
        }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Subject created")
      setShowAdd(false)
      setFormData({ name: "", code: "", credits: "", semester: "", subjectType: "THEORY", description: "", totalHoursPerWeek: "", academicYear: "", regulation: "" })
      load()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingSubject || !facultyUserId) return
    setSaving(true)
    try {
      const res = await fetch("/api/hod-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          subjectId: editingSubject.id,
          facultyId: facultyUserId,
          ...formData,
          credits: Number(formData.credits),
          semester: Number(formData.semester),
          totalHoursPerWeek: formData.totalHoursPerWeek ? Number(formData.totalHoursPerWeek) : null,
        }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Subject updated")
      setShowEdit(false)
      setEditingSubject(null)
      load()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject permanently?")) return
    setSaving(true)
    try {
      const res = await fetch(`/api/hod-subjects/${id}`, { method: "DELETE" })
      const j = await res.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Subject deleted")
      load()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAllocate = async () => {
    if (!allocatingSubject || !facultyUserId || selectedFacultyIds.length === 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/hod-subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "allocate",
          subjectId: allocatingSubject.id,
          facultyIds: selectedFacultyIds,
        }),
      })
      const j = await res.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Faculty allocated successfully")
      setShowAllocate(false)
      setSelectedFacultyIds([])
      setHoursMap({})
      load()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">Subject Management</h1>
            <p className="text-slate-400 text-sm mt-0.5">Department of {departmentName}</p>
          </div>
        </div>
        <button onClick={() => { setFormData({ name: "", code: "", credits: "", semester: "", subjectType: "THEORY", description: "", totalHoursPerWeek: "", academicYear: "", regulation: "" }); setShowAdd(true) }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold">
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${toast.type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Subjects", value: subjects.length, color: "text-white" },
          { label: "Active", value: active, color: "text-emerald-400" },
          { label: "Unassigned", value: unassigned, color: "text-red-400" },
          { label: "Faculty", value: faculty.length, color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center rounded-2xl bg-white/[0.03] border border-white/5 p-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code or name..." className="flex-1 min-w-[220px] bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
        <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm">
          <option value="ALL">All Semesters</option>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => <option key={n} value={n.toString()}>Semester {n}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm">
          <option value="ALL">All Types</option>
          <option value="THEORY">Theory</option>
          <option value="LAB">Lab</option>
          <option value="ELECTIVE">Elective</option>
          <option value="PROJECT">Project</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-16 text-center">
          <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No subjects to display.</p>
        </div>
      )}

      {Object.entries(filtered.reduce<Record<number, Subject[]>>((acc, s) => { acc[s.semester] = acc[s.semester] || []; acc[s.semester].push(s); return acc }, {}))
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([sem, rows]) => (
          <div key={sem} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
            <div className="px-6 py-3 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">Semester {sem}</h3>
                <p className="text-slate-500 text-xs">{rows.length} subjects</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Credits</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Faculty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-violet-400 text-sm font-mono font-semibold">{sub.code}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{sub.name}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{sub.credits}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_STYLE[sub.subjectType] || "bg-slate-500/10 text-slate-400"}`}>{sub.subjectType}</span></td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{sub.totalHoursPerWeek ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">
                        {sub.faculty ? sub.faculty.user.name : <span className="text-slate-500 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        {sub.isActive ? <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">Active</span> : <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400">Inactive</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setAllocatingSubject(sub); setSelectedFacultyIds((sub.facultySubjects || []).map((a) => a.facultyId)); setHoursMap((sub.facultySubjects || []).reduce((acc: Record<string, number>, a) => ({ ...acc, [a.facultyId]: a.assignedHours ?? 0 }), {})); setShowAllocate(true) }} className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20"><Users size={14} /></button>
                          <button onClick={() => { setEditingSubject(sub); setFormData({ name: sub.name, code: sub.code, credits: sub.credits.toString(), semester: sub.semester.toString(), subjectType: sub.subjectType, description: sub.description || "", totalHoursPerWeek: sub.totalHoursPerWeek?.toString() || "", academicYear: sub.academicYear || "", regulation: sub.regulation || "" }); setShowEdit(true) }} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Add/Edit Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowAdd(false); setShowEdit(false) }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">{showAdd ? "Add Subject" : "Edit Subject"}</h3>
              <button onClick={() => { setShowAdd(false); setShowEdit(false) }} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-medium">Subject Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Code</label>
                <input required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Credits</label>
                <input required type="number" min="1" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Semester</label>
                <input required type="number" min="1" max="8" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Type</label>
                <select value={formData.subjectType} onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="THEORY">Theory</option>
                  <option value="LAB">Lab / Practical</option>
                  <option value="ELECTIVE">Elective</option>
                  <option value="PROJECT">Project</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Total Hours / Week</label>
                <input type="number" min="0" value={formData.totalHoursPerWeek} onChange={(e) => setFormData({ ...formData, totalHoursPerWeek: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Academic Year</label>
                <input placeholder="e.g. 2025-2026" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Regulation</label>
                <input placeholder="e.g. R2021" value={formData.regulation} onChange={(e) => setFormData({ ...formData, regulation: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs text-slate-400 font-medium">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button onClick={() => { setShowAdd(false); setShowEdit(false) }} className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm">Cancel</button>
              <button onClick={showAdd ? handleCreate : handleUpdate} disabled={saving} className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Subject"}</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Allocate Modal */}
      {showAllocate && allocatingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAllocate(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-bold text-lg">Allocate Faculty</h3>
                <p className="text-slate-400 text-xs mt-0.5">{allocatingSubject.code} - {allocatingSubject.name}</p>
              </div>
              <button onClick={() => setShowAllocate(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="mb-4">
              <p className="text-slate-400 text-xs mb-3">Select faculty members and assign teaching hours.</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {faculty.map((f) => {
                  const checked = selectedFacultyIds.includes(f.id)
                  const hours = hoursMap[f.id] ?? 0
                  return (
                    <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/5">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setSelectedFacultyIds((prev) => checked ? prev.filter((x) => x !== f.id) : [...prev, f.id])} className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${checked ? "bg-violet-500 text-white border-violet-500" : "bg-slate-800 text-slate-400 border-white/10"}`}>
                          {checked ? <CheckIcon /> : <Plus size={14} />}
                        </button>
                        <div>
                          <p className="text-white text-sm font-medium">{f.user.name}</p>
                          <p className="text-slate-500 text-xs">{f.facultyId} • {f.designation}</p>
                        </div>
                      </div>
                      {checked && (
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" value={hours} onChange={(e) => setHoursMap({ ...hoursMap, [f.id]: e.target.value ? parseInt(e.target.value) : 0 })} className="w-20 bg-slate-900 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" />
                          <span className="text-slate-400 text-xs">hrs</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-xs">{selectedFacultyIds.length} faculty selected</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAllocate(false)} className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm">Cancel</button>
                <button onClick={handleAllocate} disabled={saving || selectedFacultyIds.length === 0} className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Allocation"}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
