import { redirect } from "next/navigation"
import SectionsClient from "./SectionsClient"

export default async function HodSectionsPage() {
  const user = (await (await import("@/lib/permissions")).requireHod()) as any
  if (!user?.email) redirect("/hod-login")

  return (
    <div className="space-y-6">
      <SectionsClient loggedUserEmail={user.email} />
    </div>
  )
}
