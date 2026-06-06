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
  // We use a system admin user for notices - find or create
  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  })

  if (!adminUser) {
    return { success: false, error: "No admin user found" }
  }

  const data = noticeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    targetAudience: formData.get("targetAudience") ?? "All",
    createdBy: adminUser.id,
  })

  if (!data.success) {
    return { success: false, error: data.error.issues[0]?.message || "Invalid notice details" }
  }

  await prisma.notice.create({ data: data.data })
  revalidatePath("/admin/announcements")
  return { success: true }
}

export async function deleteNotice(id: string) {
  await prisma.notice.delete({ where: { id } })
  revalidatePath("/admin/announcements")
  return { success: true }
}
