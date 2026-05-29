'use client'

import React, { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ApplyModal from '../../components/ApplyModal'
import { getCourse, courses } from '../data'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Users, BookOpen, Award, ChevronDown, ChevronRight,
  CheckCircle, ArrowRight, Download, Phone, Mail,
  GraduationCap, Briefcase, Star, Building2, Calendar
} from 'lucide-react'

export default function CourseDetail({ params }) {
  const course = getCourse(params.slug)
  if (!course) notFound()

  const [openSem, setOpenSem] = useState(0)
  const [applyOpen, setApplyOpen] = useState(false)

  const stats = [
    { icon: Clock, label: 'Duration', value: course.duration },
    { icon: Users, label: 'Seats', value: course.seats },
    { icon: BookOpen, label: 'Mode', value: course.mode },
    { icon: Award, label: 'Type', value: course.type },
  ]

  return (
    <>
      <Navbar />
      <ApplyModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} preselectedCourse={course} />

      {/* ── Hero ── */}
      <div className={`relative bg-gradient-to-br ${course.color} overflow-hidden`}>
        <div className="absolute inset-0 bg-primary-navy/60" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/academics" className="hover:text-white transition-colors">Academics</Link>
            <ChevronRight size={14} />
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} />
            <span className="text-white">{course.name}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Left – course info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{course.icon}</span>
                <div>
                  <span className="inline-block bg-secondary-gold text-primary-navy text-xs font-bold px-3 py-1 rounded-full mb-2">
                    {course.type}
                  </span>
                  <p className="text-white/80 text-sm">{course.department}</p>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
                {course.name}
              </h1>
              <p className="text-white/70 text-lg mb-6">{course.degree}</p>
              <p className="text-white/90 text-base leading-relaxed max-w-2xl mb-8">{course.overview}</p>
              <div className="flex flex-wrap gap-3">
                {stats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                    <Icon size={15} className="text-secondary-gold" />
                    <span className="text-white/70 text-xs">{label}:</span>
                    <span className="text-white text-xs font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              {/* Hero CTA (mobile visible) */}
              <button
                onClick={() => setApplyOpen(true)}
                className="mt-8 lg:hidden px-8 py-3 rounded-xl bg-secondary-gold text-primary-navy font-bold hover:bg-yellow-400 transition-colors shadow-lg"
              >
                Apply Now
              </button>
            </div>

            {/* Right – apply card (desktop) */}
            <div className="hidden lg:block">
              <ApplyCard course={course} onApply={() => setApplyOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-10 items-start">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-14">

            {/* Highlights */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionHeading icon={Star} title="Course Highlights" />
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {course.highlights.map((h, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                    <CheckCircle size={18} className="text-primary-blue mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{h}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Curriculum */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionHeading icon={BookOpen} title="Curriculum" />
              <div className="mt-6 space-y-3">
                {course.curriculum.map((sem, i) => (
                  <div key={i} className="border border-neutral-gray rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenSem(openSem === i ? -1 : i)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-neutral-light hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="font-semibold text-primary-navy">{sem.semester}</span>
                        <span className="text-xs text-slate-500 hidden sm:inline">— {sem.subjects.length} subjects</span>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${openSem === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSem === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <ul className="px-5 py-4 bg-white grid sm:grid-cols-2 gap-2">
                            {sem.subjects.map((sub, j) => (
                              <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-blue flex-shrink-0" />{sub}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Faculty */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionHeading icon={GraduationCap} title="Faculty" />
              <div className="mt-6 grid sm:grid-cols-2 gap-5">
                {course.faculty.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-white border border-neutral-gray rounded-xl p-5 hover:shadow-medium transition-shadow">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${course.color} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                      {f.name.charAt(f.name.indexOf(' ') + 1)}
                    </div>
                    <div>
                      <p className="font-bold text-primary-navy text-sm">{f.name}</p>
                      <p className="text-primary-blue text-xs font-semibold">{f.designation}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{f.qualification}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Career Prospects */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionHeading icon={Briefcase} title="Career Prospects" />
              <div className="mt-6 flex flex-wrap gap-3">
                {course.careerProspects.map((c, i) => (
                  <motion.span key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-white border border-neutral-gray rounded-full px-4 py-2 text-sm text-slate-700 hover:border-primary-blue hover:text-primary-blue hover:bg-blue-50 transition-colors">
                    <ArrowRight size={13} className="text-primary-blue" />{c}
                  </motion.span>
                ))}
              </div>
            </motion.section>

            {/* Top Recruiters */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionHeading icon={Building2} title="Top Recruiters" />
              <div className="mt-6 grid grid-cols-4 sm:grid-cols-8 gap-3">
                {course.topRecruiters.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="aspect-square bg-white border border-neutral-gray rounded-xl flex items-center justify-center text-center p-2 hover:shadow-medium hover:border-primary-blue transition-all">
                    <span className="text-xs font-bold text-primary-navy leading-tight">{r}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Eligibility & Fees */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <SectionHeading icon={Calendar} title="Eligibility & Fee Details" />
              <div className="mt-6 grid sm:grid-cols-2 gap-5">
                {[
                  { label: 'Eligibility', value: course.eligibility },
                  { label: 'Annual Fee', value: course.fee },
                  { label: 'Affiliation', value: course.affiliation },
                  { label: 'Accreditation', value: course.accreditation },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-neutral-light rounded-xl p-5 border border-neutral-gray">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-primary-navy font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Bottom CTA banner */}
            <div className={`rounded-2xl bg-gradient-to-r ${course.color} p-8 text-white text-center`}>
              <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Ready to join {course.name}?</h3>
              <p className="text-white/80 text-sm mb-5">Limited seats available for {new Date().getFullYear() + 1}–{(new Date().getFullYear() + 2).toString().slice(2)} batch</p>
              <button
                onClick={() => setApplyOpen(true)}
                className="px-8 py-3 rounded-xl bg-white text-primary-navy font-bold hover:bg-neutral-light transition-colors shadow-lg"
              >
                Apply Now — {course.fee}
              </button>
            </div>
          </div>

          {/* Right sidebar (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <ApplyCard course={course} onApply={() => setApplyOpen(true)} />
              <RelatedCourses current={course} />
            </div>
          </div>
        </div>

        {/* Mobile apply card */}
        <div className="lg:hidden mt-10">
          <ApplyCard course={course} onApply={() => setApplyOpen(true)} />
          <div className="mt-6"><RelatedCourses current={course} /></div>
        </div>
      </div>

      <Footer />
    </>
  )
}

/* ── Sub-components ── */

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-primary-blue" />
      </div>
      <h2 className="text-2xl font-bold text-primary-navy" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>
      <div className="flex-1 h-px bg-neutral-gray" />
    </div>
  )
}

function ApplyCard({ course, onApply }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-gray shadow-medium overflow-hidden">
      <div className={`bg-gradient-to-br ${course.color} p-5`}>
        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Annual Fee</p>
        <p className="text-white text-3xl font-bold">{course.fee}</p>
        <p className="text-white/70 text-xs mt-1">Scholarships available</p>
      </div>
      <div className="p-5 space-y-3">
        <button
          onClick={onApply}
          className="block w-full text-center bg-primary-blue text-white font-bold py-3 rounded-xl hover:bg-primary-navy transition-colors"
        >
          Apply Now
        </button>
        <Link
          href="/downloads"
          className="flex items-center justify-center gap-2 w-full border-2 border-primary-blue text-primary-blue font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
        >
          <Download size={15} /> Download Brochure
        </Link>
        <div className="border-t border-neutral-gray pt-4 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Info</p>
          {[
            { icon: Clock, label: 'Duration', value: course.duration },
            { icon: Users, label: 'Total Seats', value: course.seats },
            { icon: BookOpen, label: 'Mode', value: course.mode },
            { icon: Award, label: 'Affiliation', value: course.affiliation },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-500"><Icon size={14} /> {label}</div>
              <span className="font-semibold text-primary-navy text-right max-w-[55%] leading-tight">{value}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-neutral-gray pt-4 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Need Help?</p>
          <a href="tel:+914522345678" className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-blue transition-colors">
            <Phone size={14} className="text-primary-blue" /> +91 452 234 5678
          </a>
          <a href="mailto:admissions@misscollege.edu.in" className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-blue transition-colors">
            <Mail size={14} className="text-primary-blue" /> admissions@misscollege.edu.in
          </a>
        </div>
      </div>
    </div>
  )
}

function RelatedCourses({ current }) {
  const related = courses.filter(c => c.slug !== current.slug && c.type === current.type).slice(0, 3)
  if (!related.length) return null
  return (
    <div className="bg-white rounded-2xl border border-neutral-gray p-5">
      <p className="font-bold text-primary-navy mb-4">Related Courses</p>
      <div className="space-y-3">
        {related.map(c => (
          <Link key={c.slug} href={`/courses/${c.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-navy group-hover:text-primary-blue transition-colors truncate">{c.name}</p>
              <p className="text-xs text-slate-500">{c.duration} · {c.type}</p>
            </div>
            <ArrowRight size={14} className="text-slate-300 group-hover:text-primary-blue transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
      <Link href="/courses" className="block text-center text-xs font-semibold text-primary-blue mt-4 hover:underline">View all courses →</Link>
    </div>
  )
}
