import { getAttendanceSummary, getAttendanceDepartments } from "@/actions/attendance"
import AttendanceClient from "@/components/admin/attendance/AttendanceClient"

export default async function AttendancePage() {
  const [records, departments] = await Promise.all([
    getAttendanceSummary(),
    getAttendanceDepartments(),
  ])

  return <AttendanceClient records={records} departments={departments} />
}
