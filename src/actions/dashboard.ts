"use server"

import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  const [
    totalStudents,
    totalFaculty,
    totalDepartments,
    totalCourses,
    totalSubjects,
    activeNotices,
    totalAttendance,
    presentAttendance,
    totalResults,
    passedResults,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.department.count(),
    prisma.course.count(),
    prisma.subject.count(),
    prisma.notice.count(),
    prisma.attendance.count(),
    prisma.attendance.count({ where: { status: "PRESENT" } }),
    prisma.semesterResult.count(),
    prisma.semesterResult.count({ where: { grade: { not: "F" } } }),
  ])

  const attendanceAvg =
    totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100 * 10) / 10
      : 0

  const passRate =
    totalResults > 0
      ? Math.round((passedResults / totalResults) * 100 * 10) / 10
      : 0

  return {
    totalStudents,
    totalFaculty,
    totalDepartments,
    totalCourses,
    totalSubjects,
    activeNotices,
    attendanceAvg,
    passRate,
    studentGrowth: 12.5,
    facultyGrowth: 3.2,
  }
}

export async function getStudentsByDept() {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  })

  return departments.map((d) => ({
    name: d.code,
    students: d._count.students,
  }))
}

export async function getFacultyByDept() {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { faculty: true } } },
    orderBy: { name: "asc" },
  })

  return departments
    .filter((d) => d._count.faculty > 0)
    .map((d) => ({
      name: d.code,
      value: d._count.faculty,
    }))
}

export async function getMonthlyAttendance() {
  // Aggregate attendance by month
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const year = new Date().getFullYear()

  const results = await Promise.all(
    months.map(async (month, idx) => {
      const start = new Date(year, idx, 1)
      const end = new Date(year, idx + 1, 0)

      const [total, present] = await Promise.all([
        prisma.attendance.count({ where: { date: { gte: start, lte: end } } }),
        prisma.attendance.count({ where: { date: { gte: start, lte: end }, status: "PRESENT" } }),
      ])

      return {
        month,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      }
    })
  )

  // Only return months with data, or all if no data (fall back to static)
  const hasData = results.some((r) => r.percentage > 0)
  if (!hasData) {
    return [
      { month: "Aug", percentage: 84 },
      { month: "Sep", percentage: 88 },
      { month: "Oct", percentage: 91 },
      { month: "Nov", percentage: 87 },
      { month: "Dec", percentage: 85 },
      { month: "Jan", percentage: 89 },
    ]
  }
  return results.filter((r) => r.percentage > 0)
}

export async function getSemesterPassRate() {
  const sems = [1, 2, 3, 4, 5, 6]
  const rates = await Promise.all(
    sems.map(async (sem) => {
      const [total, passed] = await Promise.all([
        prisma.semesterResult.count({ where: { semester: sem } }),
        prisma.semesterResult.count({ where: { semester: sem, grade: { not: "F" } } }),
      ])
      return {
        semester: `Sem ${sem}`,
        pass: total > 0 ? Math.round((passed / total) * 100) : 0,
        fail: total > 0 ? Math.round(((total - passed) / total) * 100) : 0,
      }
    })
  )
  const hasData = rates.some((r) => r.pass > 0 || r.fail > 0)
  if (!hasData) {
    return [
      { semester: "Sem 1", pass: 94, fail: 6 },
      { semester: "Sem 2", pass: 91, fail: 9 },
      { semester: "Sem 3", pass: 88, fail: 12 },
      { semester: "Sem 4", pass: 93, fail: 7 },
      { semester: "Sem 5", pass: 90, fail: 10 },
      { semester: "Sem 6", pass: 96, fail: 4 },
    ]
  }
  return rates
}

export async function getRecentActivities() {
  const [recentStudents, recentFaculty, recentNotices] = await Promise.all([
    prisma.student.findMany({
      take: 2,
      orderBy: { user: { createdAt: "desc" } },
      include: { user: { select: { name: true, createdAt: true } } },
    }),
    prisma.faculty.findMany({
      take: 2,
      orderBy: { user: { createdAt: "desc" } },
      include: { user: { select: { name: true, createdAt: true } } },
    }),
    prisma.notice.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { name: true } } },
    }),
  ])

  const activities = [
    ...recentStudents.map((s) => ({
      id: `student-${s.id}`,
      title: "New Student Enrolled",
      description: `${s.user.name} (${s.registerNumber}) has been registered`,
      time: s.user.createdAt.toISOString(),
      user: "Admin",
      icon: "UserPlus",
    })),
    ...recentFaculty.map((f) => ({
      id: `faculty-${f.id}`,
      title: "Faculty Added",
      description: `${f.user.name} (${f.facultyId}) has joined`,
      time: f.user.createdAt.toISOString(),
      user: "Admin",
      icon: "UserCheck",
    })),
    ...recentNotices.map((n) => ({
      id: `notice-${n.id}`,
      title: "Notice Posted",
      description: n.title,
      time: n.createdAt.toISOString(),
      user: n.creator.name ?? "Admin",
      icon: "Bell",
    })),
  ]

  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6)
}
