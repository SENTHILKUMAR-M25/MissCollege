import { NextRequest, NextResponse } from "next/server"
import { getFacultyAssignmentsV2, getAssignmentById, gradeSubmission, updateAssignmentStatus, deleteAssignment, getAssignmentStatistics, getStudentAssignments, submitAssignment, createAssignment } from "@/actions/assignments"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")

    if (action === "stats") {
      const role = session.user.role
      if (role === "FACULTY") {
        const faculty = await prisma.faculty.findUnique({ where: { userId: session.user.id }, select: { id: true } })
        if (!faculty) return NextResponse.json({ success: false, error: "Faculty not found" }, { status: 404 })
        const result = await getAssignmentStatistics(faculty.id)
        if (!result.success) return NextResponse.json(result, { status: 500 })
        return NextResponse.json(result)
      }
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    if (action === "submissions") {
      const assignmentId = searchParams.get("assignmentId")
      if (!assignmentId) return NextResponse.json({ success: false, error: "assignmentId required" }, { status: 400 })
      const result = await getAssignmentById(assignmentId)
      if (!result.success) return NextResponse.json(result, { status: 404 })
      return NextResponse.json({ success: true, data: result.data.submissions })
    }

    if (session.user.role === "FACULTY") {
      const faculty = await prisma.faculty.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (!faculty) return NextResponse.json({ success: false, error: "Faculty not found" }, { status: 404 })
      const result = await getFacultyAssignmentsV2(faculty.id)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    if (session.user.role === "STUDENT") {
      const student = await prisma.student.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
      const result = await getStudentAssignments(session.user.id)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("Error in assignments GET:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { action } = body

    if (action === "create") {
      const result = await createAssignment(body)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    if (action === "grade") {
      const { submissionId, grade, feedback } = body
      if (!submissionId || grade === undefined) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
      const faculty = await prisma.faculty.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (!faculty) return NextResponse.json({ success: false, error: "Faculty not found" }, { status: 404 })
      const result = await gradeSubmission(submissionId, Number(grade), feedback || "", session.user.id)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    if (action === "status") {
      const { assignmentId, status, facultyUserId } = body
      if (!assignmentId || !status) return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 })
      const result = await updateAssignmentStatus(assignmentId, status, facultyUserId)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    if (action === "submit") {
      const { assignmentId, submissionText, fileUrl } = body
      if (!assignmentId) return NextResponse.json({ success: false, error: "assignmentId required" }, { status: 400 })
      const student = await prisma.student.findUnique({ where: { userId: session.user.id }, select: { id: true } })
      if (!student) return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
      const result = await submitAssignment(assignmentId, student.id, submissionText, fileUrl)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in assignments POST:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { assignmentId, facultyUserId } = body

    if (!assignmentId) return NextResponse.json({ success: false, error: "assignmentId required" }, { status: 400 })

    const result = await deleteAssignment(assignmentId, facultyUserId || session.user.id)
    if (!result.success) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ success: false, error: "Failed to delete assignment" }, { status: 500 })
  }
}
