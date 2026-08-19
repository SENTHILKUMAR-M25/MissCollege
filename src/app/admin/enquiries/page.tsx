import { getEnquiries, getEnquiryApplicationStats } from "@/actions/admissions"
import EnquiriesClient from "@/components/admin/enquiries/EnquiriesClient"

export default async function AdminEnquiriesPage() {
  const [data, stats] = await Promise.all([
    getEnquiries({ page: 1 }),
    getEnquiryApplicationStats(),
  ])

  if (!data.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">{data.error || "Failed to load enquiries"}</p>
      </div>
    )
  }

  if (!stats.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">{stats.error || "Failed to load stats"}</p>
      </div>
    )
  }

  return (
    <EnquiriesClient
      enquiries={data.data}
      total={data.total}
      stats={stats.data}
    />
  )
}