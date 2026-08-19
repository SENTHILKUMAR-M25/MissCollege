import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get("departmentId")
  const semester = searchParams.get("semester")
  const section = searchParams.get("section")

  if (!departmentId || !semester || !section) {
    return NextResponse.json({ success: false, error: "departmentId, semester, and section are required" }, { status: 400 })
  }

  try {
    const students = await prisma.student.findMany({
      where: { departmentId, semester: Number(semester), section },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { registerNumber: "asc" },
    })

    const serialized = students.map((s) => ({
      id: s.id,
      registerNumber: s.registerNumber,
      semester: s.semester,
      section: s.section,
      user: s.user,
    }))

    return NextResponse.json({ success: true, students: serialized })
  } catch (error: any) {
    console.error("Fetch students error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch students" }, { status: 500 })
  }
}