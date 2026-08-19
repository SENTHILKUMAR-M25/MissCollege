import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import AdminAppShellClient from "./AdminAppShellClient"

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN]

export default async function AdminAppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) redirect("/admin-login")
  if (!ADMIN_ROLES.includes(session.user.role)) redirect("/unauthorized")

  return <AdminAppShellClient userRole={session.user.role}>{children}</AdminAppShellClient>
}
