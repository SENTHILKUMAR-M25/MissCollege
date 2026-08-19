import { requireAdmin } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getForm } from "@/actions/forms"
import prisma from "@/lib/prisma"
import FormRenderer from "./FormRenderer"

export default async function AdminFormEditPage({ params }: { params: Promise<{ formId: string }> }) {
  const user = await requireAdmin()
  const { formId } = await params
  const result = await getForm(formId)

  if (!result.success || !result.data) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 border border-gray-100 p-10 text-center">
        <p className="text-gray-500">Form not found</p>
        <a href="/admin/forms" className="text-teal-400 text-sm mt-2 inline-block">
          Back to forms
        </a>
      </div>
    )
  }

  const form = result.data as any

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-black text-2xl font-bold">{form.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{form.description || "Edit form layout and configuration"}</p>
      </div>

      <FormRenderer form={form} readOnly />
    </div>
  )
}
