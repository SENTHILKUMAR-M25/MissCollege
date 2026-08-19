import { auth } from "./auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/admin-login")
  }
  return session.user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN])
}

export async function requireAcademicAdmin() {
  return requireRole([Role.ADMIN, Role.ACADEMIC_ADMIN])
}

export async function requireExamAdmin() {
  return requireRole([Role.ADMIN, Role.EXAM_ADMIN])
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === Role.ADMIN
}

export async function isAcademicAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === Role.ACADEMIC_ADMIN || session?.user?.role === Role.ADMIN
}

export async function isExamAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === Role.EXAM_ADMIN || session?.user?.role === Role.ADMIN
}

export async function requireHod() {
  return requireRole([Role.HOD])
}

export async function requireFaculty() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/Faculty-login")
  }
  // Allow both FACULTY and HOD roles (HOD is also a faculty member)
  if (session.user.role !== "FACULTY" && session.user.role !== "HOD") {
    redirect("/unauthorized")
  }
  return session.user
}

export async function requireStudent() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/student-login")
  }
  if (session.user.role !== "STUDENT") {
    redirect("/unauthorized")
  }
  return session.user
}

export async function hasRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await getSession()
  if (!session?.user) {
    return false
  }
  return allowedRoles.includes(session.user.role)
}

export async function getUserId(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.id || null
}

export async function isHodOfDepartment(departmentId: string): Promise<boolean> {
  const session = await getSession()
  if (!session?.user || session.user.role !== Role.HOD) {
    return false
  }

  try {
    const { prisma } = await import("./prisma")
    const faculty = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      include: {
        hodAssignments: {
          where: { isActive: true },
        },
      },
    })

    if (!faculty) return false

    const isAssigned = faculty.hodAssignments.some(
      (a) => a.departmentId === departmentId && a.isActive
    )
    return isAssigned
  } catch {
    return false
  }
}
