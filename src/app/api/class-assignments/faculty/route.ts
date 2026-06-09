import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/permissions"
import prisma from "@/lib/prisma"

async function requireHoD(sessionUser: any, requiredDeptId: string) {
  if (sessionUser.role !== "HOD") {
    return { ok: false, error: "Forbidden", status: 403 }
  }
  const hodFaculty = await prisma.faculty.findUnique({
    where: { userId: sessionUser.id },
    include: { hodAssignments: { where: { isActive: true } } },
  })
  if (!hodFaculty?.hodAssignments.some(a => a.departmentId === requiredDeptId)) {
    return { ok: false, error: "Forbidden", status: 403 }
  }
  return { ok: true }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const departmentId = searchParams.get("departmentId") || ""

    if (!departmentId) {
      return NextResponse.json({ success: false, error: "departmentId is required" }, { status: 400 })
    }

    const auth = await requireHoD(session.user, departmentId)
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const faculty = await prisma.faculty.findMany({
      where: {
        departmentId,
        accountStatus: true,
        user: { isActive: true },
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
