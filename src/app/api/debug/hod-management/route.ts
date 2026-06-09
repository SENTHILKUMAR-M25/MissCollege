export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getHodStats, getDepartmentsWithoutHod, getAvailableFaculty } from "@/actions/hod-management"

export async function GET() {
  const stats = await getHodStats()
  const depts = await getDepartmentsWithoutHod()
  const sampleDeptId = depts.data?.[0]?.id
  const faculty = sampleDeptId ? await getAvailableFaculty(sampleDeptId) : { success: false, error: "No department" }

  return NextResponse.json({
    stats,
    departmentsWithoutHodCount: depts.data?.length ?? 0,
    sampleDepartmentId: sampleDeptId,
    facultyResult: faculty,
  })
}
