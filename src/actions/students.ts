"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  registerNumber: z.string().min(2, "Register Number is required"),
  departmentId: z.string().min(1, "Department is required"),
  courseId: z.string().min(1, "Course is required"),
  semester: z.coerce.number().min(1, "Semester is required"),
  section: z.string().min(1, "Section is required"),
  admissionYear: z.coerce.number().min(2000, "Admission year is required"),
  phone: z.string().optional(),
})

export async function addStudent(formData: FormData) {
  try {
    const data = studentSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      registerNumber: formData.get("registerNumber"),
      departmentId: formData.get("departmentId"),
      courseId: formData.get("courseId"),
      semester: formData.get("semester"),
      section: formData.get("section"),
      admissionYear: formData.get("admissionYear"),
      phone: formData.get("phone") || undefined,
    })

    // Create User then Student
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: "password123", // Default password for new students
        role: "STUDENT",
        student: {
          create: {
            registerNumber: data.registerNumber,
            departmentId: data.departmentId,
            courseId: data.courseId,
            semester: data.semester,
            section: data.section,
            admissionYear: data.admissionYear,
            phone: data.phone,
          },
        },
      },
    })

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add student" }
  }
}

export async function updateStudent(formData: FormData) {
  try {
    const data = studentSchema.parse({
      id: formData.get("id"), // Student ID
      name: formData.get("name"),
      email: formData.get("email"),
      registerNumber: formData.get("registerNumber"),
      departmentId: formData.get("departmentId"),
      courseId: formData.get("courseId"),
      semester: formData.get("semester"),
      section: formData.get("section"),
      admissionYear: formData.get("admissionYear"),
      phone: formData.get("phone") || undefined,
    })

    if (!data.id) throw new Error("ID is required")

    const student = await prisma.student.findUnique({
      where: { id: data.id },
      include: { user: true },
    })

    if (!student) throw new Error("Student not found")

    // Update User and Student
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        name: data.name,
        email: data.email,
        student: {
          update: {
            registerNumber: data.registerNumber,
            departmentId: data.departmentId,
            courseId: data.courseId,
            semester: data.semester,
            section: data.section,
            admissionYear: data.admissionYear,
            phone: data.phone,
          },
        },
      },
    })

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update student" }
  }
}

export async function deleteStudent(id: string) {
  try {
    const student = await prisma.student.findUnique({ where: { id } })
    if (student) {
      // Deleting user cascades to student
      await prisma.user.delete({ where: { id: student.userId } })
    }

    revalidatePath("/admin/students")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete student" }
  }
}
