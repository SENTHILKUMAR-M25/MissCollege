import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/permissions"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!faculty?.hodAssignments.length) {
      return NextResponse.json({ success: false, error: "No active HoD assignment" }, { status: 403 })
    }
    const hodDeptId = faculty.hodAssignments[0].departmentId

    const { id } = await params
    const { remarks } = await request.json()

    if (!remarks || remarks.trim() === "") {
      return NextResponse.json({ success: false, error: "Remarks are required for rejection" }, { status: 400 })
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    })

    if (!leaveRequest) {
      return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 })
    }

    if (leaveRequest.departmentId !== hodDeptId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    if (leaveRequest.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Leave request already processed" }, { status: 400 })
    }

    await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: "HOD",
        reviewRemarks: remarks,
      },
    })

    return NextResponse.json({ success: true, message: "Leave request rejected" })
  } catch (error) {
    console.error("Error rejecting leave:", error)
    return NextResponse.json({ success: false, error: "Failed to reject leave" }, { status: 500 })
  }
}
