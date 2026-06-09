import { NextResponse } from "next/server"
import { changeHodPassword } from "@/actions/hod-actions"

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, error: "User ID and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const result = await changeHodPassword(userId, newPassword)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Change password API error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    )
  }
}
