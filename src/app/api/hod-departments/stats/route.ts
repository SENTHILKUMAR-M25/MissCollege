import { NextResponse } from "next/server"
import { getDepartmentStats, getActiveHods, getHodHistory } from "@/actions/hod-assignments"

export async function GET() {
  try {
    const statsResult = await getDepartmentStats()
    const hodsResult = await getActiveHods()
    const historyResult = await getHodHistory()

    if (!statsResult.success) {
      return NextResponse.json(
        { success: false, error: statsResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        departments: statsResult.data,
        activeHods: hodsResult.success ? hodsResult.data : [],
        history: historyResult.success ? historyResult.data : [],
      },
    })
  } catch (error) {
    console.error("Error fetching HOD departments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}
