"use client"

import { useState } from "react"
import { Settings, Key, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

export default function StudentSettingsPage() {
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
      const res = await fetch("/api/student/change-password", {
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

  const inp = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-black text-sm focus:outline-none focus:border-[#2F2FE4]/50 placeholder:text-gray-400 pr-10"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 flex items-center justify-center text-[#2F2FE4]">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-black text-2xl font-bold">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage account preferences</p>
        </div>
      </div>

      <div className="max-w-md rounded-2xl bg-white border border-gray-200 p-6 space-y-5">
        <div>
          <h3 className="text-black font-bold flex items-center gap-2"><Key size={15} className="text-[#2F2FE4]" /> Change Password</h3>
          <p className="text-gray-500 text-xs mt-0.5">Use a strong password for security</p>
        </div>

        <button onClick={() => { resetPwd(); setShowModal(true) }} className="w-full py-2.5 rounded-xl bg-[#2F2FE4]/10 border border-[#2F2FE4]/20 text-[#2F2FE4] text-sm font-semibold hover:bg-[#2F2FE4]/15 transition-colors">
          Open Change Password
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetPwd() }} title="Change Password" size="md">
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {[
            { label: "Current Password", value: currentPwd, setter: setCurrentPwd, placeholder: "Enter current password" },
            { label: "New Password", value: newPwd, setter: setNewPwd, placeholder: "Min 6 characters" },
            { label: "Confirm New Password", value: confirmPwd, setter: setConfirmPwd, placeholder: "Repeat new password" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="text-gray-500 text-xs mb-1.5 block font-medium">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  required
                  className={inp}
                />
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetPwd() }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50 transition-colors">{loading ? "Updating..." : "Update Password"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
