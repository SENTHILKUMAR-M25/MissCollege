import { DefaultSession } from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id?: string
    role?: Role
    isActive?: boolean
  }

  interface Session {
    user: {
      id: string
      role: Role
      isActive: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: Role
    isActive?: boolean
  }
}
