import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import prisma from "@/lib/prisma"
import { z } from "zod"

const EXAM_ROLES: Role[] = [Role.ADMIN, Role.EXAM_ADMIN, Role.ACADEMIC_ADMIN]

const examSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Exam name is required"),
  examTypeId: z.string().min(1, "Exam type is required"),
  subjectId: z.string().min(1, "Subject is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  className: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  semester: z.coerce.number().min(1, "Semester is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  hallId: z.string().optional(),
  invigilatorId: z.string().optional(),
  status: z.enum(["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit
    const where: any = {}

    const userRole = session.user.role as Role

    if (userRole === "FACULTY") {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id },
        select: { id: true, departmentId: true },
      })
      if (faculty) {
        where.departmentId = faculty.departmentId
      }
    } else if (userRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { departmentId: true, className: true, section: true, semester: true },
      })
      if (student) {
        where.departmentId = student.departmentId
        where.className = student.className
        where.section = student.section
        if (student.semester) where.semester = student.semester
      }
    } else if (userRole === "HOD") {
      const hod = await prisma.hodAssignment.findFirst({
        where: { faculty: { userId: session.user.id }, isActive: true },
        select: { departmentId: true },
      })
      if (hod) where.departmentId = hod.departmentId
    } else if (!EXAM_ROLES.includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          examType: true,
          subject: { select: { id: true, name: true, code: true } },
          faculty: { include: { user: { select: { name: true, email: true } } } },
          hall: true,
          invigilator: { include: { faculty: { include: { user: { select: { name: true } } } } } },
        },
        orderBy: { date: "asc" },
        skip,
        take: limit,
      }),
      prisma.exam.count({ where }),
    ])

    return NextResponse.json({
      exams,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching exams:", error)
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !EXAM_ROLES.includes(session.user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = examSchema.parse(body)

    const exam = await prisma.exam.create({
      data: {
        name: parsed.name,
        examTypeId: parsed.examTypeId,
        subjectId: parsed.subjectId,
        facultyId: parsed.facultyId,
        date: new Date(parsed.date),
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        className: parsed.className,
        section: parsed.section,
        semester: parsed.semester,
        academicYear: parsed.academicYear,
        hallId: parsed.hallId,
        invigilatorId: parsed.invigilatorId,
        status: parsed.status,
        departmentId: (await prisma.faculty.findUnique({
          where: { id: parsed.facultyId },
          select: { departmentId: true },
        }))?.departmentId || "",
      },
      include: {
        examType: true,
        subject: { select: { id: true, name: true, code: true } },
        faculty: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    const faculty = await prisma.faculty.findUnique({
      where: { id: parsed.facultyId },
      include: { user: { select: { id: true, name: true } }, department: { select: { id: true, name: true } } },
    })

    if (faculty) {
      await prisma.notification.createMany({
        data: [
          {
            userId: faculty.user.id,
            noticeId: null,
            type: "EXAM_SCHEDULE",
            message: `New exam scheduled: ${parsed.name} on ${parsed.date}`,
            link: `/faculty/examinations`,
          },
          ...(parsed.invigilatorId
            ? [
                {
                  userId: (await prisma.faculty.findUnique({
                    where: { id: parsed.invigilatorId },
                    select: { userId: true },
                  }))?.userId || "",
                  noticeId: null,
                  type: "INVIGILATION_DUTY",
                  message: `You have been assigned as invigilator for ${parsed.name} on ${parsed.date}`,
                  link: `/faculty/examinations`,
                },
              ]
            : []),
        ],
        skipDuplicates: true,
      })
    }

    return NextResponse.json(exam, { status: 201 })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
