'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, CheckCircle, User, Mail, Phone, BookOpen, FileText, GraduationCap, Upload } from 'lucide-react'
import { courses } from '../courses/data'

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-4 py-2.5 rounded-lg border border-neutral-gray bg-white text-primary-navy text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40 focus:border-primary-blue transition-colors placeholder-slate-400 ${className}`}
      {...props}
    />
  )
}

function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-4 py-2.5 rounded-lg border border-neutral-gray bg-white text-primary-navy text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40 focus:border-primary-blue transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

const STEPS = ['Personal', 'Academic', 'Course', 'Review']

export default function ApplyModal({ isOpen, onClose, preselectedCourse = null }) {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    // Personal
    firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '', address: '', city: '', state: '',
    // Academic
    tenthBoard: '', tenthPercent: '', twelfthBoard: '', twelfthPercent: '', twelfthStream: '', entranceScore: '',
    // Course
    courseSlug: preselectedCourse?.slug || '',
    academicYear: '2026-27', category: '', scholarship: false, hostel: false, message: '',
  })

  // sync if preselectedCourse changes after mount
  useEffect(() => {
    if (preselectedCourse) setForm(f => ({ ...f, courseSlug: preselectedCourse.slug }))
  }, [preselectedCourse])

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const selectedCourse = courses.find(c => c.slug === form.courseSlug)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  // ── Validation per step ──
  function validate() {
    const e = {}
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = 'Required'
      if (!form.lastName.trim()) e.lastName = 'Required'
      if (!form.dob) e.dob = 'Required'
      if (!form.gender) e.gender = 'Required'
      if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit number'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email'
    }
    if (step === 1) {
      if (!form.tenthPercent) e.tenthPercent = 'Required'
      if (!form.twelfthPercent) e.twelfthPercent = 'Required'
      if (selectedCourse?.type === 'Postgraduate' && !form.entranceScore) e.entranceScore = 'Required for PG programs'
    }
    if (step === 2) {
      if (!form.courseSlug) e.courseSlug = 'Please select a course'
      if (!form.category) e.category = 'Required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validate()) setStep(s => s + 1) }
  function back() { setStep(s => s - 1) }

  function submit() {
    if (validate()) setSubmitted(true)
  }

  function reset() {
    setStep(0); setSubmitted(false); setErrors({})
    setForm({ firstName: '', lastName: '', dob: '', gender: '', phone: '', email: '', address: '', city: '', state: '', tenthBoard: '', tenthPercent: '', twelfthBoard: '', twelfthPercent: '', twelfthStream: '', entranceScore: '', courseSlug: preselectedCourse?.slug || '', academicYear: '2026-27', category: '', scholarship: false, hostel: false, message: '' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary-navy/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-elevated w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

              {/* ── Header ── */}
              <div className={`relative p-6 pb-4 ${selectedCourse ? `bg-gradient-to-r ${selectedCourse.color}` : 'bg-gradient-to-r from-primary-blue to-secondary-emerald'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                  <X size={16} className="text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Application Form</p>
                    <h2 className="text-white font-bold text-lg leading-tight">
                      {selectedCourse ? selectedCourse.name : 'MISS College'}
                    </h2>
                    {selectedCourse && <p className="text-white/70 text-xs">{selectedCourse.department}</p>}
                  </div>
                </div>

                {/* Step indicator */}
                {!submitted && (
                  <div className="flex items-center gap-1 mt-5">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s}>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${i === step ? 'bg-white text-primary-blue' : i < step ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'}`}>
                          {i < step ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                          <span className="hidden sm:inline">{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-white/60' : 'bg-white/20'}`} />}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Body ── */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-secondary-emerald/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-secondary-emerald" />
                      </div>
                      <h3 className="text-2xl font-bold text-primary-navy mb-2">Application Submitted!</h3>
                      <p className="text-slate-600 mb-1">Thank you, <strong>{form.firstName} {form.lastName}</strong>!</p>
                      <p className="text-slate-500 text-sm mb-2">Your application for <strong>{selectedCourse?.name}</strong> has been received.</p>
                      <p className="text-slate-500 text-sm mb-6">We'll contact you at <strong>{form.email}</strong> within 2–3 working days.</p>
                      <div className="bg-neutral-light rounded-xl p-4 text-left text-sm space-y-1 mb-6 max-w-xs mx-auto">
                        <p className="text-slate-500">Application ID: <span className="font-bold text-primary-navy">MISS-{Date.now().toString().slice(-6)}</span></p>
                        <p className="text-slate-500">Academic Year: <span className="font-bold text-primary-navy">{form.academicYear}</span></p>
                        <p className="text-slate-500">Course: <span className="font-bold text-primary-navy">{selectedCourse?.name}</span></p>
                      </div>
                      <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-primary-blue text-white font-semibold text-sm hover:bg-primary-navy transition-colors">
                        Submit Another Application
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

                      {/* ── Step 0: Personal ── */}
                      {step === 0 && (
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4"><User size={15} className="text-primary-blue" /> Personal Information</p>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="First Name" error={errors.firstName}>
                              <Input placeholder="e.g. Arjun" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                            </Field>
                            <Field label="Last Name" error={errors.lastName}>
                              <Input placeholder="e.g. Kumar" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                            </Field>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Date of Birth" error={errors.dob}>
                              <Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                            </Field>
                            <Field label="Gender" error={errors.gender}>
                              <Select value={form.gender} onChange={e => set('gender', e.target.value)}>
                                <option value="">Select gender</option>
                                {GENDERS.map(g => <option key={g}>{g}</option>)}
                              </Select>
                            </Field>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Mobile Number" error={errors.phone}>
                              <Input type="tel" placeholder="10-digit number" maxLength={10} value={form.phone} onChange={e => set('phone', e.target.value)} />
                            </Field>
                            <Field label="Email Address" error={errors.email}>
                              <Input type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                            </Field>
                          </div>
                          <Field label="Address">
                            <Input placeholder="Street address" value={form.address} onChange={e => set('address', e.target.value)} />
                          </Field>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="City">
                              <Input placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
                            </Field>
                            <Field label="State">
                              <Input placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
                            </Field>
                          </div>
                        </div>
                      )}

                      {/* ── Step 1: Academic ── */}
                      {step === 1 && (
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4"><FileText size={15} className="text-primary-blue" /> Academic Background</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">10th Standard</p>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Board">
                              <Input placeholder="e.g. CBSE / State Board" value={form.tenthBoard} onChange={e => set('tenthBoard', e.target.value)} />
                            </Field>
                            <Field label="Percentage / CGPA" error={errors.tenthPercent}>
                              <Input type="number" min="0" max="100" placeholder="e.g. 85" value={form.tenthPercent} onChange={e => set('tenthPercent', e.target.value)} />
                            </Field>
                          </div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">12th Standard / Equivalent</p>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Board">
                              <Input placeholder="e.g. CBSE / State Board" value={form.twelfthBoard} onChange={e => set('twelfthBoard', e.target.value)} />
                            </Field>
                            <Field label="Percentage / CGPA" error={errors.twelfthPercent}>
                              <Input type="number" min="0" max="100" placeholder="e.g. 78" value={form.twelfthPercent} onChange={e => set('twelfthPercent', e.target.value)} />
                            </Field>
                          </div>
                          <Field label="Stream / Specialization">
                            <Input placeholder="e.g. Science (PCM), Commerce, Arts" value={form.twelfthStream} onChange={e => set('twelfthStream', e.target.value)} />
                          </Field>
                          {selectedCourse?.type === 'Postgraduate' && (
                            <Field label="Entrance Exam Score (if applicable)" error={errors.entranceScore}>
                              <Input placeholder="e.g. CAT 85 percentile / TANCET score" value={form.entranceScore} onChange={e => set('entranceScore', e.target.value)} />
                            </Field>
                          )}
                          {/* Eligibility reminder */}
                          {selectedCourse && (
                            <div className="bg-blue-50 border border-primary-blue/20 rounded-xl p-4 mt-2">
                              <p className="text-xs font-bold text-primary-blue mb-1">Eligibility for {selectedCourse.name}</p>
                              <p className="text-xs text-slate-600">{selectedCourse.eligibility}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Step 2: Course ── */}
                      {step === 2 && (
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4"><BookOpen size={15} className="text-primary-blue" /> Course & Preferences</p>
                          <Field label="Select Course" error={errors.courseSlug}>
                            <Select value={form.courseSlug} onChange={e => set('courseSlug', e.target.value)}>
                              <option value="">-- Choose a course --</option>
                              {['Undergraduate', 'Postgraduate'].map(type => (
                                <optgroup key={type} label={type}>
                                  {courses.filter(c => c.type === type).map(c => (
                                    <option key={c.slug} value={c.slug}>{c.name} — {c.department}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </Select>
                          </Field>

                          {/* Course info card */}
                          {selectedCourse && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 bg-gradient-to-r ${selectedCourse.color} text-white`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{selectedCourse.icon}</span>
                                <div>
                                  <p className="font-bold text-sm">{selectedCourse.name}</p>
                                  <p className="text-white/70 text-xs">{selectedCourse.department}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-white/15 rounded-lg p-2 text-center"><p className="text-white/70">Duration</p><p className="font-bold">{selectedCourse.duration}</p></div>
                                <div className="bg-white/15 rounded-lg p-2 text-center"><p className="text-white/70">Seats</p><p className="font-bold">{selectedCourse.seats}</p></div>
                                <div className="bg-white/15 rounded-lg p-2 text-center"><p className="text-white/70">Fee/yr</p><p className="font-bold">{selectedCourse.fee.split(' ')[0]}</p></div>
                              </div>
                            </motion.div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Academic Year">
                              <Select value={form.academicYear} onChange={e => set('academicYear', e.target.value)}>
                                <option>2026-27</option>
                                <option>2027-28</option>
                              </Select>
                            </Field>
                            <Field label="Category" error={errors.category}>
                              <Select value={form.category} onChange={e => set('category', e.target.value)}>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                              </Select>
                            </Field>
                          </div>

                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.scholarship} onChange={e => set('scholarship', e.target.checked)} className="w-4 h-4 accent-primary-blue" />
                              <span className="text-sm text-slate-700">Apply for Scholarship</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={form.hostel} onChange={e => set('hostel', e.target.checked)} className="w-4 h-4 accent-primary-blue" />
                              <span className="text-sm text-slate-700">Hostel Required</span>
                            </label>
                          </div>

                          <Field label="Additional Message (optional)">
                            <textarea
                              rows={3}
                              placeholder="Any specific queries or information you'd like to share…"
                              value={form.message}
                              onChange={e => set('message', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg border border-neutral-gray bg-white text-primary-navy text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/40 focus:border-primary-blue transition-colors placeholder-slate-400 resize-none"
                            />
                          </Field>
                        </div>
                      )}

                      {/* ── Step 3: Review ── */}
                      {step === 3 && (
                        <div className="space-y-4">
                          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4"><CheckCircle size={15} className="text-primary-blue" /> Review Your Application</p>

                          {[
                            {
                              title: 'Personal Details',
                              rows: [
                                ['Name', `${form.firstName} ${form.lastName}`],
                                ['Date of Birth', form.dob],
                                ['Gender', form.gender],
                                ['Mobile', form.phone],
                                ['Email', form.email],
                                ['City / State', `${form.city}${form.state ? ', ' + form.state : ''}`],
                              ]
                            },
                            {
                              title: 'Academic Details',
                              rows: [
                                ['10th Board', form.tenthBoard || '—'],
                                ['10th %', form.tenthPercent ? form.tenthPercent + '%' : '—'],
                                ['12th Board', form.twelfthBoard || '—'],
                                ['12th %', form.twelfthPercent ? form.twelfthPercent + '%' : '—'],
                                ['Stream', form.twelfthStream || '—'],
                                ...(selectedCourse?.type === 'Postgraduate' ? [['Entrance Score', form.entranceScore || '—']] : []),
                              ]
                            },
                            {
                              title: 'Course Preferences',
                              rows: [
                                ['Course', selectedCourse?.name || '—'],
                                ['Department', selectedCourse?.department || '—'],
                                ['Academic Year', form.academicYear],
                                ['Category', form.category],
                                ['Scholarship', form.scholarship ? 'Yes' : 'No'],
                                ['Hostel', form.hostel ? 'Yes' : 'No'],
                              ]
                            }
                          ].map(section => (
                            <div key={section.title} className="bg-neutral-light rounded-xl p-4">
                              <p className="text-xs font-bold text-primary-blue uppercase tracking-wider mb-3">{section.title}</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {section.rows.map(([label, value]) => (
                                  <div key={label}>
                                    <p className="text-xs text-slate-500">{label}</p>
                                    <p className="text-sm font-semibold text-primary-navy truncate">{value || '—'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          <p className="text-xs text-slate-500 text-center pt-2">
                            By submitting, you agree to our <span className="text-primary-blue underline cursor-pointer">Terms & Conditions</span> and <span className="text-primary-blue underline cursor-pointer">Privacy Policy</span>.
                          </p>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              {!submitted && (
                <div className="px-6 py-4 border-t border-neutral-gray flex items-center justify-between bg-white">
                  <button
                    onClick={step === 0 ? onClose : back}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-gray text-slate-600 text-sm font-semibold hover:bg-neutral-light transition-colors"
                  >
                    <ChevronLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
                  </button>

                  <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary-blue' : i < step ? 'w-3 bg-primary-blue/40' : 'w-3 bg-neutral-gray'}`} />
                    ))}
                  </div>

                  {step < STEPS.length - 1 ? (
                    <button
                      onClick={next}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-blue text-white text-sm font-bold hover:bg-primary-navy transition-colors"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary-emerald text-white text-sm font-bold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={15} /> Submit
                    </button>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
