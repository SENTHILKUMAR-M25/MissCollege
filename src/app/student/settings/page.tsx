"use client"

import { useState } from "react"
import { Settings, Key, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

export default function StudentSettingsPage() {
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) return toast.error("Passwords do not match")
    if (newPwd.length < 6) return toast.error("Password must be at least 6 characters")
    setLoading(true)
    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password changed successfully")
        setCurrentPwd("")
        setNewPwd("")
        setConfirmPwd("")
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setLoading(false)
  }

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500/50 placeholder:text-slate-500 pr-10"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage account preferences</p>
        </div>
      </div>

      <div className="max-w-md rounded-2xl bg-slate-800/50 border border-white/5 p-6 space-y-5">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2"><Key size={15} className="text-teal-400" /> Change Password</h3>
          <p className="text-slate-400 text-xs mt-0.5">Use a strong password for security</p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: "Current Password", value: currentPwd, setter: setCurrentPwd, placeholder: "Enter current password" },
            { label: "New Password", value: newPwd, setter: setNewPwd, placeholder: "Min 6 characters" },
            { label: "Confirm New Password", value: confirmPwd, setter: setConfirmPwd, placeholder: "Repeat new password" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="text-slate-400 text-xs mb-1.5 block font-medium">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  required
                  className={inp}
                />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-teal-500/20 border border-teal-500/20 text-teal-400 text-sm font-semibold hover:bg-teal-500/30 disabled:opacity-50 transition-colors">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
