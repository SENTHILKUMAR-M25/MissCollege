"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authenticate } from "../../actions/auth"
import { Lock, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await authenticate(undefined, formData)

    if (result) {
      setError(result)
      setPending(false)
    } else {
      // Login successful, redirect to dashboard.
      // NextAuth authorized callback will handle role-based redirects.
      // In this setup we can redirect to /dashboard and let middleware redirect.
      // But we can check role later or let it go home or default dashboards.
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@college.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs text-slate-500 hover:text-slate-950 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <p className="text-slate-500 text-xs">
            Admin credentials: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin@college.com</code> / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Admin@123</code>
          </p>
        </div>
      </div>
    </div>
  )
}
