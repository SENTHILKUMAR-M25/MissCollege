"use server"

import prisma from "@/lib/prisma"
import { z } from "zod"

export async function getHodDashboardData(departmentId: string) {
  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        faculty: {
          where: { accountStatus: true },
          include: {
            user: { select: { name: true, email: true, createdAt: true } },
            subjects: true,
            timetables: true,
            attendance: {
              where: {
                date: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
          },
        },
        students: {
          include: {
            user: { select: { name: true } },
            attendance: {
              where: {
                date: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lt: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
          },
        },
        subjects: true,
        timetables: {
          where: {
            dayOfWeek: new Date().getDay() === 0 ? 7 : new Date().getDay(),
          },
          include: {
            faculty: { include: { user: { select: { name: true } } } },
            subject: true,
          },
        },
        notices: {
          where: {
            OR: [
              { targetAudience: "ALL" },
              { targetAudience: "HOD" },
              { targetAudience: "FACULTY" },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        hodAssignments: {
          where: { isActive: true },
          include: { faculty: { include: { user: true } } },
        },
      },
    })

    if (!department) {
      return { success: false, error: "Department not found" }
    }

    const totalFaculty = department.faculty.length
    const totalStudents = department.students.length
    const activeClassesToday = department.timetables.length
    const hod = department.hodAssignments[0]

    const facultyWorkload = department.faculty.map((f) => ({
      id: f.id,
      name: f.user.name,
      facultyId: f.facultyId,
      designation: f.designation,
      subjectCount: f.subjects.length,
      timetableCount: f.timetables.length,
      attendanceRecords: f.attendance.length,
    }))

    const attendanceStats = {
      facultyPresent: department.faculty.filter((f) => f.attendance.length > 0).length,
      studentPresent: department.students.filter((s) => s.attendance.length > 0).length,
      totalAttendanceRecords: [
        ...department.faculty.flatMap((f) => f.attendance),
        ...department.students.flatMap((s) => s.attendance),
      ].length,
    }

    return {
      success: true,
      data: {
        department,
        stats: {
          totalFaculty,
          totalStudents,
          activeClassesToday,
          subjectCount: department.subjects.length,
          hodName: hod?.faculty.user.name || "Not Assigned",
        },
        facultyWorkload,
        attendanceStats,
        notices: department.notices,
        timetable: department.timetables,
      },
    }
  } catch (error) {
    console.error("Error fetching HOD dashboard:", error)
    return { success: false, error: "Failed to fetch dashboard data" }
  }
}
