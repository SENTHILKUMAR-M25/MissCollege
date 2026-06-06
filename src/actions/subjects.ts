"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  credits: z.coerce.number().min(1, "Credits are required"),
  semester: z.coerce.number().min(1, "Semester is required"),
  departmentId: z.string().min(1, "Department is required"),
  facultyId: z.string().optional(),
})

export async function addSubject(formData: FormData) {
  try {
    const data = subjectSchema.parse({
      name: formData.get("name"),
      code: formData.get("code"),
      credits: formData.get("credits"),
      semester: formData.get("semester"),
      departmentId: formData.get("departmentId"),
      facultyId: formData.get("facultyId") || undefined,
    })

    await prisma.subject.create({
      data,
    })

    revalidatePath("/admin/subjects")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to add subject" }
  }
}

export async function updateSubject(formData: FormData) {
  try {
    const data = subjectSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code"),
      credits: formData.get("credits"),
      semester: formData.get("semester"),
      departmentId: formData.get("departmentId"),
      facultyId: formData.get("facultyId") || undefined,
    })

    if (!data.id) throw new Error("ID is required")

    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        credits: data.credits,
        semester: data.semester,
        departmentId: data.departmentId,
        facultyId: data.facultyId,
      },
    })

    revalidatePath("/admin/subjects")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update subject" }
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({
      where: { id },
    })

    revalidatePath("/admin/subjects")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete subject" }
  }
}
