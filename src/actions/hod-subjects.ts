"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function autoGenerateSubjectCode(departmentId: string, semester: number) {
  try {
    const dept = await prisma.department.findUnique({ where: { id: departmentId } })
    if (!dept) return { success: false, error: "Department not found" }

    const prefix = `${dept.code}-SEM${semester}`
    const last = await prisma.subject.findFirst({
      where: { code: { startsWith: prefix }, departmentId },
      orderBy: { code: "desc" },
    })
    const next = last ? parseInt(last.code.slice(-3)) + 1 : 1
    const code = `${prefix}-${String(next).padStart(3, "0")}`
    return { success: true, data: code }
  } catch (err) {
    console.error("autoGenerateSubjectCode error:", err)
    return { success: false, error: "Failed to generate code" }
  }
}

export async function getHodSubjectStats(facultyId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { department: true, hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const deptId = hod.departmentId

    const [totalSubjects, totalAssigned, unassigned, facultyCount] = await Promise.all([
      prisma.subject.count({ where: { departmentId: deptId, isActive: true } }),
      prisma.subject.count({ where: { departmentId: deptId, isActive: true, facultyId: { not: null } } }),
      prisma.subject.count({ where: { departmentId: deptId, isActive: true, facultyId: null } }),
      prisma.faculty.count({ where: { departmentId: deptId, accountStatus: true } }),
    ])

    const semCounts: Record<number, number> = {}
    for (let s = 1; s <= 8; s++) {
      semCounts[s] = await prisma.subject.count({ where: { departmentId: deptId, isActive: true, semester: s } })
    }

    return {
      success: true,
      data: {
        totalSubjects,
        totalAssigned,
        unassigned,
        facultyCount,
        semCounts,
        departmentName: hod.department.name,
      },
    }
  } catch (err) {
    console.error("getHodSubjectStats error:", err)
    return { success: false, error: "Failed to load stats" }
  }
}

export async function getHodSubjects(facultyId: string, filters?: { semester?: number; subjectType?: string; academicYear?: string; regulation?: string }) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const where: any = { departmentId: hod.departmentId, isActive: true }
    if (filters?.semester) where.semester = filters.semester
    if (filters?.subjectType && filters.subjectType !== "ALL") where.subjectType = filters.subjectType
    if (filters?.academicYear) where.academicYear = filters.academicYear
    if (filters?.regulation) where.regulation = filters.regulation

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        faculty: { include: { user: { select: { name: true, email: true } } } },
        facultySubjects: {
          where: { isActive: true },
          include: { faculty: { include: { user: { select: { name: true, email: true, facultyId: true } } } } },
        },
      },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    })

    return { success: true, data: subjects }
  } catch (err) {
    console.error("getHodSubjects error:", err)
    return { success: false, error: "Failed to load subjects" }
  }
}

export async function getHodDepartmentFaculty(facultyId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { department: true, hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const faculty = await prisma.faculty.findMany({
      where: { departmentId: hod.departmentId, accountStatus: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { facultyId: "asc" },
    })

    return { success: true, data: faculty }
  } catch (err) {
    console.error("getHodDepartmentFaculty error:", err)
    return { success: false, error: "Failed to load faculty" }
  }
}

export async function createSubject(facultyId: string, data: {
  code: string
  name: string
  departmentId: string
  semester: number
  credits: number
  subjectType?: string
  regulation?: string
  academicYear?: string
  description?: string
}) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const deptId = hod.departmentId
    if (!deptId) return { success: false, error: "HOD department not found" }

    const existing = await prisma.subject.findFirst({
      where: { code: data.code, departmentId: deptId },
    })
    if (existing) return { success: false, error: `Subject code "${data.code}" already exists in this department` }

    await prisma.subject.create({
      data: {
        code: data.code,
        name: data.name,
        departmentId: deptId,
        semester: data.semester,
        credits: data.credits,
        subjectType: data.subjectType || "THEORY",
        regulation: data.regulation,
        academicYear: data.academicYear,
        description: data.description,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: facultyId,
        action: "CREATE",
        entityType: "Subject",
        entityId: data.code,
        details: `Created subject ${data.code} - ${data.name} (Sem ${data.semester})`,
      },
    })

    revalidatePath("/hod/subjects")
    return { success: true }
  } catch (err) {
    console.error("createSubject error:", err)
    return { success: false, error: "Failed to create subject" }
  }
}

