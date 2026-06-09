import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// GET — fetch recent records for a faculty
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const facultyId = searchParams.get("facultyId")
  if (!facultyId) return NextResponse.json({ success: false, error: "facultyId required" }, { status: 400 })

  try {
    const records = await prisma.attendance.findMany({
      where: { facultyId },
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
      },
      orderBy: { date: "desc" },
      take: 200,
    })
    return NextResponse.json({ success: true, records })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch records" }, { status: 500 })
  }
}

// POST — mark/upsert attendance for all students in a session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { facultyId, subjectId, date, records } = body

    if (!facultyId || !subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const attendanceDate = new Date(date)
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date" }, { status: 400 })
    }

    await prisma.$transaction(
      records.map((r: { studentId: string; status: string }) =>
        prisma.attendance.upsert({
          where: { studentId_subjectId_date: { studentId: r.studentId, subjectId, date: attendanceDate } },
          update: { status: r.status as "PRESENT" | "ABSENT", facultyId },
          create: { studentId: r.studentId, subjectId, facultyId, date: attendanceDate, status: r.status as "PRESENT" | "ABSENT" },
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

    if (!recordId || !["PRESENT", "ABSENT"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 })
    }

    await prisma.attendance.update({
      where: { id: recordId },
      data: { status: status as "PRESENT" | "ABSENT" },
    })

    revalidatePath("/faculty/attendance")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update attendance error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update" }, { status: 500 })
  }
}
