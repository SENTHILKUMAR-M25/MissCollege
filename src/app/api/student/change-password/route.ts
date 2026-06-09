import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getSession } from "@/lib/permissions"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const { currentPassword, newPassword } = await req.json()
    if (!newPassword || newPassword.length < 6)
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed, passwordChanged: true } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