export async function updateSubject(subjectId: string, facultyId: string, data: {
  name?: string
  credits?: number
  subjectType?: string
  regulation?: string
  academicYear?: string
  description?: string
  isActive?: boolean
}) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Subject not found or access denied" }
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.credits !== undefined && { credits: data.credits }),
        ...(data.subjectType !== undefined && { subjectType: data.subjectType }),
        ...(data.regulation !== undefined && { regulation: data.regulation }),
        ...(data.academicYear !== undefined && { academicYear: data.academicYear }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: facultyId,
        action: "UPDATE",
        entityType: "Subject",
        entityId: subject.code,
        details: `Updated subject ${subject.code}: ${JSON.stringify(data)}`,
      },
    })

    revalidatePath("/hod/subjects")
    return { success: true }
  } catch (err) {
    console.error("updateSubject error:", err)
    return { success: false, error: "Failed to update subject" }
  }
}

export async function deleteSubject(subjectId: string, facultyId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Subject not found or access denied" }
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: { isActive: false },
    })

    await prisma.facultySubject.updateMany({
      where: { subjectId, isActive: true },
      data: { isActive: false, removedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        userId: facultyId,
        action: "DELETE",
        entityType: "Subject",
        entityId: subject.code,
        details: `Deleted subject ${subject.code} - ${subject.name}`,
      },
    })

    revalidatePath("/hod/subjects")
    return { success: true }
  } catch (err) {
    console.error("deleteSubject error:", err)
    return { success: false, error: "Failed to delete subject" }
  }
}

export async function assignFacultyToSubject(subjectId: string, facultyIds: string[], facultyUserId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Subject not found or access denied" }
    }

    await prisma.$transaction(async (tx) => {
      for (const fid of facultyIds) {
        const existing = await tx.facultySubject.findFirst({
          where: { facultyId: fid, subjectId, isActive: true },
        })
        if (!existing) {
          await tx.facultySubject.create({
            data: { facultyId: fid, subjectId, assignedBy: facultyUserId, isActive: true },
          })
        }
      }

      if (facultyIds.length > 0) {
        await tx.subject.update({
          where: { id: subjectId },
          data: { facultyId: facultyIds[0] },
        })
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: facultyUserId,
        action: "ASSIGN",
        entityType: "FacultySubject",
        entityId: subjectId,
        details: `Assigned ${facultyIds.length} faculty to subject ${subject.code}`,
      },
    })

    revalidatePath("/hod/subjects")
    return { success: true }
  } catch (err) {
    console.error("assignFacultyToSubject error:", err)
    return { success: false, error: "Failed to assign faculty" }
  }
}

export async function removeFacultyFromSubject(facultySubjectId: string, facultyUserId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const fs = await prisma.facultySubject.findUnique({ where: { id: facultySubjectId } })
    if (!fs) return { success: false, error: "Assignment not found" }

    const subject = await prisma.subject.findUnique({ where: { id: fs.subjectId } })
    if (!subject || subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Access denied" }
    }

    await prisma.facultySubject.update({
      where: { id: facultySubjectId },
      data: { isActive: false, removedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        userId: facultyUserId,
        action: "REMOVE",
        entityType: "FacultySubject",
        entityId: fs.subjectId,
        details: `Removed faculty ${fs.facultyId} from subject ${subject?.code}`,
      },
    })

    revalidatePath("/hod/subjects")
    return { success: true }
  } catch (err) {
    console.error("removeFacultyFromSubject error:", err)
    return { success: false, error: "Failed to remove faculty" }
  }
}

