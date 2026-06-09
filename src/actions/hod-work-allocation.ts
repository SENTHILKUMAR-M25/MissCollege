"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function requireHodFaculty(userId: string) {
  const hod = await prisma.faculty.findUnique({
    where: { userId },
    include: { department: true, hodAssignments: { where: { isActive: true } } },
  })
  if (!hod?.hodAssignments[0]) throw new Error("Not authorized")
  return hod
}

export async function getWorkAllocationData(userId: string) {
  try {
    const hod = await requireHodFaculty(userId)
    const deptId = hod.departmentId

    const [facultyList, subjects, classAdvisors, studentSections] = await Promise.all([
      prisma.faculty.findMany({
        where: { departmentId: deptId, accountStatus: true },
        include: {
          user: { select: { name: true, email: true } },
          facultySubjects: {
            where: { isActive: true },
            include: { subject: { select: { id: true, code: true, name: true, semester: true, totalHoursPerWeek: true } } },
          },
          classAssignments: {
            where: { assignmentStatus: "ACTIVE", departmentId: deptId },
            select: { id: true, semester: true, section: true, academicYear: true },
          },
        },
        orderBy: { facultyId: "asc" },
      }),
      prisma.subject.findMany({
        where: { departmentId: deptId, isActive: true },
        select: { id: true, code: true, name: true, semester: true, credits: true, subjectType: true, academicYear: true, totalHoursPerWeek: true, facultyId: true },
        orderBy: [{ semester: "asc" }, { code: "asc" }],
      }),
      prisma.classAssignment.findMany({
        where: { departmentId: deptId, assignmentStatus: "ACTIVE" },
        include: { faculty: { select: { id: true, facultyId: true, user: { select: { name: true } } } } },
        orderBy: [{ semester: "asc" }, { section: "asc" }],
      }),
      prisma.student.findMany({
        where: { departmentId: deptId },
        select: { semester: true, section: true },
      }),
    ])

    // Unique semester+section combos from students
    const sectionMap = new Map<string, { semester: number; section: string }>()
    for (const s of studentSections) {
      sectionMap.set(`${s.semester}-${s.section}`, { semester: s.semester, section: s.section })
    }
    const allSections = Array.from(sectionMap.values()).sort((a, b) => a.semester - b.semester || a.section.localeCompare(b.section))

    const assignedSectionKeys = new Set(classAdvisors.map((ca) => `${ca.semester}-${ca.section}`))
    const unassignedSections = allSections.filter((s) => !assignedSectionKeys.has(`${s.semester}-${s.section}`))

    const subjectAllocations = await prisma.facultySubject.findMany({
      where: { isActive: true, subject: { departmentId: deptId } },
      include: {
        subject: { select: { id: true, code: true, name: true, semester: true } },
        faculty: { select: { id: true, facultyId: true, user: { select: { name: true } } } },
      },
    })

    const assignedSubjectIds = new Set(subjectAllocations.map((a) => a.subjectId))
    const unassignedSubjects = subjects.filter((s) => !assignedSubjectIds.has(s.id) && !s.facultyId)

    const semesters = Array.from(new Set(subjects.map((s) => s.semester))).sort()
    const academicYears = Array.from(new Set(subjects.map((s) => s.academicYear).filter(Boolean))) as string[]
    const sections = Array.from(new Set(allSections.map((s) => s.section))).sort()

    return {
      success: true,
      data: {
        departmentName: hod.department.name,
        facultyList: facultyList.map((f) => ({
          id: f.id,
          facultyId: f.facultyId,
          name: f.user.name || "",
          email: f.user.email,
          designation: f.designation,
          subjects: f.facultySubjects.map((fs) => ({
            allocationId: fs.id,
            subjectId: fs.subject.id,
            code: fs.subject.code,
            name: fs.subject.name,
            semester: fs.subject.semester,
            hoursPerWeek: fs.subject.totalHoursPerWeek || 0,
          })),
          classAdvisorFor: f.classAssignments.map((ca) => ({
            id: ca.id,
            semester: ca.semester,
            section: ca.section,
            academicYear: ca.academicYear,
          })),
          totalWeeklyHours: f.facultySubjects.reduce((s, fs) => s + (fs.subject.totalHoursPerWeek || 0), 0),
          isClassAdvisor: f.classAssignments.length > 0,
        })),
        subjects,
        classAdvisors,
        allSections,
        unassignedSections,
        unassignedSubjects,
        subjectAllocations,
        semesters,
        academicYears,
        sections,
        stats: {
          totalFaculty: facultyList.length,
          totalSubjectsAssigned: assignedSubjectIds.size,
          totalClassAdvisors: classAdvisors.length,
          unassignedSubjects: unassignedSubjects.length,
          unassignedClasses: unassignedSections.length,
        },
      },
    }
  } catch (err) {
    console.error("getWorkAllocationData error:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to load data" }
  }
}

export async function assignSubjectToFaculty(
  userId: string,
  subjectId: string,
  facultyId: string,
  hoursPerWeek?: number
) {
  try {
    const hod = await requireHodFaculty(userId)

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Subject not found or access denied" }
    }

    const existing = await prisma.facultySubject.findFirst({
      where: { facultyId, subjectId, isActive: true },
    })
    if (existing) return { success: false, error: "This subject is already assigned to this faculty" }

    await prisma.$transaction(async (tx) => {
      await tx.facultySubject.create({
        data: { facultyId, subjectId, assignedBy: userId, isActive: true, assignedHours: hoursPerWeek },
      })
      await tx.subject.update({ where: { id: subjectId }, data: { facultyId } })
    })

    revalidatePath("/hod/faculty-allocation")
    return { success: true }
  } catch (err) {
    console.error("assignSubjectToFaculty error:", err)
    return { success: false, error: "Failed to assign subject" }
  }
}

