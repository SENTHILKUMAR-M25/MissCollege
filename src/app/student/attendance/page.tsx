import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { getPeriods } from "@/actions/hod-timetable"
import { redirect } from "next/navigation"
import StudentAttendanceClient from "./StudentAttendanceClient"

export default async function StudentAttendancePage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { student, attendancePct, subjectAttendance, timetable, attendance } = result.data as any

  const periodsRes = await getPeriods()
  const periods = (periodsRes.success ? periodsRes.data : []) as Array<{ periodNumber: number; name: string; startTime: string; endTime: string; isBreak: boolean }>

  const studentTimetable = (timetable ?? []).filter((t: any) => {
    const deptOk = !student.departmentId || (t.departmentId === student.departmentId || t.department?.id === student.departmentId)
    const semOk = !t.semester || t.semester === student.semester
    const sectionOk = !t.section || t.section === student.section
    return deptOk && semOk && sectionOk
  })

  const attendanceByDate = new Map<string, any[]>()
  for (const a of attendance ?? []) {
    const key = new Date(a.date).toISOString().slice(0, 10)
    const arr = attendanceByDate.get(key) || []
    arr.push(a)
    attendanceByDate.set(key, arr)
  }

  const usedDates = Array.from(attendanceByDate.keys()).sort().slice(-5)

  const dates = usedDates.map((d) => {
    const dateObj = new Date(d)
    const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" })
    const dayOrder = dateObj.getDay() === 0 ? 7 : dateObj.getDay()
    return {
      key: d,
      label: dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      dayName,
      dayOrder,
    }
  })

  const sortedPeriods = periods
    .filter((p) => p.periodNumber > 0)
    .sort((a, b) => a.periodNumber - b.periodNumber)

  return (
    <StudentAttendanceClient
      student={student}
      dates={dates}
      sortedPeriods={sortedPeriods}
      studentTimetable={studentTimetable}
      attendanceByDate={attendanceByDate}
      subjectAttendance={subjectAttendance}
      attendancePct={attendancePct}
    />
  )
}
