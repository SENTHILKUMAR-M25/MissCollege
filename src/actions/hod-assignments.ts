"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

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
            user: true,
            department: true,
          },
        },
        department: true,
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
            user: true,
          },
        },
        department: true,
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

export async function assignHod(formData: FormData) {
  try {
    const data = assignHodSchema.parse({
      facultyId: formData.get("facultyId"),
      departmentId: formData.get("departmentId"),
      assignedBy: formData.get("assignedBy"),
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
        data: {
          isHod: false,
        },
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
            user: true,
          },
        },
        department: true,
      },
    })

    await prisma.faculty.update({
      where: { id: data.facultyId },
      data: {
        isHod: true,
      },
    })

    await prisma.user.update({
      where: { id: faculty.userId },
      data: {
        role: "HOD",
      },
    })

    revalidatePath("/admin/departments")
    revalidatePath("/admin/faculty")
    revalidatePath("/admin/reports/hod")
    revalidatePath("/hod")

    return {
      success: true,
      data: assignment,
      message: existingActiveHod
        ? `HOD changed. ${faculty.user.name || faculty.facultyId} is now the new HOD.`
        : `${faculty.user.name || faculty.facultyId} has been assigned as HOD.`,
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

    const updatedAssignment = await prisma.hodAssignment.update({
      where: { id: data.assignmentId },
      data: {
        isActive: false,
        removedAt: new Date(),
        removalReason: data.removalReason || null,
      },
    })

    await prisma.faculty.update({
      where: { id: assignment.facultyId },
      data: {
        isHod: false,
      },
    })

    await prisma.user.update({
      where: { id: assignment.faculty.userId },
      data: {
        role: "FACULTY",
      },
    })

    revalidatePath("/admin/departments")
    revalidatePath("/admin/faculty")
    revalidatePath("/admin/reports/hod")
    revalidatePath("/hod")

    return {
      success: true,
      message: `HOD assignment removed successfully.`,
    }
  } catch (error) {
    console.error("Error removing HOD:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove HOD" }
  }
}

export async function getDepartmentStats() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            faculty: true,
            students: true,
            courses: true,
            subjects: true,
          },
        },
        hodAssignments: {
          where: { isActive: true },
          include: {
            faculty: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const stats = departments.map((dept) => {
      const activeHod = dept.hodAssignments[0]
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        facultyCount: dept._count.faculty,
        studentCount: dept._count.students,
        courseCount: dept._count.courses,
        subjectCount: dept._count.subjects,
        hod: activeHod
          ? {
              id: activeHod.facultyId,
              name: activeHod.faculty?.user?.name || null,
              facultyId: activeHod.facultyId,
              assignedAt: activeHod.assignedAt,
            }
          : null,
      }
    })

    return { success: true, data: stats }
  } catch (error) {
    console.error("Error fetching department stats:", error)
    return { success: false, error: "Failed to fetch department statistics" }
  }
}
