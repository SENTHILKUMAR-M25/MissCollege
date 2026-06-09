"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { GraduationCap, Eye, EyeOff, LogIn } from "lucide-react"

export default function StudentLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.ok) {
      const { getSession } = await import("next-auth/react")
      const session = await getSession()
      if (session?.user?.role === "STUDENT") {
        router.push("/student/dashboard")
      } else {
        setError("Access denied. Student credentials required.")
        const { signOut } = await import("next-auth/react")
        await signOut({ redirect: false })
      }
    } else {
      setError("Invalid Student ID or password. Default password is your DOB in DDMMYYYY format.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/30 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Student Portal</h1>
          <p className="text-slate-400 text-sm mt-1">MISS College — Madurai Institute of Social Sciences</p>
        </div>

        <div className="rounded-2xl bg-slate-800/80 border border-white/10 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="text-white font-bold text-lg mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-500/50 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Default: DDMMYYYY (Date of Birth)"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm focus:outline-none focus:border-teal-500/50 placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-slate-500 text-[10px] mt-1">Default password is your Date of Birth in DDMMYYYY format</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {loading ? "Signing in..." : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">Trouble logging in? Contact your department administrator.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
