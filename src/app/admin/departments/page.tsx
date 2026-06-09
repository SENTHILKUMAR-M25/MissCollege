import prisma from "@/lib/prisma"
import DepartmentsClient from "@/components/admin/departments/DepartmentsClient"

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { courses: true, faculty: true, students: true } },
      hodAssignments: {
        where: { isActive: true },
        include: { faculty: { include: { user: { select: { name: true, email: true } } } } },
      },
    },
  })

  return <DepartmentsClient departments={departments} />
}

