import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/permissions"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "FACULTY") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { facultyId, subjectId, date, periodNumber, startTime, endTime, records } = body as {
      facultyId: string
      subjectId: string
      date: string
      periodNumber: number
      startTime?: string
      endTime?: string
      records: Array<{ studentId: string; status: string; maxMark?: number }>
    }

    if (!facultyId || !subjectId || !date || !periodNumber || !records?.length) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const attendanceDate = new Date(date)

    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: {
          subjectId,
          date: attendanceDate,
          periodNumber,
          facultyId,
        },
      })

      await tx.attendance.createMany({
        data: records.map((record) => ({
          studentId: record.studentId,
          subjectId,
          facultyId,
          date: attendanceDate,
          periodNumber,
          status: record.status as "PRESENT" | "ABSENT" | "OD" | "LEAVE",
          startTime: startTime || null,
          endTime: endTime || null,
        })),
        skipDuplicates: true,
      })
    })

    return NextResponse.json({ success: true, message: "Attendance saved" })
  } catch (error: any) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ success: false, error: error?.message || "Failed to save attendance" }, { status: 500 })
  }
}
