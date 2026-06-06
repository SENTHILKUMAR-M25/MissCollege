"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const departmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  description: z.string().optional(),
})

export async function addDepartment(formData: FormData) {
  try {
    const data = departmentSchema.parse({
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
    })

    await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to add department" }
  }
}

export async function updateDepartment(formData: FormData) {
  try {
    const data = departmentSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code"),
      description: formData.get("description"),
    })

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
  } catch (error) {
    return { success: false, error: "Failed to update department" }
  }
}

export async function deleteDepartment(id: string) {
  try {
    await prisma.department.delete({
      where: { id },
    })

    revalidatePath("/admin/departments")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete department" }
  }
}
