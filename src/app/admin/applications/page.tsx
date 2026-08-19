import { getApplications, getEnquiryApplicationStats } from "@/actions/admissions"
import ApplicationsClient from "@/components/admin/applications/ApplicationsClient"

export default async function AdminApplicationsPage() {
  const [data, stats] = await Promise.all([
    getApplications({ page: 1 }),
    getEnquiryApplicationStats(),
  ])

  if (!data.success) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">{data.error || "Failed to load applications"}</p>
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
    <ApplicationsClient
      applications={data.data}
      stats={stats.data}
    />
  )
}