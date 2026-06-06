import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
  // Matcher matches all request paths except for API routes, static files, and images
  matcher: ["/((?!api|_next/static|_next/image|assets|.*\\.png$).*)"],
}
