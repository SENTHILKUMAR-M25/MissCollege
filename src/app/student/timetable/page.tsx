import { requireStudent } from "@/lib/permissions"
import { getStudentPortalData } from "@/actions/students"
import { getPeriods, getHodTimetable } from "@/actions/hod-timetable"
import { redirect } from "next/navigation"
import StudentTimetableClient from "./StudentTimetableClient"

export default async function StudentTimetablePage() {
  const user = await requireStudent()
  const result = await getStudentPortalData(user.id)
  if (!result.success || !result.data) redirect("/unauthorized")

  const { student, timetable } = result.data as any

  const periodsRes = await getPeriods()
  const sortedPeriods = (periodsRes.success ? periodsRes.data : [])
    .filter((p: any) => p.periodNumber > 0)
    .sort((a: any, b: any) => a.periodNumber - b.periodNumber)

  const studentTimetable = (timetable ?? []).filter((t: any) => {
    const deptOk = !student.departmentId || (t.departmentId === student.departmentId || t.department?.id === student.departmentId)
    const semOk = !t.semester || t.semester === student.semester
    const sectionOk = !t.section || t.section === student.section
    return deptOk && semOk && sectionOk
  })

  return (
    <StudentTimetableClient
      student={student}
      sortedPeriods={sortedPeriods}
      studentTimetable={studentTimetable}
    />
  )
}
