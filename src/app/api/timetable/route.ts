import { NextRequest, NextResponse } from "next/server"
import { getHodTimetable, generateTimetable, getTimetableConflicts, getSubjectHoursForSemester, getPeriods, savePeriods, initDefaultPeriods } from "@/actions/hod-timetable"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const hod = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")

    if (action === "conflicts") {
      const result = await getTimetableConflicts(hod.departmentId)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    if (action === "subject-hours") {
      const semester = Number(searchParams.get("semester") || "1")
      const result = await getSubjectHoursForSemester(hod.departmentId, semester)
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    if (action === "courses") {
      const courses = await prisma.course.findMany({
        where: { departmentId: hod.departmentId },
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      })
      return NextResponse.json({ success: true, data: courses })
    }

    if (action === "periods") {
      const result = await getPeriods()
      if (!result.success) return NextResponse.json(result, { status: 500 })
      return NextResponse.json(result)
    }

    const filters = {
      className: searchParams.get("className") || undefined,
      section: searchParams.get("section") || undefined,
      semester: searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined,
    }

    const result = await getHodTimetable(hod.departmentId, filters)
    if (!result.success) return NextResponse.json(result, { status: 500 })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in timetable GET:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch timetable" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const hod = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 })

    const body = await req.json()
    const { action } = body

    if (action === "generate") {
      const { departmentId, className, section, semester, academicYear, workingDays, excludeBreaks, maxConsecutiveSameSubject } = body
      if (!departmentId || !className || !section || !semester) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
      }
      const result = await generateTimetable({
        departmentId,
        className,
        section,
        semester: Number(semester),
        academicYear: academicYear || "",
        workingDays,
        excludeBreaks,
        maxConsecutiveSameSubject,
        facultyUserId: session.user.id,
      })
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    if (action === "clear") {
      const { departmentId, className, section, semester } = body
      if (!departmentId || !className || !section || !semester) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
      }
      if (hod.departmentId !== departmentId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
      await prisma.timetable.deleteMany({
        where: { departmentId, className, section, semester: Number(semester) },
      })
      revalidatePath("/hod/timetable")
      revalidatePath("/faculty/timetable")
      revalidatePath("/student/timetable")
      return NextResponse.json({ success: true, message: "Timetable cleared" })
    }

    if (action === "save-periods") {
      const { periods } = body
      if (!Array.isArray(periods) || periods.length === 0) {
        return NextResponse.json({ success: false, error: "Periods array is required" }, { status: 400 })
      }
      const result = await savePeriods(periods, session.user.id)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    if (action === "init-periods") {
      const result = await initDefaultPeriods(session.user.id)
      if (!result.success) return NextResponse.json(result, { status: 400 })
      return NextResponse.json(result)
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in timetable POST:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
