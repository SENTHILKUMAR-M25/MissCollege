'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Examinations() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Examinations"
        subtitle="Exam Information, Schedules, and Results"
        cta1Text="View Results"
        cta1Link="#results"
        cta2Text="Download Hall Ticket"
        cta2Link="#tickets"
      />

      {/* Exam Services */}
      <Section>
        <Container>
          <SectionTitle title="Examination Services" subtitle="Everything you need for your exams" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Exam Notifications', icon: '📢', desc: 'Latest exam announcements' },
              { title: 'Timetable', icon: '⏰', desc: 'Exam schedule details' },
              { title: 'Hall Tickets', icon: '🎟️', desc: 'Download admit cards' },
              { title: 'Results', icon: '📊', desc: 'Check your results' },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-neutral-light rounded-xl p-8 text-center hover:shadow-soft transition-all cursor-pointer group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-lg font-bold text-primary-navy mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Current Schedule */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="Current Exam Schedule" subtitle="Upcoming examinations" />
          <div className="bg-white rounded-xl p-8 shadow-soft">
            <div className="space-y-4">
              {[
                { exam: 'End Semester Exams - Semester IV', date: 'April 1-15, 2027', location: 'Main Campus' },
                { exam: 'End Semester Exams - Semester II', date: 'April 1-20, 2027', location: 'All Centers' },
                { exam: 'Revaluation Deadline', date: 'April 25, 2027', location: 'Online' },
                { exam: 'Result Declaration', date: 'May 10, 2027', location: 'Online Portal' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-6 pb-4 border-b border-neutral-gray last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-bold text-primary-navy text-lg">{item.exam}</p>
                    <p className="text-gray-600 text-sm">{item.date}</p>
                  </div>
                  <div className="text-right text-gray-600 text-sm">{item.location}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Results */}
      <Section id="results">
        <Container>
          <SectionTitle title="Check Results" subtitle="View your examination results" />
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-soft">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your registration number"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Semester
                </label>
                <select className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue">
                  <option>Select Semester</option>
                  <option>Semester I</option>
                  <option>Semester II</option>
                  <option>Semester III</option>
                  <option>Semester IV</option>
                </select>
              </div>
              <Button variant="primary" size="lg" className="w-full">
                Check Results
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
