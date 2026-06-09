"use client"

import { useState, useMemo, useTransition } from "react"
import {
  Users, BookOpen, UserCheck, AlertCircle, CheckCircle2,
  Plus, Trash2, RefreshCw, X, ChevronDown, Search,
  BarChart3, GraduationCap, Clock, Briefcase,
} from "lucide-react"
import {
  assignSubjectToFaculty,
  removeSubjectFromFaculty,
  transferSubject,
  assignClassAdvisor,
  removeClassAdvisor,
  changeClassAdvisor,
} from "@/actions/hod-work-allocation"
import { useRouter } from "next/navigation"

/* ── types ── */
type FacultyRow = {
  id: string; facultyId: string; name: string; email: string; designation: string
  subjects: { allocationId: string; subjectId: string; code: string; name: string; semester: number; hoursPerWeek: number }[]
  classAdvisorFor: { id: string; semester: number; section: string; academicYear: string }[]
  totalWeeklyHours: number; isClassAdvisor: boolean
}
type Subject = { id: string; code: string; name: string; semester: number; credits: number; subjectType: string; academicYear?: string | null; totalHoursPerWeek?: number | null; facultyId?: string | null }
type ClassAdvisor = { id: string; semester: number; section: string; academicYear: string; faculty: { id: string; facultyId: string; user: { name: string } } }
type UnassignedSection = { semester: number; section: string }
type Stats = { totalFaculty: number; totalSubjectsAssigned: number; totalClassAdvisors: number; unassignedSubjects: number; unassignedClasses: number }

const TABS = ["Allocation Table", "Assign Subject", "Assign Class Advisor", "Workload Dashboard", "Unassigned"] as const
type Tab = typeof TABS[number]

const TYPE_COLOR: Record<string, string> = {
  THEORY: "bg-blue-500/10 text-blue-400",
  LAB: "bg-violet-500/10 text-violet-400",
  ELECTIVE: "bg-amber-500/10 text-amber-400",
  PROJECT: "bg-emerald-500/10 text-emerald-400",
}

