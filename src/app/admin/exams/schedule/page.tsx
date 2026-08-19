import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import ExamScheduleClient from "@/components/admin/exams/ExamScheduleClient"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN]

export default async function ExamSchedulePage() {
  const session = await getSession()
  if (!session?.user) redirect("/admin-login")
  if (!EXAM_ROLES.includes(session.user.role)) redirect("/unauthorized")

  return <ExamScheduleClient userRole={session.user.role} />
}
