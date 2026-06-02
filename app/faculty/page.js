'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  Search, Grid3X3, List, ChevronDown, ChevronUp,
  Mail, ExternalLink, Award, Users, BookOpen,
  GraduationCap, Library, Star, Building2, Phone,
} from 'lucide-react'

/* ─────────────────────────── DATA ─────────────────────────── */

const PRINCIPAL = {
  name: 'Dr. P. Jaya Kumar',
  qualifications: ['M.A (SW)', 'M.B.A', 'MHRM', 'M.Phil', 'Ph.D'],
  designation: 'Principal (i/c)',
  initials: 'PJK',
}

const PG_FACULTY = [
  { name: 'Mr. T.M. Venkatamurugan', qualification: 'M.A (SW), M.Phil',        designation: 'Assistant Professor', initials: 'TMV' },
  { name: 'Dr. M. Nisanth',          qualification: 'M.A, M.Phil, Ph.D',        designation: 'Assistant Professor', initials: 'MN'  },
  { name: 'Dr. A. Arun Raj Kumar',   qualification: 'MSW, MBA, Ph.D',           designation: 'Assistant Professor', initials: 'ARK' },
  { name: 'Mrs. R. Rajalakshmi',     qualification: 'MSW, M.Phil',              designation: 'Assistant Professor', initials: 'RR'  },
  { name: 'Mrs. S. Joyce Jeyarani',  qualification: 'MSW, PGDC',               designation: 'Assistant Professor', initials: 'SJJ' },
  { name: 'Dr. Gurumoorthi V',       qualification: 'MSW, Ph.D',               designation: 'Assistant Professor', initials: 'GV'  },
  { name: 'Mr. S. Charles',          qualification: 'MSW, M.Phil',              designation: 'Assistant Professor', initials: 'SC'  },
  { name: 'Mrs. Meenaloshini',       qualification: 'MSW, M.Phil, PGDC',       designation: 'Assistant Professor', initials: 'ML'  },
]

const GUEST_DEPARTMENTS = [
  {
    dept: 'Computer Science',
    color: 'from-blue-600 to-cyan-500',
    icon: '💻',
    lecturers: ['Mr. A. Ahamed Samiullah','Ms. S.A. Sowmiya','Ms. S. Devi Durga','Ms. V.N. Uma Shalini','Ms. M. Suganyaveni'],
  },
  {
    dept: 'Commerce',
    color: 'from-emerald-600 to-teal-500',
    icon: '📊',
    lecturers: ['Ms. K. Hafisha','Mr. M. Siva Rama Krishnan','Ms. K. Vellaimmal','Ms. K. Rajasuprabha','Ms. K. Mathibala','Ms. J. Jeyapriyadharshini'],
  },
  {
    dept: 'Social Work',
    color: 'from-violet-600 to-purple-500',
    icon: '🤝',
    lecturers: ['Ms. J. Arulmozhi','Ms. A. Margret Sherly'],
  },
  {
    dept: 'Business Administration',
    color: 'from-orange-600 to-amber-500',
    icon: '🏢',
    lecturers: ['Dr. G.A. Prabha','Ms. R. Suganya','Mr. T. Senthilkumaran'],
  },
  {
    dept: 'English Literature',
    color: 'from-rose-600 to-pink-500',
    icon: '📖',
    lecturers: ['Ms. J. Sujitha','Ms. M. Chidambara Vadivoo'],
  },
  {
    dept: 'Tamil',
    color: 'from-yellow-600 to-lime-500',
    icon: '🌿',
    lecturers: ['Dr. K. S. Rajakumari','Mr. V. Nagaraj'],
  },
  {
    dept: 'Psychology',
    color: 'from-indigo-600 to-blue-500',
    icon: '🧠',
    lecturers: ['Ms. S. Vaishnavy','Ms. S. Anithalakshmi','Mr. K.T. Jaswant'],
  },
]

const LIBRARIAN = {
  name: 'Dr. D. Chinnadurai',
  designation: 'Librarian',
  initials: 'DC',
}

const STATS = [
  { label: 'Total Academic Staff', value: 25, suffix: '+', icon: Users,          color: 'from-blue-600 to-cyan-500'    },
  { label: 'Assistant Professors', value: 8,  suffix: '',  icon: GraduationCap,  color: 'from-violet-600 to-purple-500'},
  { label: 'Guest Lecturers',      value: 23, suffix: '',  icon: Star,           color: 'from-emerald-600 to-teal-500' },
  { label: 'Departments Covered',  value: 8,  suffix: '',  icon: Building2,      color: 'from-orange-600 to-amber-500' },
  { label: 'Library Professionals',value: 1,  suffix: '',  icon: Library,        color: 'from-rose-600 to-pink-500'    },
]

