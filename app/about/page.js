'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Timeline, Accordion, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import logo from '../assets/logo.png'
function ProfileDropdownCard({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-soft border border-neutral-gray overflow-hidden"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className="w-full flex items-center justify-between px-5 py-4 transition-colors group cursor-default"
        style={{ backgroundColor: open ? '#eff6ff' : '' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div className="text-left">
            <p className="font-bold text-primary-navy text-sm group-hover:text-primary-blue transition-colors">{item.label}</p>
            <p className="text-xs text-primary-blue font-semibold">{item.value}</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180 text-primary-blue' : ''}`}
        />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-neutral-gray bg-neutral-light">
              {item.details.map((d) => (
                <div key={d.k} className="bg-white rounded-lg px-4 py-3 shadow-soft">
                  <p className="text-xs text-slate-500 font-medium">{d.k}</p>
                  <p className="text-sm font-bold text-primary-navy mt-0.5">{d.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function About() {
  const timelineEvents = [
    { year: '1980', description: 'MISS College founded with vision of educational excellence' },
    { year: '1985', description: 'First postgraduate program launched' },
    { year: '1995', description: 'NAAC accreditation achieved' },
    { year: '2005', description: 'Research centers established' },
    { year: '2015', description: 'Campus expansion and new facilities' },
    { year: '2020', description: 'Digital transformation and online education' },
    { year: '2025', description: 'ISO certification and international partnerships' },
  ]

  const aboutAccordion = [
    {
      title: 'Our Vision',
      content: 'To be a world-class institution for higher education, research, and innovation that develops capable and compassionate leaders for sustainable development.',
    },
    {
      title: 'Our Mission',
      content: 'To provide quality education that empowers students with knowledge, skills, and values; conduct research that advances human knowledge; and serve society through community engagement.',
    },
    {
      title: 'Core Values',
      content: 'Integrity, Excellence, Innovation, Inclusivity, Sustainability, and Student-Centric Learning',
    },
    {
      title: 'Accreditations',
      content: 'NAAC Grade A, ISO 9001:2015 certified, NBA accredited programs, and recognized by UGC.',
    },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="About MISS College"
        subtitle="45+ Years of Educational Excellence and Innovation"
        cta1Text="Explore Programs"
        cta1Link="/academics"
        cta2Text="Contact Us"
        cta2Link="/contact"
      />

      {/* Quick Navigation */}
      <Section className="bg-neutral-light">
        <Container>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: 'History', href: '#history' },
              { label: 'Founder', href: '#founder' },
              { label: 'Management', href: '#management' },
              { label: 'Vision & Mission', href: '#vision' },
              { label: 'Principal Message', href: '#principal' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-6 py-2 bg-white rounded-full font-semibold text-primary-blue hover:bg-primary-blue hover:text-white transition-colors shadow-soft"
              >
                {item.label}
              </a>
            ))}
          </div>
        </Container>
      </Section>

      {/* History Section */}
      <Section id="history">
        <Container>
          <SectionTitle
            title="Our History"
            subtitle="A Journey of Academic Excellence"
          />
          <Timeline events={timelineEvents} />
        </Container>
      </Section>

      {/* Founder Section */}
      <Section id="founder" className="bg-neutral-light">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-primary-blue to-secondary-emerald rounded-xl flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="text-8xl mb-4">👨‍🎓</div>
                <p className="font-bold text-lg">Founder</p>
                <p className="text-sm">Dr. Name Here</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary-navy mb-6">Our Founder's Vision</h2>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 1980 by visionary educators, MISS College was established with a mission to provide world-class education accessible to deserving students from all backgrounds.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                The founder believed that education is the greatest equalizer and dedicated his life to building an institution that would serve as a beacon of academic excellence.
              </p>
              <p className="text-lg text-gray-600">
                Today, his legacy continues through thousands of successful alumni who have made remarkable contributions to society.
              </p>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Management Section */}
      <Section id="management">
        <Container>
          <SectionTitle
            title="Leadership"
            subtitle="Meet our experienced management team"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: 'Principal', name: 'Dr. Name' },
              { role: 'Vice Principal', name: 'Dr. Name' },
              { role: 'Dean Academics', name: 'Dr. Name' },
              { role: 'Dean Research', name: 'Dr. Name' },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-neutral-light hover:shadow-medium transition-all"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-blue to-secondary-emerald mx-auto mb-4 flex items-center justify-center text-4xl">
                  👔
                </div>
                <h3 className="font-bold text-primary-navy mb-1">{member.name}</h3>
                <p className="text-primary-blue font-semibold text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Vision & Mission */}
      <Section id="vision" className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Vision, Mission & Values"
            subtitle="Our commitment to excellence"
          />
          <Accordion items={aboutAccordion} />
        </Container>
      </Section>

      {/* Principal Message */}
      <Section id="principal">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary-navy mb-6">Principal's Message</h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  "Welcome to MISS College, where excellence meets opportunity. Our institution has been at the forefront of educational innovation for over four decades, shaping minds and building futures."
                </p>
                <p>
                  "We believe that true education transcends mere academics. It encompasses holistic development, critical thinking, and a commitment to societal good. Our faculty, facilities, and programs are designed to facilitate this comprehensive growth."
                </p>
                <p>
                  "As you embark on your journey with us, you join a community of learners, innovators, and changemakers. Together, we will explore new horizons and contribute meaningfully to our world."
                </p>
                <p className="font-bold text-primary-navy pt-4">
                  Dr. Principal Name<br />
                  <span className="text-sm font-normal text-gray-600">Principal, MISS College</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-primary-navy to-primary-blue rounded-xl flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="text-8xl mb-4">👨‍💼</div>
                <p className="font-bold text-lg">Dr. Principal Name</p>
                <p className="text-sm">Principal</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* College Profile */}
      <Section className="bg-neutral-light" id="profile">
        <Container>
          <SectionTitle title="College Profile" subtitle="Key Facts About MISS College" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Left – Logo Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-gradient-to-br from-primary-navy via-primary-blue to-secondary-emerald rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[420px] shadow-elevated relative overflow-hidden"
            >
              {/* decorative rings */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/10" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full border border-white/10" />

              {/* Logo mark */}
              <div className="relative w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6 shadow-lg overflow-hidden">
                <Image src={logo} alt="MISS College Logo" fill className="object-contain p-2" />
                <div className="absolute -bottom-1 right-2 w-8 h-8 rounded-lg bg-secondary-gold flex items-center justify-center">
                  <span className="text-primary-navy font-black text-xs">A+</span>
                </div>
              </div>

              <h3 className="text-white font-black text-2xl tracking-wide mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>MISS</h3>
              <p className="text-secondary-gold font-bold text-sm tracking-widest uppercase mb-1">College</p>
              <p className="text-white/60 text-xs mb-6">Madurai Institute of Social Sciences</p>

              <div className="w-12 h-px bg-white/30 mb-6" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { value: '1980', label: 'Est.' },
                  { value: 'Grade A', label: 'NAAC' },
                  { value: '45+', label: 'Years' },
                  { value: '8000+', label: 'Students' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                    <p className="text-white/60 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right – Hover Dropdown Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-3 space-y-3"
            >
              {[
                {
                  label: 'Establishment & Recognition',
                  icon: '🏛️',
                  value: 'Est. 1980',
                  details: [
                    { k: 'Founded', v: '1980' },
                    { k: 'Type', v: 'Arts & Science College' },
                    { k: 'Affiliation', v: 'Madurai Kamaraj University' },
                    { k: 'Recognition', v: 'UGC, AICTE Approved' },
                  ],
                },
                {
                  label: 'Accreditation & Rankings',
                  icon: '🏆',
                  value: 'NAAC Grade A',
                  details: [
                    { k: 'NAAC', v: 'Grade A Accredited' },
                    { k: 'ISO', v: '9001:2015 Certified' },
                    { k: 'NIRF', v: 'Ranked Institution' },
                    { k: 'NBA', v: 'Accredited Programs' },
                  ],
                },
                {
                  label: 'Academic Strength',
                  icon: '📚',
                  value: '12 Departments',
                  details: [
                    { k: 'Departments', v: '12' },
                    { k: 'UG Programs', v: '18+' },
                    { k: 'PG Programs', v: '10+' },
                    { k: 'Research Centers', v: '5' },
                  ],
                },
                {
                  label: 'People & Community',
                  icon: '👥',
                  value: '8000+ Students',
                  details: [
                    { k: 'Total Students', v: '8,000+' },
                    { k: 'Faculty Members', v: '150+' },
                    { k: 'Non-Teaching Staff', v: '80+' },
                    { k: 'Alumni Network', v: '50,000+' },
                  ],
                },
                {
                  label: 'Campus & Infrastructure',
                  icon: '🏫',
                  value: '50 Acre Campus',
                  details: [
                    { k: 'Campus Area', v: '50 Acres' },
                    { k: 'Location', v: 'Madurai, Tamil Nadu' },
                    { k: 'Hostels', v: 'Boys & Girls' },
                    { k: 'Labs & Libraries', v: 'World-Class' },
                  ],
                },
                {
                  label: 'Placements & Industry',
                  icon: '💼',
                  value: '95%+ Placements',
                  details: [
                    { k: 'Placement Rate', v: '95%+' },
                    { k: 'Recruiting Companies', v: '200+' },
                    { k: 'Avg. Package', v: '₹4.5 LPA' },
                    { k: 'Highest Package', v: '₹18 LPA' },
                  ],
                },
              ].map((item, index) => (
                <ProfileDropdownCard key={index} item={item} index={index} />
              ))}
            </motion.div>

          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
