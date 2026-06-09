import { NextRequest, NextResponse } from "next/server"
import { createSection, assignStudentToSection, moveStudent, getSections, deleteSection, getUnassignedStudents } from "@/actions/sections"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"

async function assertHod(facultyUserId: string) {
  const hod = await prisma.faculty.findUnique({
    where: { userId: facultyUserId },
    include: {
      hodAssignments: { where: { isActive: true } },
      department: { select: { id: true, name: true } },
    },
  })
  if (!hod?.hodAssignments[0]) throw new Error("Not authorized")
  return { facultyId: hod.id, departmentId: hod.departmentId }
}

const badRequest = (message: string) =>
  NextResponse.json({ success: false, error: message }, { status: 400 })

const unauthorized = (message = "Unauthorized") =>
  NextResponse.json({ success: false, error: message }, { status: 401 })

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return unauthorized()

    const hod = await assertHod(session.user.id)
    const departmentId = hod.departmentId

    const { searchParams } = new URL(req.url)
    const semester = searchParams.get("semester")
    const academicYear = searchParams.get("academicYear")
    const mode = searchParams.get("mode")

    if (mode === "unassigned-students") {
      const result = await getUnassignedStudents(departmentId, semester ? Number(semester) : undefined)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    const result = await getSections(departmentId, semester ? Number(semester) : undefined, academicYear || undefined)
    if (!result.success) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("GET /api/sections error:", err)
    if (err.message === "Not authorized") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    return NextResponse.json({ success: false, error: "Failed to fetch sections" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return unauthorized()
    await assertHod(session.user.id)

    const body = await req.json()

    if (body.action === "assign") {
      if (!body.sectionId || !body.studentId) return badRequest("sectionId and studentId are required")
      const result = await assignStudentToSection({
        sectionId: body.sectionId,
        studentId: body.studentId,
        assignedBy: session.user.id,
      })
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    if (body.action === "move") {
      if (!body.studentId || !body.fromSectionId || !body.toSectionId) return badRequest("studentId, fromSectionId, and toSectionId are required")
      const result = await moveStudent({
        studentId: body.studentId,
        fromSectionId: body.fromSectionId,
        toSectionId: body.toSectionId,
        assignedBy: session.user.id,
      })
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    const { departmentId, academicYear, semester, name, className, capacity, allocationMode } = body
    if (!departmentId) return badRequest("Department is required")

    const result = await createSection({ departmentId, academicYear, semester, name, className, capacity, allocationMode })
    if (!result.success) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("POST /api/sections error:", err)
    return NextResponse.json({ success: false, error: "Failed to process section action" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return unauthorized()
    await assertHod(session.user.id)

    const { searchParams } = new URL(req.url)
    const sectionId = searchParams.get("sectionId")
    if (!sectionId) return badRequest("sectionId is required")

    const result = await deleteSection(sectionId)
    if (!result.success) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (err: any) {
    console.error("DELETE /api/sections error:", err)
    if (err.message === "Not authorized") return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    return NextResponse.json({ success: false, error: "Failed to delete section" }, { status: 500 })
  }
}
