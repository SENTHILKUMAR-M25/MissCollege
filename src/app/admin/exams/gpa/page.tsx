import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import GpaCgpaClient from "@/components/admin/exams/GpaCgpaClient"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN]

export default async function GpaCgpaPage() {
  const session = await getSession()
  if (!session?.user) redirect("/admin-login")
  if (!EXAM_ROLES.includes(session.user.role)) redirect("/unauthorized")

  return <GpaCgpaClient userRole={session.user.role} />
}
