"use client"

import { motion } from "motion/react"
import { Trophy } from "lucide-react"

type SubjectMark = {
  subject: { id: string; name: string; code: string; semester: number; credits: number }
  marks: { examType: string; mark: number }[]
  total: number
  maxTotal: number
}

type MarksData = {
  student: { name: string; registerNumber: string; department: string; course: string; semester: number; section: string }
  subjectWise: SubjectMark[]
  overall: { total: number; maxTotal: number; percentage: number }
}

const EXAM_COLORS: Record<string, string> = {
  CAT1: "bg-[#2F2FE4]/10 text-[#2F2FE4] border-[#2F2FE4]/20",
  CAT2: "bg-[#2F2FE4]/10 text-[#2F2FE4] border-[#2F2FE4]/20",
  ASSIGNMENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  SEMINAR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PRACTICAL: "bg-[#2F2FE4]/10 text-[#2F2FE4] border-[#2F2FE4]/20",
  MODEL_EXAM: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  INTERNAL_TEST_1: "bg-[#2F2FE4]/10 text-[#2F2FE4] border-[#2F2FE4]/20",
  INTERNAL_TEST_2: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export default function StudentMarksClient({ data }: { data: MarksData }) {
  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-gray-500 text-xs">Name</p><p className="text-black text-sm font-medium">{data.student.name}</p></div>
          <div><p className="text-gray-500 text-xs">Register No</p><p className="text-[#2F2FE4] text-xs font-mono font-semibold">{data.student.registerNumber}</p></div>
          <div><p className="text-gray-500 text-xs">Department</p><p className="text-black text-sm">{data.student.department}</p></div>
          <div><p className="text-gray-500 text-xs">Course</p><p className="text-black text-sm">{data.student.course}</p></div>
          <div><p className="text-gray-500 text-xs">Semester / Section</p><p className="text-black text-sm">Sem {data.student.semester} / {data.student.section}</p></div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Overall Score</p>
          <p className="text-black text-2xl font-bold mt-1">{data.overall.total} <span className="text-gray-400 text-sm">/ {data.overall.maxTotal}</span></p>
        </div>
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Overall Percentage</p>
          <p className={`text-2xl font-bold mt-1 ${data.overall.percentage >= 40 ? "text-emerald-400" : "text-red-400"}`}>{data.overall.percentage}%</p>
        </div>
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Status</p>
          <p className={`text-lg font-bold mt-1 ${data.overall.percentage >= 40 ? "text-emerald-400" : "text-amber-400"}`}>{data.overall.percentage >= 40 ? "Pass" : "Low"}</p>
        </div>
      </div>

      {/* Subject-wise Marks */}
      {data.subjectWise.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center">
          <Trophy size={32} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No marks available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.subjectWise.map((subj, index) => {
            const subjTotal = subj.marks.reduce((a, b) => a + b.mark, 0)
            const subjMax = subj.marks.reduce((a, b) => a + 100, 0)
            const subjPct = subjMax > 0 ? Math.round((subjTotal / subjMax) * 100) : 0

            return (
              <motion.div key={subj.subject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="rounded-2xl bg-gray-50 border border-gray-100 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-black font-bold text-sm">{subj.subject.name}</h3>
                    <p className="text-[#2F2FE4] text-xs font-mono">{subj.subject.code} • Sem {subj.subject.semester} • {subj.subject.credits} Cr</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${subjPct >= 40 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {subjPct}%
                  </span>
                </div>

                <div className="space-y-2">
                  {subj.marks.map((m) => (
                    <div key={m.examType} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${EXAM_COLORS[m.examType] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {m.examType}
                      </span>
                      <span className="text-black text-sm font-semibold">{m.mark}/100</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-500 text-xs">Total: {subjTotal} / {subjMax}</span>
                  <span className={`text-xs font-semibold ${subjPct >= 40 ? "text-emerald-400" : "text-red-400"}`}>{subjPct}%</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
