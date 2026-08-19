"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// ---- DASHBOARD ----
export async function getFacultyDashboardStats(facultyUserId: string, departmentId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      include: { department: { select: { name: true, code: true } } },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const [totalStudents, totalSubjects, pendingAssignments, timetableToday, recentNotices] = await Promise.all([
      prisma.student.count({ where: { departmentId } }),
      prisma.subject.count({ where: { facultyId: faculty.id } }),
      prisma.assignment.count({ where: { facultyId: faculty.id, isActive: true } }),
      prisma.timetable.findMany({
        where: { facultyId: faculty.id, dayOfWeek: new Date().getDay() === 0 ? 7 : new Date().getDay() },
        include: { subject: { select: { name: true, code: true } } },
        orderBy: { startTime: "asc" },
        take: 4,
      }),
      prisma.notice.findMany({
        where: { OR: [{ targetAudience: "ALL" }, { targetAudience: "FACULTY" }] },
        include: { creator: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    return { success: true, data: { departmentName: faculty.department.name, totalStudents, totalSubjects, pendingAssignments, timetableToday, notices: recentNotices } }
  } catch (error) {
    console.error("Error fetching faculty dashboard stats:", error)
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}

export async function getFacultyProfile(facultyFacultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { facultyId: facultyFacultyId },
      include: {
        user: { select: { name: true, email: true, createdAt: true, avatar: true } },
        department: { select: { name: true, code: true } },
        subjects: { select: { id: true, name: true, code: true, credits: true, semester: true } },
      },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }
    return { success: true, data: faculty }
  } catch (error) {
    console.error("Error fetching faculty profile:", error)
    return { success: false, error: "Failed to fetch profile" }
  }
}

export async function getFacultyStudents(facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: { departmentId: true },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const students = await prisma.student.findMany({
      where: { departmentId: faculty.departmentId },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { name: true, code: true } },
        attendance: { select: { status: true } },
      },
      orderBy: { registerNumber: "asc" },
    })

    const serialized = students.map((s) => ({
      ...s,
      attendancePercentage:
        s.attendance.length > 0
          ? Math.round((s.attendance.filter((a) => a.status === "PRESENT").length / s.attendance.length) * 100)
          : 0,
    }))

    return { success: true, data: serialized }
  } catch (error) {
    console.error("Error fetching faculty students:", error)
    return { success: false, error: "Failed to fetch students" }
  }
}

export async function getFacultyAttendanceRecordsLegacy() {
  return { success: false, error: "Legacy endpoint removed" }
}

export async function markAttendance(formData: FormData) {
  try {
    const facultyId = formData.get("facultyId") as string
    const subjectId = formData.get("subjectId") as string
    const dateStr = formData.get("date") as string
    const periodNumber = Number(formData.get("periodNumber") || 0)
    const startTime = (formData.get("startTime") as string) || null
    const endTime = (formData.get("endTime") as string) || null
    const recordsRaw = formData.get("records") as string

    const records = JSON.parse(recordsRaw) as { studentId: string; status: string }[]

    const attendanceDate = new Date(dateStr)

    await prisma.$transaction(
      records.map((r) =>
        prisma.attendance.upsert({
          where: {
            studentId_subjectId_date_periodNumber: {
              studentId: r.studentId,
              subjectId,
              date: attendanceDate,
              periodNumber,
            },
          },
          update: {
            status: r.status as "PRESENT" | "ABSENT" | "OD" | "LEAVE",
            facultyId,
            startTime: startTime ?? undefined,
            endTime: endTime ?? undefined,
          },
          create: {
            studentId: r.studentId,
            subjectId,
            facultyId,
            date: attendanceDate,
            periodNumber,
            startTime,
            endTime,
            status: r.status as "PRESENT" | "ABSENT" | "OD" | "LEAVE",
          },
        })
      )
    )
    revalidatePath("/faculty/attendance")
    return { success: true }
  } catch (error) {
    console.error("Error marking attendance:", error)
    return { success: false, error: "Failed to mark attendance" }
  }
}

