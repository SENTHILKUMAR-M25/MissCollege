"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { BarChart3, CheckCircle2, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

const PENDING_MARKS = [
  { id: "1", student: "John Doe", regNo: "22CS001", subject: "Data Structures", examType: "Mid-term", marks: null, maxMarks: 30 },
  { id: "2", student: "Jane Smith", regNo: "22CS002", subject: "Data Structures", examType: "Mid-term", marks: null, maxMarks: 30 },
  { id: "3", student: "Bob Johnson", regNo: "22CS003", subject: "Data Structures", examType: "Mid-term", marks: null, maxMarks: 30 },
]

export default function MarksVerificationClient({ userRole }: { userRole?: string }) {
  const [marks, setMarks] = useState(PENDING_MARKS)
  const [verifyModal, setVerifyModal] = useState<{ open: boolean; record: typeof PENDING_MARKS[0] | null }>({ open: false, record: null })
  const [markValue, setMarkValue] = useState("")

  const openVerify = (record: typeof PENDING_MARKS[0]) => {
    setVerifyModal({ open: true, record })
    setMarkValue(record.marks !== null ? record.marks.toString() : "")
  }

  const handleVerify = () => {
    if (!verifyModal.record) return
    const value = Number(markValue)
    if (isNaN(value) || value < 0 || value > verifyModal.record.maxMarks) {
      toast.error(`Marks must be between 0 and ${verifyModal.record.maxMarks}`)
      return
    }
    setMarks(prev => prev.map(m => m.id === verifyModal.record!.id ? { ...m, marks: value } : m))
    setVerifyModal({ open: false, record: null })
    setMarkValue("")
    toast.success("Marks verified")
  }

  const handleReject = (id: string) => {
    setMarks(prev => prev.filter(m => m.id !== id))
    toast.success("Marks rejected")
  }

  const verifiedCount = marks.filter(m => m.marks !== null).length
  const pendingCount = marks.filter(m => m.marks === null).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Marks Verification</h1>
        <p className="text-gray-500 text-sm">Verify and approve entered marks before finalization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <BarChart3 size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total Entries</p>
              <p className="text-black text-2xl font-bold">{marks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Verified</p>
              <p className="text-black text-2xl font-bold">{verifiedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <XCircle size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Pending</p>
              <p className="text-black text-2xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reg No</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marks</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {marks.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-500 font-mono">{m.regNo}</td>
                <td className="px-5 py-3 text-sm text-black font-medium">{m.student}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{m.subject}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{m.examType}</td>
                <td className="px-5 py-3 text-sm">
                  <span className={`font-semibold ${m.marks !== null ? "text-emerald-400" : "text-amber-400"}`}>
                    {m.marks !== null ? `${m.marks}/${m.maxMarks}` : "Pending"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {m.marks === null && (
                      <button onClick={() => openVerify(m)} className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Verify</button>
                    )}
                    <button onClick={() => handleReject(m.id)} className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {marks.length === 0 && <div className="px-5 py-12 text-center text-gray-400 text-sm">No marks pending verification.</div>}
      </div>

      <Modal isOpen={verifyModal.open} onClose={() => setVerifyModal({ open: false, record: null })} title="Verify Marks" size="sm">
        <div className="p-6 space-y-4">
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Student</span>
              <span className="text-black font-medium">{verifyModal.record?.student}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subject</span>
              <span className="text-black font-medium">{verifyModal.record?.subject}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Max Marks</span>
              <span className="text-black font-medium">{verifyModal.record?.maxMarks}</span>
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Marks Obtained *</label>
            <input
              type="number"
              min={0}
              max={verifyModal.record?.maxMarks ?? 0}
              value={markValue}
              onChange={e => setMarkValue(e.target.value)}
              autoFocus
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setVerifyModal({ open: false, record: null })} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="button" onClick={handleVerify} className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-600 transition-colors">Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
