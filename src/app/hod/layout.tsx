import HodLayoutClient from "./HodLayoutClient"
import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function HodLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireHod()

  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })

  if (!me?.hodAssignments[0]) {
    redirect("/unauthorized")
  }

  return (
    <HodLayoutClient
      departmentName={me.department.name}
      userName={user.name || "HOD"}
      userEmail={user.email}
    >
      {children}
    </HodLayoutClient>
  )
}
