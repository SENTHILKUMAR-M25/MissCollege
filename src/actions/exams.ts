"use server"

import prisma from "@/lib/prisma"

export async function getExamDashboardStats() {
  try {
    const [
      totalExamTypes,
      totalExamSchedule,
      totalHalls,
      totalInvigilators,
      totalStudents,
      totalResults,
      publishedResults,
    ] = await Promise.all([
      prisma.examType.count(),
      prisma.examSchedule.count(),
      prisma.examHall.count(),
      prisma.examInvigilator.count(),
      prisma.student.count(),
      prisma.examResult.count(),
      prisma.examResult.count({ where: { status: "PUBLISHED" } }),
    ])

    return {
      totalExamTypes,
      totalExamSchedule,
      totalHalls,
      totalInvigilators,
      totalStudents,
      totalResults,
      publishedResults,
    }
  } catch (error) {
    console.error("Error fetching exam dashboard stats:", error)
    return {
      totalExamTypes: 0,
      totalExamSchedule: 0,
      totalHalls: 0,
      totalInvigilators: 0,
      totalStudents: 0,
      totalResults: 0,
      publishedResults: 0,
    }
  }
}