function Toast({ t, onClose }: { t: { type: "success" | "error"; msg: string }; onClose: () => void }) {
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${t.type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
      {t.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      <span className="flex-1">{t.msg}</span>
      <button onClick={onClose}><X size={13} /></button>
    </div>
  )
}

function StatCard({ label, value, color = "text-white", icon: Icon }: { label: string; value: number; color?: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
        <Icon size={18} />
      </div>
    </div>
  )
}

export default function WorkAllocationClient({
  facultyUserId,
  departmentName,
  initialData,
}: {
  facultyUserId: string
  departmentName: string
  initialData: {
    facultyList: FacultyRow[]
    subjects: Subject[]
    classAdvisors: ClassAdvisor[]
    allSections: UnassignedSection[]
    unassignedSections: UnassignedSection[]
    unassignedSubjects: Subject[]
    semesters: number[]
    academicYears: string[]
    sections: string[]
    stats: Stats
  }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [activeTab, setActiveTab] = useState<Tab>("Allocation Table")
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // local state mirrors (refresh via router.refresh)
  const { facultyList, subjects, classAdvisors, allSections, unassignedSections, unassignedSubjects, semesters, academicYears, sections, stats } = initialData

  // Filters
  const [filterSem, setFilterSem] = useState<string>("ALL")
  const [filterSec, setFilterSec] = useState<string>("ALL")
  const [filterSearch, setFilterSearch] = useState("")

  // Assign Subject form
  const [asSem, setAsSem] = useState<string>(semesters[0]?.toString() || "")
  const [asSubjectId, setAsSubjectId] = useState("")
  const [asFacultyId, setAsFacultyId] = useState("")
  const [asHours, setAsHours] = useState<string>("")

  // Assign Class Advisor form
  const [acaSem, setAcaSem] = useState<string>(semesters[0]?.toString() || "")
  const [acaSection, setAcaSection] = useState<string>(sections[0] || "")
  const [acaFacultyId, setAcaFacultyId] = useState("")
  const [acaYear, setAcaYear] = useState<string>(academicYears[0] || new Date().getFullYear() + "-" + (new Date().getFullYear() + 1))

  // Inline actions state
  const [transferTarget, setTransferTarget] = useState<{ allocationId: string; newFacultyId: string } | null>(null)
  const [changeAdvisorTarget, setChangeAdvisorTarget] = useState<{ id: string; newFacultyId: string } | null>(null)

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const refresh = () => { router.refresh() }

  /* filtered subjects for assign subject tab */
  const semSubjects = useMemo(() =>
    subjects.filter((s) => !asSem || s.semester.toString() === asSem),
    [subjects, asSem]
  )

  /* filtered allocation table */
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const matchSearch = !filterSearch || f.name.toLowerCase().includes(filterSearch.toLowerCase()) || f.facultyId.toLowerCase().includes(filterSearch.toLowerCase())
      const matchSem = filterSem === "ALL" || f.subjects.some((s) => s.semester.toString() === filterSem) || f.classAdvisorFor.some((ca) => ca.semester.toString() === filterSem)
      const matchSec = filterSec === "ALL" || f.classAdvisorFor.some((ca) => ca.section === filterSec)
      return matchSearch && matchSem && matchSec
    })
  }, [facultyList, filterSearch, filterSem, filterSec])

  /* actions */
  async function handleAssignSubject() {
    if (!asSubjectId || !asFacultyId) return showToast("error", "Select both subject and faculty")
    startTransition(async () => {
      const r = await assignSubjectToFaculty(facultyUserId, asSubjectId, asFacultyId, asHours ? parseInt(asHours) : undefined)
      if (r.success) { showToast("success", "Subject assigned successfully"); setAsSubjectId(""); setAsFacultyId(""); setAsHours(""); refresh() }
      else showToast("error", r.error || "Failed")
    })
  }

  async function handleRemoveSubject(allocationId: string) {
    if (!confirm("Remove this subject allocation?")) return
    startTransition(async () => {
      const r = await removeSubjectFromFaculty(facultyUserId, allocationId)
      if (r.success) { showToast("success", "Allocation removed"); refresh() }
      else showToast("error", r.error || "Failed")
    })
  }

  async function handleTransferSubject() {
    if (!transferTarget?.allocationId || !transferTarget.newFacultyId) return
    startTransition(async () => {
      const r = await transferSubject(facultyUserId, transferTarget.allocationId, transferTarget.newFacultyId)
      if (r.success) { showToast("success", "Subject transferred"); setTransferTarget(null); refresh() }
      else showToast("error", r.error || "Failed")
    })
  }

  async function handleAssignAdvisor() {
    if (!acaFacultyId || !acaSem || !acaSection) return showToast("error", "Fill all fields")
    startTransition(async () => {
      const r = await assignClassAdvisor(facultyUserId, acaFacultyId, parseInt(acaSem), acaSection, acaYear)
      if (r.success) { showToast("success", "Class Advisor assigned"); setAcaFacultyId(""); refresh() }
      else showToast("error", r.error || "Failed")
    })
  }

  async function handleRemoveAdvisor(id: string) {
    if (!confirm("Remove this Class Advisor?")) return
    startTransition(async () => {
      const r = await removeClassAdvisor(facultyUserId, id)
      if (r.success) { showToast("success", "Class Advisor removed"); refresh() }
      else showToast("error", r.error || "Failed")
    })
  }

  async function handleChangeAdvisor() {
    if (!changeAdvisorTarget?.id || !changeAdvisorTarget.newFacultyId) return
    startTransition(async () => {
      const r = await changeClassAdvisor(facultyUserId, changeAdvisorTarget.id, changeAdvisorTarget.newFacultyId)
      if (r.success) { showToast("success", "Class Advisor changed"); setChangeAdvisorTarget(null); refresh() }
      else showToast("error", r.error || "Failed")
    })
  }

  const inp = "bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50"

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <Briefcase size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Faculty Work Allocation</h1>
          <p className="text-slate-400 text-sm mt-0.5">Department of {departmentName}</p>
        </div>
      </div>

      {toast && <Toast t={toast} onClose={() => setToast(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total Faculty" value={stats.totalFaculty} icon={Users} />
        <StatCard label="Subjects Assigned" value={stats.totalSubjectsAssigned} color="text-emerald-400" icon={BookOpen} />
        <StatCard label="Class Advisors" value={stats.totalClassAdvisors} color="text-violet-400" icon={UserCheck} />
        <StatCard label="Unassigned Subjects" value={stats.unassignedSubjects} color={stats.unassignedSubjects > 0 ? "text-amber-400" : "text-white"} icon={AlertCircle} />
        <StatCard label="Unassigned Classes" value={stats.unassignedClasses} color={stats.unassignedClasses > 0 ? "text-red-400" : "text-white"} icon={GraduationCap} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 rounded-xl p-1 border border-white/5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab ? "bg-violet-500 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TAB: Allocation Table ── */}
      {activeTab === "Allocation Table" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-slate-800/50 border border-white/5">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Search faculty..." className={`${inp} pl-8 w-full`} />
            </div>
            <select value={filterSem} onChange={(e) => setFilterSem(e.target.value)} className={inp}>
              <option value="ALL">All Semesters</option>
              {semesters.map((s) => <option key={s} value={s.toString()}>Semester {s}</option>)}
            </select>
            <select value={filterSec} onChange={(e) => setFilterSec(e.target.value)} className={inp}>
              <option value="ALL">All Sections</option>
              {sections.map((s) => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Faculty ID", "Faculty Name", "Designation", "Assigned Subjects", "Subject Codes", "Semester", "Section", "Class Advisor", "Workload (hrs/wk)", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-slate-400 text-xs font-semibold whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-4 py-3 text-slate-400 text-xs font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-10 text-slate-500">No faculty match filters.</td></tr>
                  ) : filteredFaculty.map((f) => (
                    <tr key={f.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-slate-300 text-xs font-mono whitespace-nowrap">{f.facultyId}</td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm font-medium whitespace-nowrap">{f.name}</p>
                        <p className="text-slate-500 text-[10px]">{f.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{f.designation}</td>
                      <td className="px-4 py-3">
                        {f.subjects.length === 0 ? (
                          <span className="text-slate-600 text-xs">—</span>
                        ) : (
                          <div className="space-y-1">
                            {f.subjects.map((s) => (
                              <div key={s.allocationId} className="flex items-center gap-1 group">
                                <span className="text-white text-xs truncate max-w-[140px]">{s.name}</span>
                                <button
                                  onClick={() => handleRemoveSubject(s.allocationId)}
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                  title="Remove subject"
                                ><X size={11} /></button>
                                <button
                                  onClick={() => setTransferTarget({ allocationId: s.allocationId, newFacultyId: "" })}
                                  className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 transition-opacity"
                                  title="Transfer subject"
                                ><RefreshCw size={11} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {f.subjects.map((s) => (
                            <span key={s.allocationId} className="text-[10px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded font-mono">{s.code}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(f.subjects.map((s) => s.semester))).map((sem) => (
                            <span key={sem} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Sem {sem}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {f.classAdvisorFor.map((ca) => (
                            <span key={ca.id} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Sec {ca.section}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {f.classAdvisorFor.length > 0 ? (
                          <div className="space-y-1">
                            {f.classAdvisorFor.map((ca) => (
                              <div key={ca.id} className="flex items-center gap-1 group">
                                <span className="text-emerald-400 text-xs">Sem {ca.semester} / {ca.section}</span>
                                <button
                                  onClick={() => handleRemoveAdvisor(ca.id)}
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                                  title="Remove advisor"
                                ><X size={11} /></button>
                                <button
                                  onClick={() => setChangeAdvisorTarget({ id: ca.id, newFacultyId: "" })}
                                  className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-blue-300 transition-opacity"
                                  title="Change advisor"
                                ><RefreshCw size={11} /></button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-500" />
                          <span className={`text-sm font-bold ${f.totalWeeklyHours >= 18 ? "text-red-400" : f.totalWeeklyHours >= 12 ? "text-amber-400" : "text-white"}`}>
                            {f.totalWeeklyHours}h
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {f.subjects.length > 0 || f.isClassAdvisor ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">Allocated</span>
                        ) : (
                          <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-semibold">Unallocated</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {/* quick assign buttons */}
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setActiveTab("Assign Subject"); setAsFacultyId(f.id) }}
                            className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                            title="Assign Subject"
                          ><BookOpen size={13} /></button>
                          <button
                            onClick={() => { setActiveTab("Assign Class Advisor"); setAcaFacultyId(f.id) }}
                            className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
                            title="Assign Class Advisor"
                          ><UserCheck size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Assign Subject ── */}
      {activeTab === "Assign Subject" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2"><BookOpen size={15} className="text-violet-400" /> Assign Subject</h3>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Semester</label>
              <select value={asSem} onChange={(e) => { setAsSem(e.target.value); setAsSubjectId("") }} className={`${inp} w-full`}>
                {semesters.map((s) => <option key={s} value={s.toString()}>Semester {s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Subject</label>
              <select value={asSubjectId} onChange={(e) => setAsSubjectId(e.target.value)} className={`${inp} w-full`}>
                <option value="">Select Subject</option>
                {semSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} – {s.name} ({s.subjectType})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Faculty Member</label>
              <select value={asFacultyId} onChange={(e) => setAsFacultyId(e.target.value)} className={`${inp} w-full`}>
                <option value="">Select Faculty</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>{f.facultyId} – {f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Hours per Week (optional)</label>
              <input type="number" min="0" max="30" value={asHours} onChange={(e) => setAsHours(e.target.value)} placeholder="e.g. 4" className={`${inp} w-full`} />
            </div>

            <button
              onClick={handleAssignSubject}
              disabled={isPending || !asSubjectId || !asFacultyId}
              className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? "Assigning..." : <><Plus size={14} /> Assign Subject</>}
            </button>
          </div>

          {/* Current allocations for selected faculty */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
            <h3 className="text-white font-bold text-sm">Current Subject Allocations</h3>
            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {facultyList.map((f) =>
                f.subjects.length === 0 ? null : (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1.5">
                    <p className="text-white text-xs font-semibold">{f.name} <span className="text-slate-500 font-normal">({f.facultyId})</span></p>
                    {f.subjects.map((s) => (
                      <div key={s.allocationId} className="flex items-center justify-between pl-2">
                        <div>
                          <span className="text-slate-300 text-xs">{s.code} – {s.name}</span>
                          <span className="text-slate-500 text-[10px] ml-2">Sem {s.semester}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setTransferTarget({ allocationId: s.allocationId, newFacultyId: "" })} className="p-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" title="Transfer"><RefreshCw size={11} /></button>
                          <button onClick={() => handleRemoveSubject(s.allocationId)} className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Remove"><Trash2 size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {facultyList.every((f) => f.subjects.length === 0) && (
                <p className="text-slate-500 text-sm text-center py-6">No subject allocations yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Assign Class Advisor ── */}
      {activeTab === "Assign Class Advisor" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2"><UserCheck size={15} className="text-teal-400" /> Assign Class Advisor</h3>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Academic Year</label>
              <input value={acaYear} onChange={(e) => setAcaYear(e.target.value)} placeholder="e.g. 2024-2025" className={`${inp} w-full`} />
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Semester</label>
              <select value={acaSem} onChange={(e) => setAcaSem(e.target.value)} className={`${inp} w-full`}>
                {semesters.map((s) => <option key={s} value={s.toString()}>Semester {s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Section</label>
              <select value={acaSection} onChange={(e) => setAcaSection(e.target.value)} className={`${inp} w-full`}>
                <option value="">Select Section</option>
                {allSections.filter((s) => s.semester.toString() === acaSem).map((s) => (
                  <option key={`${s.semester}-${s.section}`} value={s.section}>Section {s.section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Faculty Member</label>
              <select value={acaFacultyId} onChange={(e) => setAcaFacultyId(e.target.value)} className={`${inp} w-full`}>
                <option value="">Select Faculty</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>{f.facultyId} – {f.name}</option>
                ))}
              </select>
            </div>

            {/* Conflict warning */}
            {acaSem && acaSection && classAdvisors.some((ca) => ca.semester.toString() === acaSem && ca.section === acaSection) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                <AlertCircle size={13} />
                This Sem/Section already has a Class Advisor assigned. Reassign by removing first.
              </div>
            )}

            <button
              onClick={handleAssignAdvisor}
              disabled={isPending || !acaFacultyId || !acaSem || !acaSection}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? "Assigning..." : <><Plus size={14} /> Assign Class Advisor</>}
            </button>
          </div>

          {/* Current advisors */}
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
            <h3 className="text-white font-bold text-sm">Current Class Advisors</h3>
            {classAdvisors.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No class advisors assigned yet.</p>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto">
                {classAdvisors.map((ca) => (
                  <div key={ca.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">{ca.faculty.user.name}</p>
                      <p className="text-slate-500 text-xs">{ca.faculty.facultyId} · Sem {ca.semester} · Sec {ca.section}</p>
                      <p className="text-slate-600 text-[10px]">{ca.academicYear}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setChangeAdvisorTarget({ id: ca.id, newFacultyId: "" })} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" title="Change"><RefreshCw size={13} /></button>
                      <button onClick={() => handleRemoveAdvisor(ca.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Remove"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Workload Dashboard ── */}
      {activeTab === "Workload Dashboard" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-bold flex items-center gap-2"><BarChart3 size={15} className="text-violet-400" /> Faculty Workload Distribution</h3>
            </div>
            <div className="divide-y divide-white/5">
              {facultyList.map((f) => {
                const pct = Math.min(100, (f.totalWeeklyHours / 20) * 100)
                const barColor = f.totalWeeklyHours >= 18 ? "bg-red-400" : f.totalWeeklyHours >= 12 ? "bg-amber-400" : "bg-emerald-400"
                return (
                  <div key={f.id} className="p-4 grid grid-cols-1 md:grid-cols-[200px_1fr_120px_120px] gap-4 items-center">
                    <div>
                      <p className="text-white text-sm font-medium">{f.name}</p>
                      <p className="text-slate-500 text-xs">{f.facultyId} · {f.designation}</p>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {f.subjects.map((s) => (
                          <span key={s.allocationId} className="text-[10px] bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded">{s.code}</span>
                        ))}
                        {f.subjects.length === 0 && <span className="text-slate-600 text-xs">No subjects</span>}
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" />
                      <span className={`text-sm font-bold ${f.totalWeeklyHours >= 18 ? "text-red-400" : f.totalWeeklyHours >= 12 ? "text-amber-400" : "text-white"}`}>{f.totalWeeklyHours}h/wk</span>
                    </div>
                    <div>
                      {f.isClassAdvisor ? (
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-semibold">Class Advisor</span>
                      ) : (
                        <span className="text-[10px] bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">No Class</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Unassigned ── */}
      {activeTab === "Unassigned" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              <BookOpen size={15} className="text-amber-400" /> Unassigned Subjects
              <span className="ml-auto text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold">{unassignedSubjects.length}</span>
            </h3>
            {unassignedSubjects.length === 0 ? (
              <p className="text-emerald-400 text-sm flex items-center gap-2 py-4"><CheckCircle2 size={14} /> All subjects have been assigned!</p>
            ) : (
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                {unassignedSubjects.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-amber-500/10">
                    <div>
                      <p className="text-white text-sm font-medium">{s.code}</p>
                      <p className="text-slate-400 text-xs">{s.name}</p>
                      <p className="text-slate-500 text-[10px]">Sem {s.semester} · {s.subjectType}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("Assign Subject"); setAsSem(s.semester.toString()); setAsSubjectId(s.id) }}
                      className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors"
                      title="Assign now"
                    ><Plus size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-5 space-y-3">
            <h3 className="text-white font-bold flex items-center gap-2">
              <GraduationCap size={15} className="text-red-400" /> Unassigned Classes
              <span className="ml-auto text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-semibold">{unassignedSections.length}</span>
            </h3>
            {unassignedSections.length === 0 ? (
              <p className="text-emerald-400 text-sm flex items-center gap-2 py-4"><CheckCircle2 size={14} /> All classes have a Class Advisor!</p>
            ) : (
              <div className="space-y-2 max-h-[440px] overflow-y-auto">
                {unassignedSections.map((s) => (
                  <div key={`${s.semester}-${s.section}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-red-500/10">
                    <div>
                      <p className="text-white text-sm font-medium">Semester {s.semester} — Section {s.section}</p>
                      <p className="text-slate-500 text-xs">No Class Advisor assigned</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("Assign Class Advisor"); setAcaSem(s.semester.toString()); setAcaSection(s.section) }}
                      className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
                      title="Assign advisor"
                    ><Plus size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Transfer Subject Modal ── */}
      {transferTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setTransferTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold">Transfer Subject</h3>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Transfer to Faculty</label>
              <select
                value={transferTarget.newFacultyId}
                onChange={(e) => setTransferTarget({ ...transferTarget, newFacultyId: e.target.value })}
                className={`${inp} w-full`}
              >
                <option value="">Select Faculty</option>
                {facultyList.map((f) => <option key={f.id} value={f.id}>{f.facultyId} – {f.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTransferTarget(null)} className="flex-1 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm">Cancel</button>
              <button onClick={handleTransferSubject} disabled={isPending || !transferTarget.newFacultyId} className="flex-1 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">
                {isPending ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Advisor Modal ── */}
      {changeAdvisorTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setChangeAdvisorTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-white font-bold">Change Class Advisor</h3>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">New Class Advisor</label>
              <select
                value={changeAdvisorTarget.newFacultyId}
                onChange={(e) => setChangeAdvisorTarget({ ...changeAdvisorTarget, newFacultyId: e.target.value })}
                className={`${inp} w-full`}
              >
                <option value="">Select Faculty</option>
                {facultyList.map((f) => <option key={f.id} value={f.id}>{f.facultyId} – {f.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setChangeAdvisorTarget(null)} className="flex-1 py-2 rounded-xl bg-slate-800 border border-white/5 text-slate-300 text-sm">Cancel</button>
              <button onClick={handleChangeAdvisor} disabled={isPending || !changeAdvisorTarget.newFacultyId} className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold disabled:opacity-50">
                {isPending ? "Changing..." : "Change Advisor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
