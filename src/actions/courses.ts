"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  duration: z.string().min(1, "Duration is required"),
  departmentId: z.string().min(1, "Department is required"),
})

export async function addCourse(formData: FormData) {
  try {
    const data = courseSchema.parse({
      name: formData.get("name"),
      code: formData.get("code"),
      duration: formData.get("duration"),
      departmentId: formData.get("departmentId"),
    })

    await prisma.course.create({
      data,
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to add course" }
  }
}

export async function updateCourse(formData: FormData) {
  try {
    const data = courseSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code"),
      duration: formData.get("duration"),
      departmentId: formData.get("departmentId"),
    })

    if (!data.id) throw new Error("ID is required")

    await prisma.course.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        duration: data.duration,
        departmentId: data.departmentId,
      },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update course" }
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({
      where: { id },
    })

    revalidatePath("/admin/courses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete course" }
  }
}
