import { getNotices } from "@/actions/notices"
import AnnouncementsClient from "@/components/admin/announcements/AnnouncementsClient"

export default async function AnnouncementsPage() {
  const notices = await getNotices()

  return <AnnouncementsClient notices={notices} />
}