const DEPT_FILTERS = [
  'All Departments','Social Work','Computer Science','Commerce',
  'Business Administration','English Literature','Tamil','Psychology','Library',
]

/* ───────────────────── ANIMATED COUNTER ───────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const step = Math.ceil(target / 60)
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(start)
        }, 25)
      }
    }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ───────────────────── AVATAR BUBBLE ─────────────────────── */
function Avatar({ initials, size = 'md', gradient = 'from-blue-600 to-indigo-700' }) {
  const sizes = { sm: 'w-10 h-10 text-sm', md: 'w-16 h-16 text-xl', lg: 'w-24 h-24 text-3xl', xl: 'w-32 h-32 text-4xl' }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  )
}

/* ───────────────────── FACULTY CARD (GRID) ─────────────────── */
const gradients = [
  'from-blue-600 to-indigo-700','from-violet-600 to-purple-700',
  'from-emerald-600 to-teal-700','from-orange-600 to-amber-700',
  'from-rose-600 to-pink-700','from-cyan-600 to-blue-700',
  'from-lime-600 to-emerald-700','from-fuchsia-600 to-violet-700',
]

function FacultyCard({ member, index, view }) {
  const grad = gradients[index % gradients.length]

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="bg-white rounded-2xl p-5 flex items-center gap-5 shadow-soft hover:shadow-medium transition-all border border-gray-100 group"
      >
        <Avatar initials={member.initials} size="md" gradient={grad} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-primary-navy text-lg leading-tight">{member.name}</h3>
          <p className="text-primary-blue text-sm font-medium mt-0.5">{member.qualification}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
            {member.designation}
          </span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Contact">
            <Mail size={16} />
          </button>
          <button className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors" title="Profile">
            <ExternalLink size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all border border-gray-100 group"
    >
      {/* Card top strip */}
      <div className={`h-2 bg-gradient-to-r ${grad}`} />

      <div className="p-6 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Avatar initials={member.initials} size="lg" gradient={grad} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white" />
        </div>

        <h3 className="font-bold text-primary-navy text-base leading-tight mb-1">{member.name}</h3>
        <p className="text-primary-blue text-xs font-medium mb-3 leading-snug">{member.qualification}</p>
        <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-full font-semibold border border-blue-100 mb-4">
          {member.designation}
        </span>

        <div className="flex gap-2 w-full">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-blue text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
            <Mail size={13} /> Contact
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors">
            <ExternalLink size={13} /> Profile
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────── GUEST LECTURER ACCORDION ──────────────────── */
function GuestAccordion({ dept, lecturers, color, icon, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl overflow-hidden shadow-soft border border-gray-100"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-primary-navy text-base">Department of {dept}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{lecturers.length} Guest Lecturer{lecturers.length > 1 ? 's' : ''}</p>
        </div>
        <div className={`p-2 rounded-xl transition-colors ${open ? 'bg-blue-100 text-primary-blue' : 'bg-gray-100 text-gray-500'}`}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {lecturers.map((name, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary-navy truncate">{name}</p>
                      <p className="text-xs text-gray-500">Guest Lecturer</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────── FLOATING PARTICLE ─────────────────────── */
function Particle({ delay, x, y, size }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/10"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay }}
    />
  )
}

/* ══════════════════════ MAIN PAGE ══════════════════════════════ */
export default function FacultyPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All Departments')
  const [viewMode, setViewMode] = useState('grid')

  // All members pool for search/filter
  const allMembers = [
    ...PG_FACULTY.map(m => ({ ...m, department: 'Social Work' })),
    { name: LIBRARIAN.name, qualification: 'Ph.D', designation: LIBRARIAN.designation, initials: LIBRARIAN.initials, department: 'Library' },
  ]

  const filtered = allMembers.filter(m => {
    const q = searchQuery.toLowerCase()
    const matchQuery = !q || m.name.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q) || m.department.toLowerCase().includes(q)
    const matchDept = selectedDept === 'All Departments' || m.department === selectedDept
    return matchQuery && matchDept
  })

  const particles = [
    { delay: 0,   x: 10, y: 20, size: 8  },
    { delay: 1,   x: 80, y: 10, size: 12 },
    { delay: 0.5, x: 50, y: 60, size: 6  },
    { delay: 2,   x: 30, y: 80, size: 10 },
    { delay: 1.5, x: 70, y: 40, size: 14 },
    { delay: 0.8, x: 90, y: 70, size: 8  },
    { delay: 3,   x: 20, y: 50, size: 5  },
    { delay: 2.5, x: 60, y: 85, size: 9  },
  ]

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-navy via-[#1e3a8a] to-[#0f2d6b]">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* Particles */}
        {particles.map((p, i) => <Particle key={i} {...p} />)}

        {/* Floating academic icons */}
        {['📚', '🎓', '🔬', '✏️', '🏛️', '📜'].map((icon, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl select-none pointer-events-none"
            style={{ left: `${8 + i * 15}%`, top: `${15 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [-5, 5, -5], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          >
            {icon}
          </motion.div>
        ))}

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium mb-6"
          >
            <GraduationCap size={16} />
            Academic Excellence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Faculty &amp;{' '}
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Academic Staff
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-blue-100/90 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Meet our experienced faculty members, guest lecturers, researchers, and academic leaders dedicated to excellence in teaching, research, and student development.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#faculty-grid"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-blue-500/30 flex items-center gap-2 justify-center"
            >
              <Users size={18} /> View Faculty
            </a>
            <a href="#guest-lecturers"
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors backdrop-blur flex items-center gap-2 justify-center"
            >
              <Building2 size={18} /> Academic Departments
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── PRINCIPAL ── */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-primary-blue text-sm font-semibold rounded-full mb-3">Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy">Our Principal</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary-navy to-[#1e3a8a] rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-elevated"
          >
            {/* BG decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-5xl font-bold shadow-xl ring-4 ring-white/20">
                  PJK
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary-gold rounded-full flex items-center justify-center shadow-lg">
                  <Award size={18} className="text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-gold/20 rounded-full text-secondary-gold text-xs font-semibold mb-3 border border-secondary-gold/30">
                  <Star size={12} /> Academic Leader
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-1">{PRINCIPAL.name}</h2>
                <p className="text-blue-200 text-lg font-medium mb-4">{PRINCIPAL.designation}</p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                  {PRINCIPAL.qualifications.map((q, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full text-sm text-white/90 font-medium">
                      {q}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm">
                    <BookOpen size={14} /> Ph.D Qualified
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm">
                    <Users size={14} /> Academic Leader
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm">
                    <GraduationCap size={14} /> Researcher
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SEARCH + FILTER + VIEW MODE ── */}
      <section className="py-10 bg-white border-b border-gray-100 sticky top-[64px] z-30 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, department, or designation…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue text-sm transition-all bg-gray-50"
              />
            </div>

            {/* Department filter */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue text-sm bg-gray-50 text-gray-700 min-w-[200px]"
            >
              {DEPT_FILTERS.map(d => <option key={d}>{d}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-blue' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PG DEPARTMENT FACULTY ── */}
      <section id="faculty-grid" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-primary-blue to-cyan-500 rounded-full" />
              <span className="text-sm font-semibold text-primary-blue uppercase tracking-widest">PG Department</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy">Post Graduate Department of Social Work</h2>
            <p className="text-gray-500 mt-2">Dedicated academics committed to research and student excellence</p>
          </motion.div>

          {(searchQuery || selectedDept !== 'All Departments') ? (
            /* Filtered view */
            <>
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No faculty found</p>
                  <p className="text-sm mt-1">Try a different name or department</p>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'flex flex-col gap-4'
                }>
                  {filtered.map((m, i) => (
                    <FacultyCard key={m.name} member={m} index={i} view={viewMode} />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Default PG grid */
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'flex flex-col gap-4'
            }>
              {PG_FACULTY.map((m, i) => (
                <FacultyCard key={m.name} member={m} index={i} view={viewMode} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GUEST LECTURERS ── */}
      <section id="guest-lecturers" className="py-16 bg-neutral-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full mb-3">Guest Faculty</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy">Guest Lecturers</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">Industry experts and visiting faculty enriching our academic ecosystem</p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {GUEST_DEPARTMENTS.map((d, i) => (
              <GuestAccordion key={d.dept} {...d} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LIBRARY ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-3">Knowledge Center</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-navy">Library &amp; Information Services</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-elevated overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-xl">
                  <Library size={48} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star size={14} className="text-yellow-900" />
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-3 border border-white/20">
                  <Library size={12} /> Digital Library Professional
                </div>
                <h3 className="text-3xl font-bold mb-1">{LIBRARIAN.name}</h3>
                <p className="text-purple-200 text-lg font-medium mb-4">{LIBRARIAN.designation}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Knowledge Resources', icon: BookOpen },
                    { label: 'Digital Archives',    icon: Library  },
                    { label: 'Research Support',    icon: Award    },
                  ].map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur rounded-xl border border-white/20 text-sm">
                      <Icon size={15} className="flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-gradient-to-br from-primary-navy via-[#1e3a8a] to-[#0f2d6b]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Faculty at a Glance</h2>
            <p className="text-blue-200 mt-2">Numbers that reflect our academic strength</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <s.icon size={22} className="text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <p className="text-blue-200 text-sm leading-snug">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
