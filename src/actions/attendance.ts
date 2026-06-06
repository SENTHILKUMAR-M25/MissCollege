"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type AttendanceSummary = {
  studentId: string
  registerNumber: string
  studentName: string
  departmentId: string
  department: string
  subjectId: string
  subject: string
  semester: number
  present: number
  total: number
  percentage: number
  status: "Safe" | "Warning" | "Defaulter"
}

export async function getAttendanceSummary(): Promise<AttendanceSummary[]> {
  // Aggregate attendance per student per subject
  const records = await prisma.attendance.groupBy({
    by: ["studentId", "subjectId"],
    _count: { id: true },
    where: { status: "PRESENT" },
  })

  const totals = await prisma.attendance.groupBy({
    by: ["studentId", "subjectId"],
    _count: { id: true },
  })

  // Build maps
  const presentMap = new Map<string, number>()
  for (const r of records) {
    presentMap.set(`${r.studentId}|${r.subjectId}`, r._count.id)
  }
  const totalMap = new Map<string, number>()
  for (const r of totals) {
    totalMap.set(`${r.studentId}|${r.subjectId}`, r._count.id)
  }

  // Get unique student-subject pairs from totals
  const pairs = totals.map((r) => ({ studentId: r.studentId, subjectId: r.subjectId }))

  if (pairs.length === 0) return []

  const students = await prisma.student.findMany({
    where: { id: { in: [...new Set(pairs.map((p) => p.studentId))] } },
    include: {
      user: { select: { name: true } },
      department: { select: { id: true, name: true } },
    },
  })

  const subjects = await prisma.subject.findMany({
    where: { id: { in: [...new Set(pairs.map((p) => p.subjectId))] } },
    select: { id: true, name: true, semester: true },
  })

  const studentMap = new Map(students.map((s) => [s.id, s]))
  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  const summaries: AttendanceSummary[] = []

  for (const { studentId, subjectId } of pairs) {
    const student = studentMap.get(studentId)
    const subject = subjectMap.get(subjectId)
    if (!student || !subject) continue

    const present = presentMap.get(`${studentId}|${subjectId}`) ?? 0
    const total = totalMap.get(`${studentId}|${subjectId}`) ?? 0
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    const status: "Safe" | "Warning" | "Defaulter" =
      percentage >= 85 ? "Safe" : percentage >= 75 ? "Warning" : "Defaulter"

    summaries.push({
      studentId,
      registerNumber: student.registerNumber,
      studentName: student.user.name ?? "Unknown",
      departmentId: student.departmentId,
      department: student.department.name,
      subjectId,
      subject: subject.name,
      semester: subject.semester,
      present,
      total,
      percentage,
      status,
    })
  }

  return summaries.sort((a, b) => a.registerNumber.localeCompare(b.registerNumber))
}

export async function getAttendanceDepartments() {
  return prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
