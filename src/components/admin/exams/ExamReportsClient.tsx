"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { FileSpreadsheet, Download, Filter } from "lucide-react"

const REPORTS = [
  { id: "1", name: "Exam Performance Report", type: "PDF", generatedAt: "2026-06-12", size: "245 KB" },
  { id: "2", name: "Subject-wise Analysis", type: "PDF", generatedAt: "2026-06-11", size: "180 KB" },
  { id: "3", name: "Pass Percentage Report", type: "XLSX", generatedAt: "2026-06-10", size: "120 KB" },
]

export default function ExamReportsClient() {
  const [reports] = useState(REPORTS)
  const [filter, setFilter] = useState("all")

  const filtered = filter === "all" ? reports : reports.filter(r => r.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Exam Reports</h1>
          <p className="text-gray-500 text-sm">Generate and download exam reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600">
          <Download size={16} /> Generate Report
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Filter size={16} className="text-gray-500" />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm"
        >
          <option value="all" className="bg-gray-100">All Reports</option>
          <option value="PDF" className="bg-gray-100">PDF</option>
          <option value="XLSX" className="bg-gray-100">Excel</option>
        </select>
      </div>

      <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Report Name</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Generated</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Size</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-black font-medium flex items-center gap-2">
                  <FileSpreadsheet size={14} className="text-amber-400 shrink-0" />
                  {report.name}
                </td>
                <td className="px-5 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${report.type === "PDF" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>{report.type}</span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-700">{report.generatedAt}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{report.size}</td>
                <td className="px-5 py-3 text-right">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 ml-auto">
                    <Download size={12} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="px-5 py-12 text-center text-gray-400 text-sm">No reports found.</div>}
      </div>
    </div>
  )
}
