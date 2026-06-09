import { NextRequest, NextResponse } from "next/server"
import { getHodSubjects, createSubject, updateSubject, reassignSubject, assignFacultyToSubject } from "@/actions/hod-subjects"
import { getSession } from "@/lib/permissions"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  const facultyUserId = session.user.id
  const { searchParams } = new URL(req.url)
  const filters: any = {}
  const sem = searchParams.get("semester")
  if (sem) filters.semester = Number(sem)
  const st = searchParams.get("subjectType")
  if (st) filters.subjectType = st

  const result = await getHodSubjects(facultyUserId, filters)
  if (!result.success) return NextResponse.json(result, { status: 500 })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

  const facultyUserId = session.user.id
  const body = await req.json()

  if (body.action === "allocate") {
    const { subjectId, facultyIds } = body
    if (!subjectId || !Array.isArray(facultyIds) || facultyIds.length === 0) {
      return NextResponse.json({ success: false, error: "Subject and at least one faculty are required" }, { status: 400 })
    }
    const result = await assignFacultyToSubject(subjectId, facultyIds, facultyUserId)
    if (!result.success) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  }

  if (body.action === "reassign") {
    const { facultySubjectId, newFacultyId } = body
    const result = await reassignSubject(facultySubjectId, newFacultyId, facultyUserId)
    if (!result.success) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  }

  if (body.action === "update") {
    const { subjectId, facultyId } = body
    if (!subjectId) {
      return NextResponse.json({ success: false, error: "subjectId is required" }, { status: 400 })
    }
    const result = await updateSubject(subjectId, facultyId, body)
    if (!result.success) return NextResponse.json(result, { status: 400 })
    return NextResponse.json(result)
  }

  const result = await createSubject(facultyUserId, body)
  if (!result.success) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
