"use client"

import { useState } from "react"
import { submitEnquiry } from "@/actions/admissions"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const COURSES = [
  "B.S.W – Social Work","B.Com","B.Com – Computer Applications",
  "B.Sc – Computer Science","B.Sc – Information Technology",
  "B.B.A.","B.A – English","B.Sc – Psychology",
  "M.S.W. – Social Work","PGDC – Counselling","PGDPMIR","PGDCA – Computer Applications","Other",
]
const inp = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

export default function EnquiryPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", course: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await submitEnquiry(form)
    res.success ? setSuccess(true) : setError(res.error || "Failed to submit")
    setLoading(false)
  }

  if (success) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Enquiry Submitted!</h2>
          <p className="text-gray-600 mb-2">Thank you for your interest in MISS College.</p>
          <p className="text-gray-500 text-sm mb-6">Our admissions team will contact you within 24 hours.</p>
          <button onClick={() => { setSuccess(false); setForm({ name:"",email:"",phone:"",course:"",message:"" }) }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
            Submit Another Enquiry
          </button>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Send an Enquiry</h1>
            <p className="text-gray-500 mt-2">Have questions? We'll get back to you within 24 hours.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Your full name" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="your@email.com" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)} required placeholder="10-digit mobile" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Course of Interest *</label>
                  <select value={form.course} onChange={e => set("course", e.target.value)} required className={inp}>
                    <option value="">Select a course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Your Message</label>
                <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={4} placeholder="Ask us anything about admission, fees, eligibility..." className={inp + " resize-none"} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 transition">
                {loading ? "Submitting..." : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
