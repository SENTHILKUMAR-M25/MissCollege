import { getMarks, getMarksFilters } from "@/actions/marks"
import MarksClient from "@/components/admin/marks/MarksClient"

export default async function MarksPage() {
  const [records, { departments, subjects }] = await Promise.all([
    getMarks(),
    getMarksFilters(),
  ])

  return <MarksClient records={records} departments={departments} subjects={subjects} />
}
