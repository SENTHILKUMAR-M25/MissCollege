"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSession } from "@/lib/permissions"
import { requireFaculty } from "@/lib/permissions"

const EXAM_TYPES = ["CAT1", "CAT2", "ASSIGNMENT", "SEMINAR", "PRACTICAL", "MODEL_EXAM", "INTERNAL_TEST_1", "INTERNAL_TEST_2"] as const
type ExamType = typeof EXAM_TYPES[number]

const MarkEntrySchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  examType: z.enum(EXAM_TYPES),
  mark: z.coerce.number().min(0).max(100),
  maxMark: z.coerce.number().min(1).max(100).default(100),
})

export async function getFacultyAssignedSubjects(facultyUserId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      select: { id: true, departmentId: true },
    })

    if (!faculty) return { success: false, error: "Faculty not found" }

    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: faculty.departmentId,
        isActive: true,
        facultyId: faculty.id,
      },
      select: { id: true, name: true, code: true, semester: true, totalHoursPerWeek: true },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    })

    const facultySubjects = await prisma.facultySubject.findMany({
      where: { facultyId: faculty.id, isActive: true },
      include: { subject: { select: { id: true, name: true, code: true, semester: true, totalHoursPerWeek: true } } },
    })

    const allSubjects = [...subjects, ...facultySubjects.map(fs => fs.subject)]
    const unique = Array.from(new Map(allSubjects.map(s => [s.id, s])).values())

    return { success: true, data: unique }
  } catch (error) {
    console.error("Error fetching assigned subjects:", error)
    return { success: false, error: "Failed to fetch subjects" }
  }
}

export async function getStudentsForMarksEntry(facultyUserId: string, filters: { subjectId?: string; semester?: number; section?: string; academicYear?: string }) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      select: { id: true, departmentId: true },
    })

    if (!faculty) return { success: false, error: "Faculty not found" }

    const where: any = { departmentId: faculty.departmentId }
    if (filters.semester) where.semester = filters.semester
    if (filters.section) where.section = filters.section

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { registerNumber: "asc" },
    })

    const existingMarks: Record<string, { cat1?: number; cat2?: number; assignment?: number; seminar?: number; practical?: number; modelExam?: number; internalTest1?: number; internalTest2?: number }> = {}

    if (filters.subjectId) {
      const marks = await prisma.internalMark.findMany({
        where: { subjectId: filters.subjectId, studentId: { in: students.map(s => s.id) } },
      })

      for (const m of marks) {
        if (!existingMarks[m.studentId]) existingMarks[m.studentId] = {}
        const key = m.examType.toLowerCase().replace(/[^a-z0-9]/g, "") as keyof typeof existingMarks[string]
        existingMarks[m.studentId][key] = m.mark
      }
    }

    return {
      success: true,
      data: {
        students: students.map(s => ({
          id: s.id,
          registerNumber: s.registerNumber,
          name: s.user.name,
          email: s.user.email,
          semester: s.semester,
          section: s.section,
          marks: existingMarks[s.id] || {},
        })),
      },
    }
  } catch (error) {
    console.error("Error fetching students for marks:", error)
    return { success: false, error: "Failed to fetch students" }
  }
}

export async function saveMarkEntry(data: {
  subjectId: string
  examType: ExamType
  marks: { studentId: string; mark: number; maxMark?: number }[]
  facultyUserId: string
}) {
  try {
    const parsed = MarkEntrySchema.safeParse({
      studentId: "",
      subjectId: data.subjectId,
      examType: data.examType,
      mark: 0,
      maxMark: 100,
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: data.facultyUserId },
      select: { id: true, departmentId: true },
    })

    if (!faculty) return { success: false, error: "Faculty not found" }

    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      select: { departmentId: true },
    })

    if (!subject) return { success: false, error: "Subject not found" }
    if (subject.departmentId !== faculty.departmentId) {
      return { success: false, error: "Forbidden: Subject not in your department" }
    }

    await prisma.$transaction(async (tx) => {
      for (const entry of data.marks) {
        const existing = await tx.internalMark.findUnique({
          where: { studentId_subjectId_examType: { studentId: entry.studentId, subjectId: data.subjectId, examType: data.examType } },
        })

        const markValue = Math.min(entry.mark, entry.maxMark || 100)

        if (existing) {
          await tx.internalMark.update({
            where: { studentId_subjectId_examType: { studentId: entry.studentId, subjectId: data.subjectId, examType: data.examType } },
            data: { mark: markValue },
          })
        } else {
          await tx.internalMark.create({
            data: { studentId: entry.studentId, subjectId: data.subjectId, examType: data.examType, mark: markValue },
          })
        }
      }
    })

    revalidatePath("/faculty/marks")
    revalidatePath("/student/marks")
    revalidatePath("/hod/examinations")
    revalidatePath("/admin/marks")

    return { success: true, message: `Marks saved for ${data.marks.length} students` }
  } catch (error) {
    console.error("Error saving marks:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save marks" }
  }
}

