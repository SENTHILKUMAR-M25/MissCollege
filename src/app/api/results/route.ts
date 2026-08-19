import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import prisma from "@/lib/prisma"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examTypeId = searchParams.get("examTypeId")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {}
    if (examTypeId) where.examTypeId = examTypeId
    if (status) where.status = status

    const userRole = session.user.role as Role
    if (userRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (student) {
        where.studentId = student.id
      }
    } else if (userRole === "FACULTY") {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (faculty) {
        where.subject = { facultyId: faculty.id }
      }
    }

    const [results, total] = await Promise.all([
      prisma.examResult.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
              department: {
                select: { id: true, name: true, code: true },
              },
              course: {
                select: { id: true, name: true },
              },
            },
          },
          examType: true,
          subject: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.examResult.count({ where }),
    ])

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!EXAM_ROLES.includes(session.user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, subjectId, examTypeId, marks, maxMarks, grade, status } = body

    if (!studentId || !subjectId || !examTypeId || marks === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (marks < 0 || marks > maxMarks) {
      return NextResponse.json({ error: "Marks must be between 0 and max marks" }, { status: 400 })
    }

    const result = await prisma.examResult.create({
      data: {
        studentId,
        subjectId,
        examTypeId,
        marks,
        maxMarks: maxMarks || 100,
        grade: grade || null,
        status: status || "PUBLISHED",
      },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        examType: true,
        subject: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating result:", error)
    return NextResponse.json({ error: "Failed to create result" }, { status: 500 })
  }
}
