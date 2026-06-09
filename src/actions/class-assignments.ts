"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const createClassAssignmentSchema = z.object({
  facultyId: z.string().min(1, "Faculty is required"),
  departmentId: z.string().min(1, "Department is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.coerce.number().int().min(1).max(8, "Semester must be between 1 and 8"),
  section: z.string().min(1, "Section is required"),
})

const transferClassAssignmentSchema = z.object({
  classAssignmentId: z.string().min(1, "Class assignment ID is required"),
  newFacultyId: z.string().min(1, "New faculty ID is required"),
  transferReason: z.string().optional(),
})

const updateClassAssignmentSchema = z.object({
  classAssignmentId: z.string().min(1, "Class assignment ID is required"),
  academicYear: z.string().min(1, "Academic year is required").optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  section: z.string().min(1, "Section is required").optional(),
  facultyId: z.string().min(1, "Faculty is required").optional(),
})

export async function getClassAssignments(departmentId: string, semester?: number, section?: string) {
  try {
    const where: any = { departmentId }

    if (semester) where.semester = semester
    if (section) where.section = section
    if (semester && section) {
      where.semester = semester
      where.section = section
    }

    const assignments = await prisma.classAssignment.findMany({
      where: { ...where, assignmentStatus: "ACTIVE" },
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
      orderBy: { assignedAt: "desc" },
    })

    const totalAssignments = await prisma.classAssignment.count({
      where: { departmentId, assignmentStatus: "ACTIVE" },
    })

    const uniqueSections = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      select: { section: true },
      distinct: ["section"],
    })

    const uniqueSemesters = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      select: { semester: true },
      distinct: ["semester"],
    })

    const assignedClassAdvisors = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } } },
      distinct: ["facultyId"],
      orderBy: { faculty: { user: { name: "asc" } } },
    })

    const recentAssignments = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: { assignedAt: "desc" },
      take: 10,
    })

    const unassignedSections = await getUnassignedSections(departmentId)

    return {
      success: true,
      data: {
        assignments,
        stats: {
          totalAssignments,
          totalSections: uniqueSections.length,
          totalSemesters: uniqueSemesters.length,
          classAdvisorCount: assignedClassAdvisors.length,
        },
        unassignedSections,
        recentAssignments,
      },
    }
  } catch (error) {
    console.error("Error fetching class assignments:", error)
    return { success: false, error: "Failed to fetch class assignments" }
  }
}

async function getUnassignedSections(departmentId: string) {
  const allStudents = await prisma.student.findMany({
    where: { departmentId },
    select: { semester: true, section: true },
  })

  const existingSections = new Set(
    (
      await prisma.classAssignment.findMany({
        where: { departmentId, assignmentStatus: "ACTIVE" },
        select: { semester: true, section: true },
      })
    ).map((a) => `${a.semester}-${a.section}`)
  )

  const unassigned: { semester: number; section: string }[] = []
  const seen = new Set<string>()

  for (const s of allStudents) {
    const key = `${s.semester}-${s.section}`
    if (!existingSections.has(key) && !seen.has(key)) {
      unassigned.push({ semester: s.semester, section: s.section })
      seen.add(key)
    }
  }

  return unassigned.sort((a, b) => a.semester - b.semester || a.section.localeCompare(b.section))
}

export async function assignClassToFaculty(data: {
  facultyId: string
  departmentId: string
  academicYear: string
  semester: number
  section: string
}) {
  try {
    const parsed = createClassAssignmentSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const { facultyId, departmentId, academicYear, semester, section } = parsed.data

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { user: true, department: true },
    })

    if (!faculty) {
      return { success: false, error: "Faculty member not found" }
    }

    if (faculty.departmentId !== departmentId) {
      return { success: false, error: "Faculty member does not belong to the selected department" }
    }

    if (!faculty.user.isActive) {
      return { success: false, error: "Faculty member account is deactivated" }
    }

    if (!faculty.accountStatus) {
      return { success: false, error: "Faculty member account is suspended" }
    }

    const existingActive = await prisma.classAssignment.findFirst({
      where: {
        departmentId,
        semester,
        section,
        assignmentStatus: "ACTIVE",
      },
      include: { faculty: { include: { user: true } } },
    })

    if (existingActive) {
      return {
        success: false,
        error: `Class ${section} Semester ${semester} is already assigned to ${existingActive.faculty.user.name}`,
      }
    }

    const assignment = await prisma.classAssignment.create({
      data: {
        facultyId,
        departmentId,
        academicYear,
        semester,
        section,
        assignmentStatus: "ACTIVE",
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

    revalidatePath("/hod/class-assignments")
    revalidatePath("/hod/dashboard")

    return {
      success: true,
      data: assignment,
      message: `Class ${section} (Semester ${semester}) assigned to ${faculty.user.name}`,
    }
  } catch (error) {
    console.error("Error assigning class to faculty:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign class" }
  }
}

export async function getClassAssignmentHistory(departmentId: string) {
  try {
    const history = await prisma.classAssignment.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
      orderBy: { assignedAt: "desc" },
      take: 50,
    })

    return { success: true, data: history }
  } catch (error) {
    console.error("Error fetching class assignment history:", error)
    return { success: false, error: "Failed to fetch history" }
  }
}

