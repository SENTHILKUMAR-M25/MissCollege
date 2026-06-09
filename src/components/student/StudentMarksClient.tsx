"use client"

import { motion } from "framer-motion"
import { Status } from "@prisma/client"

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
  CAT1: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CAT2: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  ASSIGNMENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  SEMINAR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PRACTICAL: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MODEL_EXAM: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  INTERNAL_TEST_1: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  INTERNAL_TEST_2: "bg-pink-500/10 text-pink-400 border-pink-500/20",
}

export default function StudentMarksClient({ data }: { data: MarksData }) {
  return (
    <div className="space-y-6">
      {/* Student Info */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-slate-400 text-xs">Name</p><p className="text-white text-sm font-medium">{data.student.name}</p></div>
          <div><p className="text-slate-400 text-xs">Register No</p><p className="text-teal-400 text-xs font-mono font-semibold">{data.student.registerNumber}</p></div>
          <div><p className="text-slate-400 text-xs">Department</p><p className="text-white text-sm">{data.student.department}</p></div>
          <div><p className="text-slate-400 text-xs">Course</p><p className="text-white text-sm">{data.student.course}</p></div>
          <div><p className="text-slate-400 text-xs">Semester / Section</p><p className="text-white text-sm">Sem {data.student.semester} / {data.student.section}</p></div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Overall Score</p>
          <p className="text-white text-2xl font-bold mt-1">{data.overall.total} <span className="text-slate-500 text-sm">/ {data.overall.maxTotal}</span></p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Overall Percentage</p>
          <p className={`text-2xl font-bold mt-1 ${data.overall.percentage >= 40 ? "text-emerald-400" : "text-red-400"}`}>{data.overall.percentage}%</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Status</p>
          <p className={`text-lg font-bold mt-1 ${data.overall.percentage >= 40 ? "text-emerald-400" : "text-amber-400"}`}>{data.overall.percentage >= 40 ? "Pass" : "Low"}</p>
        </div>
      </div>

      {/* Subject-wise Marks */}
      {data.subjectWise.length === 0 ? (
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-16 text-center">
          <Award size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No marks available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.subjectWise.map((subj, index) => {
            const subjTotal = subj.marks.reduce((a, b) => a + b.mark, 0)
            const subjMax = subj.marks.reduce((a, b) => a + 100, 0)
            const subjPct = subjMax > 0 ? Math.round((subjTotal / subjMax) * 100) : 0

            return (
              <motion.div key={subj.subject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold text-sm">{subj.subject.name}</h3>
                    <p className="text-teal-400 text-xs font-mono">{subj.subject.code} • Sem {subj.subject.semester} • {subj.subject.credits} Cr</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${subjPct >= 40 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {subjPct}%
                  </span>
                </div>

                <div className="space-y-2">
                  {subj.marks.map((m) => (
                    <div key={m.examType} className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${EXAM_COLORS[m.examType] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                        {m.examType}
                      </span>
                      <span className="text-white text-sm font-semibold">{m.mark}/100</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Total: {subjTotal} / {subjMax}</span>
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
