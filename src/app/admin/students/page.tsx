import prisma from "@/lib/prisma"
import StudentsClient from "@/components/admin/students/StudentsClient"
import { getStudentStats } from "@/actions/students"

export default async function StudentsPage() {
  const [departments, courses, students, statsResult] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.course.findMany({ select: { id: true, name: true, code: true, departmentId: true }, orderBy: { name: "asc" } }),
    prisma.student.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
        user: { select: { name: true, email: true, isActive: true, passwordChanged: true, createdAt: true } },
      },
      orderBy: { registerNumber: "asc" },
    }),
    getStudentStats(),
  ])

  const stats = statsResult.success ? statsResult.data : null

  return <StudentsClient students={students} departments={departments} courses={courses} stats={stats} />
}
