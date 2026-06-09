"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const noticeSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(5, "Content required"),
  targetAudience: z.string().min(1, "Audience required"),
  createdBy: z.string().min(1),
})

export async function getNotices() {
  return prisma.notice.findMany({
    include: {
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createNotice(formData: FormData) {
  try {
    const title = (formData.get("title") || "").toString().trim()
    const description = (formData.get("description") || "").toString().trim()
    const targetAudience = (formData.get("targetAudience") || "").toString().trim()

    if (!title || title.length < 3) return { success: false, error: "Title must be at least 3 characters" }
    if (!description || description.length < 5) return { success: false, error: "Description must be at least 5 characters" }
    if (!targetAudience) return { success: false, error: "Audience is required" }

    const users = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    })

    if (users.length === 0) {
      return { success: false, error: "No admin user found" }
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        description,
        targetAudience,
        createdBy: users[0].id,
      },
      include: {
        creator: { select: { name: true } },
      },
    })

    revalidatePath("/admin/announcements")
    revalidatePath("/admin/notices")
    return { success: true, data: notice }
  } catch (error) {
    console.error("Error creating notice:", error)
    return { success: false, error: "Failed to create notice" }
  }
}

export async function deleteNotice(id: string) {
  try {
    await prisma.notice.delete({ where: { id } })
    revalidatePath("/admin/announcements")
    revalidatePath("/admin/notices")
    return { success: true }
  } catch (error) {
    console.error("Error deleting notice:", error)
    return { success: false, error: "Failed to delete notice" }
  }
}

export async function createDepartmentNotice(data: {
  title: string
  description: string
  targetAudience: string
  departmentId: string
  createdByUserId: string
}) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId: data.createdByUserId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }
    if (hod.departmentId !== data.departmentId) return { success: false, error: "Forbidden" }

    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        description: data.description,
        targetAudience: data.targetAudience,
        createdBy: data.createdByUserId,
      },
      include: {
        creator: { select: { name: true } },
      },
    })

    revalidatePath("/hod/notices")
    return { success: true, data: notice }
  } catch (error) {
    console.error("Error creating department notice:", error)
    return { success: false, error: "Failed to create notice" }
  }
}

export async function getHodNotices(userId: string) {
  try {
    const hod = await prisma.faculty.findUnique({
      where: { userId },
      include: { hodAssignments: { where: { isActive: true } } },
    })
    if (!hod?.hodAssignments[0]) return { success: false, error: "Not authorized" }

    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          { targetAudience: "ALL" },
          { targetAudience: "HOD" },
          { targetAudience: "FACULTY" },
        ],
      },
      include: {
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return { success: true, data: notices }
  } catch (error) {
    console.error("Error fetching HoD notices:", error)
    return { success: false, error: "Failed to fetch notices" }
  }
}
