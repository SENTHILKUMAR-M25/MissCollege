"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const createSectionSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.coerce.number().int().min(1).max(8, "Semester must be between 1 and 8"),
  name: z.string().min(1, "Section name is required"),
  className: z.string().min(1, "Class name is required"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  allocationMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
})

const assignStudentSchema = z.object({
  sectionId: z.string().min(1, "Section is required"),
  studentId: z.string().min(1, "Student is required"),
  assignedBy: z.string().optional(),
})

const moveStudentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  fromSectionId: z.string().min(1, "From section is required"),
  toSectionId: z.string().min(1, "To section is required"),
  assignedBy: z.string().optional(),
})

export async function createSection(data: z.infer<typeof createSectionSchema>) {
  try {
    const parsed = createSectionSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const { departmentId, academicYear, semester, name, className, capacity, allocationMode } = parsed.data

    const isDuplicateName = await prisma.section.findFirst({
      where: { departmentId, academicYear, semester, name },
    })
    if (isDuplicateName) {
      return { success: false, error: `Section "${name}" already exists for this semester and year` }
    }

    let assignedStudents = 0

    if (allocationMode === "AUTO") {
      const students = await prisma.student.findMany({
        where: { departmentId, semester, section: name },
        select: { id: true },
      })
      assignedStudents = students.length
    }

    const section = await prisma.section.create({
      data: {
        name,
        className,
        departmentId,
        academicYear,
        semester,
        capacity,
        assignedStudents,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    })

    if (allocationMode === "AUTO") {
      const students = await prisma.student.findMany({
        where: { departmentId, semester, section: name },
      })
      if (students.length > 0) {
        await prisma.studentSection.createMany({
          data: students.map((s) => ({
            studentId: s.id,
            sectionId: section.id,
            assignedBy: null,
          })),
          skipDuplicates: true,
        })
      }
    }

    revalidatePath("/hod/sections")
    return { success: true, data: section }
  } catch (error) {
    console.error("Error creating section:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create section" }
  }
}

export async function assignStudentToSection(data: z.infer<typeof assignStudentSchema>) {
  try {
    const parsed = assignStudentSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const { sectionId, studentId, assignedBy } = parsed.data

    const [section, student] = await Promise.all([
      prisma.section.findUnique({ where: { id: sectionId }, include: { department: true } }),
      prisma.student.findUnique({ where: { id: studentId }, include: { department: true } }),
    ])

    if (!section) return { success: false, error: "Section not found" }
    if (!student) return { success: false, error: "Student not found" }
    if (student.departmentId !== section.departmentId) {
      return { success: false, error: "Student and section must belong to the same department" }
    }

    const currentCount = await prisma.studentSection.count({
      where: { sectionId },
    })
    if (currentCount >= section.capacity) {
      return { success: false, error: `Section is full (${section.capacity} students max)` }
    }

    const existing = await prisma.studentSection.findUnique({
      where: { studentId_sectionId: { studentId, sectionId } },
    })
    if (existing) {
      return { success: false, error: "Student is already assigned to this section" }
    }

    await prisma.studentSection.create({
      data: {
        studentId,
        sectionId,
        assignedBy: assignedBy || null,
      },
    })

    await prisma.student.update({
      where: { id: studentId },
      data: { section: section.name },
    })

    await prisma.section.update({
      where: { id: sectionId },
      data: { assignedStudents: { increment: 1 } },
    })

    revalidatePath("/hod/sections")
    return { success: true, message: "Student assigned successfully" }
  } catch (error) {
    console.error("Error assigning student:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign student" }
  }
}

export async function moveStudent(data: z.infer<typeof moveStudentSchema>) {
  try {
    const parsed = moveStudentSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const { studentId, fromSectionId, toSectionId, assignedBy } = parsed.data

    const [fromSection, toSection, student] = await Promise.all([
      prisma.section.findUnique({ where: { id: fromSectionId } }),
      prisma.section.findUnique({ where: { id: toSectionId } }),
      prisma.student.findUnique({ where: { id: studentId } }),
    ])

    if (!fromSection) return { success: false, error: "Source section not found" }
    if (!toSection) return { success: false, error: "Destination section not found" }
    if (!student) return { success: false, error: "Student not found" }
    if (fromSection.departmentId !== toSection.departmentId) {
      return { success: false, error: "Sections must belong to the same department" }
    }

    const toSectionCount = await prisma.studentSection.count({ where: { sectionId: toSectionId } })
    if (toSectionCount >= toSection.capacity) {
      return { success: false, error: `Destination section is full (${toSection.capacity} students max)` }
    }

    const existing = await prisma.studentSection.findUnique({
      where: { studentId_sectionId: { studentId, sectionId: toSectionId } },
    })
    if (existing) {
      return { success: false, error: "Student is already assigned to destination section" }
    }

    await prisma.$transaction([
      prisma.studentSection.deleteMany({
        where: { studentId, sectionId: fromSectionId },
      }),
      prisma.studentSection.create({
        data: {
          studentId,
          sectionId: toSectionId,
          assignedBy: assignedBy || null,
        },
      }),
      prisma.student.update({
        where: { id: studentId },
        data: { section: toSection.name },
      }),
      prisma.section.update({
        where: { id: fromSectionId },
        data: { assignedStudents: { decrement: 1 } },
      }),
      prisma.section.update({
        where: { id: toSectionId },
        data: { assignedStudents: { increment: 1 } },
      }),
    ])

    revalidatePath("/hod/sections")
    return { success: true, message: "Student moved successfully" }
  } catch (error) {
    console.error("Error moving student:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to move student" }
  }
}

export async function getSections(departmentId: string, semester?: number, academicYear?: string) {
  try {
    const where: any = { departmentId }
    if (semester) where.semester = semester
    if (academicYear) where.academicYear = academicYear

    const sections = await prisma.section.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, code: true } },
        studentSections: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: [{ semester: "asc" }, { name: "asc" }],
    })

    return {
      success: true,
      data: sections.map((section) => ({
        ...section,
        availableSeats: section.capacity - section.assignedStudents,
      })),
    }
  } catch (error) {
    console.error("Error fetching sections:", error)
    return { success: false, error: "Failed to fetch sections" }
  }
}

export async function deleteSection(sectionId: string) {
  try {
    const section = await prisma.section.findUnique({ where: { id: sectionId } })
    if (!section) return { success: false, error: "Section not found" }

    if (section.assignedStudents > 0) {
      return { success: false, error: "Cannot delete section with assigned students" }
    }

    await prisma.studentSection.deleteMany({ where: { sectionId } })
    await prisma.section.delete({ where: { id: sectionId } })

    revalidatePath("/hod/sections")
    return { success: true, message: "Section deleted successfully" }
  } catch (error) {
    console.error("Error deleting section:", error)
    return { success: false, error: "Failed to delete section" }
  }
}

export async function getUnassignedStudents(departmentId: string, semester?: number) {
  try {
    const where: any = { departmentId }
    if (semester) where.semester = semester

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { name: true, code: true } },
      },
    })

    const assignedStudentIds = new Set<string>()
    const studentSections = await prisma.studentSection.findMany({
      include: { section: true },
    })
    for (const ss of studentSections) {
      if (ss.section.departmentId === departmentId) {
        assignedStudentIds.add(ss.studentId)
      }
    }

    const unassigned = students.filter((s) => !assignedStudentIds.has(s.id))

    return {
      success: true,
      data: unassigned,
    }
  } catch (error) {
    console.error("Error fetching unassigned students:", error)
    return { success: false, error: "Failed to fetch unassigned students" }
  }
}
