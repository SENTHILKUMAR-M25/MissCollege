"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Users, Plus, Trash2, Calendar, Clock, X, Check, BookOpen, GraduationCap, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

type Subject = { id: string; code: string; name: string; semester: number; academicYear?: string | null; subjectType: string; totalHoursPerWeek?: number | null; credits: number }
type Faculty = { id: string; facultyId: string; user: { name: string; email: string }; designation: string }
type Allocation = { id: string; subject: { id: string; code: string; name: string; semester: number; academicYear?: string | null; totalHoursPerWeek?: number | null }; faculty: { facultyId: string; user: { name: string; email: string } }; assignedHours?: number | null; assignedAt: string }

const TYPE_COLORS: Record<string, string> = {
  THEORY: "bg-blue-500/10 text-blue-400",
  LAB: "bg-violet-500/10 text-violet-400",
  ELECTIVE: "bg-amber-500/10 text-amber-400",
  PROJECT: "bg-emerald-500/10 text-emerald-400",
}

export default function HodAllocationClient({
  initialSubjects,
  initialFaculty,
  initialAllocations,
  departmentName,
  academicYears,
  semesters,
  facultyUserId,
}: {
  initialSubjects: Subject[]
  initialFaculty: Faculty[]
  initialAllocations: Allocation[]
  departmentName: string
  academicYears: string[]
  semesters: number[]
  facultyUserId: string
}) {
  const [subjects] = useState<Subject[]>(initialSubjects)
  const [faculty] = useState<Faculty[]>(initialFaculty)
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations)

  const [academicYear, setAcademicYear] = useState<string>(academicYears[0] || "ALL")
  const [semester, setSemester] = useState<string>(semesters[0]?.toString() || "ALL")
  const [searchSubject, setSearchSubject] = useState("")
  const [searchFaculty, setSearchFaculty] = useState("")

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([])
  const [hoursMap, setHoursMap] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState("")

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [showReassign, setShowReassign] = useState<string | null>(null)
  const [reassignId, setReassignId] = useState("")

  const showToast = (type: "success" | "error", msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000) }

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => academicYear === "ALL" || s.academicYear === academicYear)
      .filter((s) => semester === "ALL" || s.semester.toString() === semester)
      .filter((s) => !searchSubject || s.name.toLowerCase().includes(searchSubject.toLowerCase()) || s.code.toLowerCase().includes(searchSubject.toLowerCase()))
  }, [subjects, academicYear, semester, searchSubject])

  const filteredFaculty = useMemo(() => {
    return faculty
      .filter((f) => !searchFaculty || f.user.name.toLowerCase().includes(searchFaculty.toLowerCase()) || f.facultyId.toLowerCase().includes(searchFaculty.toLowerCase()))
  }, [faculty, searchFaculty])

  const filteredAllocations = useMemo(() => {
    return allocations
      .filter((a) => academicYear === "ALL" || a.subject.academicYear === academicYear)
      .filter((a) => semester === "ALL" || a.subject.semester.toString() === semester)
      .filter((a) => !searchSubject || a.subject.name.toLowerCase().includes(searchSubject.toLowerCase()) || a.subject.code.toLowerCase().includes(searchSubject.toLowerCase()))
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
  }, [allocations, academicYear, semester, searchSubject])

  const stats = useMemo(() => {
    const uniqueFaculty = new Set(allocations.map((a) => a.faculty.facultyId)).size
    const unassigned = filteredSubjects.filter((s) => !allocations.some((a) => a.subject.id === s.id)).length
    const totalAssignedHours = allocations.reduce((a, c) => a + (c.assignedHours || 0), 0)
    return { totalSubjects: filteredSubjects.length, totalAssigned: filteredSubjects.length - unassigned, unassigned, facultyAllocated: uniqueFaculty, totalHours: totalAssignedHours }
  }, [allocations, filteredSubjects])

  const loadAllocations = async () => {
    const r = await fetch(`/api/hod-subjects?academicYear=${academicYear}&semester=${semester}`)
    const j = await r.json()
    if (j.success) setAllocations(j.data.allocations || [])
  }

  const saveAllocation = async () => {
    if (!selectedSubject || !facultyUserId || selectedFaculty.length === 0) return
    setSaving(true)
    try {
      const body = {
        action: "allocate",
        subjectId: selectedSubject.id,
        facultyIds: selectedFaculty,
        hoursMap,
        facultyUserId: facultyUserId,
        notes,
      }
      const r = await fetch("/api/hod-subjects-allocations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const j = await r.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Allocation saved")
      setSelectedSubject(null)
      setSelectedFaculty([])
      setHoursMap({})
      setNotes("")
      loadAllocations()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeAllocation = async (allocationId: string) => {
    if (!confirm("Remove this allocation? Faculty will no longer be assigned to this subject.")) return
    setSaving(true)
    try {
      const r = await fetch(`/api/hod-subjects-allocations/${allocationId}`, { method: "DELETE" })
      const j = await r.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Allocation removed")
      loadAllocations()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
      setShowReassign(null)
      setReassignId("")
    }
  }

  const reassignAllocation = async (allocationId: string, newFacultyId: string) => {
    if (!facultyUserId) return
    setSaving(true)
    try {
      const r = await fetch("/api/hod-subjects-allocations/reassign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ allocationId, newFacultyId, facultyUserId: facultyUserId }) })
      const j = await r.json()
      if (!j.success) throw new Error(j.error)
      showToast("success", "Faculty reassigned")
      setShowReassign(null)
      loadAllocations()
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setSaving(false)
    }
  }

  const openAllocate = (sub: Subject | null = null) => {
    if (sub) {
      setSelectedSubject(sub)
      setSelectedFaculty([])
      setHoursMap({})
    } else if (selectedSubject) {
      setSelectedSubject(null)
      setSelectedFaculty([])
      setHoursMap({})
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Faculty Allocation</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {departmentName}</p>
        </div>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${toast.type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
          {toast.msg}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Subjects", value: stats.totalSubjects },
          { label: "Allocated", value: stats.totalAssigned, color: "text-emerald-400" },
          { label: "Unassigned", value: stats.unassigned, color: "text-red-400" },
          { label: "Faculty Allocated", value: stats.facultyAllocated },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color ?? "text-white"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={academicYear} onChange={(e) => { setAcademicYear(e.target.value); loadAllocations() }} className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
            {academicYears.map((y) => <option key={y} value={y}>AY: {y}</option>)}
          </select>
          <select value={semester} onChange={(e) => { setSemester(e.target.value); loadAllocations() }} className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
            {semesters.map((s) => <option key={s} value={s.toString()}>Semester {s}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchSubject} onChange={(e) => setSearchSubject(e.target.value)} placeholder="Search subjects..." className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:outline-none" />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchFaculty} onChange={(e) => setSearchFaculty(e.target.value)} placeholder="Filter faculty..." className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {selectedSubject ? (
        <div className="rounded-2xl bg-slate-800/50 border border-violet-500/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold">Allocating: {selectedSubject.code} - {selectedSubject.name}</h3>
              <p className="text-slate-400 text-xs mt-0.5">Semester {selectedSubject.semester} • {selectedSubject.academicYear || "No AY"} • {selectedSubject.subjectType}</p>
              {selectedSubject.totalHoursPerWeek && <p className="text-slate-400 text-xs mt-0.5">Total Hours/Week: {selectedSubject.totalHoursPerWeek}</p>}
            </div>
            <button onClick={() => openAllocate(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredFaculty.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No faculty in this department.</p>
            ) : (
              filteredFaculty.map((f) => {
                const checked = selectedFaculty.includes(f.id)
                const existingHours = hoursMap[f.id]
                return (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                        {f.user.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{f.user.name}</p>
                        <p className="text-slate-500 text-xs">{f.facultyId} • {f.designation}</p>
                        {f.user.email && <p className="text-slate-600 text-[10px]">{f.user.email}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFaculty((prev) => checked ? prev.filter((x) => x !== f.id) : [...prev, f.id])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${checked ? "bg-violet-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                      >
                        {checked ? <><Check size={12} className="inline mr-1" />Selected</> : <><Plus size={12} className="inline mr-1" />Select</>}
                      </button>
                    </div>
                    {checked && (
                      <div className="flex items-center gap-2 ml-3 pl-3 border-l border-white/5">
                        <input
                          type="number"
                          min="0"
                          placeholder="Hours"
                          value={existingHours === 0 ? 0 : existingHours ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseInt(e.target.value)
                            setHoursMap((prev) => ({ ...prev, [f.id]: isNaN(val) ? 0 : val }))
                          }}
                          className="w-20 bg-slate-800 border border-white/5 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                        />
                        <span className="text-slate-400 text-xs w-6">hrs</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-slate-400 text-xs">{selectedFaculty.length} faculty selected • Total: {Object.values(hoursMap).reduce((a, b) => a + b, 0)} hrs</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => openAllocate(null)} className="px-4 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm">Cancel</button>
              <button type="button" onClick={saveAllocation} disabled={saving || selectedFaculty.length === 0} className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Allocation"}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Available Subjects</h3>
              <span className="text-[10px] text-slate-400 font-medium bg-slate-700/50 px-2 py-0.5 rounded">{filteredSubjects.length} subjects</span>
            </div>
            {filteredSubjects.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">No subjects match filters.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSubject(s); setSelectedFaculty([]); setHoursMap({}) }}
                    className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{s.code}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{s.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_COLORS[s.subjectType] || "bg-slate-500/10 text-slate-400"}`}>{s.subjectType}</span>
                        {s.totalHoursPerWeek ? <span className="text-slate-400 text-[10px] flex items-center gap-1"><Clock size={10} />{s.totalHoursPerWeek}h</span> : null}
                      </div>
                    </div>
                    <p className="text-slate-500 text-[10px] mt-1">Sem {s.semester} • {s.academicYear || "No AY"} • Credits: {s.credits}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm">Current Allocations</h3>
              <span className="text-[10px] text-slate-400 font-medium bg-slate-700/50 px-2 py-0.5 rounded">{filteredAllocations.length} records</span>
            </div>
            {filteredAllocations.length === 0 ? (
              <div className="py-10 text-center">
                <Users size={28} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No allocations yet for this filter.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredAllocations.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-slate-400">{a.subject.academicYear || "No AY"} • Sem {a.subject.semester}</p>
                        <p className="text-white text-sm font-medium mt-0.5">{a.subject.code} - {a.subject.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-[10px]">
                            {a.faculty.user.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-slate-200 text-xs font-medium">{a.faculty.user.name}</p>
                            <p className="text-slate-500 text-[10px]">{a.faculty.facultyId}</p>
                          </div>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-1.5 flex items-center gap-1"><Clock size={10} /> {a.assignedHours || 0} teaching hours • Assigned {new Date(a.assignedAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {showReassign === a.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={reassignId}
                              onChange={(e) => setReassignId(e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded-lg px-1 py-1 text-white text-[10px] focus:outline-none max-w-[120px]"
                            >
                              <option value="">New faculty...</option>
                              {faculty.map((f) => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                            </select>
                            <button onClick={() => reassignId && reassignAllocation(a.id, reassignId)} className="text-emerald-400 hover:text-emerald-300 p-1"><RefreshCw size={12} /></button>
                            <button onClick={() => setShowReassign(null)} className="text-slate-400 hover:text-white p-1"><X size={12} /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setShowReassign(a.id); setReassignId("") }} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" title="Reassign"><RefreshCw size={13} /></button>
                            <button onClick={() => removeAllocation(a.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Remove"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
