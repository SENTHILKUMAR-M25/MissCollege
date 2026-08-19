import { getSession } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import StudentNoticesClient from "@/components/student/StudentNoticesClient"

export default async function StudentNoticesPage() {
  const session = await getSession()
  if (!session?.user) redirect("/student-login")
  if (session.user.role !== "STUDENT") redirect("/unauthorized")

  return <StudentNoticesClient userId={session.user.id} />
}
