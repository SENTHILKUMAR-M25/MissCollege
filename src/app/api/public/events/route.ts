import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "5")
    const upcoming = searchParams.get("upcoming") === "true"

    const where: any = {}
    if (upcoming) {
      where.date = { gte: new Date() }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
