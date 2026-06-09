"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const hodLoginSchema = z.object({
  facultyId: z.string().min(1, "Faculty ID is required"),
  dateOfBirth: z.string().min(8, "Date of Birth is required"),
})

export async function hodLogin(facultyId: string, dateOfBirth: string) {
  try {
    const parsed = hodLoginSchema.safeParse({
      facultyId,
      dateOfBirth,
    })

    if (!parsed.success) {
      return { success: false, error: "Invalid credentials format" }
    }

    const { facultyId: inputFacultyId, dateOfBirth: inputDob } = parsed.data

    const dobDate = new Date(inputDob.replace(/(\d{2})(\d{2})(\d{4})/, "$3-$2-$1"))
    if (isNaN(dobDate.getTime())) {
      return { success: false, error: "Invalid Date of Birth format. Use DDMMYYYY" }
    }

    const faculty = await prisma.faculty.findUnique({
      where: { facultyId: inputFacultyId },
      include: {
        user: true,
        department: true,
      },
    })

    if (!faculty) {
      return { success: false, error: "Invalid Faculty ID" }
    }

    if (!faculty.dateOfBirth) {
      return { success: false, error: "Date of Birth not set for this faculty. Contact Admin." }
    }

    const facultyDob = new Date(faculty.dateOfBirth)
    const isDobMatch =
      facultyDob.getFullYear() === dobDate.getFullYear() &&
      facultyDob.getMonth() === dobDate.getMonth() &&
      facultyDob.getDate() === dobDate.getDate()

    if (!isDobMatch) {
      return { success: false, error: "Invalid Date of Birth" }
    }

    if (faculty.user.role !== "HOD") {
      return { success: false, error: "You are not assigned as Head of Department" }
    }

    if (!faculty.user.isActive) {
      return { success: false, error: "Your account is deactivated. Contact Admin." }
    }

    if (!faculty.accountStatus) {
      return { success: false, error: "Your faculty account is suspended. Contact Admin." }
    }

    const hodAssignment = await prisma.hodAssignment.findFirst({
      where: {
        facultyId: faculty.id,
        isActive: true,
      },
      include: {
        department: true,
      },
    })

    if (!hodAssignment) {
      return { success: false, error: "No active HOD assignment found" }
    }

    const mustChangePassword = !faculty.user.passwordChanged

    return {
      success: true,
      data: {
        id: faculty.user.id,
        name: faculty.user.name,
        email: faculty.user.email,
        role: faculty.user.role,
        facultyId: faculty.facultyId,
        designation: faculty.designation,
        departmentId: hodAssignment.departmentId,
        departmentName: hodAssignment.department.name,
        departmentCode: hodAssignment.department.code,
        mustChangePassword,
      },
    }
  } catch (error) {
    console.error("HOD login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function changeHodPassword(userId: string, newPassword: string) {
  try {
    const passwordSchema = z.object({
      newPassword: z.string().min(6, "Password must be at least 6 characters"),
    })

    const parsed = passwordSchema.safeParse({ newPassword })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message }
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChanged: true,
      },
    })

    return { success: true, message: "Password changed successfully" }
  } catch (error) {
    console.error("Error changing HOD password:", error)
    return { success: false, error: "Failed to change password" }
  }
}

