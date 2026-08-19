"use client"

import { useState } from "react"
import { Save, User, Mail, Phone, Lock, Building, Upload } from "lucide-react"

export default function GeneralSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-black font-bold text-xl">General Settings</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage your institution's profile and preferences</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2F2FE4] to-[#4F6FE4] text-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-[#2F2FE4]/20">
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div className="bg-white border border-gray-200 border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-black font-semibold text-sm">Institution Details</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center relative overflow-hidden group">
              <span className="text-gray-400 text-xs">Logo</span>
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={20} className="text-black mb-1" />
                <span className="text-black text-[10px]">Upload</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block">Institution Name</label>
                  <input defaultValue="MISS College of Arts and Science" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block">Short Name / Code</label>
                  <input defaultValue="MISS" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
                <input defaultValue="info@miss.edu" className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                <input defaultValue="+91 9876543210" className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-gray-500 text-xs mb-1.5 block">Address</label>
              <textarea rows={3} defaultValue="123 Education Street, Knowledge City, State - 600001" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50 resize-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-black font-semibold text-sm">Academic Settings</h3>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Current Academic Year</label>
            <select className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50">
              <option className="bg-white">2025-2026</option>
              <option className="bg-white">2024-2025</option>
            </select>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block">Current Semester Phase</label>
            <select className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50">
              <option className="bg-white">Odd Semester (1,3,5)</option>
              <option className="bg-white">Even Semester (2,4,6)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
