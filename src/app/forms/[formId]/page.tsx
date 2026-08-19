import { getForm } from "@/actions/forms"
import { notFound } from "next/navigation"
import PublicFormPage from "./FormRenderer"

export default async function PublicFormWrapper({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params
  const result = await getForm(formId)

  if (!result.success || !result.data) return notFound()

  const form = result.data as any

  if (form.status !== "ACTIVE") {
    return (
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-10 text-center">
        <p className="text-slate-400 text-sm">This form is currently unavailable.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">{form.name}</h1>
        {form.description && <p className="text-slate-400 text-sm mt-1">{form.description}</p>}
      </div>
      <PublicFormPage form={form} />
    </div>
  )
}