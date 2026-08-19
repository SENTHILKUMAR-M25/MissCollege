import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import ExamDashboardClient from "@/components/admin/exams/ExamDashboardClient"
import { getExamDashboardStats } from "@/actions/exams"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN]

export default async function ExamDashboardPage() {
  const session = await getSession()
  if (!session?.user) redirect("/admin-login")
  if (!EXAM_ROLES.includes(session.user.role)) redirect("/unauthorized")

  const stats = await getExamDashboardStats()

  return <ExamDashboardClient initialStats={stats} userRole={session.user.role} />
}
