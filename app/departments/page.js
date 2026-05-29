'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, ArrowRight, Users, BookOpen, FlaskConical,
  Trophy, ChevronRight, GraduationCap, Briefcase, Star
} from 'lucide-react'

const departments = [
  {
    id: 'social-work',
    name: 'Department of Social Work',
    short: 'SW',
    icon: '🤝',
    color: 'from-blue-600 to-cyan-500',
    category: 'Social Sciences',
    hod: 'Dr. Name Here',
    faculty: 12,
    students: 480,
    established: 1980,
    description: 'A pioneering department offering professional social work education focused on community development, counselling, and social welfare.',
    courses: [
      'Master of Philosophy in Social Work (SF)',
      'Ph.D – Social Work (SF)',
      'Bachelor of Social Work (SF)',
      'Master of Social Work (SF)',
    ],
    highlights: ['Community Field Work', 'Counselling Centre', 'NGO Tie-ups', 'Research Publications'],
    research: 'Community Development, Social Welfare Policy, Counselling & Mental Health',
  },
  {
    id: 'computer-science',
    name: 'Department of Computer Science',
    short: 'CS',
    icon: '💻',
    color: 'from-indigo-600 to-blue-500',
    category: 'Science & Technology',
    hod: 'Dr. Name Here',
    faculty: 10,
    students: 360,
    established: 1995,
    description: 'Offering cutting-edge undergraduate programs in Computer Science and Information Technology with modern labs and industry exposure.',
    courses: [
      'Bachelor of Computer Science',
      'Bachelor of Information Technology',
    ],
    highlights: ['Programming Labs', 'Industry Internships', 'Hackathons', 'Placement Support'],
    research: 'Artificial Intelligence, Data Science, Networking',
  },
  {
    id: 'commerce',
    name: 'Department of Commerce',
    short: 'COM',
    icon: '📊',
    color: 'from-emerald-600 to-teal-500',
    category: 'Commerce & Management',
    hod: 'Dr. Name Here',
    faculty: 10,
    students: 400,
    established: 1980,
    description: 'Comprehensive commerce education with focus on accounting, finance, taxation, and computer applications in business.',
    courses: [
      'Bachelor of Commerce',
      'Bachelor of Commerce (Computer Applications)',
    ],
    highlights: ['Tally ERP Lab', 'GST Certification', 'CA Foundation', 'Bank Tie-ups'],
    research: 'Financial Markets, Taxation Policy, Corporate Governance',
  },
  {
    id: 'management',
    name: 'Department of Management Studies',
    short: 'MGT',
    icon: '🎯',
    color: 'from-amber-500 to-orange-500',
    category: 'Commerce & Management',
    hod: 'Dr. Name Here',
    faculty: 8,
    students: 240,
    established: 2000,
    description: 'Developing future business leaders through the Bachelor of Business Administration program with strategic and analytical focus.',
    courses: [
      'Bachelor of Business Administration',
    ],
    highlights: ['Business Incubator', 'Case Study Lab', 'Industry Mentors', 'Leadership Programs'],
    research: 'Strategic Management, Organisational Behaviour, Entrepreneurship',
  },
  {
    id: 'english',
    name: 'Department of English',
    short: 'ENG',
    icon: '📚',
    color: 'from-pink-600 to-rose-500',
    category: 'Arts & Humanities',
    hod: 'Dr. Name Here',
    faculty: 7,
    students: 180,
    established: 1980,
    description: 'Developing communication, literary analysis, and critical thinking skills through the Bachelor of English program.',
    courses: [
      'Bachelor of English',
    ],
    highlights: ['Language Lab', 'Literary Festival', 'Debate Club', 'Creative Writing'],
    research: 'Post-Colonial Literature, Linguistics, Cultural Studies',
  },
  {
    id: 'psychology',
    name: 'Department of Psychology',
    short: 'PSY',
    icon: '🧠',
    color: 'from-violet-600 to-purple-500',
    category: 'Social Sciences',
    hod: 'Dr. Name Here',
    faculty: 6,
    students: 160,
    established: 1998,
    description: 'Understanding human behaviour and mental processes through the Bachelor of Psychology program with counselling and research focus.',
    courses: [
      'Bachelor of Psychology',
    ],
    highlights: ['Psychology Lab', 'Counselling Clinic', 'Behaviour Research', 'Community Outreach'],
    research: 'Clinical Psychology, Counselling, Cognitive Behaviour Therapy',
  },
  {
    id: 'pg-diploma',
    name: 'PG Diploma Programmes',
    short: 'PGD',
    icon: '🎓',
    color: 'from-slate-600 to-gray-500',
    category: 'Professional Programmes',
    hod: 'Dr. Name Here',
    faculty: 8,
    students: 120,
    established: 1990,
    description: 'Short-term postgraduate diploma programmes in Counselling, Personnel Management, and Computer Applications for working professionals.',
    courses: [
      'PG Diploma in Counselling',
      'PG Diploma in Personnel Management and Industrial Relations',
      'PG Diploma in Computer Applications',
    ],
    highlights: ['Flexible Schedule', 'Industry Experts', 'Practical Training', 'Certificate of Excellence'],
    research: 'Applied Counselling, HR Practices, Computer Applications',
  },
]