export async function getClassAssignmentStats(departmentId: string) {
  try {
    const totalAssignments = await prisma.classAssignment.count({
      where: { departmentId, assignmentStatus: "ACTIVE" },
    })

    const classAdvisors = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } }, department: { select: { name: true, code: true } } },
      distinct: ["facultyId"],
      orderBy: { assignedAt: "desc" },
    })

    const recentAssignments = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } } },
      orderBy: { assignedAt: "desc" },
      take: 5,
    })

    const allCombinations = await prisma.student.findMany({
      where: { departmentId },
      select: { semester: true, section: true },
    })

    const assignedCombinations = new Set(
      (
        await prisma.classAssignment.findMany({
          where: { departmentId, assignmentStatus: "ACTIVE" },
          select: { semester: true, section: true },
        })
      ).map((a) => `${a.semester}-${a.section}`)
    )

    const totalUnique = new Set(allCombinations.map((s) => `${s.semester}-${s.section}`)).size
    const unassignedCount = totalUnique - totalAssignments

    return {
      success: true,
      data: {
        totalSections: totalUnique,
        assignedClasses: totalAssignments,
        unassignedClasses: unassignedCount,
        classAdvisorCount: classAdvisors.length,
        classAdvisors,
        recentAssignments,
      },
    }
  } catch (error) {
    console.error("Error fetching class assignment stats:", error)
    return { success: false, error: "Failed to fetch stats" }
  }
}

