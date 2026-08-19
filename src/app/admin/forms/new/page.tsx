"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createForm } from "@/actions/forms"
import { FormFieldType, RecordStatus } from "@prisma/client"
import toast from "react-hot-toast"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import Modal from "@/components/ui/Modal"

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "TEXT", label: "Text" },
  { value: "EMAIL", label: "Email" },
  { value: "NUMBER", label: "Number" },
  { value: "TEXTAREA", label: "Textarea" },
  { value: "SELECT", label: "Select" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "DATE", label: "Date" },
]

export default function CreateFormPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<RecordStatus>("ACTIVE")
  const [fields, setFields] = useState<
    Array<{
      label: string
      type: FormFieldType
      required: boolean
      unique: boolean
      order: number
      options?: string[]
    }>
  >([
    { label: "", type: "TEXT", required: false, unique: false, order: 0 },
  ])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  function closeModal() {
    setOpen(false)
    router.push("/admin/forms")
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      { label: "", type: "TEXT", required: false, unique: false, order: prev.length },
    ])
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })))
  }

  function updateField(index: number, patch: Partial<(typeof fields)[number]>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const sanitized = fields
      .filter((f) => f.label.trim())
      .map((f, i) => ({
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        unique: f.unique,
        order: i,
        options: f.type === "SELECT" ? f.options?.filter(Boolean) : undefined,
      }))

    if (!sanitized.length) {
      toast.error("Add at least one field")
      setLoading(false)
      return
    }

    const res = await createForm({
      name: name.trim(),
      description: description.trim(),
      createdBy: "admin",
      status,
      fields: sanitized,
    })

    if (res.success) {
      toast.success("Form created")
      setOpen(false)
      router.push("/admin/forms")
    } else {
      toast.error(res.error || "Failed to create form")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="text-black text-2xl font-bold">New Form</div>
        <p className="text-gray-500 text-sm max-w-md">Use the modal dialog to configure your form.</p>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-xl bg-teal-500 text-black text-sm font-semibold">
          Open Form Builder
        </button>

        <Modal isOpen={open} onClose={closeModal} title="New Form" size="xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">Form Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Admission Enquiry"
                  required
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="text-gray-500 text-xs mb-1.5 block font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RecordStatus)}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-teal-500/50"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-black font-bold">Fields</h3>
                  <p className="text-gray-400 text-xs mt-0.5">Required fields and unique constraints are enforced</p>
                </div>
                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-slate-200 text-xs hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} /> Add field
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-3">
                      <input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="Label"
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-teal-500/50"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value as FormFieldType })}
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-teal-500/50"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      {field.type === "SELECT" ? (
                        <input
                          value={field.options?.join(", ")}
                          onChange={(e) => updateField(index, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                          placeholder="Option A, Option B"
                          className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-teal-500/50"
                        />
                      ) : (
                        <div className="h-[42px]" />
                      )}
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-gray-700 text-xs">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                        />
                        Required
                      </label>
                      <label className="inline-flex items-center gap-2 text-gray-700 text-xs">
                        <input
                          type="checkbox"
                          checked={field.unique}
                          onChange={(e) => updateField(index, { unique: e.target.checked })}
                        />
                        Unique
                      </label>
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Close</button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-teal-500/20 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/30 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating..." : "Create Form"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
