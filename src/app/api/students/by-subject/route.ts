import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get("subjectId")

    if (!subjectId) {
      return NextResponse.json({ success: false, error: "subjectId required" }, { status: 400 })
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { departmentId: true, semester: true },
    })

    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 })
    }

    const students = await prisma.student.findMany({
      where: { departmentId: subject.departmentId, semester: subject.semester },
      include: {
        user: { select: { name: true } },
        course: { select: { name: true, code: true } },
      },
      orderBy: { registerNumber: "asc" },
    })

    return NextResponse.json({ success: true, data: students })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 })
  }
}
