import prisma from "@/lib/prisma"
import StudentsClient from "@/components/admin/students/StudentsClient"

export default async function StudentsPage() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const courses = await prisma.course.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const students = await prisma.student.findMany({
    include: {
      department: { select: { id: true, name: true } },
      course: { select: { id: true, name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { registerNumber: "asc" },
  })

  return <StudentsClient students={students} departments={departments} courses={courses} />
}
