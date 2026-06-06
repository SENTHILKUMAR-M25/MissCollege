export const FACULTY_DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Guest Lecturer",
  "Head of Department",
] as const

export const FACULTY_PREFIXES: Record<string, string> = {
  Professor: "P",
  "Associate Professor": "AP",
  "Assistant Professor": "ASP",
  Lecturer: "L",
  "Guest Lecturer": "GL",
  "Head of Department": "HOD",
}

export type FacultyDesignation = (typeof FACULTY_DESIGNATIONS)[number]

export function generateFacultyId(designation: FacultyDesignation): string {
  return `MISS-${FACULTY_PREFIXES[designation]}-001`
}
