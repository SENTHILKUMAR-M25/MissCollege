"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [facultyId, setFacultyId] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <Mail size={28} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-2">Contact your administrator to reset your password</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5">
          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
              Your request has been noted. Please contact your department administrator or IT support to reset your password.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Faculty ID *</label>
                <input
                  type="text"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  placeholder="e.g. MISS-AP-001"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <p className="text-slate-500 text-xs">
                Note: Password resets are handled by the administrator. Your default password is your Date of Birth in DDMMYYYY format.
              </p>
              <button
                type="submit"
                disabled={!facultyId}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-teal-500/25"
              >
                Submit Request
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          <a href="/Faculty-login" className="text-teal-400 hover:text-teal-300 transition flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to Faculty Login
          </a>
        </p>
      </motion.div>
    </div>
  )
}
