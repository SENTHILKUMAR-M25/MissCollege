import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
  return { ok: true, hodFacultyId: hodFaculty.id, departmentId: hodFaculty.departmentId }
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

    const where: any = { departmentId, assignmentStatus: "ACTIVE" }
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")
    if (semester) where.semester = Number(semester)
    if (section) where.section = section

    const [assignments, allSections, allSemesters, assignedFaculty, recent] = await Promise.all([
      prisma.classAssignment.findMany({
        where,
        include: {
          faculty: { include: { user: { select: { name: true, email: true } } } },
          department: { select: { name: true, code: true } },
        },
        orderBy: { assignedAt: "desc" },
      }),
      prisma.classAssignment.findMany({
        where: { departmentId, assignmentStatus: "ACTIVE" },
        select: { section: true },
      }),
      prisma.classAssignment.findMany({
        where: { departmentId, assignmentStatus: "ACTIVE" },
        select: { semester: true },
      }),
      prisma.classAssignment.findMany({
        where: { departmentId, assignmentStatus: "ACTIVE" },
        include: { faculty: { include: { user: { select: { name: true } } } } },
      }),
      prisma.classAssignment.findMany({
        where: { departmentId, assignmentStatus: "ACTIVE" },
        include: { faculty: { include: { user: { select: { name: true } } } } },
        orderBy: { assignedAt: "desc" },
        take: 10,
      }),
    ])

    const allStudents = await prisma.student.findMany({
      where: { departmentId },
      select: { semester: true, section: true },
    })

    const assignedSet = new Set(assignments.map((a) => `${a.semester}-${a.section}`))
    const unassigned: { semester: number; section: string }[] = []
    const seen = new Set<string>()

    for (const s of allStudents) {
      const key = `${s.semester}-${s.section}`
      if (!assignedSet.has(key) && !seen.has(key)) {
        unassigned.push({ semester: s.semester, section: s.section })
        seen.add(key)
      }
    }

    unassigned.sort((a, b) => a.semester - b.semester || a.section.localeCompare(b.section))

    return NextResponse.json({
      success: true,
      data: {
        assignments,
        stats: {
          totalAssignments: assignments.length,
          totalSections: new Set(allSections.map(s => s.section)).size,
          totalSemesters: new Set(allSemesters.map(s => s.semester)).size,
          classAdvisorCount: new Set(assignedFaculty.map(a => a.facultyId)).size,
        },
        unassignedSections: unassigned,
        recentAssignments: recent,
      },
    })
  } catch (error) {
    console.error("Error fetching class assignments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch class assignments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { facultyId, departmentId, academicYear, semester, section } = body

    if (!facultyId || !departmentId || !academicYear || !semester || !section) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    const auth = await requireHoD(session.user, departmentId)
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const [faculty, existing, allStudents] = await Promise.all([
      prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { user: { select: { name: true } }, department: { select: { name: true, code: true } } },
      }),
      prisma.classAssignment.findFirst({
        where: { departmentId, semester, section, assignmentStatus: "ACTIVE" },
        include: { faculty: { include: { user: { select: { name: true } } } } },
      }),
      prisma.student.findMany({
        where: { departmentId },
        select: { semester: true, section: true },
      }),
    ])

    if (!faculty) {
      return NextResponse.json({ success: false, error: "Faculty not found" }, { status: 404 })
    }

    if (faculty.departmentId !== departmentId) {
      return NextResponse.json({ success: false, error: "Faculty does not belong to the selected department" }, { status: 400 })
    }

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Class ${section} (Semester ${semester}) is already assigned to ${existing.faculty.user.name}` },
        { status: 409 }
      )
    }

    const allStudentSections = new Set(allStudents.map((s) => `${s.semester}-${s.section}`))
    const hasStudents = allStudentSections.has(`${semester}-${section}`)
    if (!hasStudents) {
      return NextResponse.json(
        { success: false, error: `No students found for Semester ${semester}, Section ${section}. Students must exist before assigning an advisor.` },
        { status: 400 })
    }

    const assignment = await prisma.classAssignment.create({
      data: {
        facultyId,
        departmentId,
        academicYear,
        semester,
        section,
        assignmentStatus: "ACTIVE",
      },
      include: {
        faculty: { include: { user: { select: { name: true, email: true } } } },
        department: { select: { name: true, code: true } },
      },
    })

    revalidatePath("/hod/faculty-allocation")
    return NextResponse.json({
      success: true,
      data: assignment,
      message: `Class ${section} (Semester ${semester}) assigned to ${faculty.user.name}`,
    })
  } catch (error) {
    console.error("Error creating class assignment:", error)
    return NextResponse.json({ success: false, error: "Failed to create class assignment" }, { status: 500 })
  }
}
