"use client"

import { useState } from "react"
import { Eye, Search } from "lucide-react"

function attendanceColor(pct: number) {
  if (pct >= 75) return "text-emerald-400"
  if (pct >= 60) return "text-amber-400"
  return "text-red-400"
}

export default function StudentsClient({ initialStudents }: { initialStudents: any[] }) {
  const [search, setSearch] = useState("")

  const filtered = initialStudents.filter((s: any) => {
    const q = search.toLowerCase()
    return (
      s.registerNumber.toLowerCase().includes(q) ||
      s.user?.name?.toLowerCase().includes(q) ||
      s.course?.code?.toLowerCase().includes(q) ||
      s.section?.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <tbody>
        <tr className="border-b border-gray-100 bg-gray-50">
          <td colSpan={8} className="px-4 py-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-black text-xs placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50"
              />
            </div>
          </td>
        </tr>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-xs">No students found.</td>
          </tr>
        ) : (
          filtered.map((s: any) => (
            <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-100 transition-colors">
              <td className="px-4 py-3 text-black text-sm font-medium">{s.registerNumber}</td>
              <td className="px-4 py-3 text-gray-700 text-sm">{s.user?.name || "N/A"}</td>
              <td className="px-4 py-3 text-gray-700 text-xs">{s.course?.code || "N/A"}</td>
              <td className="px-4 py-3 text-gray-700 text-xs">{s.semester ?? "N/A"}</td>
              <td className="px-4 py-3 text-gray-700 text-xs">{s.section || "N/A"}</td>
              <td className="px-4 py-3 text-gray-700 text-xs">{s.user?.email || "N/A"}</td>
              <td className={`px-4 py-3 text-xs font-semibold ${attendanceColor(s.attendancePercentage ?? 0)}`}>
                {s.attendancePercentage ?? 0}%
              </td>
              <td className="px-4 py-3">
                <button className="text-[#2F2FE4] hover:text-[#2525c5] transition-colors">
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </>
  )
}
