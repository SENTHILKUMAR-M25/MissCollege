import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import AssessmentSetupClient from "@/components/admin/exams/AssessmentSetupClient"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN]

export default async function AssessmentSetupPage() {
  const session = await getSession()
  if (!session?.user) redirect("/admin-login")
  if (!EXAM_ROLES.includes(session.user.role)) redirect("/unauthorized")

  return <AssessmentSetupClient userRole={session.user.role} />
}
