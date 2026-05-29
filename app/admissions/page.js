'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button, Accordion } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Admissions() {
  const admissionFaq = [
    {
      title: 'What are the eligibility criteria for undergraduate programs?',
      content: '12th pass or equivalent qualification. Minimum 50% aggregate marks required.',
    },
    {
      title: 'What is the application process?',
      content: 'Visit our Apply Now page, fill the form, upload documents, and submit. Selection is based on merit and entrance exam.',
    },
    {
      title: 'Are there scholarships available?',
      content: 'Yes! Merit-based (up to 100%), Need-based, and SC/ST/OBC scholarships available. Check scholarship page for details.',
    },
    {
      title: 'What is the fee structure?',
      content: 'Fees vary by program. UG: Rs. 1-2 lakhs per year. PG: Rs. 1.5-3 lakhs per year. Contact admissions for exact details.',
    },
    {
      title: 'What documents are required for admission?',
      content: '10th & 12th mark sheets, Entrance exam score, ID proof, address proof, character certificate, and passport-size photos.',
    },
    {
      title: 'When do admissions open?',
      content: 'Admissions typically open in June for the academic year starting in the same year.',
    },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Admissions to MISS College"
        subtitle="Your Gateway to Quality Education and Bright Future"
        cta1Text="Apply Now"
        cta1Link="/admissions/apply"
        cta2Text="Download Prospectus"
        cta2Link="/downloads"
      />

      {/* Why MISS College */}
      <Section>
        <Container>
          <SectionTitle
            title="Why Choose MISS College"
            subtitle="Reasons to join our academic community"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: '45+ Years', desc: 'Trusted legacy in educational excellence' },
              { title: 'NAAC Grade A', desc: 'Highest accreditation rating' },
              { title: 'Expert Faculty', desc: '150+ experienced educators' },
              { title: 'World-Class Facilities', desc: 'Modern labs and infrastructure' },
              { title: '95%+ Placements', desc: 'Strong industry connections' },
              { title: 'Scholarships', desc: 'Merit and need-based assistance' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-neutral-light rounded-xl p-8 text-center hover:shadow-soft transition-all"
              >
                <div className="text-4xl font-bold text-primary-blue mb-3">{item.title}</div>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Admission Timeline */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Admission Timeline"
            subtitle="Important dates for the admission process"
          />
          <div className="max-w-3xl mx-auto">
            {[
              { date: 'June 1, 2026', event: 'Admissions open, application portal live' },
              { date: 'June 1-30, 2026', event: 'Application submission period' },
              { date: 'July 1-15, 2026', event: 'Entrance exam for merit selection' },
              { date: 'July 20, 2026', event: 'Merit list announcement' },
              { date: 'July 21-25, 2026', event: 'Counselling and seat allotment' },
              { date: 'July 26-Aug 10, 2026', event: 'Document verification' },
              { date: 'August 15, 2026', event: 'Orientation and classes begin' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-6 mb-6 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-blue text-white font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-grow bg-white rounded-lg p-6 shadow-soft">
                  <p className="font-bold text-primary-navy text-lg">{item.date}</p>
                  <p className="text-gray-600">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Eligibility */}
      <Section>
        <Container>
          <SectionTitle
            title="Eligibility Criteria"
            subtitle="Check if you meet the requirements"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-primary-navy mb-6">Undergraduate Programs</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">12th pass or equivalent qualification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Minimum 50% aggregate marks (45% for SC/ST)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Valid entrance exam score</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Age limit: 21 years (for general category)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Indian citizen or NRI/OCI</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-primary-navy mb-6">Postgraduate Programs</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Bachelor's degree from recognized university</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Minimum 50% aggregate (45% for SC/ST)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Valid entrance exam / CAT / GATE score</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">Relevant academic background</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">✓</span>
                  <span className="text-gray-700">No age limit</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Scholarships */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Scholarships"
            subtitle="Financial assistance available for deserving students"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Merit Scholarship', coverage: 'Up to 100%', criteria: 'Top academic performers' },
              { name: 'SC/ST Scholarship', coverage: 'Up to 100%', criteria: 'Reserved category students' },
              { name: 'Need-Based Aid', coverage: 'Up to 50%', criteria: 'Family income basis' },
              { name: 'Sports Scholarship', coverage: 'Up to 75%', criteria: 'National/state level athletes' },
              { name: 'OBC Scholarship', coverage: 'Up to 75%', criteria: 'OBC category students' },
              { name: 'Girl Child Scholarship', coverage: 'Up to 50%', criteria: 'Female students' },
            ].map((schol, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all"
              >
                <h3 className="text-xl font-bold text-primary-navy mb-3">{schol.name}</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-secondary-gold font-bold text-lg">{schol.coverage}</span>
                </div>
                <p className="text-gray-600 text-sm">{schol.criteria}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/admissions/scholarships">
              <Button variant="primary" size="lg">
                View Detailed Scholarship Information
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* FAQs */}
      <Section>
        <Container>
          <SectionTitle
            title="Frequently Asked Questions"
            subtitle="Get answers to your admission questions"
          />
          <Accordion items={admissionFaq} />
        </Container>
      </Section>

      {/* CTA */}
      <Section className="bg-gradient-to-r from-primary-navy to-primary-blue text-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <h2 className="text-4xl font-bold mb-6">Start Your Application Today</h2>
            <p className="text-xl text-gray-100 mb-8">
              Begin your journey toward a transformative education experience.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/admissions/apply">
                <Button variant="secondary" size="lg">
                  Apply Now
                </Button>
              </Link>
              <Link href="/downloads">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary-navy"
                >
                  Download Prospectus
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
