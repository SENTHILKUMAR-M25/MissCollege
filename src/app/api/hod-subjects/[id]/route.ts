import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { deleteSubject } from "@/actions/hod-subjects"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { department: true },
    })

    if (!subject) {
      return NextResponse.json({ success: false, error: "Subject not found" }, { status: 404 })
    }

    const session = await (await import("@/lib/permissions")).getSession()
    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const hodFaculty = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      include: { hodAssignments: { where: { isActive: true } } },
    })

    if (!hodFaculty?.hodAssignments.some(a => a.departmentId === subject.departmentId)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    await deleteSubject(id, hodFaculty.id)

    return NextResponse.json({ success: true, message: "Subject deleted successfully" })
  } catch (error) {
    console.error("Error deleting subject:", error)
    return NextResponse.json({ success: false, error: "Failed to delete subject" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
