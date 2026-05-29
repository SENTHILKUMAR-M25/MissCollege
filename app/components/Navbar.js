'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X, ChevronDown, Phone, Mail, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'
const menuItems = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about',
    submenu: [
      { label: 'History', href: '/about#history' },
      { label: 'Founder', href: '/about#founder' },
      { label: 'Management', href: '/about#management' },
      { label: 'Vision & Mission', href: '/about#vision-mission' },
      { label: 'College Profile', href: '/about#profile' },
      { label: "Principal's Message", href: '/about#principal-message' },
    ],
  },
  {
    label: 'Academics',
    href: '/academics',
    submenu: [
      { label: 'Undergraduate Programmes', href: '/academics#undergraduate' },
      { label: 'Postgraduate Programmes', href: '/academics#postgraduate' },
      { label: 'Diploma Courses', href: '/academics#diploma' },
      { label: 'Certificate Courses', href: '/academics#certificate' },
      { label: 'Academic Calendar', href: '/academics#calendar' },
    ],
  },
  { label: 'Departments', href: '/departments' },
  { label: 'Courses', href: '/courses' },
  {
    label: 'Admissions',
    href: '/admissions',
    submenu: [
      { label: 'Procedure', href: '/admissions#procedure' },
      { label: 'Eligibility', href: '/admissions#eligibility' },
      { label: 'Scholarships', href: '/admissions#scholarships' },
      { label: 'Fee Structure', href: '/admissions#fees' },
    ],
  },
  {
    label: 'Examinations',
    href: '/examinations',
    submenu: [
      { label: 'Exam Notifications', href: '/examinations#notifications' },
      { label: 'Timetable', href: '/examinations#timetable' },
      { label: 'Results', href: '/examinations#results' },
    ],
  },
  {
    label: 'Research',
    href: '/research',
    submenu: [
      { label: 'Research Centres', href: '/research#centres' },
      { label: 'Publications', href: '/research#publications' },
      { label: 'Projects', href: '/research#projects' },
    ],
  },
  { label: 'Administration', href: '/administration' },
  {
    label: 'Resources',
    href: '#',
    submenu: [
      { label: 'Library', href: '/library' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'Events', href: '/events' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Campus Life', href: '/campus-life' },
      { label: 'Alumni', href: '/alumni' },
    ],
  },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openMobileMenu, setOpenMobileMenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); setOpenMobileMenu(null) }, [pathname])

  const isActive = (href) => {
    if (href === '#' || href === '/') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="sticky top-0 z-50">
      {/* Top Info Bar */}
      <div className="bg-primary-navy text-white text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <a href="tel:+914522345678" className="flex items-center gap-1.5 hover:text-secondary-gold transition-colors">
              <Phone size={12} /> +91 452 234 5678
            </a>
            <a href="mailto:info@misscollege.edu.in" className="flex items-center gap-1.5 hover:text-secondary-gold transition-colors">
              <Mail size={12} /> info@misscollege.edu.in
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-gray">
            <MapPin size={12} />
            <span>Madurai, Tamil Nadu</span>
          </div>
        </div>
      </div>

      {/* Announcement Ticker */}
      <div className="bg-gradient-to-r from-primary-blue to-secondary-emerald text-white py-1.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[ticker_30s_linear_infinite]">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="mx-8 text-xs font-medium">
              🎓 Admissions Open 2026–27 &nbsp;|&nbsp; 📢 NAAC Grade A Accredited &nbsp;|&nbsp; 🏆 NIRF Ranked Institution &nbsp;|&nbsp; 📅 Academic Calendar Published
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-medium' : 'bg-white shadow-soft'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                <Image src={logo} alt="MISS College Logo" fill className="object-contain" priority />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-bold text-primary-navy text-base tracking-wide" style={{ fontFamily: 'Syne, sans-serif' }}>Madurai Institute of Social Sciences(Autonomous)</span>
              </div>
            </Link>

            

            {/* CTA Buttons */}
            <div className="hidden xl:flex items-center gap-2">
              <Link
                href="/student-corner"
                className="px-4 py-2 rounded-lg border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white transition-all duration-200 font-semibold text-sm"
              >
                Student Portal
              </Link>
              <Link
                href="/admissions"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-blue to-blue-600 text-white hover:from-primary-navy hover:to-primary-navy transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
              >
                Apply Now
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 rounded-lg text-primary-navy hover:bg-neutral-light transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </AnimatePresence>
            </button>

          </div>
          {/* Desktop Menu */}
          <div className="hidden xl:flex justify-center items-center gap-0.5">
            {menuItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors duration-200
                      ${isActive(item.href)
                      ? 'text-primary-blue'
                      : 'text-slate-600 hover:text-primary-blue'
                    }`}
                >
                  {item.label}
                  {item.submenu?.length > 0 && (
                    <ChevronDown size={14} className="mt-0.5 group-hover:rotate-180 transition-transform duration-200" />
                  )}
                  {/* Active underline */}
                  {isActive(item.href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-blue rounded-full" />
                  )}
                </Link>

                {/* Dropdown */}
                {item.submenu?.length > 0 && (
                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="bg-white rounded-xl shadow-elevated border border-neutral-gray/50 py-1.5 min-w-[200px] overflow-hidden">
                      {/* Accent top bar */}
                      <div className="h-0.5 bg-gradient-to-r from-primary-blue to-secondary-emerald mx-3 mb-1.5 rounded-full" />
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-primary-blue hover:bg-blue-50 transition-colors group/sub"
                        >
                          <span className="w-1 h-1 rounded-full bg-primary-blue/30 group-hover/sub:bg-primary-blue transition-colors flex-shrink-0" />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="xl:hidden overflow-hidden border-t border-neutral-gray bg-white"
            >
              <div className="px-4 py-3 space-y-1 max-h-[75vh] overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.label}>
                    {item.submenu?.length > 0 ? (
                      <>
                        <button
                          onClick={() => setOpenMobileMenu(openMobileMenu === item.label ? null : item.label)}
                          className={`w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                            ${isActive(item.href) ? 'text-primary-blue bg-blue-50' : 'text-slate-700 hover:bg-neutral-light'}`}
                        >
                          {item.label}
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${openMobileMenu === item.label ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <AnimatePresence>
                          {openMobileMenu === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-3 pl-3 border-l-2 border-primary-blue/20 mt-1 mb-1 space-y-0.5">
                                {item.submenu.map((sub) => (
                                  <Link
                                    key={sub.label}
                                    href={sub.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-3 py-2 text-sm text-slate-600 hover:text-primary-blue hover:bg-blue-50 rounded-md transition-colors"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${isActive(item.href) ? 'text-primary-blue bg-blue-50' : 'text-slate-700 hover:bg-neutral-light'}`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile CTAs */}
                <div className="pt-3 pb-1 grid grid-cols-2 gap-2 border-t border-neutral-gray mt-2">
                  <Link
                    href="/student-corner"
                    onClick={() => setIsOpen(false)}
                    className="text-center px-3 py-2.5 rounded-lg border-2 border-primary-blue text-primary-blue font-semibold text-sm hover:bg-primary-blue hover:text-white transition-all"
                  >
                    Student Portal
                  </Link>
                  <Link
                    href="/admissions"
                    onClick={() => setIsOpen(false)}
                    className="text-center px-3 py-2.5 rounded-lg bg-primary-blue text-white font-semibold text-sm hover:bg-primary-navy transition-all"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  )
}