export async function removeSubjectFromFaculty(userId: string, allocationId: string) {
  try {
    const hod = await requireHodFaculty(userId)

    const alloc = await prisma.facultySubject.findUnique({
      where: { id: allocationId },
      include: { subject: true },
    })
    if (!alloc || alloc.subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Allocation not found or access denied" }
    }

    await prisma.facultySubject.update({
      where: { id: allocationId },
      data: { isActive: false, removedAt: new Date() },
    })

    // Clear subject's primary faculty if it matches
    if (alloc.subject.facultyId === alloc.facultyId) {
      const next = await prisma.facultySubject.findFirst({
        where: { subjectId: alloc.subjectId, isActive: true, id: { not: allocationId } },
      })
      await prisma.subject.update({
        where: { id: alloc.subjectId },
        data: { facultyId: next?.facultyId || null },
      })
    }

    revalidatePath("/hod/faculty-allocation")
    return { success: true }
  } catch (err) {
    console.error("removeSubjectFromFaculty error:", err)
    return { success: false, error: "Failed to remove subject" }
  }
}

export async function transferSubject(userId: string, allocationId: string, newFacultyId: string) {
  try {
    const hod = await requireHodFaculty(userId)

    const alloc = await prisma.facultySubject.findUnique({
      where: { id: allocationId },
      include: { subject: true },
    })
    if (!alloc || alloc.subject.departmentId !== hod.departmentId) {
      return { success: false, error: "Allocation not found or access denied" }
    }
    if (alloc.facultyId === newFacultyId) {
      return { success: false, error: "Cannot transfer to the same faculty" }
    }

    const alreadyAssigned = await prisma.facultySubject.findFirst({
      where: { facultyId: newFacultyId, subjectId: alloc.subjectId, isActive: true },
    })
    if (alreadyAssigned) return { success: false, error: "Subject already assigned to target faculty" }

    await prisma.$transaction(async (tx) => {
      await tx.facultySubject.update({ where: { id: allocationId }, data: { isActive: false, removedAt: new Date() } })
      await tx.facultySubject.create({ data: { facultyId: newFacultyId, subjectId: alloc.subjectId, assignedBy: userId, isActive: true } })
      await tx.subject.update({ where: { id: alloc.subjectId }, data: { facultyId: newFacultyId } })
    })

    revalidatePath("/hod/faculty-allocation")
    return { success: true }
  } catch (err) {
    console.error("transferSubject error:", err)
    return { success: false, error: "Failed to transfer subject" }
  }
}

export async function assignClassAdvisor(
  userId: string,
  facultyId: string,
  semester: number,
  section: string,
  academicYear: string
) {
  try {
    const hod = await requireHodFaculty(userId)
    const deptId = hod.departmentId

    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } })
    if (!faculty || faculty.departmentId !== deptId) {
      return { success: false, error: "Faculty not found or not in department" }
    }

    const existing = await prisma.classAssignment.findFirst({
      where: { departmentId: deptId, semester, section, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } } },
    })
    if (existing) {
      return { success: false, error: `Sem ${semester} Sec ${section} already has ${existing.faculty.user.name} as Class Advisor` }
    }

    await prisma.classAssignment.create({
      data: { facultyId, departmentId: deptId, semester, section, academicYear, assignmentStatus: "ACTIVE" },
    })

    revalidatePath("/hod/faculty-allocation")
    return { success: true }
  } catch (err) {
    console.error("assignClassAdvisor error:", err)
    return { success: false, error: "Failed to assign class advisor" }
  }
}

export async function removeClassAdvisor(userId: string, classAssignmentId: string) {
  try {
    const hod = await requireHodFaculty(userId)

    const ca = await prisma.classAssignment.findUnique({ where: { id: classAssignmentId } })
    if (!ca || ca.departmentId !== hod.departmentId) {
      return { success: false, error: "Assignment not found or access denied" }
    }

    await prisma.classAssignment.update({
      where: { id: classAssignmentId },
      data: { assignmentStatus: "REMOVED" },
    })

    revalidatePath("/hod/faculty-allocation")
    return { success: true }
  } catch (err) {
    console.error("removeClassAdvisor error:", err)
    return { success: false, error: "Failed to remove class advisor" }
  }
}

export async function changeClassAdvisor(
  userId: string,
  classAssignmentId: string,
  newFacultyId: string
) {
  try {
    const hod = await requireHodFaculty(userId)

    const ca = await prisma.classAssignment.findUnique({ where: { id: classAssignmentId } })
    if (!ca || ca.departmentId !== hod.departmentId) {
      return { success: false, error: "Assignment not found or access denied" }
    }
    if (ca.facultyId === newFacultyId) {
      return { success: false, error: "Cannot change to the same faculty" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.classAssignment.update({ where: { id: classAssignmentId }, data: { assignmentStatus: "TRANSFERRED" } })
      await tx.classAssignment.create({
        data: { facultyId: newFacultyId, departmentId: ca.departmentId, semester: ca.semester, section: ca.section, academicYear: ca.academicYear, assignmentStatus: "ACTIVE" },
      })
    })

    revalidatePath("/hod/faculty-allocation")
    return { success: true }
  } catch (err) {
    console.error("changeClassAdvisor error:", err)
    return { success: false, error: "Failed to change class advisor" }
  }
}
