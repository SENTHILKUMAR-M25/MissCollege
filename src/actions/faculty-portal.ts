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
        user: { select: { name: true, email: true, createdAt: true } },
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

export async function getFacultyAttendanceRecords(facultyId: string, startDate?: string, endDate?: string) {
  try {
    const where: any = { facultyId }
    if (startDate) where.date = { ...where.date, gte: new Date(startDate) }
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
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

export async function markAttendance(formData: FormData) {
  try {
    const facultyId = formData.get("facultyId") as string
    const subjectId = formData.get("subjectId") as string
    const dateStr = formData.get("date") as string
    const recordsRaw = formData.get("records") as string

    const records = JSON.parse(recordsRaw) as { studentId: string; status: string }[]

    const attendanceDate = new Date(dateStr)
    await prisma.$transaction(
      records.map((r) =>
        prisma.attendance.upsert({
          where: { studentId_subjectId_date: { studentId: r.studentId, subjectId, date: attendanceDate } },
          update: { status: r.status as "PRESENT" | "ABSENT" },
          create: { studentId: r.studentId, subjectId, facultyId, date: attendanceDate, status: r.status as "PRESENT" | "ABSENT" },
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
      include: { subject: { select: { name: true, code: true } } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })
    return { success: true, data: timetable }
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return { success: false, error: "Failed to fetch timetable" }
  }
}

export async function getFacultyNotices() {
  try {
    const notices = await prisma.notice.findMany({
      where: { OR: [{ targetAudience: "ALL" }, { targetAudience: "FACULTY" }] },
      include: { creator: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return { success: true, data: notices }
  } catch (error) {
    console.error("Error fetching notices:", error)
    return { success: false, error: "Failed to fetch notices" }
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

export async function changeFacultyPassword(userId: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: "User not found" }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, passwordChanged: true },
    })

    revalidatePath("/faculty/profile")
    return { success: true }
  } catch (error) {
    console.error("Error changing faculty password:", error)
    return { success: false, error: "Failed to change password" }
  }
}

export async function updateFacultyProfile(facultyId: string, data: {
  name?: string
  phone?: string
  alternateNumber?: string
  address?: string
  specialization?: string
  experience?: number
  joiningDate?: string | undefined
  gender?: string
  qualification?: string
}) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { facultyId },
      include: { user: true },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const facultyUpdate: Record<string, any> = {}
    if (data.phone !== undefined) facultyUpdate.phone = data.phone
    if (data.alternateNumber !== undefined) facultyUpdate.alternateNumber = data.alternateNumber
    if (data.address !== undefined) facultyUpdate.address = data.address
    if (data.specialization !== undefined) facultyUpdate.specialization = data.specialization
    if (data.experience !== undefined) facultyUpdate.experience = data.experience
    if (data.joiningDate !== undefined) facultyUpdate.joiningDate = data.joiningDate ? new Date(data.joiningDate) : undefined
    if (data.gender !== undefined) facultyUpdate.gender = data.gender
    if (data.qualification !== undefined) facultyUpdate.qualification = data.qualification

    await prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({ where: { id: faculty.userId }, data: { name: data.name } })
      }
      if (Object.keys(facultyUpdate).length > 0) {
        await tx.faculty.update({ where: { id: faculty.id }, data: facultyUpdate })
      }
    })

    revalidatePath("/faculty/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function applyFacultyLeave(formData: FormData) {
  try {
    const facultyId = formData.get("facultyId") as string
    const departmentId = formData.get("departmentId") as string
    const leaveType = formData.get("leaveType") as string
    const startDateStr = formData.get("startDate") as string
    const endDateStr = formData.get("endDate") as string
    const reason = formData.get("reason") as string

    if (!facultyId || !departmentId || !leaveType || !startDateStr || !endDateStr || !reason) {
      return { success: false, error: "All fields are required" }
    }

    await prisma.leaveRequest.create({
      data: {
        facultyId,
        departmentId,
        leaveType,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        reason,
        status: "PENDING",
      },
    })

    revalidatePath("/faculty/leave")
    return { success: true }
  } catch (error) {
    console.error("Error applying for leave:", error)
    return { success: false, error: "Failed to apply for leave" }
  }
}

export async function getFacultyLeaveHistory(facultyId: string) {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { facultyId },
      include: { department: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: leaveRequests }
  } catch (error) {
    console.error("Error fetching leave history:", error)
    return { success: false, error: "Failed to fetch leave history" }
  }
}

export async function createAssignment(data: {
  title: string
  description: string
  subjectId: string
  facultyId: string
  className: string
  section: string
  dueDate: string
  totalMarks: number
  priority: string
}) {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        subjectId: data.subjectId,
        facultyId: data.facultyId,
        className: data.className,
        section: data.section,
        dueDate: new Date(data.dueDate),
        totalMarks: data.totalMarks,
        priority: data.priority,
        status: "PENDING",
      },
    })
    revalidatePath("/faculty/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Failed to create assignment" }
  }
}

export async function getFacultyAssignments(facultyId: string) {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { facultyId },
      include: {
        subject: { select: { name: true, code: true } },
        submissions: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return { success: true, data: assignments }
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return { success: false, error: "Failed to fetch assignments" }
  }
}

export async function getAssignmentSubmissions(assignmentId: string) {
  try {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { submittedAt: "desc" },
    })
    return { success: true, data: submissions }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return { success: false, error: "Failed to fetch submissions" }
  }
}

export async function gradeAssignment(submissionId: string, grade: number, feedback: string) {
  try {
    await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: { grade, feedback, gradedAt: new Date() },
    })
    revalidatePath("/faculty/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error grading assignment:", error)
    return { success: false, error: "Failed to grade assignment" }
  }
}