export async function transferClassAssignment(data: {
  classAssignmentId: string
  newFacultyId: string
  transferReason?: string
}) {
  try {
    const parsed = transferClassAssignmentSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const { classAssignmentId, newFacultyId, transferReason } = parsed.data

    const existingAssignment = await prisma.classAssignment.findUnique({
      where: { id: classAssignmentId },
      include: { faculty: { include: { user: true, department: true } }, department: true },
    })

    if (!existingAssignment) {
      return { success: false, error: "Class assignment not found" }
    }

    if (existingAssignment.assignmentStatus !== "ACTIVE") {
      return { success: false, error: "This assignment is no longer active" }
    }

    const newFaculty = await prisma.faculty.findUnique({
      where: { id: newFacultyId },
      include: { user: true, department: true },
    })

    if (!newFaculty) {
      return { success: false, error: "New faculty member not found" }
    }

    if (newFaculty.departmentId !== existingAssignment.departmentId) {
      return { success: false, error: "New faculty member does not belong to the same department" }
    }

    if (newFacultyId === existingAssignment.facultyId) {
      return { success: false, error: "Cannot transfer to the same faculty member" }
    }

    await prisma.classAssignment.update({
      where: { id: classAssignmentId },
      data: { assignmentStatus: "TRANSFERRED" },
    })

    const newAssignment = await prisma.classAssignment.create({
      data: {
        facultyId: newFacultyId,
        departmentId: existingAssignment.departmentId,
        academicYear: existingAssignment.academicYear,
        semester: existingAssignment.semester,
        section: existingAssignment.section,
        assignmentStatus: "ACTIVE",
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

    revalidatePath("/hod/class-assignments")
    revalidatePath("/hod/dashboard")

    return {
      success: true,
      data: newAssignment,
      message: `Class ${existingAssignment.section} (Semester ${existingAssignment.semester}) transferred from ${existingAssignment.faculty.user.name} to ${newFaculty.user.name}`,
    }
  } catch (error) {
    console.error("Error transferring class assignment:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to transfer class assignment" }
  }
}

export async function removeClassAssignment(classAssignmentId: string) {
  try {
    const assignment = await prisma.classAssignment.findUnique({
      where: { id: classAssignmentId },
      include: { faculty: { include: { user: true } }, department: true },
    })

    if (!assignment) {
      return { success: false, error: "Class assignment not found" }
    }

    if (assignment.assignmentStatus !== "ACTIVE") {
      return { success: false, error: "This assignment is already inactive" }
    }

    await prisma.classAssignment.update({
      where: { id: classAssignmentId },
      data: { assignmentStatus: "REMOVED" },
    })

    revalidatePath("/hod/class-assignments")
    revalidatePath("/hod/dashboard")

    return {
      success: true,
      message: `Class assignment for ${assignment.section} (Semester ${assignment.semester}) removed successfully`,
    }
  } catch (error) {
    console.error("Error removing class assignment:", error)
    return { success: false, error: "Failed to remove class assignment" }
  }
}

export async function getFacultyClassAssignments(facultyId: string) {
  try {
    const assignments = await prisma.classAssignment.findMany({
      where: { facultyId, assignmentStatus: "ACTIVE" },
      include: {
        department: { select: { name: true, code: true } },
      },
      orderBy: { assignedAt: "desc" },
    })

    return { success: true, data: assignments }
  } catch (error) {
    console.error("Error fetching faculty class assignments:", error)
    return { success: false, error: "Failed to fetch class assignments" }
  }
}

export async function getClassAssignmentById(id: string) {
  try {
    const assignment = await prisma.classAssignment.findUnique({
      where: { id },
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
    })

    if (!assignment) {
      return { success: false, error: "Class assignment not found" }
    }

    return { success: true, data: assignment }
  } catch (error) {
    console.error("Error fetching class assignment:", error)
    return { success: false, error: "Failed to fetch class assignment" }
  }
}

export async function updateClassAssignment(data: {
  classAssignmentId: string
  academicYear?: string
  semester?: number
  section?: string
  facultyId?: string
}) {
  try {
    const parsed = updateClassAssignmentSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const { classAssignmentId, academicYear, semester, section, facultyId } = parsed.data

    const existing = await prisma.classAssignment.findUnique({
      where: { id: classAssignmentId },
    })

    if (!existing) {
      return { success: false, error: "Class assignment not found" }
    }

    if (existing.assignmentStatus !== "ACTIVE") {
      return { success: false, error: "This assignment is no longer active" }
    }

    if (facultyId && facultyId !== existing.facultyId) {
      const newFaculty = await prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { user: true },
      })

      if (!newFaculty) {
        return { success: false, error: "New faculty member not found" }
      }

      if (newFaculty.departmentId !== existing.departmentId) {
        return { success: false, error: "Faculty member does not belong to the selected department" }
      }
    }

    const updateData: any = {}
    if (academicYear) updateData.academicYear = academicYear
    if (semester) updateData.semester = semester
    if (section) updateData.section = section
    if (facultyId) updateData.facultyId = facultyId

    const updated = await prisma.classAssignment.update({
      where: { id: classAssignmentId },
      data: updateData,
      include: {
        faculty: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        department: { select: { name: true, code: true } },
      },
    })

    revalidatePath("/hod/class-assignments")
    revalidatePath("/hod/dashboard")

    return {
      success: true,
      data: updated,
      message: `Class assignment updated successfully`,
    }
  } catch (error) {
    console.error("Error updating class assignment:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to update class assignment" }
  }
}

export async function getDepartmentFacultyForClassAssignment(departmentId: string) {
  try {
    const faculty = await prisma.faculty.findMany({
      where: {
        departmentId,
        accountStatus: true,
        user: { isActive: true, role: "FACULTY" },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { id: "asc" },
    })

    return { success: true, data: faculty }
  } catch (error) {
    console.error("Error fetching faculty for class assignment:", error)
    return { success: false, error: "Failed to fetch faculty" }
  }
}

export async function getClassAssignmentReports(departmentId: string) {
  try {
    const [semesterReport, sectionReport, facultyReport] = await Promise.all([
      prisma.classAssignment.groupBy({
        by: ["semester", "section"],
        where: { departmentId, assignmentStatus: "ACTIVE" },
        _count: { id: true },
        having: { id: { _count: { gt: 0 } } },
      }),
      prisma.classAssignment.groupBy({
        by: ["section"],
        where: { departmentId, assignmentStatus: "ACTIVE" },
        _count: { id: true },
        having: { id: { _count: { gt: 0 } } },
      }),
      prisma.classAssignment.groupBy({
        by: ["facultyId"],
        where: { departmentId, assignmentStatus: "ACTIVE" },
        _count: { id: true },
        having: { id: { _count: { gt: 0 } } },
      }),
    ])

    const facultyDetails = await prisma.faculty.findMany({
      where: {
        id: { in: facultyReport.map((f) => f.facultyId) },
        departmentId,
      },
      include: { user: { select: { name: true, email: true } } },
    })

    const facultyMap = new Map(facultyDetails.map((f) => [f.id, f]))

    const semesterReportSorted = semesterReport
      .map((r) => ({
        semester: r.semester,
        section: r.section,
        count: r._count.id,
      }))
      .sort((a, b) => a.semester - b.semester || a.section.localeCompare(b.section))

    const facultyReportDetailed = facultyReport.map((r) => {
      const f = facultyMap.get(r.facultyId)
      return {
        facultyId: r.facultyId,
        facultyName: f?.user.name || "Unknown",
        facultyEmail: f?.user.email || "",
        assignmentCount: r._count.id,
      }
    })

    return {
      success: true,
      data: {
        semesterReport: semesterReportSorted,
        sectionReport: sectionReport.map((r) => ({
          section: r.section,
          count: r._count.id,
        })),
        facultyReport: facultyReportDetailed,
      },
    }
  } catch (error) {
    console.error("Error fetching class assignment reports:", error)
    return { success: false, error: "Failed to fetch reports" }
  }
}
