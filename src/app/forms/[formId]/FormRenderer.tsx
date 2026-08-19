"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitFormRecord } from "@/actions/forms"
import toast from "react-hot-toast"

export default function PublicFormPage({ form }: { form: any }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [values, setValues] = useState<Record<string, any>>({})

  const fields = (form.fields ?? []).sort((a: any, b: any) => a.order - b.order)

  function handleChange(label: string, value: any) {
    setValues((prev) => ({ ...prev, [label]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await submitFormRecord(form.id, values)
    if (res.success) {
      toast.success("Form submitted successfully")
      setValues({})
      router.refresh()
    } else {
      toast.error(res.error || "Failed to submit form")
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">{form.name}</h1>
        {form.description && <p className="text-slate-400 text-sm mt-1">{form.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field: any) => (
              <div key={field.id} className={field.type === "TEXTAREA" ? "md:col-span-2" : ""}>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                  {field.unique && <span className="text-amber-400 ml-1 text-[10px] uppercase">(unique)</span>}
                </label>

                {field.type === "TEXT" && (
                  <input
                    value={values[field.label] ?? ""}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    placeholder={field.label}
                    required={field.required}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                )}

                {field.type === "EMAIL" && (
                  <input
                    type="email"
                    value={values[field.label] ?? ""}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    placeholder={field.label}
                    required={field.required}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                )}

                {field.type === "NUMBER" && (
                  <input
                    type="number"
                    value={values[field.label] ?? ""}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    placeholder={field.label}
                    required={field.required}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                )}

                {field.type === "TEXTAREA" && (
                  <textarea
                    value={values[field.label] ?? ""}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    placeholder={field.label}
                    required={field.required}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                )}

                {field.type === "DATE" && (
                  <input
                    type="date"
                    value={values[field.label] ?? ""}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    required={field.required}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                  />
                )}

                {field.type === "SELECT" && (
                  <select
                    value={values[field.label] ?? ""}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    required={field.required}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="">Select {field.label}</option>
                    {(field.options ?? []).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === "CHECKBOX" && (
                  <label className="inline-flex items-center gap-2 text-slate-300 text-sm">
                    <input
                      type="checkbox"
                      checked={!!values[field.label]}
                      onChange={(e) => handleChange(field.label, e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500"
                    />
                    {field.label}
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-teal-500/20 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/30 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  )
}