export async function getFacultyTimetable(facultyId: string) {
  try {
    const timetable = await prisma.timetable.findMany({
      where: { facultyId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
    return { success: true, data: timetable }
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return { success: false, error: "Failed to fetch timetable" }
  }
}

export async function getFacultySubjects(facultyId: string) {
  try {
    const [directSubjects, allocatedSubjects] = await Promise.all([
      prisma.subject.findMany({ where: { facultyId, isActive: true } }),
      prisma.facultySubject.findMany({
        where: { facultyId, isActive: true },
        include: { subject: true },
      }),
    ])
    const subjectMap = new Map<string, any>()
    directSubjects.forEach((s) => subjectMap.set(s.id, s))
    allocatedSubjects.forEach((fs) => subjectMap.set(fs.subject.id, fs.subject))
    return { success: true, data: Array.from(subjectMap.values()) }
  } catch (error) {
    console.error("Error fetching faculty subjects:", error)
    return { success: false, error: "Failed to fetch subjects" }
  }
}

export async function getFacultyAttendanceRecords(facultyId: string, startDate?: string, endDate?: string) {
  try {
    const where: any = { facultyId }
    if (startDate) where.date = { ...where.date, gte: new Date(startDate) }
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            course: { select: { name: true, code: true } },
            department: { select: { name: true, code: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true, semester: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    })
    return { success: true, data: records }
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return { success: false, error: "Failed to fetch attendance records" }
  }
}

export async function getPeriods() {
  try {
    const periods = await prisma.period.findMany({ orderBy: { periodNumber: "asc" } })
    return { success: true, data: periods }
  } catch (error) {
    console.error("Error fetching periods:", error)
    return { success: false, error: "Failed to fetch periods" }
  }
}

export async function getClassStudents(departmentId: string, courseId: string, semester: number, section: string) {
  try {
    const students = await prisma.student.findMany({
      where: { departmentId, courseId, semester, section },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { registerNumber: "asc" },
    })
    return { success: true, data: students }
  } catch (error) {
    console.error("Error fetching class students:", error)
    return { success: false, error: "Failed to fetch students" }
  }
}

export async function getAttendanceSummary(facultyId: string) {
  try {
    const records = await prisma.attendance.findMany({
      where: { facultyId },
      include: { subject: { select: { code: true, name: true } }, student: { include: { user: { select: { name: true } }, department: { select: { code: true } } } } },
      orderBy: { date: "desc" },
      take: 200,
    })

    const bySubject = new Map<string, { code: string; present: number; absent: number; od: number; leave: number; total: number }>()
    const byPeriod = new Map<number, { present: number; absent: number; od: number; leave: number; total: number }>()
    const byMonth = new Map<string, { present: number; absent: number; od: number; leave: number; total: number }>()
    const byStudent = new Map<string, { name: string; present: number; total: number }>()
    const bySection = new Map<string, { present: number; total: number }>()

    for (const r of records) {
      const month = new Date(r.date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
      const subjectKey = r.subject.code
      bySubject.set(subjectKey, {
        code: subjectKey,
        present: (bySubject.get(subjectKey)?.present || 0) + (r.status === "PRESENT" ? 1 : 0),
        absent: (bySubject.get(subjectKey)?.absent || 0) + (r.status === "ABSENT" ? 1 : 0),
        od: (bySubject.get(subjectKey)?.od || 0) + (r.status === "OD" ? 1 : 0),
        leave: (bySubject.get(subjectKey)?.leave || 0) + (r.status === "LEAVE" ? 1 : 0),
        total: (bySubject.get(subjectKey)?.total || 0) + 1,
      })
      byPeriod.set(r.periodNumber, {
        present: (byPeriod.get(r.periodNumber)?.present || 0) + (r.status === "PRESENT" ? 1 : 0),
        absent: (byPeriod.get(r.periodNumber)?.absent || 0) + (r.status === "ABSENT" ? 1 : 0),
        od: (byPeriod.get(r.periodNumber)?.od || 0) + (r.status === "OD" ? 1 : 0),
        leave: (byPeriod.get(r.periodNumber)?.leave || 0) + (r.status === "LEAVE" ? 1 : 0),
        total: (byPeriod.get(r.periodNumber)?.total || 0) + 1,
      })
      byMonth.set(month, {
        present: (byMonth.get(month)?.present || 0) + (r.status === "PRESENT" ? 1 : 0),
        absent: (byMonth.get(month)?.absent || 0) + (r.status === "ABSENT" ? 1 : 0),
        od: (byMonth.get(month)?.od || 0) + (r.status === "OD" ? 1 : 0),
        leave: (byMonth.get(month)?.leave || 0) + (r.status === "LEAVE" ? 1 : 0),
        total: (byMonth.get(month)?.total || 0) + 1,
      })

      const studentName = r.student.user.name || "Unknown"
      byStudent.set(r.studentId, {
        name: studentName,
        present: (byStudent.get(r.studentId)?.present || 0) + (r.status === "PRESENT" ? 1 : 0),
        total: (byStudent.get(r.studentId)?.total || 0) + 1,
      })

      const sectionKey = `${r.student.department?.code || ""}-${r.student.section || ""}`
      bySection.set(sectionKey, {
        present: (bySection.get(sectionKey)?.present || 0) + (r.status === "PRESENT" ? 1 : 0),
        total: (bySection.get(sectionKey)?.total || 0) + 1,
      })
    }

    return {
      success: true,
      data: {
        subjectWise: Array.from(bySubject.values()),
        periodWise: Array.from(byPeriod.entries()).map(([periodNumber, v]) => ({ periodNumber, ...v })),
        monthWise: Array.from(byMonth.values()),
        studentWise: Array.from(byStudent.entries()).map(([id, v]) => ({ id, ...v })),
        sectionWise: Array.from(bySection.entries()).map(([id, v]) => ({ id, ...v })),
      },
    }
  } catch (error) {
    console.error("Error fetching attendance summary:", error)
    return { success: false, error: "Failed to fetch attendance summary" }
  }
}

export async function createInternalMark(formData: FormData) {
  try {
    const studentId = formData.get("studentId") as string
    const subjectId = formData.get("subjectId") as string
    const examType = formData.get("examType") as string
    const mark = Number(formData.get("mark"))

    if (!studentId || !subjectId || !examType || mark === undefined || mark === null || mark < 0) {
      return { success: false, error: "All fields are required" }
    }
    if (mark > 100) return { success: false, error: "Mark cannot exceed 100" }

    await prisma.internalMark.create({ data: { studentId, subjectId, examType, mark } })
    revalidatePath("/faculty/examinations")
    return { success: true }
  } catch (error) {
    console.error("Error creating internal mark:", error)
    return { success: false, error: "Failed to create mark" }
  }
}

export async function getFacultyInternalMarks(facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: { subjects: { select: { id: true, name: true, code: true } } },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const subjectIds = faculty.subjects.map((s) => s.id)
    if (subjectIds.length === 0) return { success: true, data: [] }

    const marks = await prisma.internalMark.findMany({
      where: { subjectId: { in: subjectIds } },
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true, semester: true } },
      },
      take: 50,
    })

    const serialized = marks.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      studentName: m.student.user.name ?? "Unknown",
      subjectId: m.subjectId,
      subjectCode: m.subject.code,
      subjectName: m.subject.name,
      semester: m.subject.semester,
      examType: m.examType,
      mark: m.mark,
    }))

    return { success: true, data: serialized }
  } catch (error) {
    console.error("Error fetching internal marks:", error)
    return { success: false, error: "Failed to fetch marks" }
  }
}

