import { NextRequest, NextResponse } from "next/server"
import { getHodTimetable, generateTimetable, getTimetableConflicts, getSubjectHoursForSemester, getPeriods, savePeriods, initDefaultPeriods } from "@/actions/hod-timetable"
import { createTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from "@/actions/hod-actions"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

    if (action === "faculty") {
      const faculty = await prisma.faculty.findMany({
        where: { departmentId: hod.departmentId, accountStatus: true },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { facultyId: "asc" },
      })
      return NextResponse.json({ success: true, data: faculty.map((f) => ({ id: f.id, name: f.user.name })) })
    }

    if (action === "rooms") {
      const departmentId = searchParams.get("departmentId") || hod.departmentId
      const rooms = await prisma.timetable.findMany({
        where: { departmentId },
        select: { classroom: true },
        distinct: ["classroom"],
      })
      return NextResponse.json({ success: true, data: rooms.map((r) => r.classroom).filter(Boolean) })
    }

    const filters = {
      className: searchParams.get("className") || undefined,
      section: searchParams.get("section") || undefined,
      semester: searchParams.get("semester") ? Number(searchParams.get("semester")) : undefined,
      academicYear: searchParams.get("academicYear") || undefined,
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

    if (action === "create") {
      const { departmentId, className, section, semester, dayOfWeek, startTime, endTime, classroom, subjectId, facultyId } = body
      if (!departmentId || !className || !section || !dayOfWeek || !startTime || !endTime || !classroom || !facultyId) {
        return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
      }
      if (hod.departmentId !== departmentId) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      }
      // Conflict checks
      const [facultyConflict, sectionConflict] = await Promise.all([
        prisma.timetable.findFirst({ where: { facultyId, dayOfWeek, startTime, endTime } }),
        prisma.timetable.findFirst({ where: { departmentId, className, section, dayOfWeek, startTime, endTime } }),
      ])
      if (facultyConflict) return NextResponse.json({ success: false, error: "Faculty already assigned at this time" }, { status: 400 })
      if (sectionConflict) return NextResponse.json({ success: false, error: "This class/section already has a period at this time" }, { status: 400 })

      const entry = await prisma.timetable.create({
        data: { facultyId, departmentId, subjectId: subjectId || null, className, section, dayOfWeek, startTime, endTime, classroom, semester: semester ? Number(semester) : null },
        include: { faculty: { include: { user: { select: { name: true } } } }, subject: true },
      })
      revalidatePath("/hod/timetable")
      revalidatePath("/faculty/timetable")
      revalidatePath("/student/timetable")
      return NextResponse.json({ success: true, data: entry })
    }

    if (action === "update") {
      const { id, departmentId, className, section, semester, dayOfWeek, startTime, endTime, classroom, subjectId, facultyId } = body
      if (!id) return NextResponse.json({ success: false, error: "Entry id required" }, { status: 400 })

      const existing = await prisma.timetable.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 })
      if (existing.departmentId !== hod.departmentId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

      const resolvedFacultyId = facultyId || existing.facultyId
      const resolvedDay = dayOfWeek ?? existing.dayOfWeek
      const resolvedStart = startTime || existing.startTime
      const resolvedEnd = endTime || existing.endTime

      const [facultyConflict, sectionConflict] = await Promise.all([
        prisma.timetable.findFirst({ where: { facultyId: resolvedFacultyId, dayOfWeek: resolvedDay, startTime: resolvedStart, endTime: resolvedEnd, id: { not: id } } }),
        prisma.timetable.findFirst({ where: { departmentId: existing.departmentId, className: className || existing.className, section: section || existing.section, dayOfWeek: resolvedDay, startTime: resolvedStart, endTime: resolvedEnd, id: { not: id } } }),
      ])
      if (facultyConflict) return NextResponse.json({ success: false, error: "Faculty already assigned at this time" }, { status: 400 })
      if (sectionConflict) return NextResponse.json({ success: false, error: "This class/section already has a period at this time" }, { status: 400 })

      const updated = await prisma.timetable.update({
        where: { id },
        data: {
          facultyId: resolvedFacultyId,
          subjectId: subjectId !== undefined ? (subjectId || null) : existing.subjectId,
          className: className || existing.className,
          section: section || existing.section,
          dayOfWeek: resolvedDay,
          startTime: resolvedStart,
          endTime: resolvedEnd,
          classroom: classroom || existing.classroom,
          semester: semester !== undefined ? Number(semester) : existing.semester,
        },
        include: { faculty: { include: { user: { select: { name: true } } } }, subject: true },
      })
      revalidatePath("/hod/timetable")
      revalidatePath("/faculty/timetable")
      revalidatePath("/student/timetable")
      return NextResponse.json({ success: true, data: updated })
    }

    if (action === "delete") {
      const { id } = body
      if (!id) return NextResponse.json({ success: false, error: "Entry id required" }, { status: 400 })
      const existing = await prisma.timetable.findUnique({ where: { id } })
      if (!existing) return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 })
      if (existing.departmentId !== hod.departmentId) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
      await prisma.timetable.delete({ where: { id } })
      revalidatePath("/hod/timetable")
      revalidatePath("/faculty/timetable")
      revalidatePath("/student/timetable")
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in timetable POST:", error)
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 })
  }
}
