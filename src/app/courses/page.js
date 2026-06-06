'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ApplyModal from '../components/ApplyModal'
import { courses } from './data'
import { motion } from 'framer-motion'
import { Clock, Users, ArrowRight, Search } from 'lucide-react'

const TYPES = ['All', 'Undergraduate', 'Postgraduate']

export default function CoursesPage() {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const visible = courses.filter((c) => {
    const matchType = filter === 'All' || c.type === filter
    const matchQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.department.toLowerCase().includes(query.toLowerCase())
    return matchType && matchQuery
  })

  function openApply(course, e) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCourse(course)
    setApplyOpen(true)
  }

  return (
    <>
      <Navbar />
      <ApplyModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} preselectedCourse={selectedCourse} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-navy via-primary-blue to-secondary-emerald py-20 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Explore Our Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-white/80 text-lg mb-8 max-w-xl mx-auto"
          >
            {courses.length} programs across {[...new Set(courses.map(c => c.department))].length} departments
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="relative max-w-md mx-auto"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses or departments…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-primary-navy placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-gold shadow-medium"
            />
          </motion.div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-neutral-gray sticky top-[var(--navbar-h,80px)] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-3">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === t
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'bg-neutral-light text-slate-600 hover:bg-blue-50 hover:text-primary-blue'
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            {visible.length} course{visible.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {visible.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold">No courses found</p>
            <p className="text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {visible.map((course, i) => (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="bg-white rounded-2xl border border-neutral-gray shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden h-full flex flex-col group">
                  {/* Card top */}
                  <div className={`bg-gradient-to-br ${course.color} p-6 relative overflow-hidden`}>
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                    <span className="text-4xl">{course.icon}</span>
                    <span className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {course.type}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-primary-blue uppercase tracking-wider mb-1">{course.department}</p>
                    <h3 className="text-lg font-bold text-primary-navy mb-1">
                      {course.name}
                    </h3>
                    <p className="text-slate-500 text-sm mb-3">{course.degree}</p>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 flex-1">{course.overview}</p>

                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-neutral-gray text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {course.seats} seats</span>
                      <span className="ml-auto font-semibold text-primary-blue">{course.fee}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-primary-blue text-primary-blue text-sm font-semibold hover:bg-blue-50 transition-colors"
                      >
                        View Details <ArrowRight size={14} />
                      </Link>
                      <button
                        onClick={(e) => openApply(course, e)}
                        className="flex-1 py-2.5 rounded-xl bg-primary-blue text-white text-sm font-bold hover:bg-primary-navy transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  )
}
