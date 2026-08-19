import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        _count: { select: { courses: true, faculty: true, students: true } },
        hodAssignments: {
          where: { isActive: true },
          take: 1,
          include: {
            faculty: { include: { user: { select: { name: true } } } },
          },
        },
        courses: { select: { id: true, name: true, code: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ departments })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
