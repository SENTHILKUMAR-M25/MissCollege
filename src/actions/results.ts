"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type ResultRecord = {
  id: string
  studentId: string
  registerNumber: string
  studentName: string
  department: string
  subjectCode: string
  subjectName: string
  semester: number
  grade: string
  mark: number
}

export async function getResults(): Promise<ResultRecord[]> {
  const results = await prisma.semesterResult.findMany({
    include: {
      student: {
        include: {
          user: { select: { name: true } },
          department: { select: { name: true } },
        },
      },
      subject: { select: { name: true, code: true, semester: true } },
    },
    orderBy: [{ student: { registerNumber: "asc" } }, { semester: "asc" }],
  })

  return results.map((r) => ({
    id: r.id,
    studentId: r.studentId,
    registerNumber: r.student.registerNumber,
    studentName: r.student.user.name ?? "Unknown",
    department: r.student.department.name,
    subjectCode: r.subject.code,
    subjectName: r.subject.name,
    semester: r.semester,
    grade: r.grade,
    mark: r.mark,
  }))
}

export async function getResultStats() {
  const [total, passed, distinctions] = await Promise.all([
    prisma.semesterResult.count(),
    prisma.semesterResult.count({ where: { grade: { not: "F" } } }),
    prisma.semesterResult.count({ where: { mark: { gte: 75 } } }),
  ])

  const arrears = total - passed

  return {
    total,
    passed,
    distinctions,
    arrears,
    passRate: total > 0 ? Math.round((passed / total) * 100 * 10) / 10 : 0,
  }
}

export async function getPassRateBySemester() {
  const semesters = [1, 2, 3, 4, 5, 6]
  const rates = await Promise.all(
    semesters.map(async (sem) => {
      const [total, passed] = await Promise.all([
        prisma.semesterResult.count({ where: { semester: sem } }),
        prisma.semesterResult.count({ where: { semester: sem, grade: { not: "F" } } }),
      ])
      return {
        semester: `Sem ${sem}`,
        pass: total > 0 ? Math.round((passed / total) * 100) : 0,
        fail: total > 0 ? Math.round(((total - passed) / total) * 100) : 0,
      }
    })
  )
  return rates
}

export async function getTopRankers(limit = 5) {
  // Get students with highest average mark
  const results = await prisma.semesterResult.groupBy({
    by: ["studentId"],
    _avg: { mark: true },
    orderBy: { _avg: { mark: "desc" } },
    take: limit,
  })

  const studentIds = results.map((r) => r.studentId)
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: {
      user: { select: { name: true } },
      department: { select: { name: true } },
    },
  })

  const studentMap = new Map(students.map((s) => [s.id, s]))

  return results.map((r, idx) => {
    const student = studentMap.get(r.studentId)
    return {
      rank: idx + 1,
      name: student?.user?.name ?? "Unknown",
      reg: student?.registerNumber ?? "",
      dept: student?.department?.name ?? "",
      cgpa: ((r._avg.mark ?? 0) / 10).toFixed(1),
    }
  })
}

export async function getResultFilters() {
  return prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
