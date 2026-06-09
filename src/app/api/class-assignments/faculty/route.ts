import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId") || ""

    if (!departmentId) {
      return NextResponse.json({ success: false, error: "departmentId is required" }, { status: 400 })
    }

    const faculty = await prisma.faculty.findMany({
      where: {
        departmentId,
        accountStatus: true,
        user: { isActive: true, role: "FACULTY" },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { id: "asc" },
    })

    return NextResponse.json({ success: true, data: faculty })
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch faculty" }, { status: 500 })
  }
}
