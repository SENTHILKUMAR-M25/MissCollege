"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Shield, ArrowRight } from "lucide-react"
import { signIn } from "next-auth/react"

export default function HodLoginPage() {
  const [facultyId, setFacultyId] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      facultyId,
      dateOfBirth,
      redirect: false,
    })

    if (res?.ok) {
      router.push("/hod/dashboard")
    } else {
      setError(res?.error || "Invalid Faculty ID or Date of Birth")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">HOD Portal Login</h1>
          <p className="text-slate-400 text-sm mt-2">Enter your credentials to access the Head of Department portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-slate-400 text-xs mb-1.5 block font-medium">Faculty ID *</label>
            <input
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              placeholder="e.g. MISS-P-001"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1.5 block font-medium">Date of Birth (DDMMYYYY) *</label>
            <input
              value={dateOfBirth}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 8)
                setDateOfBirth(val)
              }}
                maxLength={8}
                required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !facultyId || !dateOfBirth}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : "Login"}
            {!loading && <ArrowRight size={16} />}
          </button>

          <p className="text-center text-slate-500 text-xs">
            First login credentials: Faculty ID + DOB (DDMMYYYY)
          </p>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Return to <a href="/" className="text-violet-400 hover:text-violet-300 transition">Home</a>
        </p>
      </motion.div>
    </div>
  )
}
