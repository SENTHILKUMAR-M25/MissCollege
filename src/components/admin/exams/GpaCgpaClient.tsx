"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { TrendingUp, Calculator } from "lucide-react"

const GPA_DATA = [
  { regNo: "22CS001", name: "John Doe", semester: 3, gpa: 8.5, cgpa: 8.2 },
  { regNo: "22CS002", name: "Jane Smith", semester: 3, gpa: 9.2, cgpa: 8.8 },
  { regNo: "22CS003", name: "Bob Johnson", semester: 3, gpa: 7.8, cgpa: 7.9 },
]

export default function GpaCgpaClient() {
  const [semester, setSemester] = useState("all")
  const [gpaData] = useState(GPA_DATA)

  const filtered = semester === "all" ? gpaData : gpaData.filter(g => g.semester.toString() === semester)
  const avgGpa = filtered.length > 0 ? (filtered.reduce((sum, g) => sum + g.gpa, 0) / filtered.length).toFixed(2) : "0.00"
  const avgCgpa = filtered.length > 0 ? (filtered.reduce((sum, g) => sum + g.cgpa, 0) / filtered.length).toFixed(2) : "0.00"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">GPA/CGPA Calculation</h1>
          <p className="text-gray-500 text-sm">Student academic performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-black text-sm"
          >
            <option value="all" className="bg-gray-100">All Semesters</option>
            <option value="1" className="bg-gray-100">Sem 1</option>
            <option value="2" className="bg-gray-100">Sem 2</option>
            <option value="3" className="bg-gray-100">Sem 3</option>
            <option value="4" className="bg-gray-100">Sem 4</option>
            <option value="5" className="bg-gray-100">Sem 5</option>
            <option value="6" className="bg-gray-100">Sem 6</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600">
            <Calculator size={16} /> Recalculate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Average GPA (Current Sem)</p>
              <p className="text-black text-2xl font-bold">{avgGpa}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Average CGPA (Overall)</p>
              <p className="text-black text-2xl font-bold">{avgCgpa}</p>
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
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Semester</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GPA</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">CGPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((g) => (
              <tr key={g.regNo} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-500 font-mono">{g.regNo}</td>
                <td className="px-5 py-3 text-sm text-black font-medium">{g.name}</td>
                <td className="px-5 py-3 text-sm text-gray-700">Semester {g.semester}</td>
                <td className="px-5 py-3 text-sm text-emerald-400 font-bold">{g.gpa}</td>
                <td className="px-5 py-3 text-sm text-blue-400 font-bold">{g.cgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="px-5 py-12 text-center text-gray-400 text-sm">No GPA records found.</div>}
      </div>
    </div>
  )
}