export async function getHodDashboardStats(departmentId: string) {
  try {
    const facultyCount = await prisma.faculty.count({
      where: {
        departmentId,
        accountStatus: true,
      },
    })

    const studentCount = await prisma.student.count({
      where: {
        departmentId,
      },
    })

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const activeClassesToday = await prisma.timetable.count({
      where: {
        departmentId,
      },
    })

    const subjects = await prisma.subject.count({
      where: {
        departmentId,
      },
    })

    const hod = await prisma.hodAssignment.findFirst({
      where: {
        departmentId,
        isActive: true,
      },
      include: {
        department: true,
        faculty: {
          include: {
            user: true,
          },
        },
      },
    })

    const facultyList = await prisma.faculty.findMany({
      where: {
        departmentId,
        accountStatus: true,
      },
      include: {
        user: true,
        subjects: true,
        timetables: true,
      },
    })

    const totalTeachingHours = facultyList.reduce((sum, f) => {
      return sum + f.timetables.length
    }, 0)

    const avgWorkload = facultyCount > 0 ? totalTeachingHours / facultyCount : 0

    const workloadData = facultyList.map((f) => ({
      name: f.user.name || f.facultyId,
      facultyId: f.facultyId,
      designation: f.designation,
      timetableCount: f.timetables.length,
      subjectCount: f.subjects.length,
    }))

    return {
      success: true,
      data: {
        departmentName: hod?.department.name || "Department",
        hodName: hod?.faculty.user.name || "N/A",
        facultyCount,
        studentCount,
        activeClassesToday,
        subjectCount: subjects,
        avgWorkload: Math.round(avgWorkload * 10) / 10,
        totalTeachingHours,
        facultyList,
        workloadData,
      },
    }
  } catch (error) {
    console.error("Error fetching HOD dashboard stats:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}

export async function getHodFaculty(departmentId: string) {
  try {
    const faculty = await prisma.faculty.findMany({
      where: {
        departmentId,
      },
      include: {
        user: true,
        subjects: true,
        timetables: {
          orderBy: { dayOfWeek: "asc" },
        },
        leaveRequests: {
          where: {
            status: "PENDING",
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { user: { createdAt: "desc" } },
    })

    return { success: true, data: faculty }
  } catch (error) {
    console.error("Error fetching HOD faculty:", error)
    return { success: false, error: "Failed to fetch faculty data" }
  }
}

export async function getHodTimetable(departmentId: string) {
  try {
    const timetable = await prisma.timetable.findMany({
      where: {
        departmentId,
      },
      include: {
        faculty: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
      orderBy: { dayOfWeek: "asc" },
    })

    return { success: true, data: timetable }
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return { success: false, error: "Failed to fetch timetable" }
  }
}

export async function createTimetableEntry(data: {
  facultyId: string
  departmentId: string
  subjectId?: string
  className: string
  section: string
  dayOfWeek: number
  startTime: string
  endTime: string
  classroom: string
  semester?: number
}) {
  try {
    if (data.dayOfWeek < 1 || data.dayOfWeek > 7) {
      return { success: false, error: "Invalid day of week" }
    }

    const facultyConflict = await prisma.timetable.findFirst({
      where: {
        facultyId: data.facultyId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    })

    if (facultyConflict) {
      return {
        success: false,
        error: "Faculty member is already assigned to another class during this time slot",
      }
    }

    const classroomConflict = await prisma.timetable.findFirst({
      where: {
        departmentId: data.departmentId,
        dayOfWeek: data.dayOfWeek,
        classroom: data.classroom,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    })

    if (classroomConflict) {
      return {
        success: false,
        error: "Classroom is already assigned to another class during this time slot",
      }
    }

    const timetableEntry = await prisma.timetable.create({
      data: {
        facultyId: data.facultyId,
        departmentId: data.departmentId,
        subjectId: data.subjectId,
        className: data.className,
        section: data.section,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        classroom: data.classroom,
        semester: data.semester,
      },
      include: {
        faculty: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
    })

    return { success: true, data: timetableEntry }
  } catch (error) {
    console.error("Error creating timetable entry:", error)
    return { success: false, error: "Failed to create timetable entry" }
  }
}

export async function updateTimetableEntry(
  id: string,
  data: {
    facultyId?: string
    departmentId?: string
    subjectId?: string | null
    className: string
    section: string
    dayOfWeek: number
    startTime: string
    endTime: string
    classroom: string
    semester?: number
  }
) {
  try {
    if (data.dayOfWeek < 1 || data.dayOfWeek > 7) {
      return { success: false, error: "Invalid day of week" }
    }

    const existing = await prisma.timetable.findUnique({
      where: { id },
    })

    if (!existing) {
      return { success: false, error: "Timetable entry not found" }
    }

    const facultyConflict = await prisma.timetable.findFirst({
      where: {
        facultyId: data.facultyId || existing.facultyId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        id: { not: id },
      },
    })

    if (facultyConflict) {
      return {
        success: false,
        error: "Faculty member is already assigned to another class during this time slot",
      }
    }

    const classroomConflict = await prisma.timetable.findFirst({
      where: {
        departmentId: data.departmentId || existing.departmentId,
        dayOfWeek: data.dayOfWeek,
        classroom: data.classroom,
        startTime: data.startTime,
        endTime: data.endTime,
        id: { not: id },
      },
    })

    if (classroomConflict) {
      return {
        success: false,
        error: "Classroom is already assigned to another class during this time slot",
      }
    }

    const updated = await prisma.timetable.update({
      where: { id },
      data: {
        facultyId: data.facultyId || existing.facultyId,
        departmentId: data.departmentId || existing.departmentId,
        subjectId: data.subjectId,
        className: data.className,
        section: data.section,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        classroom: data.classroom,
        semester: data.semester,
      },
      include: {
        faculty: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
    })

    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating timetable entry:", error)
    return { success: false, error: "Failed to update timetable entry" }
  }
}

export async function deleteTimetableEntry(id: string, departmentId: string) {
  try {
    const entry = await prisma.timetable.findUnique({
      where: { id },
    })

    if (!entry) {
      return { success: false, error: "Timetable entry not found" }
    }

    if (entry.departmentId !== departmentId) {
      return { success: false, error: "Unauthorized: Entry belongs to different department" }
    }

    await prisma.timetable.delete({
      where: { id },
    })

    return { success: true, message: "Timetable entry deleted successfully" }
  } catch (error) {
    console.error("Error deleting timetable entry:", error)
    return { success: false, error: "Failed to delete timetable entry" }
  }
}

export async function approveLeave(id: string, remarks?: string) {
  try {
    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: "HOD",
        reviewRemarks: remarks || null,
      },
    })
    return { success: true, message: "Leave request approved successfully" }
  } catch (error) {
    console.error("Error approving leave:", error)
    return { success: false, error: "Failed to approve leave request" }
  }
}

export async function rejectLeave(id: string, remarks?: string) {
  try {
    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: "HOD",
        reviewRemarks: remarks || null,
      },
    })
    return { success: true, message: "Leave request rejected successfully" }
  } catch (error) {
    console.error("Error rejecting leave:", error)
    return { success: false, error: "Failed to reject leave request" }
  }
}
