import { requireAdmin } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { listForms, deleteForm } from "@/actions/forms"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Eye, ListChecks } from "lucide-react"

export default async function AdminFormsPage() {
  const user = await requireAdmin()
  const result = await listForms()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black text-2xl font-bold">Forms</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage dynamic forms</p>
        </div>
        <Link href="/admin/forms/new">
          <Button className="gap-2 bg-teal-500 hover:bg-teal-600 text-black">
            <Plus size={16} /> New Form
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {result.success ? (
          result.data.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-500 text-sm">No forms yet</p>
            </div>
          ) : (
            result.data.map((form: any) => (
              <div key={form.id} className="rounded-2xl bg-white border border-gray-200 border border-gray-100 p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-black font-bold">{form.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        form.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : form.status === "ARCHIVED"
                          ? "bg-slate-500/10 text-gray-500"
                          : "bg-[#2F2FE4]/10 text-[#2F2FE4]"
                      }`}
                    >
                      {form.status}
                    </span>
                  </div>
                  {form.description && <p className="text-gray-500 text-xs">{form.description}</p>}
                  <p className="text-gray-400 text-[10px]">{form.fields?.length ?? 0} fields &middot; {form._count?.records ?? 0} records</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/forms/${form.id}`} className="flex-1">
                    <Button variant="outline" className="w-full gap-2 border-gray-200 bg-gray-100 text-slate-200 hover:bg-gray-100">
                      <ListChecks size={14} /> Records
                    </Button>
                  </Link>
                  <Link href={`/forms/${form.id}`} target="_blank">
                    <Button variant="outline" className="gap-2 border-gray-200 bg-gray-100 text-slate-200 hover:bg-gray-100">
                      <Eye size={14} />
                    </Button>
                  </Link>
                  <form action={async () => {
                    "use server"
                    const id = form.id
                    const res = await deleteForm(id)
                  }}>
                    <Button variant="outline" type="submit" className="gap-2 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )
        ) : (
          <div className="col-span-full rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-sm">
            Failed to load forms
          </div>
        )}
      </div>
    </div>
  )
}
