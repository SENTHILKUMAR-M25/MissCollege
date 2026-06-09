import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/permissions"

export async function middleware(request: NextRequest) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const { pathname } = request.nextUrl

  if (pathname.startsWith("/hod") && session.user.role !== "HOD") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  if (pathname.startsWith("/admin") && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/hod/:path*", "/admin/:path*"],
}
