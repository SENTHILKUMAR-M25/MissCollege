"use client"

import { useState } from "react"
import { Save, Shield, Key, Smartphone, AlertTriangle } from "lucide-react"

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Security Settings</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage your password and security preferences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center gap-2">
          <Key size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Change Password</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-slate-900/30 flex items-center gap-2">
          <Shield size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Two-Factor Authentication (2FA)</h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Authenticator App</p>
              <p className="text-slate-400 text-xs mt-0.5">Use an app like Google Authenticator to get 2FA codes.</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
            Enable
          </button>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-red-400 font-bold flex items-center gap-2 mb-1"><AlertTriangle size={16} /> Danger Zone</p>
            <p className="text-slate-400 text-xs">If you notice suspicious activity, you can sign out of all other active sessions.</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors">
            Sign out all sessions
          </button>
        </div>
      </div>
    </div>
  )
}
