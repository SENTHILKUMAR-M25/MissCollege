import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/Faculty-login",
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return Promise.resolve(true)
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.isActive = (user as any).isActive
      }
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      return token
    },
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
}
