import { NextRequest, NextResponse } from "next/server"
import { getFacultyAssignedSubjects, getStudentsForMarksEntry, saveMarkEntry, getMarkStatistics, getMarksAuditLog } from "@/actions/faculty-marks"
import { requireFaculty } from "@/lib/permissions"
import { getSession } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  try {
    const user = await requireFaculty()
    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")

    if (action === "subjects") {
      const result = await getFacultyAssignedSubjects(user.id)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    if (action === "students") {
      const subjectId = searchParams.get("subjectId") || ""
      const semester = searchParams.get("semester")
      const section = searchParams.get("section")
      const academicYear = searchParams.get("academicYear")

      if (!subjectId) {
        return NextResponse.json({ success: false, error: "subjectId is required" }, { status: 400 })
      }

      const result = await getStudentsForMarksEntry(user.id, {
        subjectId,
        semester: semester ? Number(semester) : undefined,
        section: section || undefined,
        academicYear: academicYear || undefined,
      })

      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    if (action === "statistics") {
      const result = await getMarkStatistics(user.id)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    if (action === "audit") {
      const limit = Number(searchParams.get("limit") || 50)
      const result = await getMarksAuditLog(user.id, limit)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in faculty marks GET:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch marks data" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireFaculty()
    const body = await req.json()
    const { action } = body

    if (action === "save") {
      const { subjectId, examType, marks } = body

      if (!subjectId || !examType || !Array.isArray(marks) || marks.length === 0) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
      }

      const result = await saveMarkEntry({ subjectId, examType, marks, facultyUserId: user.id })

      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in faculty marks POST:", error)
    return NextResponse.json({ success: false, error: "Failed to save marks" }, { status: 500 })
  }
}
