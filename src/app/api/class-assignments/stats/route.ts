import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId") || ""

    if (!departmentId) {
      return NextResponse.json({ success: false, error: "departmentId is required" }, { status: 400 })
    }

    const totalAssignments = await prisma.classAssignment.count({
      where: { departmentId, assignmentStatus: "ACTIVE" },
    })

    const allStudents = await prisma.student.findMany({
      where: { departmentId },
      select: { semester: true, section: true },
    })
    const totalUnique = new Set(allStudents.map((s) => `${s.semester}-${s.section}`)).size

    const classAdvisors = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } }, department: { select: { name: true, code: true } } },
      distinct: ["facultyId"],
      orderBy: { assignedAt: "desc" },
    })

    const recentAssignments = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } } },
      orderBy: { assignedAt: "desc" },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      data: {
        totalSections: totalUnique,
        assignedClasses: totalAssignments,
        unassignedClasses: totalUnique - totalAssignments,
        classAdvisorCount: classAdvisors.length,
        classAdvisors,
        recentAssignments,
      },
    })
  } catch (error) {
    console.error("Error fetching class assignment stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
