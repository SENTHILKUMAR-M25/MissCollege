import prisma from "@/lib/prisma"
import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import HodSubjectsClient from "@/components/hod/HodSubjectsClient"

export default async function HodSubjectsPage() {
  const user = await requireHod()

  const hod = await prisma.faculty.findUnique({
    where: { userId: user.id },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })
  if (!hod?.hodAssignments[0]) redirect("/unauthorized")

  const deptId = hod.departmentId
  const departmentName = hod.department.name

  const [subjects, faculty] = await Promise.all([
    prisma.subject.findMany({
      where: { departmentId: deptId, isActive: true },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        facultySubjects: { where: { isActive: true }, include: { faculty: { include: { user: { select: { name: true, email: true } } } } } },
      },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    }),
    prisma.faculty.findMany({
      where: { departmentId: deptId, accountStatus: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { facultyId: "asc" },
    }),
  ])

  return <HodSubjectsClient initialSubjects={subjects as any} initialFaculty={faculty as any} departmentName={departmentName} facultyUserId={user.id} />
}
