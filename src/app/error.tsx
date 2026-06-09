"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-sm mb-2">{error.message || "An unexpected error occurred."}</p>
          {error.digest && <p className="text-slate-600 text-xs mb-6">Error ID: {error.digest}</p>}
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">
              <RefreshCw size={14} /> Try Again
            </button>
            <a href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700">
              <Home size={14} /> Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
