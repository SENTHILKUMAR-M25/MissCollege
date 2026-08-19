"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/permissions"
import { z } from "zod"

const createAssignmentSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(5, "Description required"),
  instructions: z.string().optional(),
  subjectId: z.string().min(1),
  facultyId: z.string().min(1),
  className: z.string().min(1),
  section: z.string().min(1),
  semester: z.coerce.number().min(1).max(8),
  academicYear: z.string().min(1),
  dueDate: z.coerce.date(),
  totalMarks: z.coerce.number().min(1).max(1000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  attachmentUrls: z.array(z.string()).optional(),
  allowResubmission: z.boolean().default(false),
  maxResubmissions: z.coerce.number().min(0).max(5).optional(),
  plagiarismCheck: z.boolean().default(false),
})

export async function createAssignment(data: z.infer<typeof createAssignmentSchema>) {
  try {
    console.log("createAssignment input:", JSON.stringify(data))
    const session = await getSession()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      select: { id: true, departmentId: true },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const parsed = createAssignmentSchema.safeParse(data)
    if (!parsed.success) {
      console.error("Validation errors:", JSON.stringify(parsed.error.issues))
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" }
    }

    const d = parsed.data

    const subject = await prisma.subject.findUnique({
      where: { id: d.subjectId },
      select: { id: true, departmentId: true, name: true, code: true },
    })
    if (!subject) return { success: false, error: "Subject not found" }
    if (subject.departmentId !== faculty.departmentId) {
      return { success: false, error: "Subject does not belong to your department" }
    }

    if (d.facultyId !== faculty.id) {
      return { success: false, error: "You can only create assignments for yourself" }
    }

    if (subject.semester && subject.semester !== d.semester) {
      return { success: false, error: "Subject does not belong to the selected semester" }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: d.title,
        description: d.description,
        instructions: d.instructions,
        subjectId: d.subjectId,
        facultyId: d.facultyId,
        className: d.className,
        section: d.section,
        dueDate: d.dueDate,
        totalMarks: d.totalMarks,
        priority: d.priority,
        attachmentUrls: d.attachmentUrls || [],
        allowResubmission: d.allowResubmission,
        maxResubmissions: d.maxResubmissions ?? (d.allowResubmission ? 1 : 0),
        plagiarismCheck: d.plagiarismCheck,
        status: "PUBLISHED",
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: { include: { user: { select: { name: true, email: true } } } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_ASSIGNMENT",
        entityType: "Assignment",
        entityId: assignment.id,
        details: `Created assignment "${assignment.title}" for ${subject.name} (${subject.code}) Class ${d.className} - ${d.section}`,
      },
    })

    revalidatePath("/faculty/assignments")
    revalidatePath("/student/assignments")
    revalidatePath("/hod/assignments")
    revalidatePath("/admin/assignments")

    return { success: true, data: assignment }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return { success: false, error: "Failed to create assignment" }
  }
}

export async function getFacultyAssignmentsV2(facultyId: string, filters?: { subjectId?: string; className?: string; section?: string; status?: string }) {
  try {
    const where: any = { facultyId }
    if (filters?.subjectId) where.subjectId = filters.subjectId
    if (filters?.className) where.className = filters.className
    if (filters?.section) where.section = filters.section

    const [assignments, stats] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true, code: true, semester: true } },
          submissions: {
            include: {
              student: {
                include: {
                  user: { select: { name: true } },
                  department: { select: { code: true } },
                  course: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.assignmentSubmission.groupBy({
        by: ["assignmentId"],
        where: { assignment: { facultyId } },
        _count: { id: true },
        _avg: { grade: true },
      }),
    ])

    const statsMap = new Map(stats.map(s => [s.assignmentId, s]))

    const enriched = assignments.map(a => {
      const st = statsMap.get(a.id)
      return {
        ...a,
        submissionCount: st?._count?.id ?? 0,
        gradedCount: st?._count?.id ?? 0,
        avgGrade: st?._avg?.grade ?? null,
        totalSubmissions: st?._count?.id ?? 0,
      }
    })

    return { success: true, data: enriched }
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return { success: false, error: "Failed to fetch assignments" }
  }
}

export async function getAssignmentById(id: string) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        faculty: { include: { user: { select: { name: true, email: true } } } },
        submissions: {
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true } },
                department: { select: { name: true, code: true } },
                course: { select: { name: true } },
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    })

    if (!assignment) return { success: false, error: "Assignment not found" }
    return { success: true, data: assignment }
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return { success: false, error: "Failed to fetch assignment" }
  }
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string, facultyUserId: string) {
  try {
    const session = await getSession()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: session.user.id },
      select: { id: true, departmentId: true },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { id: true, facultyId: true, title: true, totalMarks: true, className: true, section: true } },
      },
    })

    if (!submission) return { success: false, error: "Submission not found" }
    if (submission.assignment.facultyId !== faculty.id) {
      return { success: false, error: "Forbidden: Not your assignment" }
    }
    if (grade < 0 || grade > submission.assignment.totalMarks) {
      return { success: false, error: `Grade must be between 0 and ${submission.assignment.totalMarks}` }
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        gradedAt: new Date(),
        status: "GRADED",
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
        assignment: { select: { title: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "GRADE_SUBMISSION",
        entityType: "AssignmentSubmission",
        entityId: submissionId,
        details: `Graded submission for "${submission.assignment.title}" - Marks: ${grade}/${submission.assignment.totalMarks}`,
      },
    })

    revalidatePath("/faculty/assignments")
    revalidatePath("/student/assignments")
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error grading submission:", error)
    return { success: false, error: "Failed to grade submission" }
  }
}

