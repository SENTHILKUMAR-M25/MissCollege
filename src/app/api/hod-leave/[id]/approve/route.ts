import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { remarks } = await request.json().catch(() => ({ remarks: "" }))

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
        status: "APPROVED",
        reviewedBy: "HOD",
        reviewRemarks: remarks || null,
      },
    })

    return NextResponse.json({ success: true, message: "Leave request approved" })
  } catch (error) {
    console.error("Error approving leave:", error)
    return NextResponse.json({ success: false, error: "Failed to approve leave" }, { status: 500 })
  }
}