export async function getSubjectAuditLogs(facultyId: string, limit = 50) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const logs = await prisma.auditLog.findMany({
      where: { entityType: "Subject" },
      select: { id: true, userId: true, action: true, entityType: true, entityId: true, details: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return { success: true, data: logs }
  } catch (err) {
    console.error("getSubjectAuditLogs error:", err)
    return { success: false, error: "Failed to load audit logs" }
  }
}

export async function getHodFacultyWorkload(facultyId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const facultyList = await prisma.faculty.findMany({
      where: { departmentId: hod.departmentId, accountStatus: true },
      include: {
        user: { select: { name: true, email: true } },
        facultySubjects: { where: { isActive: true }, include: { subject: true } },
      },
      orderBy: { facultyId: "asc" },
    })

    const workload = facultyList.map((f) => {
      const totalHours = f.facultySubjects.reduce((s, fs) => s + (fs.assignedHours || 0), 0)
      return {
        id: f.id,
        facultyId: f.facultyId,
        name: f.user.name,
        email: f.user.email,
        designation: f.designation,
        subjectCount: f.facultySubjects.length,
        totalAssignedHours: totalHours,
        subjects: f.facultySubjects.map((fs) => ({
          subjectCode: fs.subject.code,
          subjectName: fs.subject.name,
          hours: fs.assignedHours,
          semester: fs.subject.semester,
        })),
      }
    })

    return { success: true, data: workload }
  } catch (err) {
    console.error("getHodFacultyWorkload error:", err)
    return { success: false, error: "Failed to load workload" }
  }
}

export async function getSemesterSubjectReport(facultyId: string, semester: number, academicYear?: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const where: any = { departmentId: hod.departmentId, semester, isActive: true }
    if (academicYear) where.academicYear = academicYear

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        facultySubjects: { where: { isActive: true }, include: { faculty: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { code: "asc" },
    })

    const total = subjects.length
    const assigned = subjects.filter((s) => s.facultyId || s.facultySubjects.length > 0).length
    const unassigned = total - assigned

    return {
      success: true,
      data: {
        semester,
        academicYear,
        total,
        assigned,
        unassigned,
        subjects,
      },
    }
  } catch (err) {
    console.error("getSemesterSubjectReport error:", err)
    return { success: false, error: "Failed to load report" }
  }
}

export async function getDepartmentSubjectReport(facultyId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyId },
      include: { hodAssignments: { where: { isActive: true } }, department: true },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const subjects = await prisma.subject.findMany({
      where: { departmentId: hod.departmentId, isActive: true },
      include: { faculty: { include: { user: { select: { name: true } } } }, facultySubjects: { where: { isActive: true }, include: { faculty: { include: { user: { select: { name: true } } } } } } },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    })

    const semCounts: Record<number, number> = {}
    for (let s = 1; s <= 8; s++) {
      semCounts[s] = subjects.filter((sub) => sub.semester === s).length
    }

    return {
      success: true,
      data: {
        departmentName: hod.department.name,
        total: subjects.length,
        semCounts,
        subjects,
      },
    }
  } catch (err) {
    console.error("getDepartmentSubjectReport error:", err)
    return { success: false, error: "Failed to load report" }
  }
}

export async function reassignSubject(facultySubjectId: string, newFacultyId: string, facultyUserId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const old = await prisma.facultySubject.findUnique({ where: { id: facultySubjectId } })
    if (!old) return { success: false, error: "Allocation not found" }

    const subject = await prisma.subject.findUnique({ where: { id: old.subjectId } })
    if (!subject || subject.departmentId !== hod.departmentId) return { success: false, error: "Access denied" }

    await prisma.$transaction(async (tx) => {
      await tx.facultySubject.update({ where: { id: facultySubjectId }, data: { isActive: false, removedAt: new Date() } })
      await tx.facultySubject.create({ data: { facultyId: newFacultyId, subjectId: old.subjectId, assignedBy: facultyUserId, isActive: true } })
      await tx.subject.update({ where: { id: old.subjectId }, data: { facultyId: newFacultyId } })
    })

    revalidatePath("/hod/subjects")
    return { success: true }
  } catch (err) {
    console.error("reassignSubject error:", err)
    return { success: false, error: "Failed to reassign" }
  }
}