export async function updateAssignmentStatus(assignmentId: string, status: "PUBLISHED" | "CLOSED" | "DRAFT", facultyId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: { id: true, departmentId: true },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, facultyId: true },
    })

    if (!assignment) return { success: false, error: "Assignment not found" }
    if (assignment.facultyId !== faculty.id) return { success: false, error: "Forbidden" }

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status },
    })

    revalidatePath("/faculty/assignments")
    revalidatePath("/student/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error updating assignment status:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function getStudentAssignments(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: studentId },
      select: { id: true, semester: true, section: true, departmentId: true, courseId: true },
    })

    if (!student) return { success: false, error: "Student not found" }

    const now = new Date()

    const assignments = await prisma.assignment.findMany({
      where: {
        isActive: true,
        status: { in: ["PUBLISHED", "CLOSED"] },
        section: student.section,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        submissions: {
          where: { studentId: student.id },
          select: { id: true, submittedAt: true, grade: true, feedback: true, status: true, isLate: true, fileUrl: true },
        },
      },
      orderBy: { dueDate: "asc" },
    })

    const result = assignments.map(a => {
      const submission = a.submissions[0]
      const isOverdue = !submission && new Date(a.dueDate) < now
      const isLate = submission?.isLate
      return {
        ...a,
        submission,
        isOverdue: !!isOverdue,
        isLate: !!isLate,
      }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    return { success: false, error: "Failed to fetch assignments" }
  }
}

export async function submitAssignment(assignmentId: string, studentId: string, submissionText?: string, fileUrl?: string) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, dueDate: true, status: true, allowResubmission: true, maxResubmissions: true },
    })

    if (!assignment) return { success: false, error: "Assignment not found" }
    if (assignment.status === "CLOSED") return { success: false, error: "Assignment is closed" }

    const now = new Date()
    const isLate = now > assignment.dueDate

    const existing = await prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId },
      orderBy: { submittedAt: "desc" },
    })

    if (existing) {
      if (!assignment.allowResubmission) {
        return { success: false, error: "Resubmission not allowed" }
      }
      const resubCount = await prisma.assignmentSubmission.count({
        where: { assignmentId, studentId },
      })
      if (resubCount >= (assignment.maxResubmissions ?? 1)) {
        return { success: false, error: "Maximum resubmissions reached" }
      }
    }

    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        submissionText,
        fileUrl,
        isLate,
        status: existing ? "RESUBMITTED" : "SUBMITTED",
      },
      include: {
        assignment: { select: { title: true, totalMarks: true } },
        student: { include: { user: { select: { name: true } } } },
      },
    })

    revalidatePath("/student/assignments")
    revalidatePath("/faculty/assignments")
    return { success: true, data: submission }
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return { success: false, error: "Failed to submit assignment" }
  }
}

export async function getAssignmentStatistics(facultyId: string) {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { facultyId },
      include: {
        submissions: { select: { id: true, grade: true, submittedAt: true, status: true } },
        subject: { select: { name: true, code: true } },
      },
    })

    const totalAssignments = assignments.length
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions.length, 0)
    const gradedCount = assignments.reduce((sum, a) => sum + a.submissions.filter(s => s.grade != null).length, 0)
    const lateCount = assignments.reduce((sum, a) => sum + a.submissions.filter(s => s.status === "LATE").length, 0)

    const avgGrades: Record<string, number> = {}
    for (const a of assignments) {
      const grades = a.submissions.filter(s => s.grade != null).map(s => s.grade as number)
      if (grades.length > 0) {
        avgGrades[a.id] = Math.round((grades.reduce((x, y) => x + y, 0) / grades.length) * 10) / 10
      }
    }

    return {
      success: true,
      data: {
        totalAssignments,
        totalSubmissions,
        gradedCount,
        pendingCount: totalSubmissions - gradedCount,
        lateCount,
        assignments: assignments.map(a => ({
          id: a.id,
          title: a.title,
          subject: a.subject,
          totalMarks: a.totalMarks,
          submissions: a.submissions.length,
          graded: a.submissions.filter(s => s.grade != null).length,
          avgGrade: avgGrades[a.id] || null,
        })),
      },
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return { success: false, error: "Failed to fetch statistics" }
  }
}

export async function deleteAssignment(assignmentId: string, facultyUserId: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { userId: facultyUserId },
      select: { id: true },
    })
    if (!faculty) return { success: false, error: "Faculty not found" }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, facultyId: true },
    })

    if (!assignment) return { success: false, error: "Assignment not found" }
    if (assignment.facultyId !== faculty.id) return { success: false, error: "Forbidden" }

    await prisma.assignment.delete({ where: { id: assignmentId } })

    revalidatePath("/faculty/assignments")
    revalidatePath("/student/assignments")
    return { success: true, message: "Assignment deleted" }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return { success: false, error: "Failed to delete assignment" }
  }
}
