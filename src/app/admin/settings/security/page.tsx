"use client"

import { useState } from "react"
import { Save, Shield, Key, Smartphone, AlertTriangle } from "lucide-react"

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-black font-bold text-xl">Security Settings</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage your password and security preferences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] text-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-[#2F2FE4]/20">
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div className="bg-white border border-gray-200 border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Key size={16} className="text-[#2F2FE4]" />
          <h3 className="text-black font-semibold text-sm">Change Password</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full max-w-md bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full max-w-md bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full max-w-md bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Shield size={16} className="text-[#2F2FE4]" />
          <h3 className="text-black font-semibold text-sm">Two-Factor Authentication (2FA)</h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-black font-semibold text-sm">Authenticator App</p>
              <p className="text-gray-500 text-xs mt-0.5">Use an app like Google Authenticator to get 2FA codes.</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-black text-sm font-semibold hover:bg-gray-100 transition-colors">
            Enable
          </button>
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-red-400 font-bold flex items-center gap-2 mb-1"><AlertTriangle size={16} /> Danger Zone</p>
            <p className="text-gray-500 text-xs">If you notice suspicious activity, you can sign out of all other active sessions.</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors">
            Sign out all sessions
          </button>
        </div>
      </div>
    </div>
  )
}
