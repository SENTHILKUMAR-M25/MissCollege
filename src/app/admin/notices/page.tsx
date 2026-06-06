import { getNotices } from "@/actions/notices"
import NoticesClient from "@/components/admin/notices/NoticesClient"

export default async function NoticesPage() {
  const notices = await getNotices()

  return <NoticesClient notices={notices} />
}
