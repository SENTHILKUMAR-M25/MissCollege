import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import ExamReportsClient from "@/components/admin/exams/ExamReportsClient"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN]

export default async function ExamReportsPage() {
  const session = await getSession()
  if (!session?.user) redirect("/admin-login")
  if (!EXAM_ROLES.includes(session.user.role)) redirect("/unauthorized")

  return <ExamReportsClient userRole={session.user.role} />
}
