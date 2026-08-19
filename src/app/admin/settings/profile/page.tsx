"use client"

import { useState } from "react"
import { Mail, ShieldCheck, Key, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

export default function ProfileSettingsPage() {
  const [showModal, setShowModal] = useState(false)
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const resetPwd = () => {
    setCurrentPwd("")
    setNewPwd("")
    setConfirmPwd("")
    setShow(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) return toast.error("Passwords do not match")
    if (newPwd.length < 6) return toast.error("Password must be at least 6 characters")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password changed successfully")
        setShowModal(false)
        resetPwd()
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setLoading(false)
  }

  const inp = "w-full bg-gray-100 border border-gray-200 rounded-xl pl-3 pr-10 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50"
  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400"
      case "INACTIVE":
        return "bg-slate-500/10 text-gray-500"
      default:
        return "bg-[#2F2FE4]/10 text-[#2F2FE4]"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-black text-2xl font-bold">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl bg-white border border-gray-200 border border-gray-100 p-6 space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#2F2FE4] flex items-center justify-center text-black text-2xl font-bold shadow-lg shadow-[#2F2FE4]/20">AD</div>
            <h2 className="text-black text-lg font-bold mt-3">Admin User</h2>
            <p className="text-[#2F2FE4] text-sm font-medium">Administrator</p>
            <p className="text-gray-500 text-xs">Platform Administrator</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
              <Mail size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Email</p>
                <p className="text-black text-xs truncate">admin@miss.edu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
              <ShieldCheck size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Role</p>
                <p className="text-black text-xs">System Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
              <ShieldCheck size={16} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] uppercase font-semibold">Account Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor("ACTIVE")}`}>Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 border border-gray-100 p-6 space-y-6">
          <div>
            <h3 className="text-black font-bold text-base">Personal Information</h3>
            <p className="text-gray-400 text-xs mt-0.5">Basic details from your account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">First Name</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">Admin</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Last Name</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">User</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Email Address</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">admin@miss.edu</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">Phone Number</p>
              <p className="text-black text-sm bg-gray-100 rounded-lg px-3 py-2">+91 9876543210</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button className="px-4 py-2 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-xs font-semibold hover:bg-[#2F2FE4]/10 transition-all">Edit Profile</button>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-all">Change Password</button>
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetPwd() }} title="Change Password" size="md">
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block font-medium">Current Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="Enter current password" required className={inp} />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">{show ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block font-medium">New Password</label>
            <input type={show ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min 6 characters" required minLength={6} className={inp} />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block font-medium">Confirm New Password</label>
            <input type={show ? "text" : "password"} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Confirm new password" required minLength={6} className={inp} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetPwd() }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors">{loading ? "Updating..." : "Update Password"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
