import { auth } from "./auth"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

/**
 * Returns the current authenticated user session.
 */
export async function getSession() {
  return await auth()
}

/**
 * Gets the current user and asserts that they are logged in.
 * If not, redirects them to the login page.
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/login")
  }
  return session.user
}

/**
 * Ensures the logged-in user has one of the allowed roles.
 * If not, redirects them to an unauthorized error page.
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

/**
 * Require ADMIN role.
 */
export async function requireAdmin() {
  return requireRole([Role.ADMIN])
}

/**
 * Require FACULTY role.
 */
export async function requireFaculty() {
  return requireRole([Role.FACULTY])
}

/**
 * Require STUDENT role.
 */
export async function requireStudent() {
  return requireRole([Role.STUDENT])
}

/**
 * Check if the current user has a specific role (returns boolean without redirecting).
 */
export async function hasRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await getSession()
  if (!session?.user) {
    return false
  }
  return allowedRoles.includes(session.user.role)
}
