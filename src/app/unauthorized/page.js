'use client'

import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Access Denied
        </h1>
        
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          You do not have the required permissions to view this dashboard. Please verify your account role or contact the system administrator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            <Home size={16} /> Home Page
          </Link>
        </div>
      </div>
    </div>
  )
}
