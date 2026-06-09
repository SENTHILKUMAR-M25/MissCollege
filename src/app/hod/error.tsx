"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react"

export default function HodError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[HOD Error]", error) }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={26} className="text-red-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm mb-1">{error.message || "An unexpected error occurred in this section."}</p>
        {error.digest && <p className="text-slate-600 text-xs mb-6">Error ID: {error.digest}</p>}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600">
            <RefreshCw size={14} /> Try Again
          </button>
          <a href="/hod/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-slate-700">
            <LayoutDashboard size={14} /> Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
