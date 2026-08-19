import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import prisma from "@/lib/prisma"

const ADMIN_ROLES = [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const where: any = { userId: session.user.id }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          notice: {
            include: {
              creator: {
                select: { id: true, name: true, email: true, role: true },
              },
              department: {
                select: { id: true, name: true, code: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { noticeId, type, message, link } = body

    if (!noticeId) {
      return NextResponse.json({ error: "Notice ID is required" }, { status: 400 })
    }

    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { id: true, targetAudience: true, departmentId: true },
    })

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 })
    }

    let targetUsers: any[] = []

    if (notice.targetAudience === "ALL") {
      targetUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      })
    } else {
      const roleMap: Record<string, any> = {
        STUDENT: { role: "STUDENT" },
        FACULTY: { role: "FACULTY" },
        HOD: { role: "HOD" },
        ADMIN: { role: { in: ADMIN_ROLES.map(r => r as any) } },
      }

      const userWhere: any = { isActive: true }
      if (notice.targetAudience === "DEPARTMENT" && notice.departmentId) {
        const deptUsers = await prisma.user.findMany({
          where: {
            OR: [
              { student: { some: { departmentId: notice.departmentId } } },
              { faculty: { some: { departmentId: notice.departmentId } } },
            ],
          },
          select: { id: true },
        })
        targetUsers = deptUsers
      } else if (roleMap[notice.targetAudience]) {
        Object.assign(userWhere, roleMap[notice.targetAudience])
        targetUsers = await prisma.user.findMany({
          where: userWhere,
          select: { id: true },
        })
      }
    }

    const notificationsToCreate = targetUsers.map((user) => ({
      userId: user.id,
      noticeId: notice.id,
      type: type || "NOTICE",
      message: message || notice.title,
      link: link || null,
    }))

    const createdNotifications = await prisma.notification.createMany({
      data: notificationsToCreate,
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      count: createdNotifications.count,
    })
  } catch (error) {
    console.error("Error creating notifications:", error)
    return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 })
  }
}
