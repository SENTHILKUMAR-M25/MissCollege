import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={32} className="text-amber-400" />
        </div>
        <h1 className="text-white text-6xl font-black mb-2">404</h1>
        <h2 className="text-white text-xl font-bold mb-3">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="javascript:history.back()" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700">
            <ArrowLeft size={14} /> Go Back
          </Link>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600">
            <Home size={14} /> Home
          </Link>
        </div>
      </div>
    </div>
  )
}
