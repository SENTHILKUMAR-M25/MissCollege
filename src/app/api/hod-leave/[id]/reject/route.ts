import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { remarks } = await request.json()

    if (!remarks || remarks.trim() === "") {
      return NextResponse.json({ success: false, error: "Remarks are required for rejection" }, { status: 400 })
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { faculty: { include: { user: true } } },
    })

    if (!leaveRequest) {
      return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 })
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
