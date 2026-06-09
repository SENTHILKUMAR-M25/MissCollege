import { NextResponse } from "next/server"
import { getActiveHods, assignHod, removeHod } from "@/actions/hod-assignments"

export async function GET() {
  try {
    const result = await getActiveHods()
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error fetching HODs:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch HODs" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const formData = new FormData()

    formData.append("facultyId", body.facultyId)
    formData.append("departmentId", body.departmentId)
    formData.append("assignedBy", body.assignedBy || "")

    const result = await assignHod(formData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error assigning HOD:", error)
    return NextResponse.json(
      { success: false, error: "Failed to assign HOD" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { assignmentId, removalReason } = await request.json()

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "Assignment ID is required" },
        { status: 400 }
      )
    }

    const formData = new FormData()
    formData.append("assignmentId", assignmentId)
    formData.append("removalReason", removalReason || "")

    const result = await removeHod(formData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error removing HOD:", error)
    return NextResponse.json(
      { success: false, error: "Failed to remove HOD" },
      { status: 500 }
    )
  }
}
