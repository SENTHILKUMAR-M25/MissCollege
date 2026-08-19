"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/permissions"

// ── Generate application number ────────────────────────────────────────────
async function generateApplicationNo(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2)
  const count = await prisma.application.count()
  return `APP${year}${String(count + 1).padStart(4, "0")}`
}

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC — Submit Contact Form (routes to Enquiry table)
// ══════════════════════════════════════════════════════════════════════════
export async function submitContactForm(data: {
  name: string; email: string; phone: string; subject: string; message: string
}) {
  try {
    if (!data.name || !data.email || !data.phone || !data.message) {
      return { success: false, error: "Name, email, phone and message are required" }
    }
    const course = data.subject === "Admissions Inquiry" ? "Admissions"
      : data.subject === "Academic Information" ? "Academic"
      : data.subject === "Placement Query" ? "Placements"
      : data.subject === "General Inquiry" ? "General"
      : "General"
    const enquiry = await prisma.enquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        course,
        message: data.message.trim(),
        source: "contact_form",
        status: "PENDING",
      },
    })
    await prisma.enquiryAuditLog.create({
      data: {
        enquiryId: enquiry.id,
        action: "CONTACT_FORM_SUBMITTED",
        toStatus: "PENDING",
        doneBy: data.name,
        remarks: `Contact form: ${data.subject}`,
      },
    })
    revalidatePath("/admin/enquiries")
    return { success: true, id: enquiry.id }
  } catch (error: any) {
    console.error("submitContactForm error:", error)
    return { success: false, error: error.message || "Failed to submit message" }
  }
}

