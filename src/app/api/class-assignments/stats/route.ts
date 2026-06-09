import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"

async function requireHoD(sessionUser: any, requiredDeptId: string) {
  if (sessionUser.role !== "HOD") {
    return { ok: false, error: "Forbidden", status: 403 }
  }
  const hodFaculty = await prisma.faculty.findUnique({
    where: { userId: sessionUser.id },
    include: { hodAssignments: { where: { isActive: true } } },
  })
  if (!hodFaculty?.hodAssignments.some(a => a.departmentId === requiredDeptId)) {
    return { ok: false, error: "Forbidden", status: 403 }
  }
  return { ok: true }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId") || ""

    if (!departmentId) {
      return NextResponse.json({ success: false, error: "departmentId is required" }, { status: 400 })
    }

    const auth = await requireHoD(session.user, departmentId)
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
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
      orderBy: { assignedAt: "desc" },
    })

    const recentAssignments = await prisma.classAssignment.findMany({
      where: { departmentId, assignmentStatus: "ACTIVE" },
      include: { faculty: { include: { user: { select: { name: true } } } } },
      orderBy: { assignedAt: "desc" },
      take: 5,
    })

    const uniqueAdvisors = new Set(classAdvisors.map((a) => a.facultyId)).size

    return NextResponse.json({
      success: true,
      data: {
        totalSections: totalUnique,
        assignedClasses: totalAssignments,
        unassignedClasses: totalUnique - totalAssignments,
        classAdvisorCount: uniqueAdvisors,
        classAdvisors,
        recentAssignments,
      },
    })
  } catch (error) {
    console.error("Error fetching class assignment stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
