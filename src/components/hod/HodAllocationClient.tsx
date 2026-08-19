"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import { Search, Users, Plus, Trash2, Calendar, Clock, X, Check, BookOpen, GraduationCap, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"

type Subject = { id: string; code: string; name: string; semester: number; academicYear?: string | null; subjectType: string; totalHoursPerWeek?: number | null; credits: number }
type Faculty = { id: string; facultyId: string; user: { name: string; email: string }; designation: string }
type Allocation = { id: string; subject: { id: string; code: string; name: string; semester: number; academicYear?: string | null; totalHoursPerWeek?: number | null }; faculty: { facultyId: string; user: { name: string; email: string } }; assignedHours?: number | null; assignedAt: string }

const TYPE_COLORS: Record<string, string> = {
  THEORY: "bg-[#2F2FE4]/10 text-[#2F2FE4]",
  LAB: "bg-[#2F2FE4]/10 text-[#2F2FE4]",
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
          <h1 className="text-black text-2xl font-bold">Faculty Allocation</h1>
          <p className="text-gray-500 text-sm mt-0.5">Department of {departmentName}</p>
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
          <div key={s.label} className="rounded-2xl bg-white border border-gray-200 p-4">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color ?? "text-black"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={academicYear} onChange={(e) => { setAcademicYear(e.target.value); loadAllocations() }} className="bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm focus:outline-none">
            {academicYears.map((y) => <option key={y} value={y}>AY: {y}</option>)}
          </select>
          <select value={semester} onChange={(e) => { setSemester(e.target.value); loadAllocations() }} className="bg-gray-100 border border-gray-100 rounded-xl px-3 py-2 text-black text-sm focus:outline-none">
            {semesters.map((s) => <option key={s} value={s.toString()}>Semester {s}</option>)}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchSubject} onChange={(e) => setSearchSubject(e.target.value)} placeholder="Search subjects..." className="w-full bg-gray-100 border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-black text-sm focus:outline-none" />
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchFaculty} onChange={(e) => setSearchFaculty(e.target.value)} placeholder="Filter faculty..." className="w-full bg-gray-100 border border-gray-100 rounded-xl pl-9 pr-3 py-2 text-black text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {selectedSubject ? (
        <div className="rounded-2xl bg-white border border-gray-200 border border-[#2F2FE4]/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-black font-bold">Allocating: {selectedSubject.code} - {selectedSubject.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">Semester {selectedSubject.semester} • {selectedSubject.academicYear || "No AY"} • {selectedSubject.subjectType}</p>
              {selectedSubject.totalHoursPerWeek && <p className="text-gray-500 text-xs mt-0.5">Total Hours/Week: {selectedSubject.totalHoursPerWeek}</p>}
            </div>
            <button onClick={() => openAllocate(null)} className="text-gray-500 hover:text-black"><X size={18} /></button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredFaculty.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No faculty in this department.</p>
            ) : (
              filteredFaculty.map((f) => {
                const checked = selectedFaculty.includes(f.id)
                const existingHours = hoursMap[f.id]
                return (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold text-xs">
                        {f.user.name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="text-black text-sm font-medium">{f.user.name}</p>
                        <p className="text-gray-400 text-xs">{f.facultyId} • {f.designation}</p>
                        {f.user.email && <p className="text-gray-400 text-[10px]">{f.user.email}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFaculty((prev) => checked ? prev.filter((x) => x !== f.id) : [...prev, f.id])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${checked ? "bg-[#2F2FE4] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {checked ? <><Check size={12} className="inline mr-1" />Selected</> : <><Plus size={12} className="inline mr-1" />Select</>}
                      </button>
                    </div>
                    {checked && (
                      <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-100">
                        <input
                          type="number"
                          min="0"
                          placeholder="Hours"
                          value={existingHours === 0 ? 0 : existingHours ?? ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : parseInt(e.target.value)
                            setHoursMap((prev) => ({ ...prev, [f.id]: isNaN(val) ? 0 : val }))
                          }}
                          className="w-20 bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-black text-xs focus:outline-none"
                        />
                        <span className="text-gray-500 text-xs w-6">hrs</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">{selectedFaculty.length} faculty selected • Total: {Object.values(hoursMap).reduce((a, b) => a + b, 0)} hrs</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => openAllocate(null)} className="px-4 py-2 rounded-xl bg-white border border-gray-100 text-gray-700 text-sm">Cancel</button>
              <button type="button" onClick={saveAllocation} disabled={saving || selectedFaculty.length === 0} className="px-4 py-2 rounded-xl bg-[#2F2FE4] hover:bg-[#2525c5] text-white text-sm font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Allocation"}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-black font-bold text-sm">Available Subjects</h3>
              <span className="text-[10px] text-gray-500 font-medium bg-gray-200/50 px-2 py-0.5 rounded">{filteredSubjects.length} subjects</span>
            </div>
            {filteredSubjects.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">No subjects match filters.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSubject(s); setSelectedFaculty([]); setHoursMap({}) }}
                    className="w-full text-left p-3 rounded-xl bg-white border border-gray-100 hover:border-[#2F2FE4]/30 hover:bg-[#2F2FE4]/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-black text-sm font-medium">{s.code}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{s.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TYPE_COLORS[s.subjectType] || "bg-gray-100 text-gray-500"}`}>{s.subjectType}</span>
                        {s.totalHoursPerWeek ? <span className="text-gray-500 text-[10px] flex items-center gap-1"><Clock size={10} />{s.totalHoursPerWeek}h</span> : null}
                      </div>
                    </div>
                    <p className="text-gray-400 text-[10px] mt-1">Sem {s.semester} • {s.academicYear || "No AY"} • Credits: {s.credits}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-black font-bold text-sm">Current Allocations</h3>
              <span className="text-[10px] text-gray-500 font-medium bg-gray-200/50 px-2 py-0.5 rounded">{filteredAllocations.length} records</span>
            </div>
            {filteredAllocations.length === 0 ? (
              <div className="py-10 text-center">
                <Users size={28} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No allocations yet for this filter.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredAllocations.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">{a.subject.academicYear || "No AY"} • Sem {a.subject.semester}</p>
                        <p className="text-black text-sm font-medium mt-0.5">{a.subject.code} - {a.subject.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-black font-bold text-[10px]">
                            {a.faculty.user.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-black text-xs font-medium">{a.faculty.user.name}</p>
                            <p className="text-gray-400 text-[10px]">{a.faculty.facultyId}</p>
                          </div>
                        </div>
                        <p className="text-gray-500 text-[10px] mt-1.5 flex items-center gap-1"><Clock size={10} /> {a.assignedHours || 0} teaching hours • Assigned {new Date(a.assignedAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {showReassign === a.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={reassignId}
                              onChange={(e) => setReassignId(e.target.value)}
                              className="bg-white border border-gray-200 rounded-lg px-1 py-1 text-black text-[10px] focus:outline-none max-w-[120px]"
                            >
                              <option value="">New faculty...</option>
                              {faculty.map((f) => <option key={f.id} value={f.id}>{f.user.name}</option>)}
                            </select>
                            <button onClick={() => reassignId && reassignAllocation(a.id, reassignId)} className="text-emerald-400 hover:text-emerald-300 p-1"><RefreshCw size={12} /></button>
                            <button onClick={() => setShowReassign(null)} className="text-gray-500 hover:text-black p-1"><X size={12} /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setShowReassign(a.id); setReassignId("") }} className="p-1.5 rounded-lg bg-[#2F2FE4]/10 text-[#2F2FE4] hover:bg-[#2F2FE4]/15" title="Reassign"><RefreshCw size={13} /></button>
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
