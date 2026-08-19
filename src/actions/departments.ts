"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { requireAcademicAdmin } from "@/lib/permissions"

const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  description: z.string().optional(),
})

export async function addDepartment(formData: FormData) {
  try {
    await requireAcademicAdmin()
    const payload = {
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
    }
    const data = departmentSchema.parse(payload)

    await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    const message = error?.errors?.map((e: any) => e.message).join(", ") || error?.message || "Failed to add department"
    return { success: false, error: message }
  }
}

export async function updateDepartment(formData: FormData) {
  try {
    await requireAcademicAdmin()
    const payload = {
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
    }
    const data = departmentSchema.parse(payload)

    if (!data.id) throw new Error("ID is required")

    await prisma.department.update({
      where: { id: data.id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    const message = error?.errors?.map((e: any) => e.message).join(", ") || error?.message || "Failed to update department"
    return { success: false, error: message }
  }
}

export async function deleteDepartment(id: string) {
  try {
    await requireAcademicAdmin()
    await prisma.department.delete({
      where: { id },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete department" }
  }
}
