import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import prisma from "@/lib/prisma"

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetAudience = searchParams.get("targetAudience") || "ALL"
    const departmentId = searchParams.get("departmentId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      OR: [{ targetAudience: "ALL" }, { targetAudience: targetAudience }],
    }

    if (departmentId && ADMIN_ROLES.includes(session.user.role as Role)) {
      where.departmentId = departmentId
    } else if (session.user.role === "HOD") {
      const hodAssignment = await prisma.hodAssignment.findFirst({
        where: { facultyId: session.user.id, isActive: true },
        select: { departmentId: true },
      })
      if (hodAssignment) {
        where.departmentId = hodAssignment.departmentId
      }
    }

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notice.count({ where }),
    ])

    return NextResponse.json({
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notices:", error)
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ADMIN_ROLES.includes(session.user.role as Role) && session.user.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, targetAudience, departmentId, priority, expiresAt } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        description: content,
        targetAudience: targetAudience || "ALL",
        departmentId: departmentId || null,
        priority: priority || "MEDIUM",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, role: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error("Error creating notice:", error)
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 })
  }
}
