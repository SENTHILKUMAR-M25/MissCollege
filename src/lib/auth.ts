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
            console.error("[auth] Zod parse failed:", parsed.error.flatten())
            return null
          }

          const { email, password, facultyId, dateOfBirth } = parsed.data
          console.log("[auth] Authorize attempt:", { email, facultyId, dateOfBirth: dateOfBirth ? "***" : undefined })

          if (facultyId && dateOfBirth) {
            const faculty = await prisma.faculty.findUnique({
              where: { facultyId },
              include: { user: true },
            })

            if (!faculty || !faculty.user) {
              console.error("[auth] Faculty not found for facultyId:", facultyId)
              return null
            }
            if (!faculty.user.isActive) {
              console.error("[auth] Faculty user is inactive:", faculty.user.id)
              return null
            }
            if (faculty.accountStatus !== "ACTIVE") {
              console.error("[auth] Faculty accountStatus is not ACTIVE:", faculty.accountStatus)
              return null
            }

            if (!(["HOD", "FACULTY"] as string[]).includes(faculty.user.role)) {
              console.error("[auth] Faculty role is not HOD/FACULTY:", faculty.user.role)
              return null
            }

            if (faculty.dateOfBirth) {
              const dobDate = new Date(dateOfBirth.replace(/(\d{2})(\d{2})(\d{4})/, "$3-$2-$1"))
              if (isNaN(dobDate.getTime())) {
                console.error("[auth] Invalid DOB date from input:", dateOfBirth)
                return null
              }
              const facultyDob = new Date(faculty.dateOfBirth)
              const isDobMatch =
                facultyDob.getFullYear() === dobDate.getFullYear() &&
                facultyDob.getMonth() === dobDate.getMonth() &&
                facultyDob.getDate() === dobDate.getDate()
              if (!isDobMatch) {
                console.error("[auth] DOB mismatch:", {
                  input: { y: dobDate.getFullYear(), m: dobDate.getMonth(), d: dobDate.getDate() },
                  stored: { y: facultyDob.getFullYear(), m: facultyDob.getMonth(), d: facultyDob.getDate() },
                  storedRaw: faculty.dateOfBirth,
                })
                return null
              }
            } else {
              const passwordsMatch = bcrypt.compareSync(dateOfBirth, faculty.user.password)
              if (!passwordsMatch) {
                console.error("[auth] DOB fallback bcrypt compare failed for facultyId:", facultyId)
                return null
              }
            }

            console.log("[auth] Faculty auth success:", faculty.user.id, faculty.user.role)
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
            if (!user) {
              console.error("[auth] User not found for email:", email)
              return null
            }

            const passwordsMatch = await bcrypt.compare(password, user.password)
            if (!passwordsMatch) {
              console.error("[auth] Password mismatch for email:", email)
              return null
            }
            if (!user.isActive) {
              console.error("[auth] User is inactive:", user.id)
              return null
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }
          }

          console.error("[auth] No credentials matched - no facultyId+dateOfBirth or email+password provided")
          return null
        } catch (error) {
          console.error("[auth] Authorize error:", error)
          return null
        }
      },
    }),
  ],
})
