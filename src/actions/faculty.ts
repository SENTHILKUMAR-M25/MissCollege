"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import bcrypt from "bcryptjs"
import { FACULTY_DESIGNATIONS, FACULTY_PREFIXES, type FacultyDesignation } from "@/lib/faculty"

// NOTE: Faculty hiring and account creation is admin-only.
// HODs are not allowed to hire faculty via this action.

const facultySchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional().transform(v => v ? new Date(v) : undefined),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  alternateNumber: z.string().optional(),
  address: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  designation: z.enum(FACULTY_DESIGNATIONS, "Designation is required"),
  qualification: z.string().min(2, "Qualification is required"),
  specialization: z.string().optional(),
  experience: z.coerce.number().optional(),
  joiningDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
  password: z.string().optional(),
  accountStatus: z.string().optional().transform(v => v === "false" ? false : true),
  assignedSemesters: z.string().optional(),
  assignedSections: z.string().optional(),
  profilePhoto: z.string().optional(),
  resumeUrl: z.string().optional(),
  appointmentOrderUrl: z.string().optional(),
  joiningLetterUrl: z.string().optional(),
  eduCertificatesUrl: z.string().optional(),
  experienceCertificatesUrl: z.string().optional(),
  aadharCardUrl: z.string().optional(),
  panCardUrl: z.string().optional(),
  idCardUrl: z.string().optional(),
  bankDetailsUrl: z.string().optional(),
  relievingLetterUrl: z.string().optional(),
  assignedSubjects: z.string().optional(),
})

type FacultyData = z.infer<typeof facultySchema>

function getDesignationPrefix(designation: string): string {
  return FACULTY_PREFIXES[designation as FacultyDesignation] || "FAC"
}

async function nextFacultyId(tx: any, designation: string): Promise<string> {
  const prefix = `MISS-${getDesignationPrefix(designation)}-`
  const latest = await tx.faculty.findFirst({
    where: { facultyId: { startsWith: prefix } },
    orderBy: { facultyId: "desc" },
    select: { facultyId: true },
  })

  const latestSequence = latest?.facultyId
    ? Number.parseInt(latest.facultyId.slice(prefix.length), 10)
    : 0
  const nextSequence = Number.isFinite(latestSequence) ? latestSequence + 1 : 1

  return `${prefix}${String(nextSequence).padStart(3, "0")}`
}

function parseSubjectIds(value?: string) {
  if (!value) return []
  return Array.from(new Set(value.split(",").map((id) => id.trim()).filter(Boolean)))
}

async function ensureSubjectsExist(subjectIds: string[]) {
  if (subjectIds.length === 0) return
  const count = await prisma.subject.count({
    where: { id: { in: subjectIds } },
  })
  if (count !== subjectIds.length) {
    throw new Error("One or more selected subjects could not be found")
  }
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path)
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error
    }
    console.warn(`Skipped revalidatePath("${path}") because the Next routes manifest is missing.`)
  }
}

async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive: true })
  const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`
  const filePath = join(uploadDir, uniqueName)
  await writeFile(filePath, buffer)
  return `/uploads/${uniqueName}`
}

async function parseFormData(formData: FormData) {
  const rawData: Record<string, any> = {}
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      rawData[key] = await saveFile(value)
    } else if (typeof value === 'string' && value !== "") {
      rawData[key] = value
    }
  }
  return rawData
}

function getAccountStatus(data: FacultyData) {
  return data.accountStatus ?? true
}

export async function addFaculty(formData: FormData) {
  try {
    const rawData = await parseFormData(formData)
    const parsed = facultySchema.safeParse(rawData)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message || "Please fill all required faculty details" }
    }
    const data = parsed.data

    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`.trim()
    const plainPassword = data.password || "password123"
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    const accountStatus = getAccountStatus(data)

    const subjectIds = parseSubjectIds(data.assignedSubjects)
    await ensureSubjectsExist(subjectIds)

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    })

    if (existingUser) {
      return { success: false, error: "A user with this email already exists. Use a different email or edit the existing account." }
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName,
          email: data.email,
          password: hashedPassword,
          role: "FACULTY",
          isActive: accountStatus,
        },
      })

      const faculty = await tx.faculty.create({
        data: {
          userId: user.id,
          facultyId: await nextFacultyId(tx, data.designation),
          departmentId: data.departmentId,
          designation: data.designation,
          qualification: data.qualification,
          phone: data.phone,
          accountStatus: accountStatus,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          profilePhoto: data.profilePhoto,
          alternateNumber: data.alternateNumber,
          address: data.address,
          specialization: data.specialization,
          experience: data.experience,
          joiningDate: data.joiningDate,
          assignedSemesters: data.assignedSemesters,
          assignedSections: data.assignedSections,
          resumeUrl: data.resumeUrl,
          appointmentOrderUrl: data.appointmentOrderUrl,
          joiningLetterUrl: data.joiningLetterUrl,
          eduCertificatesUrl: data.eduCertificatesUrl,
          experienceCertificatesUrl: data.experienceCertificatesUrl,
          aadharCardUrl: data.aadharCardUrl,
          panCardUrl: data.panCardUrl,
          idCardUrl: data.idCardUrl,
          bankDetailsUrl: data.bankDetailsUrl,
          relievingLetterUrl: data.relievingLetterUrl,
        },
      })

      if (subjectIds.length > 0) {
        await tx.subject.updateMany({
          where: { id: { in: subjectIds } },
          data: { facultyId: faculty.id },
        })
      }
    })

    safeRevalidatePath("/admin/faculty")
    safeRevalidatePath("/admin/subjects")
    return { success: true }
  } catch (error: any) {
    console.error("addFaculty error:", error)
    return { success: false, error: error.message || "Failed to add faculty" }
  }
}

