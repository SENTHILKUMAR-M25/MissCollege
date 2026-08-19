"use server"

import prisma from "@/lib/prisma"

export async function getExamDashboardStats() {
  try {
    const totalStudents = await prisma.student.count()
    const totalInternalMarks = await prisma.internalMark.count()
    const totalSemesterResults = await prisma.semesterResult.count()

    return {
      totalExamTypes: 0,
      totalExamSchedule: 0,
      totalHalls: 0,
      totalInvigilators: 0,
      totalStudents,
      totalResults: totalInternalMarks + totalSemesterResults,
      publishedResults: totalSemesterResults,
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
