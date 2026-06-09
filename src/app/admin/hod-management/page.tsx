"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Eye, Copy, Check, X, Crown, Building2, Users, UserCheck, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { getActiveHods, getHodHistory, getDepartmentsWithoutHod, getAvailableFaculty, assignHod, removeHod, getHodStats } from "@/actions/hod-management"

type HodAssignment = {
  id: string
  facultyId: string
  faculty: {
    facultyId: string
    user: {
      name?: string | null
      email: string
    }
    phone?: string | null
    designation: string
    experience?: number | null
    accountStatus: boolean
    dateOfBirth?: Date | null
  }
  department: {
    name: string
    code: string
  }
  assignedAt: Date | string
  isActive: boolean
  assignedBy?: string | null
  removedAt?: Date | string | null
  removalReason?: string | null
}

type Department = {
  id: string
  name: string
  code: string
  _count?: { faculty: number }
}

type Faculty = {
  id: string
  facultyId: string
  designation: string
  experience?: number | null
  accountStatus: boolean
  phone?: string | null
  user: {
    name?: string | null
    email: string
  }
}

type HodStats = {
  totalDepartments: number
  totalAssignedHoDs: number
  departmentsWithoutHoD: number
  activeHoDs: number
  inactiveHoDs: number
}

type AssignmentResult = {
  success: boolean
  data?: {
    hodId: string
    facultyName: string
    department: string
    username: string
    password: string
    assignment: HodAssignment
  }
  message?: string
  error?: string
}

