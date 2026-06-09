"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FACULTY_PREFIXES: Record<string, string> = {
  Professor: "P",
  "Associate Professor": "AP",
  "Assistant Professor": "ASP",
  Lecturer: "L",
  "Guest Lecturer": "GL",
  "Head of Department": "HOD",
}

function getDesignationPrefix(designation: string): string {
  return FACULTY_PREFIXES[designation] || "FAC"
}

const assignHodSchema = z.object({
  facultyId: z.string().min(1, "Faculty is required"),
  departmentId: z.string().min(1, "Department is required"),
  assignedBy: z.string().optional(),
})

const removeHodSchema = z.object({
  assignmentId: z.string().min(1, "Assignment is required"),
  removalReason: z.string().optional(),
})

export async function getActiveHods() {
  try {
    const assignments = await prisma.hodAssignment.findMany({
      where: { isActive: true },
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true, code: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
      orderBy: { assignedAt: "desc" },
    })

    return { success: true, data: assignments }
  } catch (error) {
    console.error("Error fetching HOD assignments:", error)
    return { success: false, error: "Failed to fetch HOD assignments" }
  }
}

export async function getHodHistory() {
  try {
    const history = await prisma.hodAssignment.findMany({
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
      orderBy: { assignedAt: "desc" },
      take: 100,
    })

    return { success: true, data: history }
  } catch (error) {
    console.error("Error fetching HOD history:", error)
    return { success: false, error: "Failed to fetch HOD history" }
  }
}

export async function getDepartmentsWithoutHod() {
  try {
    const departments = await prisma.department.findMany({
      where: {
        hodAssignments: {
          none: { isActive: true },
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { faculty: true } },
      },
      orderBy: { name: "asc" },
    })

    return { success: true, data: departments }
  } catch (error) {
    console.error("Error fetching departments without HOD:", error)
    return { success: false, error: "Failed to fetch departments" }
  }
}

