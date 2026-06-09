import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "../auth.config"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        facultyId: { label: "Faculty ID", type: "text" },
        dateOfBirth: { label: "Date of Birth", type: "text" },
      },
      async authorize(credentials) {
        try {
          const parsed = z
            .object({
              email: z.string().email().optional(),
              password: z.string().optional(),
              facultyId: z.string().optional(),
              dateOfBirth: z.string().optional(),
            })
            .safeParse(credentials)

          if (!parsed.success) {
            return null
          }

          const { email, password, facultyId, dateOfBirth } = parsed.data

          if (facultyId && dateOfBirth) {
            const faculty = await prisma.faculty.findUnique({
              where: { facultyId },
              include: { user: true },
            })

            if (!faculty || !faculty.user) return null
            if (!faculty.user.isActive) return null
            if (!faculty.accountStatus) return null

            // Must be FACULTY or HOD role
            if (!(["HOD", "FACULTY"] as string[]).includes(faculty.user.role)) return null

            // If faculty has a DOB set, verify it matches
            if (faculty.dateOfBirth) {
              const dobDate = new Date(dateOfBirth.replace(/(\d{2})(\d{2})(\d{4})/, "$3-$2-$1"))
              if (isNaN(dobDate.getTime())) return null
              const facultyDob = new Date(faculty.dateOfBirth)
              const isDobMatch =
                facultyDob.getFullYear() === dobDate.getFullYear() &&
                facultyDob.getMonth() === dobDate.getMonth() &&
                facultyDob.getDate() === dobDate.getDate()
              if (!isDobMatch) return null
            } else {
              // No DOB set — fall back to bcrypt password compare
              const passwordsMatch = bcrypt.compareSync(dateOfBirth, faculty.user.password)
              if (!passwordsMatch) return null
            }

            return {
              id: faculty.user.id,
              name: faculty.user.name,
              email: faculty.user.email,
              role: faculty.user.role,
              isActive: faculty.user.isActive,
            }
          }

          if (email && password) {
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user) return null

            const passwordsMatch = await bcrypt.compare(password, user.password)
            if (!passwordsMatch) return null
            if (!user.isActive) return null

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }
          }

          return null
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
  ],
})