export async function submitEnquiry(data: {
  name: string; email: string; phone: string; course: string; message: string
}) {
  try {
    if (!data.name || !data.email || !data.phone || !data.course) {
      return { success: false, error: "All required fields must be filled" }
    }
    const enquiry = await prisma.enquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        course: data.course.trim(),
        message: data.message.trim(),
        status: "PENDING",
      },
    })
    await prisma.enquiryAuditLog.create({
      data: {
        enquiryId: enquiry.id,
        action: "ENQUIRY_SUBMITTED",
        toStatus: "PENDING",
        doneBy: "PUBLIC",
        doneByName: data.name,
        remarks: "Submitted via website",
      },
    })
    revalidatePath("/admin/enquiries")
    return { success: true, id: enquiry.id }
  } catch (error: any) {
    console.error("submitEnquiry error:", error)
    return { success: false, error: error.message || "Failed to submit enquiry" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC — Submit Application (no auth required) - used by /apply page
// ══════════════════════════════════════════════════════════════════════════
export async function submitApplication(data: {
  name: string; email: string; phone: string; dob?: string; gender?: string
  address?: string; courseApplied: string; department?: string
  previousSchool?: string; previousBoard?: string; previousPercent?: string
  qualification?: string; parentName?: string; parentPhone?: string; parentOccupation?: string
}) {
  try {
    if (!data.name || !data.email || !data.phone || !data.courseApplied) {
      return { success: false, error: "All required fields must be filled" }
    }
    const applicationNo = await generateApplicationNo()
    const application = await prisma.application.create({
      data: {
        ...data,
        email: data.email.trim().toLowerCase(),
        applicationNo,
        status: "SUBMITTED",
      },
    })
    await prisma.applicationAuditLog.create({
      data: {
        applicationId: application.id,
        action: "APPLICATION_SUBMITTED",
        toStatus: "SUBMITTED",
        doneBy: "PUBLIC",
        doneByName: data.name,
        remarks: `Application No: ${applicationNo}`,
      },
    })
    revalidatePath("/admin/applications")
    return { success: true, id: application.id, applicationNo }
  } catch (error: any) {
    console.error("submitApplication error:", error)
    return { success: false, error: error.message || "Failed to submit application" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC — Submit application from course modal / public website
// ══════════════════════════════════════════════════════════════════════════
export async function submitCourseApplication(data: {
  name: string; email: string; phone: string; dob?: string; gender?: string; address?: string
  courseApplied: string; department?: string
  previousSchool?: string; previousBoard?: string; previousPercent?: string
  qualification?: string; source?: string; message?: string
}) {
  try {
    if (!data.name || !data.email || !data.phone || !data.courseApplied) {
      return { success: false, error: "Name, email, phone and course are required" }
    }
    const appNo = await generateApplicationNo()
    const application = await prisma.application.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        dob: data.dob || "",
        gender: data.gender || "",
        address: data.address?.trim(),
        courseApplied: data.courseApplied.trim(),
        department: data.department?.trim(),
        previousSchool: data.previousSchool?.trim(),
        previousBoard: data.previousBoard?.trim(),
        previousPercent: data.previousPercent?.trim(),
        qualification: data.qualification?.trim(),
        source: data.source || "website",
        applicationNo: appNo,
        status: "SUBMITTED",
      },
    })
    await prisma.applicationAuditLog.create({
      data: {
        applicationId: application.id,
        action: "APPLICATION_SUBMITTED",
        toStatus: "SUBMITTED",
        doneBy: "PUBLIC",
        doneByName: data.name,
        remarks: data.message || `Application via course modal: App No ${appNo}`,
      },
    })
    revalidatePath("/admin/applications")
    return { success: true, applicationNo: appNo }
  } catch (error: any) {
    console.error("submitCourseApplication error:", error)
    return { success: false, error: error.message || "Failed to submit application" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Get all enquiries with filters
// ══════════════════════════════════════════════════════════════════════════
export async function getEnquiries(filters?: {
  status?: string; search?: string; course?: string; page?: number
}) {
  try {
    const page = filters?.page || 1
    const take = 20
    const skip = (page - 1) * take
    const where: any = {}
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.course && filters.course !== "ALL") where.course = filters.course
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ]
    }
    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where, orderBy: { createdAt: "desc" }, take, skip,
        include: { auditLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      prisma.enquiry.count({ where }),
    ])
    return { success: true, data: enquiries, total, page, totalPages: Math.ceil(total / take) }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch enquiries" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Get all applications with filters
// ══════════════════════════════════════════════════════════════════════════
export async function getApplications(filters?: {
  status?: string; search?: string; course?: string; page?: number
}) {
  try {
    const page = filters?.page || 1
    const take = 20
    const skip = (page - 1) * take
    const where: any = {}
    if (filters?.status && filters.status !== "ALL") where.status = filters.status
    if (filters?.course && filters.course !== "ALL") where.courseApplied = filters.course
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { applicationNo: { contains: filters.search, mode: "insensitive" } },
      ]
    }
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where, orderBy: { createdAt: "desc" }, take, skip,
        include: { auditLogs: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      prisma.application.count({ where }),
    ])
    return { success: true, data: applications, total, page, totalPages: Math.ceil(total / take) }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch applications" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Update enquiry status
// ══════════════════════════════════════════════════════════════════════════
export async function updateEnquiryStatus(
  id: string, status: string, remarks?: string, assignedTo?: string
) {
  try {
    const session = await getSession()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const existing = await prisma.enquiry.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Enquiry not found" }

    const updateData: any = { status, updatedAt: new Date() }
    if (remarks !== undefined) updateData.remarks = remarks
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (status === "RESPONDED") updateData.respondedAt = new Date()
    if (status === "CLOSED") updateData.closedAt = new Date()

    await prisma.enquiry.update({ where: { id }, data: updateData })
    await prisma.enquiryAuditLog.create({
      data: {
        enquiryId: id,
        action: `STATUS_CHANGED_TO_${status}`,
        fromStatus: existing.status,
        toStatus: status,
        remarks: remarks || null,
        doneBy: session.user.id,
        doneByName: session.user.name || "Admin",
      },
    })

    revalidatePath("/admin/enquiries")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update enquiry" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Update application status
// ══════════════════════════════════════════════════════════════════════════
export async function updateApplicationStatus(
  id: string, status: string, remarks?: string, correctionNote?: string, assignedTo?: string
) {
  try {
    const session = await getSession()
    if (!session?.user) return { success: false, error: "Unauthorized" }

    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Application not found" }

    const updateData: any = { status, updatedAt: new Date() }
    if (remarks !== undefined) updateData.remarks = remarks
    if (correctionNote !== undefined) updateData.correctionNote = correctionNote
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (status === "UNDER_REVIEW") updateData.reviewedAt = new Date()
    if (["APPROVED", "REJECTED", "SHORTLISTED"].includes(status)) updateData.decidedAt = new Date()

    await prisma.application.update({ where: { id }, data: updateData })
    await prisma.applicationAuditLog.create({
      data: {
        applicationId: id,
        action: `STATUS_CHANGED_TO_${status}`,
        fromStatus: existing.status,
        toStatus: status,
        remarks: remarks || correctionNote || null,
        doneBy: session.user.id,
        doneByName: session.user.name || "Admin",
      },
    })

    revalidatePath("/admin/applications")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update application" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Dashboard stats
// ══════════════════════════════════════════════════════════════════════════
export async function getEnquiryApplicationStats() {
  try {
    const [
      totalEnquiries, pendingEnquiries, reviewedEnquiries, closedEnquiries,
      totalApplications, submittedApps, underReviewApps, shortlistedApps,
      approvedApps, rejectedApps, correctionApps,
    ] = await Promise.all([
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "PENDING" } }),
      prisma.enquiry.count({ where: { status: "REVIEWED" } }),
      prisma.enquiry.count({ where: { status: "CLOSED" } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: "SUBMITTED" } }),
      prisma.application.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.application.count({ where: { status: "SHORTLISTED" } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({ where: { status: "CORRECTION_NEEDED" } }),
    ])
    return {
      success: true,
      data: {
        totalEnquiries, pendingEnquiries, reviewedEnquiries, closedEnquiries,
        totalApplications, submittedApps, underReviewApps, shortlistedApps,
        approvedApps, rejectedApps, correctionApps,
        pendingApplications: submittedApps + underReviewApps + correctionApps,
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch stats" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Get single enquiry/application with full audit trail
// ══════════════════════════════════════════════════════════════════════════
export async function getEnquiryById(id: string) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: { auditLogs: { orderBy: { createdAt: "asc" } } },
    })
    return enquiry ? { success: true, data: enquiry } : { success: false, error: "Not found" }
  } catch {
    return { success: false, error: "Failed to fetch enquiry" }
  }
}

export async function getApplicationById(id: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { auditLogs: { orderBy: { createdAt: "asc" } } },
    })
    return application ? { success: true, data: application } : { success: false, error: "Not found" }
  } catch {
    return { success: false, error: "Failed to fetch application" }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ADMIN — Delete enquiry / application
// ══════════════════════════════════════════════════════════════════════════
export async function deleteEnquiry(id: string) {
  try {
    await prisma.enquiry.delete({ where: { id } })
    revalidatePath("/admin/enquiries")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete" }
  }
}

export async function deleteApplication(id: string) {
  try {
    await prisma.application.delete({ where: { id } })
    revalidatePath("/admin/applications")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to delete" }
  }
}
