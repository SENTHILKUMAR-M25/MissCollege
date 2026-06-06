"use client"

import { useState } from "react"
import { Save, User, Mail, Phone, Lock, Camera, Upload } from "lucide-react"

export default function ProfileSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">My Profile</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage your personal information</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/25">
          <Save size={15} /> Save Profile
        </button>
      </div>

      <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-amber-500/20">
              AD
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-white hover:bg-slate-600 transition-colors">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Admin User</h3>
            <p className="text-slate-400 text-sm mb-2">Administrator</p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">First Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-3 text-slate-500" />
              <input defaultValue="Admin" className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Last Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-3 text-slate-500" />
              <input defaultValue="User" className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
              <input defaultValue="admin@miss.edu" className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-3 text-slate-500" />
              <input defaultValue="+91 9876543210" className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
