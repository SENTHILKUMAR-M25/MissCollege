import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "overview"
    const departmentId = searchParams.get("departmentId")
    const format = searchParams.get("format") || "json"

    const userRole = session.user.role as Role
    const isAdmin = [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN].includes(userRole)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let reportData: any = {}

    switch (reportType) {
      case "overview":
        const [totalStudents, totalFaculty, totalDepartments, totalCourses] = await Promise.all([
          prisma.student.count(),
          prisma.faculty.count(),
          prisma.department.count(),
          prisma.course.count(),
        ])

        const attendanceStats = await prisma.attendance.groupBy({
          by: ["status"],
          _count: { status: true },
        })

        const resultStats = await prisma.examResult.groupBy({
          by: ["status"],
          _count: { status: true },
          _avg: { marks: true },
        })

        reportData = {
          totalStudents,
          totalFaculty,
          totalDepartments,
          totalCourses,
          attendanceStats: attendanceStats.map(s => ({ status: s.status, count: s._count.status })),
          resultStats: resultStats.map(s => ({ status: s.status, count: s._count.status, avgMarks: Math.round(s._avg.marks || 0) })),
        }
        break

      case "department":
        if (!departmentId) {
          return NextResponse.json({ error: "Department ID required" }, { status: 400 })
        }
        const dept = await prisma.department.findUnique({
          where: { id: departmentId },
          include: {
            faculty: { include: { user: { select: { name: true, email: true } } } },
            students: { include: { user: { select: { name: true, email: true } } } },
            courses: true,
            subjects: true,
          },
        })
        reportData = dept
        break

      case "students":
        const students = await prisma.student.findMany({
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true, code: true } },
            course: { select: { name: true } },
            attendance: { include: { subject: { select: { name: true } } } },
            internalMarks: { include: { subject: { select: { name: true } } } },
            examResults: { include: { examType: true, subject: { select: { name: true } } } },
          },
        })
        reportData = students
        break

      case "faculty":
        const faculty = await prisma.faculty.findMany({
          include: {
            user: { select: { name: true, email: true } },
            department: { select: { name: true, code: true } },
            subjects: true,
            assignments: true,
          },
        })
        reportData = faculty
        break

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    if (format === "csv") {
      const { Parser } = await import("json2csv")
      const parser = new Parser()
      const csv = parser.parse(Array.isArray(reportData) ? reportData : [reportData])
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=${reportType}-report.csv`,
        },
      })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
