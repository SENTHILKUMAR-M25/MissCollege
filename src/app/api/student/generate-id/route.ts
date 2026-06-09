import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const departmentId = searchParams.get("departmentId")
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

  if (!departmentId) return NextResponse.json({ success: false, error: "departmentId required" }, { status: 400 })

  try {
    const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { code: true } })
    const code = dept?.code?.toUpperCase() || "GEN"
    const yy = String(year).slice(-2)           // last 2 digits of year
    const prefix = `${yy}${code}`               // e.g. "22CS"
    const last = await prisma.student.findFirst({
      where: { registerNumber: { startsWith: prefix } },
      orderBy: { registerNumber: "desc" },
    })
    const seq = last ? parseInt(last.registerNumber.slice(prefix.length)) + 1 : 1
    const id = `${prefix}${String(seq).padStart(3, "0")}`  // e.g. 22CS001
    return NextResponse.json({ success: true, data: id })
  } catch {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
