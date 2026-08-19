import { auth } from "@/lib/auth"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_ROLES = [Role.ADMIN, Role.ACADEMIC_ADMIN, Role.EXAM_ADMIN]

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  const isHodLogin = pathname === "/hod-login"
  const isAdminLogin = pathname === "/admin-login"
  const isFacultyLogin = pathname === "/Faculty-login"
  const isStudentLogin = pathname === "/student-login"

  if (isHodLogin || isAdminLogin || isFacultyLogin || isStudentLogin) {
    if (session?.user) {
      if (session.user.role === "HOD") return NextResponse.redirect(new URL("/hod/dashboard", request.url))
      if (ADMIN_ROLES.includes(session.user.role as Role)) return NextResponse.redirect(new URL("/admin", request.url))
      if (session.user.role === "FACULTY") return NextResponse.redirect(new URL("/faculty/dashboard", request.url))
      if (session.user.role === "STUDENT") return NextResponse.redirect(new URL("/student/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!session?.user) {
    if (pathname.startsWith("/hod")) return NextResponse.redirect(new URL("/hod-login", request.url))
    if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/admin-login", request.url))
    if (pathname.startsWith("/faculty")) return NextResponse.redirect(new URL("/Faculty-login", request.url))
    if (pathname.startsWith("/student")) return NextResponse.redirect(new URL("/student-login", request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith("/hod") && session.user.role !== "HOD") return NextResponse.redirect(new URL("/unauthorized", request.url))
  if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(session.user.role as Role)) return NextResponse.redirect(new URL("/unauthorized", request.url))
  if (pathname.startsWith("/faculty") && session.user.role !== "FACULTY" && session.user.role !== "HOD") return NextResponse.redirect(new URL("/unauthorized", request.url))
  if (pathname.startsWith("/student") && session.user.role !== "STUDENT") return NextResponse.redirect(new URL("/unauthorized", request.url))

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/hod/:path*", "/faculty/:path*", "/student/:path*"],
}
