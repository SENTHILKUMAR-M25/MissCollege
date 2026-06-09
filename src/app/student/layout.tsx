import { requireStudent } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import StudentLayoutClient from "./StudentLayoutClient"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent()

  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: { department: { select: { name: true } } },
  })
  if (!student) redirect("/unauthorized")

  return (
    <StudentLayoutClient
      studentName={user.name || "Student"}
      registerNumber={student.registerNumber}
      departmentName={student.department.name}
    >
      {children}
    </StudentLayoutClient>
  )
}
