import prisma from "@/lib/prisma"
import SubjectsClient from "@/components/admin/subjects/SubjectsClient"

export default async function SubjectsPage() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const faculties = await prisma.faculty.findMany({
    select: { id: true, user: { select: { name: true } } },
    orderBy: { user: { name: "asc" } },
  })

  const subjects = await prisma.subject.findMany({
    include: {
      department: { select: { id: true, name: true } },
      faculty: { select: { id: true, user: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  })

  return <SubjectsClient subjects={subjects} departments={departments} faculties={faculties} />
}
