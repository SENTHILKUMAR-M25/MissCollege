"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import Modal from "@/components/ui/Modal"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters")
      setLoading(false)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }
    try {
      const res = await fetch("/api/faculty/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Password changed successfully")
        setTimeout(() => router.push("/faculty/profile"), 1000)
      } else {
        toast.error(data.error || "Failed to change password")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Modal isOpen={showModal} onClose={() => router.back()} title="Change Your Password" size="md">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block font-medium">Current Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block font-medium">New Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50 pr-10"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1.5 block font-medium">Confirm New Password *</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-black text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2F2FE4]/50 pr-10"
            />
          </div>
          <button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword} className="w-full py-3 rounded-xl bg-[#2F2FE4] text-white text-sm font-semibold hover:bg-[#2525c5] disabled:opacity-50 transition shadow-lg shadow-[#2F2FE4]/20">
            {loading ? "Updating Password..." : "Change Password"}
          </button>
        </form>
      </Modal>
    </div>
  )
}
