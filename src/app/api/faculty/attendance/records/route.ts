import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
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
    console.error("Fetch attendance records error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch records" }, { status: 500 })
  }
}