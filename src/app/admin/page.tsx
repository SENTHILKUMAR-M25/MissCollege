import {
  getDashboardStats,
  getStudentsByDept,
  getFacultyByDept,
  getMonthlyAttendance,
  getSemesterPassRate,
  getRecentActivities,
} from "@/actions/dashboard"
import AdminDashboardClient from "@/components/admin/dashboard/AdminDashboardClient"

export default async function AdminDashboard() {
  const [stats, studentsByDept, facultyByDept, monthlyAttendance, semesterPassRate, recentActivities] =
    await Promise.all([
      getDashboardStats(),
      getStudentsByDept(),
      getFacultyByDept(),
      getMonthlyAttendance(),
      getSemesterPassRate(),
      getRecentActivities(),
    ])

  return (
    <AdminDashboardClient
      stats={stats}
      studentsByDept={studentsByDept}
      facultyByDept={facultyByDept}
      monthlyAttendance={monthlyAttendance}
      semesterPassRate={semesterPassRate}
      recentActivities={recentActivities}
    />
  )
}
