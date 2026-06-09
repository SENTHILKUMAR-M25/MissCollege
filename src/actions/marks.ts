"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const markSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  examType: z.string().min(1), // e.g. "CAT1", "CAT2", "ASSIGNMENT"
  mark: z.number().min(0).max(100),
})

export type MarkRecord = {
  id: string
  studentId: string
  registerNumber: string
  studentName: string
  department: string
  subjectId: string
  subjectCode: string
  subjectName: string
  semester: number
  cat1: number
  cat2: number
  assignment: number
  total: number
}

export async function getMarks(): Promise<MarkRecord[]> {
  // Group by student + subject, pivot exam types
  const marks = await prisma.internalMark.findMany({
    include: {
      student: {
        include: {
          user: { select: { name: true } },
          department: { select: { name: true } },
        },
      },
      subject: { select: { id: true, name: true, code: true, semester: true } },
    },
    orderBy: [{ student: { registerNumber: "asc" } }, { subject: { code: "asc" } }],
  })

  // Group by studentId+subjectId
  const grouped = new Map<string, MarkRecord>()

  for (const m of marks) {
    const key = `${m.studentId}|${m.subjectId}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        studentId: m.studentId,
        registerNumber: m.student.registerNumber,
        studentName: m.student.user.name ?? "Unknown",
        department: m.student.department.name,
        subjectId: m.subjectId,
        subjectCode: m.subject.code,
        subjectName: m.subject.name,
        semester: m.subject.semester,
        cat1: 0,
        cat2: 0,
        assignment: 0,
        total: 0,
      })
    }
    const rec = grouped.get(key)!
    if (m.examType === "CAT1") rec.cat1 = m.mark
    else if (m.examType === "CAT2") rec.cat2 = m.mark
    else if (m.examType === "ASSIGNMENT") rec.assignment = m.mark
    rec.total = rec.cat1 + rec.cat2 + rec.assignment
  }

  return Array.from(grouped.values())
}

export async function upsertMark(data: {
  studentId: string
  subjectId: string
  cat1: number
  cat2: number
  assignment: number
}) {
  try {
    const { studentId, subjectId, cat1, cat2, assignment } = data

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { departmentId: true },
    })

    if (!subject) {
      return { success: false, error: "Subject not found" }
    }

    const session = await (await import("@/lib/permissions")).getSession()
    if (!session?.user || (session.user.role !== "HOD" && session.user.role !== "FACULTY")) {
      return { success: false, error: "Unauthorized" }
    }

    if (session.user.role === "HOD") {
      const hodFaculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id },
        include: { hodAssignments: { where: { isActive: true } } },
      })
      if (!hodFaculty?.hodAssignments.some(a => a.departmentId === subject.departmentId)) {
        return { success: false, error: "Unauthorized: Not your department" }
      }
    } else {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id },
      })
      if (!faculty || faculty.departmentId !== subject.departmentId) {
        return { success: false, error: "Unauthorized: Not your department" }
      }
    }

    await prisma.$transaction([
      prisma.internalMark.upsert({
        where: { studentId_subjectId_examType: { studentId, subjectId, examType: "CAT1" } },
        update: { mark: cat1 },
        create: { studentId, subjectId, examType: "CAT1", mark: cat1 },
      }),
      prisma.internalMark.upsert({
        where: { studentId_subjectId_examType: { studentId, subjectId, examType: "CAT2" } },
        update: { mark: cat2 },
        create: { studentId, subjectId, examType: "CAT2", mark: cat2 },
      }),
      prisma.internalMark.upsert({
        where: { studentId_subjectId_examType: { studentId, subjectId, examType: "ASSIGNMENT" } },
        update: { mark: assignment },
        create: { studentId, subjectId, examType: "ASSIGNMENT", mark: assignment },
      }),
    ])

    revalidatePath("/admin/marks")
    revalidatePath("/hod/examinations")
    return { success: true }
  } catch (error) {
    console.error("Error upserting mark:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save mark" }
  }
}

export async function getMarksFilters() {
  const [departments, subjects] = await Promise.all([
    prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({
      select: { id: true, name: true, code: true, semester: true, departmentId: true },
      orderBy: { code: "asc" },
    }),
  ])
  return { departments, subjects }
}