export async function getStudentMarks(studentUserId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: studentUserId },
      include: { department: true, course: true },
    })

    if (!student) return { success: false, error: "Student not found" }

    const marks = await prisma.internalMark.findMany({
      where: { studentId: student.id },
      include: {
        subject: { select: { id: true, name: true, code: true, semester: true, credits: true } },
      },
      orderBy: { subject: { semester: "asc" } },
    })

    const grouped: Record<string, { subject: any; marks: { examType: string; mark: number }[]; total: number; maxTotal: number }> = {}

    for (const m of marks) {
      const key = m.subjectId
      if (!grouped[key]) {
        grouped[key] = { subject: m.subject, marks: [], total: 0, maxTotal: 0 }
      }
      grouped[key].marks.push({ examType: m.examType, mark: m.mark })
      grouped[key].total += m.mark
      grouped[key].maxTotal += 100
    }

    const overallTotal = Object.values(grouped).reduce((sum, g) => sum + g.total, 0)
    const overallMax = Object.values(grouped).reduce((sum, g) => sum + g.maxTotal, 0)
    const overallPercentage = overallMax > 0 ? Math.round((overallTotal / overallMax) * 100) : 0

    return {
      success: true,
      data: {
        student: {
          name: student.user.name,
          registerNumber: student.registerNumber,
          department: student.department.name,
          course: student.course.name,
          semester: student.semester,
          section: student.section,
        },
        subjectWise: Object.values(grouped),
        overall: { total: overallTotal, maxTotal: overallMax, percentage: overallPercentage },
      },
    }
  } catch (error) {
    console.error("Error fetching student marks:", error)
    return { success: false, error: "Failed to fetch marks" }
  }
}

export async function getMarksAuditLog(facultyUserId: string, limit = 50) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      select: { id: true, departmentId: true },
    })

    if (!faculty) return { success: false, error: "Faculty not found" }

    const subjects = await prisma.subject.findMany({
      where: { departmentId: faculty.departmentId },
      select: { id: true },
    })

    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: "InternalMark",
        entityId: { in: subjects.map(s => s.id) },
      },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return { success: true, data: logs }
  } catch (error) {
    console.error("Error fetching audit log:", error)
    return { success: false, error: "Failed to fetch audit log" }
  }
}

export async function getMarkStatistics(facultyUserId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      select: { id: true, departmentId: true },
    })

    if (!faculty) return { success: false, error: "Faculty not found" }

    const subjects = await prisma.subject.findMany({
      where: { facultyId: faculty.id, isActive: true },
      select: { id: true, name: true, code: true },
    })

    const stats = await Promise.all(
      subjects.map(async (subject) => {
        const marks = await prisma.internalMark.findMany({
          where: { subjectId: subject.id },
        })

        const marksByType: Record<string, number[]> = {}
        for (const m of marks) {
          if (!marksByType[m.examType]) marksByType[m.examType] = []
          marksByType[m.examType].push(m.mark)
        }

        const avgByType: Record<string, number> = {}
        for (const [type, values] of Object.entries(marksByType)) {
          avgByType[type] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
        }

        const allMarks = marks.map(m => m.mark)
        const classAvg = allMarks.length > 0 ? Math.round((allMarks.reduce((a, b) => a + b, 0) / allMarks.length) * 10) / 10 : 0

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          totalStudents: marks.length,
          classAverage: classAvg,
          examTypeAverages: avgByType,
        }
      })
    )

    return { success: true, data: stats }
  } catch (error) {
    console.error("Error fetching mark statistics:", error)
    return { success: false, error: "Failed to fetch statistics" }
  }
}
