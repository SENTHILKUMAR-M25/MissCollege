"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// Auto-generate Student ID: {YY}{DEPT_CODE}{SEQ} e.g. 22CS001
export async function generateStudentId(departmentId: string, year: number): Promise<string> {
  const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { code: true } })
  const code = dept?.code?.toUpperCase() || "GEN"
  const yy = String(year).slice(-2)
  const prefix = `${yy}${code}`
  const last = await prisma.student.findFirst({
    where: { registerNumber: { startsWith: prefix } },
    orderBy: { registerNumber: "desc" },
  })
  const seq = last ? parseInt(last.registerNumber.slice(prefix.length)) + 1 : 1
  return `${prefix}${String(seq).padStart(3, "0")}`
}

export async function addStudent(data: {
  name: string
  email: string
  departmentId: string
  courseId: string
  semester: number
  section: string
  admissionYear: number
  phone?: string
  dob?: string
  gender?: string
  parentName?: string
  parentPhone?: string
  address?: string
}) {
  try {
    const { name, email, departmentId, courseId, semester, section, admissionYear, phone, dob, gender, parentName, parentPhone, address } = data

    if (!name || !email || !departmentId || !courseId || !semester || !section || !admissionYear) {
      return { success: false, error: "All required fields must be filled" }
    }

    const registerNumber = await generateStudentId(departmentId, admissionYear)

    let plainPassword = "12345678"
    if (dob) {
      const [y, m, d] = dob.split("-")
      if (y && m && d) plainPassword = `${d}${m}${y}`
    }
    const hashedPassword = bcrypt.hashSync(plainPassword, 10)

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return { success: false, error: "Email already exists" }

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        passwordChanged: false,
        student: {
          create: {
            registerNumber,
            departmentId,
            courseId,
            semester,
            section,
            admissionYear,
            phone: phone || null,
            dob: dob ? new Date(dob) : null,
            gender: gender || null,
            parentName: parentName || null,
            parentPhone: parentPhone || null,
            address: address || null,
          },
        },
      },
    })

    revalidatePath("/admin/students")
    return { success: true, registerNumber }
  } catch (error: any) {
    console.error("addStudent error:", error)
    return { success: false, error: error.message || "Failed to add student" }
  }
}

export async function updateStudent(data: {
  id: string
  name: string
  email: string
  registerNumber: string
  departmentId: string
  courseId: string
  semester: number
  section: string
  admissionYear: number
  phone?: string
  dob?: string
  gender?: string
  parentName?: string
  parentPhone?: string
  address?: string
}) {
  try {
    const { id, name, email, registerNumber, departmentId, courseId, semester, section, admissionYear, phone, dob, gender, parentName, parentPhone, address } = data

    if (!id) return { success: false, error: "ID is required" }

    const student = await prisma.student.findUnique({ where: { id }, include: { user: true } })
    if (!student) return { success: false, error: "Student not found" }

    if (email !== student.user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return { success: false, error: "Email already in use" }
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: student.userId }, data: { name, email } }),
      prisma.student.update({
        where: { id },
        data: {
          registerNumber, departmentId, courseId, semester, section, admissionYear,
          phone: phone || null,
          dob: dob ? new Date(dob) : undefined,
          gender: gender || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          address: address || null,
        },
      }),
    ])

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    console.error("updateStudent error:", error)
    return { success: false, error: error.message || "Failed to update student" }
  }
}

export async function deleteStudent(id: string) {
  try {
    const student = await prisma.student.findUnique({ where: { id } })
    if (!student) return { success: false, error: "Student not found" }
    await prisma.user.delete({ where: { id: student.userId } })
    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to delete student" }
  }
}

export async function resetStudentPassword(id: string, dob: string) {
  try {
    const student = await prisma.student.findUnique({ where: { id } })
    if (!student) return { success: false, error: "Student not found" }
    const [y, m, d] = dob.split("-")
    const plain = `${d}${m}${y}`
    const hashed = bcrypt.hashSync(plain, 10)
    await prisma.user.update({ where: { id: student.userId }, data: { password: hashed, passwordChanged: false } })
    revalidatePath("/admin/students")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to reset password" }
  }
}

export async function getStudentStats() {
  try {
    const [total, deptStats, semStats, active] = await Promise.all([
      prisma.student.count(),
      prisma.student.groupBy({ by: ["departmentId"], _count: { id: true } }),
      prisma.student.groupBy({ by: ["semester"], _count: { id: true }, orderBy: { semester: "asc" } }),
      prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    ])

    const deptIds = deptStats.map((d) => d.departmentId)
    const depts = await prisma.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true, code: true } })
    const deptMap = Object.fromEntries(depts.map((d) => [d.id, d]))

    return {
      success: true,
      data: {
        total,
        active,
        deptStats: deptStats.map((d) => ({ ...deptMap[d.departmentId], count: d._count.id })),
        semStats: semStats.map((s) => ({ semester: s.semester, count: s._count.id })),
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch stats" }
  }
}

export async function getStudentPortalData(userId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, passwordChanged: true } },
        department: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
      },
    })
    if (!student) return { success: false, error: "Student not found" }

    const subjects = await prisma.subject.findMany({
      where: { departmentId: student.departmentId, semester: student.semester, isActive: true },
      include: { faculty: { include: { user: { select: { name: true } } } } },
    })

    const attendance = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: { subject: { select: { name: true, code: true } } },
    })

    const totalClasses = attendance.length
    const presentClasses = attendance.filter((a) => a.status === "PRESENT").length
    const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

    const subjectAttendance = subjects.map((sub) => {
      const subAtt = attendance.filter((a) => a.subject.code === sub.code)
      const pct = subAtt.length > 0 ? Math.round((subAtt.filter((a) => a.status === "PRESENT").length / subAtt.length) * 100) : 0
      return { id: sub.id, name: sub.name, code: sub.code, pct, total: subAtt.length, present: subAtt.filter((a) => a.status === "PRESENT").length }
    })

    const assignments = await prisma.assignment.findMany({
      where: { subject: { departmentId: student.departmentId, semester: student.semester } },
      include: {
        subject: { select: { name: true, code: true } },
        submissions: { where: { studentId: student.id }, select: { id: true, grade: true, feedback: true, submittedAt: true } },
      },
      orderBy: { dueDate: "desc" },
      take: 10,
    })

    const marks = await prisma.internalMark.findMany({
      where: { studentId: student.id },
      include: { subject: { select: { name: true, code: true, semester: true } } },
    })

    const leaveRequests: any[] = []

    const timetable = await prisma.timetable.findMany({
      where: { departmentId: student.departmentId, semester: student.semester, section: student.section },
      include: { subject: { select: { name: true, code: true } }, faculty: { include: { user: { select: { name: true } } } } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })

    const notices = await prisma.notice.findMany({
      where: { OR: [{ targetAudience: "ALL" }, { targetAudience: "STUDENT" }] },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return {
      success: true,
      data: {
        student,
        subjects,
        attendancePct,
        subjectAttendance,
        assignments,
        marks,
        leaveRequests,
        timetable,
        notices,
      },
    }
  } catch (error) {
    console.error("getStudentPortalData error:", error)
    return { success: false, error: "Failed to load portal data" }
  }
}
