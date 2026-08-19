import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// GET — fetch attendance records for a faculty with optional date range
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const facultyId = searchParams.get("facultyId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  if (!facultyId) return NextResponse.json({ success: false, error: "facultyId required" }, { status: 400 })

  try {
    const where: any = { facultyId }
    if (startDate) where.date = { ...where.date, gte: new Date(startDate) }
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            course: { select: { name: true, code: true } },
            department: { select: { name: true, code: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true, semester: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    })

    const serialized = records.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      periodNumber: r.periodNumber,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      student: {
        id: r.student.id,
        registerNumber: r.student.registerNumber,
        user: r.student.user,
      },
      subject: r.subject,
    }))

    return NextResponse.json({ success: true, records: serialized })
  } catch (error: any) {
    console.error("Fetch attendance error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch records" }, { status: 500 })
  }
}

// POST — mark/upsert period-wise attendance for all students in a slot
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { facultyId, subjectId, date, periodNumber, startTime, endTime, records } = body

    if (!facultyId || !subjectId || !date || !periodNumber || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date" }, { status: 400 })
    }

    const allowedStatuses = ["PRESENT", "ABSENT", "OD", "LEAVE"] as const
    const sanitized = records.map((r: { studentId: string; status: string }) => {
      const status = allowedStatuses.includes(r.status) ? r.status : "ABSENT"
      return { studentId: r.studentId, status }
    })

    await prisma.$transaction(
      sanitized.map((r: { studentId: string; status: string }) =>
        prisma.attendance.upsert({
          where: {
            studentId_subjectId_date_periodNumber: {
              studentId: r.studentId,
              subjectId,
              date: attendanceDate,
              periodNumber: Number(periodNumber),
            },
          },
          update: {
            status: r.status as "PRESENT" | "ABSENT" | "OD" | "LEAVE",
            facultyId,
            startTime: startTime ?? undefined,
            endTime: endTime ?? undefined,
          },
          create: {
            studentId: r.studentId,
            subjectId,
            facultyId,
            date: attendanceDate,
            periodNumber: Number(periodNumber),
            startTime: startTime || null,
            endTime: endTime || null,
            status: r.status as "PRESENT" | "ABSENT" | "OD" | "LEAVE",
          },
        })
      )
    )

    revalidatePath("/faculty/attendance")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Mark attendance error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to mark attendance" }, { status: 500 })
  }
}

// PATCH — update a single existing attendance record
export async function PATCH(request: Request) {
  try {
    const { recordId, status } = await request.json()

    const allowed = ["PRESENT", "ABSENT", "OD", "LEAVE"]
    if (!recordId || !allowed.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 })
    }

    const updated = await prisma.attendance.update({
      where: { id: recordId },
      data: { status: status as "PRESENT" | "ABSENT" | "OD" | "LEAVE" },
    })

    revalidatePath("/faculty/attendance")
    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("Update attendance error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update" }, { status: 500 })
  }
}
