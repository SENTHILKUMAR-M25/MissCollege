"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Plus, Eye, EyeOff, Award, Download } from "lucide-react"
import toast from "react-hot-toast"

const RESULTS = [
  { id: "1", regNo: "22CS001", name: "John Doe", examType: "Mid-term", marks: 27, maxMarks: 30, grade: "A", status: "PUBLISHED" },
  { id: "2", regNo: "22CS002", name: "Jane Smith", examType: "Mid-term", marks: 29, maxMarks: 30, grade: "A+", status: "PUBLISHED" },
  { id: "3", regNo: "22CS003", name: "Bob Johnson", examType: "Mid-term", marks: 22, maxMarks: 30, grade: "B+", status: "DRAFT" },
]

export default function ResultsClient() {
  const [results, setResults] = useState(RESULTS)
  const [selectedResult, setSelectedResult] = useState<string | null>(null)

  const handlePublish = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: "PUBLISHED" } : r))
    toast.success("Result published")
  }

  const handleUnpublish = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: "DRAFT" } : r))
    toast.success("Result unpublished")
  }

  const publishedCount = results.filter(r => r.status === "PUBLISHED").length
  const draftCount = results.filter(r => r.status === "DRAFT").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Results Publication</h1>
          <p className="text-gray-500 text-sm">Manage and publish exam results</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Award size={20} /></div>
            <div>
              <p className="text-gray-500 text-xs">Total Results</p>
              <p className="text-black text-2xl font-bold">{results.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><Eye size={20} /></div>
            <div>
              <p className="text-gray-500 text-xs">Published</p>
              <p className="text-black text-2xl font-bold">{publishedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-gray-500"><EyeOff size={20} /></div>
            <div>
              <p className="text-gray-500 text-xs">Draft</p>
              <p className="text-black text-2xl font-bold">{draftCount}</p>
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
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marks</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-500 font-mono">{r.regNo}</td>
                <td className="px-5 py-3 text-sm text-black font-medium">{r.name}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{r.examType}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{r.marks}/{r.maxMarks}</td>
                <td className="px-5 py-3 text-sm">
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold">{r.grade}</span>
                </td>
                <td className="px-5 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-gray-500"}`}>{r.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  {r.status === "DRAFT" ? (
                    <button onClick={() => handlePublish(r.id)} className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">Publish</button>
                  ) : (
                    <button onClick={() => handleUnpublish(r.id)} className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-500/10 text-gray-500 hover:bg-slate-500/20">Unpublish</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 && <div className="px-5 py-12 text-center text-gray-400 text-sm">No results available.</div>}
      </div>
    </div>
  )
}
