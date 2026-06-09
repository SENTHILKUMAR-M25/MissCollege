import FacultyLayoutClient from "./FacultyLayoutClient"
import prisma from "@/lib/prisma"
import { requireFaculty } from "@/lib/permissions"
import { redirect } from "next/navigation"

export default async function FacultyLayout({children}:{children:React.ReactNode}) {
  const user = await requireFaculty()
  const me = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true, code: true } } }
  })
  if (!me) return redirect("/unauthorized")
  return (
    <FacultyLayoutClient departmentName={me.department.name} userName={user.name || "Faculty"} userEmail={user.email}>
      {children}
    </FacultyLayoutClient>
  )
}