export default function HodManagementPage() {
  const [hods, setHods] = useState<HodAssignment[]>([])
  const [history, setHistory] = useState<HodAssignment[]>([])
  const [stats, setStats] = useState<HodStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResult["data"] | null>(null)
  const [step, setStep] = useState<"department" | "faculty" | "confirm">("department")
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [availableFaculty, setAvailableFaculty] = useState<Faculty[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [hodsRes, historyRes, statsRes, deptsRes] = await Promise.all([
      getActiveHods(),
      getHodHistory(),
      getHodStats(),
      getDepartmentsWithoutHod(),
    ])

    if (hodsRes.success) setHods(hodsRes.data)
    if (historyRes.success) setHistory(historyRes.data)
    if (statsRes.success) setStats(statsRes.data)
    if (deptsRes.success) setDepartments(deptsRes.data)
    setLoading(false)
  }

  async function handleDepartmentSelect(dept: Department) {
    setSelectedDepartment(dept)
    setStep("faculty")
    const facultyRes = await getAvailableFaculty(dept.id)
    if (facultyRes.success) {
      setAvailableFaculty(facultyRes.data)
    } else {
      toast.error(facultyRes.error || "Failed to load faculty")
    }
  }

  async function handleAssignHod() {
    if (!selectedFaculty || !selectedDepartment) return

    setSubmitting(true)
    const formData = new FormData()
    formData.append("facultyId", selectedFaculty.id)
    formData.append("departmentId", selectedDepartment.id)
    formData.append("assignedBy", "admin")

    const result = (await assignHod(formData)) as AssignmentResult

    if (result.success && result.data) {
      setSelectedAssignment(result.data)
      setShowSuccessModal(true)
      setShowAddModal(false)
      setStep("department")
      setSelectedDepartment(null)
      setSelectedFaculty(null)
      setAvailableFaculty([])
      await loadData()
    } else {
      toast.error(result.error || "Failed to assign HOD")
    }

    setSubmitting(false)
  }

  async function handleRemoveHod(assignmentId: string) {
    if (!confirm("Are you sure you want to remove this HOD assignment?")) return

    const formData = new FormData()
    formData.append("assignmentId", assignmentId)
    formData.append("removalReason", "Removed by admin")

    const result = await removeHod(formData)

    if (result.success) {
      toast.success("HOD assignment removed successfully")
      await loadData()
    } else {
      toast.error(result.error || "Failed to remove HOD")
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">HoD Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">Assign and manage Heads of Departments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-violet-500/25"
        >
          <Plus size={15} /> Add HoD
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { label: "Total Departments", value: stats.totalDepartments, icon: Building2, color: "text-blue-400 bg-blue-500/10" },
            { label: "Assigned HoDs", value: stats.totalAssignedHoDs, icon: Crown, color: "text-amber-400 bg-amber-500/10" },
            { label: "Without HoD", value: stats.departmentsWithoutHoD, icon: AlertCircle, color: "text-red-400 bg-red-500/10" },
            { label: "Active HoDs", value: stats.activeHoDs, icon: UserCheck, color: "text-emerald-400 bg-emerald-500/10" },
            { label: "Inactive HoDs", value: stats.inactiveHoDs, icon: Users, color: "text-slate-400 bg-slate-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-slate-400 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30">
          <h3 className="text-white font-bold">Active HoD Assignments</h3>
          <p className="text-slate-500 text-xs">{hods.length} active assignments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/20">
                {["HoD ID", "Faculty", "Department", "Designation", "Email", "Mobile", "Assigned Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hods.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No active HoD assignments. Click "Add HoD" to create one.
                  </td>
                </tr>
              ) : (
                hods.map((hod) => (
                  <tr key={hod.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-violet-400 text-sm font-mono font-semibold">MISS-HOD-{hod.id.slice(0, 3)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                          {(hod.faculty.user.name || "H").charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{hod.faculty.user.name || "N/A"}</p>
                          <p className="text-slate-400 text-xs">{hod.faculty.facultyId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{hod.department.name}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{hod.faculty.designation}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{hod.faculty.user.email}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{hod.faculty.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">
                      {new Date(hod.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveHod(hod.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30">
            <h3 className="text-white font-bold">Assignment History</h3>
            <p className="text-slate-500 text-xs">{history.length} total records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/20">
                  {["Faculty", "Department", "Status", "Assigned At", "Removed At", "Reason"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white text-sm">{h.faculty.user.name}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{h.department.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${h.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`}>
                        {h.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{new Date(h.assignedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{h.removedAt ? new Date(h.removedAt).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{h.removalReason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && !showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-slate-800 z-10">
                <div>
                  <h2 className="text-white font-bold">Assign New HoD</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {step === "department" && "Select a department"}
                    {step === "faculty" && `Select faculty for ${selectedDepartment?.name}`}
                    {step === "confirm" && "Review assignment"}
                  </p>
                </div>
                <button onClick={() => { setShowAddModal(false); setStep("department"); setSelectedDepartment(null); setSelectedFaculty(null); }} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <X size={15} />
                </button>
              </div>

              <div className="p-6">
                {step === "department" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 size={18} className="text-violet-400" />
                      <p className="text-white text-sm font-medium">Available Departments</p>
                    </div>
                    {departments.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">All departments already have an active HoD assigned.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {departments.map((dept) => (
                          <button
                            key={dept.id}
                            onClick={() => handleDepartmentSelect(dept)}
                            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/30 transition-all text-left group"
                          >
                            <p className="text-white font-semibold text-sm group-hover:text-violet-400 transition-colors">{dept.name}</p>
                            <p className="text-slate-500 text-xs mt-1">{dept.code} • {dept._count?.faculty || 0} faculty</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {step === "faculty" && selectedDepartment && (
                  <div className="space-y-4">
                    <button onClick={() => { setStep("department"); setSelectedDepartment(null); }} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
                      ← Back to departments
                    </button>
                    <p className="text-white text-sm font-medium">Select Faculty from {selectedDepartment.name}</p>
                    {availableFaculty.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No available faculty in this department.</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableFaculty.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setSelectedFaculty(f)}
                            className={`w-full p-4 rounded-xl border transition-all text-left ${
                              selectedFaculty?.id === f.id
                                ? "bg-violet-500/10 border-violet-500/30"
                                : "bg-white/5 border-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-semibold text-sm">{f.user?.name || "N/A"}</p>
                                <p className="text-slate-400 text-xs">{f.facultyId} • {f.designation}</p>
                                <p className="text-slate-500 text-xs mt-1">{f.user?.email || ""} • {f.experience ?? 0} yrs exp</p>
                              </div>
                              {selectedFaculty?.id === f.id && <Check size={18} className="text-violet-400" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedFaculty && (
                      <button
                        onClick={() => setStep("confirm")}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90"
                      >
                        Continue to Confirm
                      </button>
                    )}
                  </div>
                )}

                {step === "confirm" && selectedFaculty && selectedDepartment && (
                  <div className="space-y-4">
                    <button onClick={() => setStep("faculty")} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
                      ← Back to faculty selection
                    </button>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Faculty Name</p>
                          <p className="text-white text-sm font-medium mt-1">{selectedFaculty.user.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Faculty ID</p>
                          <p className="text-violet-400 text-sm font-mono font-semibold mt-1">{selectedFaculty.facultyId}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Department</p>
                          <p className="text-white text-sm font-medium mt-1">{selectedDepartment.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-[10px] uppercase font-semibold">Designation</p>
                          <p className="text-white text-sm font-medium mt-1">{selectedFaculty.designation}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAssignHod}
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? "Assigning..." : "Assign as HoD"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSuccessModal && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-md bg-slate-800 border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-white font-bold text-xl">HoD Assigned Successfully!</h2>
                <p className="text-slate-400 text-xs mt-1">Credentials have been generated</p>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Faculty Name</p>
                    <p className="text-white text-sm font-medium mt-1">{selectedAssignment?.facultyName ?? selectedFaculty?.user?.name ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Faculty ID</p>
                    <p className="text-violet-400 text-sm font-mono font-semibold mt-1">{selectedFaculty?.facultyId ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Department</p>
                    <p className="text-white text-sm font-medium mt-1">{selectedDepartment?.name ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Designation</p>
                    <p className="text-white text-sm font-medium mt-1">{selectedFaculty?.designation ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Username</p>
                    <p className="text-white text-sm font-mono font-medium mt-1">{selectedAssignment?.username ?? selectedAssignment?.hodId ?? "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-semibold">Temporary Password</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-amber-400 text-sm font-mono font-bold">{selectedAssignment?.password ?? "N/A"}</p>
                      <button
                        onClick={() => selectedAssignment?.password && copyToClipboard(selectedAssignment.password)}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-slate-500 text-[10px]">⚠️ HoD must change password on first login</p>
                </div>
              </div>

              <button
                onClick={() => { setShowSuccessModal(false); setSelectedAssignment(null); }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