const CATEGORIES = ['All', 'Social Sciences', 'Science & Technology', 'Commerce & Management', 'Arts & Humanities', 'Professional Programmes']

export default function Departments() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  const visible = departments.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory
    const matchQ = d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.short.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-br from-primary-navy via-primary-blue to-secondary-emerald overflow-hidden py-20">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-secondary-gold font-semibold text-sm uppercase tracking-widest mb-3">Academic Excellence</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Our Departments
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          {departments.length} departments · {departments.reduce((a, d) => a + d.faculty, 0)}+ faculty · {departments.reduce((a, d) => a + d.students, 0).toLocaleString()}+ students
          </motion.p>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search departments…" value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-primary-navy placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-gold shadow-medium"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-neutral-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: GraduationCap, value: '12', label: 'Departments' },
            { icon: Users, value: '163+', label: 'Faculty Members' },
            { icon: BookOpen, value: '50+', label: 'Programs Offered' },
            { icon: Trophy, value: '95%+', label: 'Placement Rate' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-primary-blue" />
              </div>
              <div className="text-left">
                <p className="font-black text-primary-navy text-sm leading-none">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Filter ── */}
      <div className="bg-white border-b border-neutral-gray sticky top-[var(--navbar-h,80px)] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-primary-blue text-white shadow-md'
                  : 'bg-neutral-light text-slate-600 hover:bg-blue-50 hover:text-primary-blue'
              }`}>
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{visible.length} dept{visible.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Department Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {visible.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold">No departments found</p>
            <button onClick={() => { setQuery(''); setActiveCategory('All') }} className="mt-3 text-sm text-primary-blue hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((dept, i) => (
              <motion.div key={dept.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <DeptCard dept={dept} onClick={() => setSelected(dept)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Features Section ── */}
      <div className="bg-neutral-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-primary-navy mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>What Makes Us Special</h2>
            <p className="text-slate-500 text-sm">Excellence across every department</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FlaskConical, title: 'Modern Labs', desc: 'State-of-the-art research & teaching labs' },
              { icon: Users, title: 'Expert Faculty', desc: '163+ experienced educators & researchers' },
              { icon: Briefcase, title: 'Industry Links', desc: '200+ company partnerships for placements' },
              { icon: Star, title: 'NAAC Grade A', desc: 'Highest accreditation for quality education' },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center shadow-soft hover:shadow-medium transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary-blue/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-blue transition-colors">
                  <Icon size={22} className="text-primary-blue group-hover:text-white transition-colors" />
                </div>
                <p className="font-bold text-primary-navy text-sm mb-1">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Department Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary-navy/60 backdrop-blur-sm z-[100]"
              onClick={() => setSelected(null)} />

            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Modal header */}
                <div className={`bg-gradient-to-r ${selected.color} p-6 relative`}>
                  <button onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                    <X size={16} className="text-white" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">
                      {selected.icon}
                    </div>
                    <div>
                      <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{selected.category}</span>
                      <h2 className="text-white font-black text-xl leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>{selected.name}</h2>
                      <p className="text-white/70 text-sm mt-0.5">HOD: {selected.hod}</p>
                    </div>
                  </div>
                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      { label: 'Faculty', value: selected.faculty + '+' },
                      { label: 'Students', value: selected.students + '+' },
                      { label: 'Est.', value: selected.established },
                    ].map(s => (
                      <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
                        <p className="text-white font-black text-lg leading-none">{s.value}</p>
                        <p className="text-white/70 text-xs mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <p className="text-slate-600 leading-relaxed">{selected.description}</p>

                  {/* Courses */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <BookOpen size={13} /> Programs Offered
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.courses.map(c => (
                        <span key={c} className="bg-blue-50 text-primary-blue text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-blue/20">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Star size={13} /> Key Highlights
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selected.highlights.map(h => (
                        <div key={h} className="flex items-center gap-2 bg-neutral-light rounded-lg px-3 py-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary-emerald flex-shrink-0" />
                          <span className="text-sm text-slate-700">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Research */}
                  <div className="bg-primary-blue/5 border border-primary-blue/15 rounded-xl p-4">
                    <p className="text-xs font-bold text-primary-blue uppercase tracking-wider mb-1 flex items-center gap-2">
                      <FlaskConical size={13} /> Research Areas
                    </p>
                    <p className="text-sm text-slate-600">{selected.research}</p>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 border-t border-neutral-gray flex gap-3">
                  <Link href="/courses"
                    className="flex-1 text-center py-2.5 rounded-xl bg-primary-blue text-white font-bold text-sm hover:bg-primary-navy transition-colors flex items-center justify-center gap-2">
                    View Courses <ArrowRight size={15} />
                  </Link>
                  <Link href="/admissions"
                    className="flex-1 text-center py-2.5 rounded-xl border-2 border-primary-blue text-primary-blue font-bold text-sm hover:bg-blue-50 transition-colors">
                    Apply Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}

function DeptCard({ dept, onClick }) {
  return (
    <div onClick={onClick}
      className="group bg-white rounded-2xl border border-neutral-gray shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer">

      {/* Card top */}
      <div className={`bg-gradient-to-br ${dept.color} p-5 relative overflow-hidden`}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="flex items-start justify-between">
          <span className="text-4xl">{dept.icon}</span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {dept.category}
          </span>
        </div>
        <div className="mt-3">
          <p className="text-white/70 text-xs font-semibold">Est. {dept.established}</p>
          <h3 className="text-white font-black text-base leading-tight mt-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
            {dept.name}
          </h3>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">{dept.description}</p>

        {/* Mini stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Users size={12} /> {dept.faculty} Faculty</span>
          <span className="flex items-center gap-1"><GraduationCap size={12} /> {dept.students}+ Students</span>
        </div>

        {/* Course pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {dept.courses.slice(0, 3).map(c => (
            <span key={c} className="bg-blue-50 text-primary-blue text-[10px] font-semibold px-2 py-1 rounded-full">
              {c}
            </span>
          ))}
          {dept.courses.length > 3 && (
            <span className="bg-neutral-light text-slate-500 text-[10px] font-semibold px-2 py-1 rounded-full">
              +{dept.courses.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">HOD: {dept.hod}</p>
          <span className="flex items-center gap-1 text-primary-blue text-xs font-bold group-hover:gap-2 transition-all">
            Explore <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  )
}