// ---- PASSWORD ----
export async function changeFacultyPassword(userId: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: "User not found" }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })
    return { success: true }
  } catch (error) {
    console.error("Error changing faculty password:", error)
    return { success: false, error: "Failed to change password" }
  }
}

// ---- NOTICES ----
export async function getFacultyNotices() {
  try {
    const notices = await prisma.notice.findMany({
      where: {
        isActive: true,
        OR: [{ targetAudience: "ALL" }, { targetAudience: "FACULTY" }],
      },
      include: {
        creator: { select: { name: true, role: true } },
        department: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return { success: true, data: notices }
  } catch (error) {
    console.error("Error fetching faculty notices:", error)
    return { success: false, error: "Failed to fetch notices" }
  }
}

// ---- LEAVE ----
export async function applyFacultyLeave(formData: FormData) {
  try {
    const facultyId = formData.get("facultyId") as string
    const departmentId = formData.get("departmentId") as string
    const leaveType = formData.get("leaveType") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const reason = formData.get("reason") as string

    if (!facultyId || !departmentId || !leaveType || !startDate || !endDate || !reason) {
      return { success: false, error: "All fields are required" }
    }

    await prisma.leaveRequest.create({
      data: {
        facultyId,
        departmentId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      },
    })
    revalidatePath("/faculty/leaves")
    return { success: true }
  } catch (error) {
    console.error("Error applying for leave:", error)
    return { success: false, error: "Failed to apply for leave" }
  }
}

// ---- ASSIGNMENT SUBMISSIONS ----
export async function getAssignmentSubmissions(assignmentId: string) {
  try {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        assignment: { select: { title: true, totalMarks: true } },
      },
      orderBy: { submittedAt: "desc" },
    })
    return { success: true, data: submissions }
  } catch (error) {
    console.error("Error fetching assignment submissions:", error)
    return { success: false, error: "Failed to fetch submissions" }
  }
}

// ---- GRADING ----
export async function gradeAssignment(submissionId: string, grade: number, feedback: string) {
  try {
    if (grade < 0 || grade > 100) {
      return { success: false, error: "Grade must be between 0 and 100" }
    }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: { select: { totalMarks: true } } },
    })
    if (!submission) return { success: false, error: "Submission not found" }

    await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback: feedback || null,
        gradedAt: new Date(),
        status: "GRADED",
      },
    })
    revalidatePath("/faculty/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error grading assignment:", error)
    return { success: false, error: "Failed to grade assignment" }
  }
}
