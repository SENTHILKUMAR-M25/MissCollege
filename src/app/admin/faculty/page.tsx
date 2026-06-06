import prisma from "@/lib/prisma"
import FacultyClient from "@/components/admin/faculty/FacultyClient"

export default async function FacultyPage() {
  const [departments, faculty, subjects] = await Promise.all([
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.faculty.findMany({
      include: {
        department: { select: { id: true, name: true } },
        user: { select: { name: true, email: true } },
        subjects: { select: { id: true, name: true, code: true, semester: true } },
      },
      orderBy: { facultyId: "asc" },
    }),
    prisma.subject.findMany({
      select: { id: true, name: true, code: true, semester: true },
      orderBy: [{ semester: "asc" }, { name: "asc" }],
    }),
  ])

  return <FacultyClient faculty={faculty} departments={departments} subjects={subjects} />
}
