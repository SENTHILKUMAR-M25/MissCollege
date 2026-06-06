import prisma from "@/lib/prisma"
import DepartmentsClient from "@/components/admin/departments/DepartmentsClient"

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          courses: true,
          faculty: true,
          students: true,
        },
      },
    },
  })

  return <DepartmentsClient departments={departments} />
}
