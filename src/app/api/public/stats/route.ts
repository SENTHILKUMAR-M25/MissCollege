import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const [departmentCount, courseCount, facultyCount, studentCount] = await Promise.all([
      prisma.department.count(),
      prisma.course.count(),
      prisma.faculty.count(),
      prisma.student.count(),
    ])

    return NextResponse.json({
      stats: {
        departmentCount,
        courseCount,
        facultyCount,
        studentCount,
      },
    })
  } catch (error) {
    console.error("Error fetching public stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
