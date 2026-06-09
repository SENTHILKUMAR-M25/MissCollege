import { requireHod } from "@/lib/permissions"
import { redirect } from "next/navigation"
import { getWorkAllocationData } from "@/actions/hod-work-allocation"
import WorkAllocationClient from "@/components/hod/WorkAllocationClient"

export default async function FacultyWorkAllocationPage() {
  const user = await requireHod()
  const result = await getWorkAllocationData(user.id)

  if (!result.success || !result.data) redirect("/unauthorized")

  return (
    <WorkAllocationClient
      facultyUserId={user.id}
      departmentName={result.data.departmentName}
      initialData={result.data}
    />
  )
}
