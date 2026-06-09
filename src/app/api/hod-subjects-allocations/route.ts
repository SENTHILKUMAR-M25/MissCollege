import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/permissions"

async function getHodFacultyUserId() {
  const session = await getSession()
  return session?.user?.id || null
}

async function assertHod(facultyUserId: string) {
  const hod = await prisma.faculty.findUnique({
    where: { userId: facultyUserId },
    include: { hodAssignments: { where: { isActive: true } }, department: { select: { id: true, name: true } } },
  })
  if (!hod?.hodAssignments[0]) throw new Error("Not authorized")
  return hod
}

export async function GET(req: NextRequest) {
  try {
    const facultyUserId = await getHodFacultyUserId()
    if (!facultyUserId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const hod = await assertHod(facultyUserId)

    const { searchParams } = new URL(req.url)
    const ay = searchParams.get("academicYear") || undefined
    const sem = searchParams.get("semester") || undefined

    const [allocations, subjects, faculty] = await Promise.all([
      prisma.facultySubject.findMany({
        where: {
          isActive: true,
          subject: {
            departmentId: hod.departmentId,
            ...(ay ? { academicYear: ay } : {}),
            ...(sem ? { semester: Number(sem) } : {}),
          },
        },
        include: {
          subject: { select: { id: true, code: true, name: true, academicYear: true, totalHoursPerWeek: true, semester: true } },
          faculty: { select: { facultyId: true, user: { select: { name: true, email: true } } } },
        },
        orderBy: { assignedAt: "desc" },
      }),
      prisma.subject.findMany({
        where: { departmentId: hod.departmentId, isActive: true, ...(ay ? { academicYear: ay } : {}), ...(sem ? { semester: Number(sem) } : {}) },
        select: { id: true, code: true, name: true, semester: true, academicYear: true, subjectType: true, totalHoursPerWeek: true, credits: true },
        orderBy: [{ semester: "asc" }, { code: "asc" }],
      }),
      prisma.faculty.findMany({
        where: { departmentId: hod.departmentId, accountStatus: true },
        select: { id: true, facultyId: true, user: { select: { name: true, email: true } }, designation: true },
        orderBy: { facultyId: "asc" },
      }),
    ])

    return NextResponse.json({ success: true, data: { allocations, subjects, faculty, departmentName: hod.department?.name || "" } })
  } catch (err: any) {
    console.error("GET hod-subjects-allocations error:", err)
    return NextResponse.json({ success: false, error: err.message || "Failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const facultyUserId = await getHodFacultyUserId()
    if (!facultyUserId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const hod = await assertHod(facultyUserId)

    const body = await req.json()
    const { action, subjectId, facultyIds, hoursMap, notes } = body

    if (action === "allocate") {
      if (!subjectId || !facultyIds?.length) return NextResponse.json({ success: false, error: "Subject and faculty required" }, { status: 400 })

      const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
      if (!subject || subject.departmentId !== hod.departmentId) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })

      const existingLinks = await prisma.facultySubject.findMany({
        where: { subjectId, isActive: true },
        select: { id: true, facultyId: true },
      })

      for (const link of existingLinks) {
        if (!facultyIds.includes(link.facultyId)) {
          await prisma.facultySubject.update({ where: { id: link.id }, data: { isActive: false, removedAt: new Date(), notes: "Removed by HOD" } })
        }
      }

      for (const fid of facultyIds) {
        const dup = await prisma.facultySubject.findFirst({
          where: { facultyId: fid, subjectId, isActive: true },
        })
        if (!dup) {
          await prisma.facultySubject.create({
            data: {
              facultyId: fid,
              subjectId,
              assignedBy: facultyUserId,
              isActive: true,
              assignedHours: hoursMap?.[fid] || 0,
              notes: notes || `Allocated by HOD`,
            },
          })
        } else if (hoursMap?.[fid] !== undefined) {
          await prisma.facultySubject.update({ where: { id: dup.id }, data: { assignedHours: hoursMap[fid] } })
        }
      }

      await prisma.auditLog.create({
        data: { userId: facultyUserId, action: "ALLOCATE", entityType: "FacultySubject", entityId: subjectId, details: `Allocated ${facultyIds.length} faculty to ${subject.code}` },
      })

      return NextResponse.json({ success: true, data: { allocated: facultyIds.length } })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    console.error("POST hod-subjects-allocations error:", err)
    return NextResponse.json({ success: false, error: err.message || "Failed" }, { status: 500 })
  }
}