export async function updateFaculty(formData: FormData) {
  try {
    const rawData = await parseFormData(formData)
    const parsed = facultySchema.safeParse(rawData)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { success: false, error: firstIssue?.message || "Please fill all required faculty details" }
    }
    const data = parsed.data

    if (!data.id) throw new Error("ID is required")

    const faculty = await prisma.faculty.findUnique({
      where: { id: data.id },
      include: { user: true },
    })

    if (!faculty) throw new Error("Faculty not found")

    const subjectIds = parseSubjectIds(data.assignedSubjects)
    await ensureSubjectsExist(subjectIds)

    const [emailConflict] = await Promise.all([
      prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: faculty.userId },
        },
        select: { id: true },
      }),
    ])

    if (emailConflict) {
      return { success: false, error: "A user with this email already exists. Use a different email." }
    }

    const userUpdateData: any = {
      name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
      email: data.email,
      isActive: getAccountStatus(data),
    }
    if (data.password && data.password.length >= 6) {
      userUpdateData.password = await bcrypt.hash(data.password, 10)
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: faculty.userId },
        data: userUpdateData,
      })

      await tx.faculty.update({
        where: { id: data.id },
        data: {
          departmentId: data.departmentId,
          designation: data.designation,
          qualification: data.qualification,
          phone: data.phone,
          accountStatus: getAccountStatus(data),
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          ...(data.profilePhoto && { profilePhoto: data.profilePhoto }),
          alternateNumber: data.alternateNumber,
          address: data.address,
          specialization: data.specialization,
          experience: data.experience,
          joiningDate: data.joiningDate,
          assignedSemesters: data.assignedSemesters,
          assignedSections: data.assignedSections,
          ...(data.resumeUrl && { resumeUrl: data.resumeUrl }),
          ...(data.appointmentOrderUrl && { appointmentOrderUrl: data.appointmentOrderUrl }),
          ...(data.joiningLetterUrl && { joiningLetterUrl: data.joiningLetterUrl }),
          ...(data.eduCertificatesUrl && { eduCertificatesUrl: data.eduCertificatesUrl }),
          ...(data.experienceCertificatesUrl && { experienceCertificatesUrl: data.experienceCertificatesUrl }),
          ...(data.aadharCardUrl && { aadharCardUrl: data.aadharCardUrl }),
          ...(data.panCardUrl && { panCardUrl: data.panCardUrl }),
          ...(data.idCardUrl && { idCardUrl: data.idCardUrl }),
          ...(data.bankDetailsUrl && { bankDetailsUrl: data.bankDetailsUrl }),
          ...(data.relievingLetterUrl && { relievingLetterUrl: data.relievingLetterUrl }),
        },
      })

      await tx.subject.updateMany({
        where: {
          facultyId: faculty.facultyId,
          ...(subjectIds.length > 0 ? { id: { notIn: subjectIds } } : {}),
        },
        data: { facultyId: null },
      })

      if (subjectIds.length > 0) {
        await tx.subject.updateMany({
          where: { id: { in: subjectIds } },
          data: { facultyId: faculty.id },
        })
      }
    })

    safeRevalidatePath("/admin/faculty")
    safeRevalidatePath("/admin/subjects")
    return { success: true }
  } catch (error: any) {
    console.error("updateFaculty error:", error)
    return { success: false, error: error.message || "Failed to update faculty" }
  }
}

export async function suspendFaculty(id: string) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: { user: true },
    })
    if (!faculty) {
      return { success: false, error: "Faculty not found" }
    }

    const newStatus = !faculty.accountStatus

    await prisma.$transaction(async (tx) => {
      await tx.faculty.update({
        where: { id },
        data: { accountStatus: newStatus },
      })
      await tx.user.update({
        where: { id: faculty.userId },
        data: { isActive: newStatus },
      })
    })

    safeRevalidatePath("/admin/faculty")
    return { success: true }
  } catch (error: any) {
    console.error("suspendFaculty error:", error)
    return { success: false, error: "Failed to update faculty status" }
  }
}

export async function deleteFaculty(id: string) {
  try {
    const faculty = await prisma.faculty.findUnique({ where: { id } })
    if (faculty) {
      await prisma.user.delete({ where: { id: faculty.userId } })
    }
    safeRevalidatePath("/admin/faculty")
    return { success: true }
  } catch (error: any) {
    console.error("deleteFaculty error:", error)
    return { success: false, error: "Failed to delete faculty" }
  }
}
