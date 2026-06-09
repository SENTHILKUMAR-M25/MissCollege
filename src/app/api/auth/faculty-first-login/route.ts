import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { changeFacultyPassword } from "@/actions/faculty-portal"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const result = await changeFacultyPassword(session.user.id, newPassword)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("First login change password error:", error)
    return NextResponse.json({ success: false, error: "Failed to change password" }, { status: 500 })
  }
}
