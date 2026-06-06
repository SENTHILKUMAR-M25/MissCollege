'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { motion } from 'framer-motion'
import { Users, Target, Calendar, IndianRupee, CheckCircle } from 'lucide-react'

const objectives = [
  'To build a strong network with Alumni of MISS',
  'To build a rapport with current student community',
  'To maintain and periodically update Alumni database',
  'To create common interest groups and provide a forum for continuous learning and placement',
  'To organize periodical meetings in different locations to develop network',
  'To make use of Alumni expertise for the current students to develop their skills and update the emerging trends in the field',
  'To provide Training and Consultancy to the Government and Non-Government organizations',
  'To develop liaison with other National and International Organizations, working for human resource and Social science forum',
  'To maintain e-groups to share and update current developments in the field',
  'To provide merit scholarship to deserving students to pursue their studies',
]

export default function Alumni() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Alumni Association"
        subtitle="Connecting Generations of MISS College Graduates Since 1988"
        cta1Text="Register Now"
        cta1Link="#register"
      />

      {/* About Section */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Calendar, label: 'Established', value: '10 July 1988' },
              { icon: Users, label: 'Life Membership', value: 'Open to All Graduates' },
              { icon: IndianRupee, label: 'Membership Fee', value: '₹250 (One-time)' },
            ].map(({ icon: Icon, label, value }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-gradient-to-br from-primary-navy to-primary-blue rounded-xl p-6 text-white text-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Icon size={24} className="text-white" />
                </div>
                <p className="text-white/70 text-sm mb-1">{label}</p>
                <p className="font-bold text-lg">{value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="bg-neutral-light rounded-2xl p-8 mb-4">
            <p className="text-gray-700 text-lg leading-relaxed">
              The MISS College Alumni Association was started on <strong className="text-primary-navy">10th July 1988</strong> with a vision to build a lifelong bond between the institution and its graduates. The association serves as a bridge between the past and present — empowering current students through the experience and expertise of our alumni community.
            </p>
          </motion.div>
        </Container>
      </Section>

      {/* Objectives */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Our Objectives"
            subtitle="The guiding principles of the MISS Alumni Association"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectives.map((obj, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-soft">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-blue/10 flex items-center justify-center mt-0.5">
                  <CheckCircle size={16} className="text-primary-blue" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{obj}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Membership */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Membership Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-secondary-gold/20 flex items-center justify-center">
                  <Target size={20} className="text-secondary-gold" />
                </div>
                <h2 className="text-2xl font-bold text-primary-navy">Admission of Members</h2>
              </div>
              <div className="bg-gradient-to-br from-secondary-gold/10 to-secondary-emerald/10 border border-secondary-gold/30 rounded-2xl p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  At the time of admission, a sum of <strong className="text-primary-navy text-lg">₹250/-</strong> is collected from each student toward the <strong>life membership</strong> of the Alumni Association.
                </p>
                <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-soft">
                  <IndianRupee size={28} className="text-secondary-gold flex-shrink-0" />
                  <div>
                    <p className="font-bold text-primary-navy text-xl">₹250 One-Time Fee</p>
                    <p className="text-gray-500 text-sm">Life Membership — No Renewal Required</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Register Form */}
            <motion.div id="register" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-primary-navy mb-6">Register as Alumni</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Full Name"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                <input type="email" placeholder="Email Address"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                <input type="tel" placeholder="Mobile Number"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Registration Number"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                  <input type="text" placeholder="Graduation Year"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                </div>
                <input type="text" placeholder="Current Occupation / Organization"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                <Button variant="primary" size="lg" className="w-full">
                  Register
                </Button>
              </form>
            </motion.div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
