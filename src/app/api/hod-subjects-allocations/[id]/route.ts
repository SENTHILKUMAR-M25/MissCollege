import {NextRequest, NextResponse} from "next/server"
import prisma from "@/lib/prisma"

function getHodFacultyUserId(req: NextRequest) {
  try {
    const session = req.cookies.get("next-auth.session-token")?.value || req.cookies.get("__Secure-next-auth.session-token")?.value
    if (!session) return null
    const decoded = JSON.parse(Buffer.from(session, "base64").toString())
    return decoded.user.id
  } catch {
    return null
  }
}

async function assertHod(facultyUserId: string) {
  const hod = await prisma.faculty.findUnique({where: {userId: facultyUserId}, include: {hodAssignments: {where: {isActive: true}}}})
  if (!hod?.hodAssignments[0]) throw new Error("Not authorized")
  return hod
}

export async function DELETE(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  try {
    const facultyUserId = getHodFacultyUserId(req)
    if (!facultyUserId) return NextResponse.json({success: false, error: "Unauthorized"}, {status: 401})
    const hod = await assertHod(facultyUserId)

    const {id} = await params

    const record = await prisma.facultySubject.findUnique({
      where: {id},
      include: {subject: {select: {departmentId: true, code: true}}},
    })
    if (!record) return NextResponse.json({success: false, error: "Not found"}, {status: 404})
    if (record.subject.departmentId !== hod.departmentId) return NextResponse.json({success: false, error: "Access denied"}, {status: 403})

    await prisma.facultySubject.update({
      where: {id},
      data: {isActive: false, removedAt: new Date(), notes: "Removed by HOD"},
    })

    await prisma.auditLog.create({
      data: {userId: facultyUserId, action: "REMOVE_ALLOCATION", entityType: "FacultySubject", entityId: id, details: `Removed allocation for subject ${record.subject.code}`},
    })

    return NextResponse.json({success: true})
  } catch (err: any) {
    console.error("DELETE hod-subjects-allocations error:", err)
    return NextResponse.json({success: false, error: err.message || "Failed"}, {status: 500})
  }
}
