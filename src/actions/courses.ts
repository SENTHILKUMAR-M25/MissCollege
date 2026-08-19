"use server"

import { requireAcademicAdmin } from "@/lib/permissions"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const courseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  duration: z.string().min(1, "Duration is required"),
  departmentId: z.string().min(1, "Department is required"),
  slug: z.string().optional().transform(val => val || undefined),
  type: z.string().default("Undergraduate"),
  mode: z.string().default("Full-Time"),
  seats: z.coerce.number().default(60),
  fee: z.string().default("₹40,000 / year"),
  eligibility: z.string().default("See admission criteria"),
  affiliation: z.string().optional(),
  accreditation: z.string().optional(),
  overview: z.string().optional(),
  highlights: z.string().optional(),
  curriculum: z.string().optional(),
  faculty: z.string().optional(),
  careerProspects: z.string().optional(),
  topRecruiters: z.string().optional(),
  bgImage: z.string().optional(),
})

function parseJsonField(raw: string | null | undefined, fallback: any) {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function parseJsonObj(raw: string | null | undefined, fallback: any) {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

export async function addCourse(formData: FormData) {
  try {
    await requireAcademicAdmin()
    const raw = {
      name: formData.get("name"),
      code: formData.get("code"),
      duration: formData.get("duration"),
      departmentId: formData.get("departmentId"),
      slug: formData.get("slug"),
      type: formData.get("type"),
      mode: formData.get("mode"),
      seats: formData.get("seats"),
      fee: formData.get("fee"),
      eligibility: formData.get("eligibility"),
      affiliation: formData.get("affiliation"),
      accreditation: formData.get("accreditation"),
      overview: formData.get("overview"),
      highlights: formData.get("highlights"),
      curriculum: formData.get("curriculum"),
      faculty: formData.get("faculty"),
      careerProspects: formData.get("careerProspects"),
      topRecruiters: formData.get("topRecruiters"),
      bgImage: formData.get("bgImage"),
    }
    const data = courseSchema.parse(raw)

    await prisma.course.create({
      data: {
        ...data,
        highlights: parseJsonField(data.highlights, []),
        careerProspects: parseJsonField(data.careerProspects, []),
        topRecruiters: parseJsonField(data.topRecruiters, []),
        curriculum: parseJsonObj(data.curriculum, null),
        faculty: parseJsonObj(data.faculty, null),
      },
    })

    revalidatePath("/admin/courses")
    revalidatePath("/api/public/courses")
    return { success: true }
  } catch (error) {
    console.error("Failed to add course:", error)
    return { success: false, error: "Failed to add course" }
  }
}

export async function updateCourse(formData: FormData) {
  try {
    await requireAcademicAdmin()
    const raw = {
      id: formData.get("id"),
      name: formData.get("name"),
      code: formData.get("code"),
      duration: formData.get("duration"),
      departmentId: formData.get("departmentId"),
      slug: formData.get("slug"),
      type: formData.get("type"),
      mode: formData.get("mode"),
      seats: formData.get("seats"),
      fee: formData.get("fee"),
      eligibility: formData.get("eligibility"),
      affiliation: formData.get("affiliation"),
      accreditation: formData.get("accreditation"),
      overview: formData.get("overview"),
      highlights: formData.get("highlights"),
      curriculum: formData.get("curriculum"),
      faculty: formData.get("faculty"),
      careerProspects: formData.get("careerProspects"),
      topRecruiters: formData.get("topRecruiters"),
      bgImage: formData.get("bgImage"),
    }
    const data = courseSchema.parse(raw)

    if (!data.id) throw new Error("ID is required")

    await prisma.course.update({
      where: { id: data.id },
      data: {
        ...data,
        highlights: parseJsonField(data.highlights, []),
        careerProspects: parseJsonField(data.careerProspects, []),
        topRecruiters: parseJsonField(data.topRecruiters, []),
        curriculum: parseJsonObj(data.curriculum, null),
        faculty: parseJsonObj(data.faculty, null),
      },
    })

    revalidatePath("/admin/courses")
    revalidatePath("/api/public/courses")
    return { success: true }
  } catch (error) {
    console.error("Failed to update course:", error)
    return { success: false, error: "Failed to update course" }
  }
}

export async function deleteCourse(id: string) {
  try {
    await requireAcademicAdmin()
    await prisma.course.delete({
      where: { id },
    })

    revalidatePath("/admin/courses")
    revalidatePath("/api/public/courses")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete course" }
  }
}
