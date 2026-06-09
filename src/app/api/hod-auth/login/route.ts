import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { facultyId, dateOfBirth } = await request.json()

    if (!facultyId || !dateOfBirth) {
      return NextResponse.json(
        { success: false, error: "Faculty ID and Date of Birth are required" },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.findUnique({
      where: { facultyId },
      include: { user: true },
    })

    if (!faculty?.user || !faculty.user.isActive || !faculty.accountStatus) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    if (faculty.user.role !== "HOD") {
      return NextResponse.json({ success: false, error: "Not authorized as HOD" }, { status: 403 })
    }

    if (faculty.dateOfBirth) {
      const dobDate = new Date(dateOfBirth.replace(/(\d{2})(\d{2})(\d{4})/, "$3-$2-$1"))
      if (isNaN(dobDate.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 })
      }
      const fDob = new Date(faculty.dateOfBirth)
      const match =
        fDob.getFullYear() === dobDate.getFullYear() &&
        fDob.getMonth() === dobDate.getMonth() &&
        fDob.getDate() === dobDate.getDate()
      if (!match) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }
    } else {
      const match = bcrypt.compareSync(dateOfBirth, faculty.user.password)
      if (!match) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }
    }

    return NextResponse.json({ success: true, userId: faculty.user.id })
  } catch (error) {
    console.error("HOD login API error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
