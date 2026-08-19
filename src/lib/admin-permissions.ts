"use server"

import { Role, AdminSubRole } from "@prisma/client"

export const ACADEMIC_MODULES = [
  "dashboard",
  "departments",
  "faculty",
  "students",
  "hod-management",
  "courses",
  "subjects",
  "class-allocation",
  "timetable",
  "attendance",
  "notices",
  "announcements",
  "reports",
  "settings",
] as const

export const EXAM_MODULES = [
  "exam-types",
  "assessment-setup",
  "exam-schedule",
  "hall-allocation",
  "invigilator-assignment",
  "marks-verification",
  "result-publication",
  "gpa-cgpa",
  "exam-reports",
  "exam-settings",
] as const

export const ALL_ADMIN_MODULES = [...ACADEMIC_MODULES, ...EXAM_MODULES] as const

export const SUPER_ADMIN_MODULES = ALL_ADMIN_MODULES

export function getRoleModules(role: Role, subRole?: AdminSubRole): string[] {
  if (role === Role.ADMIN) return [...SUPER_ADMIN_MODULES]
  if (role === Role.ACADEMIC_ADMIN) return [...ACADEMIC_MODULES]
  if (role === Role.EXAM_ADMIN) return [...EXAM_MODULES]
  return []
}

export function hasModuleAccess(role: Role, subRole: AdminSubRole, module: string): boolean {
  if (role === Role.ADMIN) return true
  if (role === Role.ACADEMIC_ADMIN) return ACADEMIC_MODULES.includes(module as any)
  if (role === Role.EXAM_ADMIN) return EXAM_MODULES.includes(module as any)
  return false
}

export function isSuperAdmin(role: Role): boolean {
  return role === Role.ADMIN
}

export function isAcademicAdmin(role: Role): boolean {
  return role === Role.ACADEMIC_ADMIN
}

export function isExamAdmin(role: Role): boolean {
  return role === Role.EXAM_ADMIN
}

export function canManageAdmins(role: Role): boolean {
  return role === Role.ADMIN
}

export function canAccessAcademic(role: Role): boolean {
  return role === Role.ADMIN || role === Role.ACADEMIC_ADMIN
}

export function canAccessExams(role: Role): boolean {
  return role === Role.ADMIN || role === Role.EXAM_ADMIN
}
