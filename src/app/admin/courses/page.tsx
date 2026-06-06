import prisma from "@/lib/prisma"
import CoursesClient from "@/components/admin/courses/CoursesClient"

export default async function CoursesPage() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const courses = await prisma.course.findMany({
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { students: true } },
    },
    orderBy: { name: "asc" },
  })

  return <CoursesClient courses={courses} departments={departments} />
}
