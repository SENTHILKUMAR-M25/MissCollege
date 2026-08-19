"use client"

import { useState } from "react"
import { archiveFormRecord, deleteFormRecord } from "@/actions/forms"
import toast from "react-hot-toast"

export default function FormRecordTable({ form }: { form: any }) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleArchive(id: string) {
    setLoading(id)
    const res = await archiveFormRecord(id)
    if (res.success) toast.success("Record archived")
    else toast.error(res.error || "Failed to archive")
    setLoading(null)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record permanently?")) return
    setLoading(id)
    const res = await deleteFormRecord(id)
    if (res.success) toast.success("Record deleted")
    else toast.error(res.error || "Failed to delete")
    setLoading(null)
  }

  if (!form.records?.length) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 border border-dashed border-gray-200 p-10 text-center">
        <p className="text-gray-500 text-sm">No records yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-gray-500 font-semibold">Field</th>
              {form.fields?.map((field: any) => (
                <th key={field.id} className="px-4 py-3 text-gray-500 font-semibold">
                  {field.label}
                  {field.unique && <span className="ml-1 text-[10px] text-amber-400">(unique)</span>}
                </th>
              ))}
              <th className="px-4 py-3 text-gray-500 font-semibold">Status</th>
              <th className="px-4 py-3 text-gray-500 font-semibold">Submitted</th>
              <th className="px-4 py-3 text-gray-500 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {form.records.map((record: any) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700 text-xs"></td>
                {form.fields?.map((field: any) => {
                  const value = record.fieldValues?.find((fv: any) => fv.fieldId === field.id)?.value
                  return (
                    <td key={field.id} className="px-4 py-3 text-black text-xs">
                      {value ?? <span className="text-gray-400">—</span>}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      record.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : record.status === "ARCHIVED"
                        ? "bg-slate-500/10 text-gray-500"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  {new Date(record.createdAt).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {record.status === "ACTIVE" && (
                      <button
                        disabled={loading === record.id}
                        onClick={() => handleArchive(record.id)}
                        className="text-[11px] px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      disabled={loading === record.id}
                      onClick={() => handleDelete(record.id)}
                      className="text-[11px] px-2 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
