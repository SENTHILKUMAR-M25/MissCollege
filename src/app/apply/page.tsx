"use client"

import { useState } from "react"
import { submitApplication } from "@/actions/admissions"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const COURSES = [
  "B.S.W – Social Work","B.Com","B.Com – Computer Applications",
  "B.Sc – Computer Science","B.Sc – Information Technology",
  "B.B.A.","B.A – English","B.Sc – Psychology",
  "M.S.W. – Social Work","PGDC – Counselling","PGDPMIR","PGDCA – Computer Applications",
]
const BOARDS = ["State Board (Tamil Nadu)","CBSE","ICSE","Matriculation","Others"]
const inp = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const sel = inp

type Form = {
  name: string; email: string; phone: string; dob: string; gender: string; address: string
  courseApplied: string; department: string; qualification: string
  previousSchool: string; previousBoard: string; previousPercent: string
  parentName: string; parentPhone: string; parentOccupation: string
}

function blank(): Form {
  return { name:"",email:"",phone:"",dob:"",gender:"",address:"",
    courseApplied:"",department:"",qualification:"",
    previousSchool:"",previousBoard:"",previousPercent:"",
    parentName:"",parentPhone:"",parentOccupation:"" }
}

export default function ApplyPage() {
  const [form, setForm] = useState<Form>(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{applicationNo: string} | null>(null)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError("")
    const res = await submitApplication(form)
    if (res.success) {
      setSuccess({ applicationNo: res.applicationNo! })
    } else {
      setError(res.error || "Failed to submit")
    }
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-blue-600 text-sm font-medium">Your Application Number</p>
            <p className="text-blue-800 text-2xl font-black">{success.applicationNo}</p>
          </div>
          <p className="text-gray-500 text-sm mb-6">Save this number for tracking. We'll review your application and contact you soon.</p>
          <button onClick={() => { setSuccess(null); setForm(blank()); setStep(1) }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
            Submit Another Application
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Apply for Admission</h1>
            <p className="text-gray-500 mt-2">Fill the form below to apply to MISS College</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {["Personal","Academic","Parent & Submit"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-medium ${step === i + 1 ? "text-blue-600" : "text-gray-400"}`}>{s}</span>
                {i < 2 && <div className="w-8 h-px bg-gray-300" />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>

              {/* Step 1: Personal */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                      <input value={form.name} onChange={e => set("name", e.target.value)} required className={inp} placeholder="As per certificate" /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                      <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required className={inp} /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Phone *</label>
                      <input value={form.phone} onChange={e => set("phone", e.target.value)} required className={inp} /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
                      <input type="date" value={form.dob} onChange={e => set("dob", e.target.value)} className={inp} /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                      <select value={form.gender} onChange={e => set("gender", e.target.value)} className={sel}>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Course Applied *</label>
                      <select value={form.courseApplied} onChange={e => set("courseApplied", e.target.value)} required className={sel}>
                        <option value="">Select course</option>
                        {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select></div>
                  </div>
                  <div><label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                    <textarea value={form.address} onChange={e => set("address", e.target.value)} rows={2} className={inp + " resize-none"} /></div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => { if (!form.name||!form.email||!form.phone||!form.courseApplied) { setError("Fill required fields"); return } setError(""); setStep(2) }}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Next →</button>
                  </div>
                </div>
              )}

              {/* Step 2: Academic */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Academic Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Highest Qualification</label>
                      <select value={form.qualification} onChange={e => set("qualification", e.target.value)} className={sel}>
                        <option value="">Select</option>
                        <option>HSC / 12th</option><option>Diploma</option><option>UG Degree</option><option>PG Degree</option>
                      </select></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Previous School / College</label>
                      <input value={form.previousSchool} onChange={e => set("previousSchool", e.target.value)} className={inp} /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Board / University</label>
                      <select value={form.previousBoard} onChange={e => set("previousBoard", e.target.value)} className={sel}>
                        <option value="">Select</option>
                        {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Percentage / CGPA</label>
                      <input value={form.previousPercent} onChange={e => set("previousPercent", e.target.value)} className={inp} placeholder="e.g. 85% or 8.5 CGPA" /></div>
                  </div>
                  <div className="flex justify-between">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">← Back</button>
                    <button type="button" onClick={() => { setError(""); setStep(3) }} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Next →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Parent + Submit */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Parent / Guardian Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Parent / Guardian Name</label>
                      <input value={form.parentName} onChange={e => set("parentName", e.target.value)} className={inp} /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Parent Phone</label>
                      <input value={form.parentPhone} onChange={e => set("parentPhone", e.target.value)} className={inp} /></div>
                    <div><label className="text-sm font-medium text-gray-700 mb-1 block">Parent Occupation</label>
                      <input value={form.parentOccupation} onChange={e => set("parentOccupation", e.target.value)} className={inp} /></div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm space-y-1">
                    <p className="font-semibold text-blue-800 mb-2">Application Summary</p>
                    <p className="text-gray-700"><span className="font-medium">Name:</span> {form.name}</p>
                    <p className="text-gray-700"><span className="font-medium">Course:</span> {form.courseApplied}</p>
                    <p className="text-gray-700"><span className="font-medium">Qualification:</span> {form.qualification || "—"}</p>
                    <p className="text-gray-700"><span className="font-medium">Percentage:</span> {form.previousPercent || "—"}</p>
                  </div>

                  <div className="flex justify-between">
                    <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">← Back</button>
                    <button type="submit" disabled={loading}
                      className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-50 transition">
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