export async function getAvailableFaculty(departmentId: string) {
  try {
    const faculty = await prisma.faculty.findMany({
      where: {
        departmentId,
        accountStatus: true,
        user: { isActive: true },
        hodAssignments: {
          none: { isActive: true },
        },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { id: "asc" },
    })

    console.log(`[getAvailableFaculty] departmentId=${departmentId} count=${faculty.length}`)
    return { success: true, data: faculty }
  } catch (error) {
    console.error("[getAvailableFaculty] error", error)
    return { success: false, error: "Failed to fetch faculty" }
  }
}

export async function assignHod(formData: FormData) {
  try {
    const data = assignHodSchema.parse({
      facultyId: formData.get("facultyId"),
      departmentId: formData.get("departmentId"),
      assignedBy: formData.get("assignedBy") || undefined,
    })

    const faculty = await prisma.faculty.findUnique({
      where: { id: data.facultyId },
      include: { user: true },
    })

    if (!faculty) {
      return { success: false, error: "Faculty not found" }
    }

    if (faculty.departmentId !== data.departmentId) {
      return { success: false, error: "Faculty must belong to the selected department" }
    }

    const existingActiveHod = await prisma.hodAssignment.findFirst({
      where: {
        departmentId: data.departmentId,
        isActive: true,
      },
      include: { faculty: { include: { user: true } } },
    })

    if (existingActiveHod) {
      if (existingActiveHod.facultyId === data.facultyId) {
        return { success: false, error: "This faculty member is already assigned as HOD" }
      }

      await prisma.hodAssignment.update({
        where: { id: existingActiveHod.id },
        data: {
          isActive: false,
          removedAt: new Date(),
          removalReason: "Replaced by new HOD assignment",
        },
      })

      await prisma.faculty.update({
        where: { id: existingActiveHod.facultyId },
        data: { isHod: false },
      })

      await prisma.user.update({
        where: { id: existingActiveHod.faculty.userId },
        data: { role: "FACULTY" },
      })
    }

    const activeHodAssignments = await prisma.hodAssignment.findFirst({
      where: {
        facultyId: data.facultyId,
        isActive: true,
      },
    })

    if (activeHodAssignments) {
      await prisma.hodAssignment.update({
        where: { id: activeHodAssignments.id },
        data: {
          isActive: false,
          removedAt: new Date(),
          removalReason: "Reassigned to new department",
        },
      })
    }

    const latestHodFaculty = await prisma.faculty.findFirst({
      where: { facultyId: { startsWith: "MISS-HOD-" } },
      orderBy: { facultyId: "desc" },
      select: { facultyId: true },
    })

    const latestSequence = latestHodFaculty?.facultyId
      ? parseInt(latestHodFaculty.facultyId.slice("MISS-HOD-".length), 10)
      : 0
    const nextSeq = isNaN(latestSequence) ? 1 : latestSequence + 1
    const hodId = `MISS-HOD-${String(nextSeq).padStart(3, "0")}`

    const plainPassword = faculty.dateOfBirth
      ? new Date(faculty.dateOfBirth).toISOString().slice(0, 10).replace(/-/g, "")
      : "password123"

    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    const assignment = await prisma.hodAssignment.create({
      data: {
        departmentId: data.departmentId,
        facultyId: data.facultyId,
        assignedBy: data.assignedBy || null,
        isActive: true,
      },
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
    })

    await prisma.faculty.update({
      where: { id: data.facultyId },
      data: { isHod: true, facultyId: hodId },
    })

    await prisma.user.update({
      where: { id: faculty.userId },
      data: { role: "HOD", password: hashedPassword },
    })

    revalidatePath("/admin/departments")
    revalidatePath("/admin/faculty")
    revalidatePath("/admin/hod-management")

    return {
      success: true,
      data: {
        hodId,
        facultyName: faculty.user.name || faculty.facultyId,
        department: assignment.department.name,
        username: hodId,
        password: plainPassword,
        assignment,
      },
      message: `${faculty.user.name || faculty.facultyId} assigned as HOD successfully.`,
    }
  } catch (error) {
    console.error("Error assigning HOD:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign HOD" }
  }
}

export async function removeHod(formData: FormData) {
  try {
    const data = removeHodSchema.parse({
      assignmentId: formData.get("assignmentId"),
      removalReason: formData.get("removalReason"),
    })

    const assignment = await prisma.hodAssignment.findUnique({
      where: { id: data.assignmentId },
      include: {
        faculty: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!assignment) {
      return { success: false, error: "HOD assignment not found" }
    }

    if (!assignment.isActive) {
      return { success: false, error: "This HOD assignment is already inactive" }
    }

    await prisma.hodAssignment.update({
      where: { id: data.assignmentId },
      data: {
        isActive: false,
        removedAt: new Date(),
        removalReason: data.removalReason || null,
      },
    })

    const prefix = `MISS-${getDesignationPrefix(assignment.faculty.designation)}-`
    const latest = await prisma.faculty.findFirst({
      where: { facultyId: { startsWith: prefix } },
      orderBy: { facultyId: "desc" },
      select: { facultyId: true },
    })

    const latestSequence = latest?.facultyId
      ? Number.parseInt(latest.facultyId.slice(prefix.length), 10)
      : 0
    const nextSequence = Number.isFinite(latestSequence) ? latestSequence + 1 : 1
    const newFacultyId = `${prefix}${String(nextSequence).padStart(3, "0")}`

    await prisma.faculty.update({
      where: { id: assignment.facultyId },
      data: { isHod: false, facultyId: newFacultyId },
    })

    await prisma.user.update({
      where: { id: assignment.faculty.userId },
      data: { role: "FACULTY" },
    })

    revalidatePath("/admin/departments")
    revalidatePath("/admin/faculty")
    revalidatePath("/admin/hod-management")

    return {
      success: true,
      message: "HOD assignment removed successfully.",
    }
  } catch (error) {
    console.error("Error removing HOD:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove HOD" }
  }
}

export async function getHodStats() {
  try {
    const totalDepartments = await prisma.department.count()
    const totalHods = await prisma.hodAssignment.count({ where: { isActive: true } })
    const departmentsWithoutHod = await prisma.department.count({
      where: { hodAssignments: { none: { isActive: true } } },
    })
    const inactiveHods = await prisma.hodAssignment.count({ where: { isActive: false } })

    return {
      success: true,
      data: {
        totalDepartments,
        totalAssignedHoDs: totalHods,
        departmentsWithoutHoD: departmentsWithoutHod,
        activeHoDs: totalHods,
        inactiveHoDs: inactiveHods,
      },
    }
  } catch (error) {
    console.error("Error fetching HOD stats:", error)
    return { success: false, error: "Failed to fetch HOD stats" }
  }
}
