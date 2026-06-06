'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Accordion, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { GlassCard } from '../components/Cards'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Users, Award, Target } from 'lucide-react'

export default function Academics() {
  const programs = [
    {
      title: 'Undergraduate Programs',
      description: '3-4 year degree programs in various disciplines with modern curriculum',
      icon: BookOpen,
    },
    {
      title: 'Postgraduate Programs',
      description: 'Advanced Masters programs with research focus and industry exposure',
      icon: Award,
    },
    {
      title: 'Diploma Courses',
      description: 'Specialized 2-year diploma programs for skill development',
      icon: Target,
    },
    {
      title: 'Certificate Courses',
      description: 'Short-term professional certification programs',
      icon: Users,
    },
  ]

  const academicFaq = [
    {
      title: 'What is the admission procedure for undergraduate programs?',
      content: 'Visit our Admissions page for detailed information on eligibility criteria, application process, and important dates.',
    },
    {
      title: 'What are the fee structures for different programs?',
      content: 'Fee structures vary by program. Please visit the Admissions page or contact our office for detailed fee information.',
    },
    {
      title: 'Are scholarships available?',
      content: 'Yes, we offer merit-based and need-based scholarships for eligible students. Visit our Scholarships page for more details.',
    },
    {
      title: 'What is the academic calendar like?',
      content: 'Our academic year typically runs from June to April with two semesters. Check the Academic Calendar section for detailed dates.',
    },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Academics at MISS College"
        subtitle="Comprehensive Programs Designed for Excellence and Innovation"
        cta1Text="Apply Now"
        cta1Link="/admissions/apply"
        cta2Text="View Programs"
        cta2Link="#programs"
      />

      {/* Program Categories */}
      <Section id="programs">
        <Container>
          <SectionTitle
            title="Our Program Categories"
            subtitle="Choose from diverse academic pathways"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <GlassCard key={index} {...program} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Undergraduate Programs */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Undergraduate Programmes"
            subtitle="3-4 Year Bachelor's Degree Programs"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Bachelor of Science', dept: 'Computer Science', duration: '4 Years' },
              { name: 'Bachelor of Commerce', dept: 'Commerce', duration: '3 Years' },
              { name: 'Bachelor of Arts', dept: 'Humanities', duration: '3 Years' },
              { name: 'Bachelor of Technology', dept: 'Engineering', duration: '4 Years' },
              { name: 'Bachelor of Business Administration', dept: 'Management', duration: '3 Years' },
              { name: 'Bachelor of Science (Honors)', dept: 'Science', duration: '4 Years' },
            ].map((prog, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all"
              >
                <h3 className="text-lg font-bold text-primary-navy mb-2">{prog.name}</h3>
                <p className="text-gray-600 text-sm mb-1">Department: {prog.dept}</p>
                <p className="text-primary-blue font-semibold text-sm">Duration: {prog.duration}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Postgraduate Programs */}
      <Section>
        <Container>
          <SectionTitle
            title="Postgraduate Programmes"
            subtitle="Advanced Master's Programs with Research Focus"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Master of Technology', dept: 'Computer Science', duration: '2 Years' },
              { name: 'Master of Business Administration', dept: 'Management', duration: '2 Years' },
              { name: 'Master of Science', dept: 'Science', duration: '2 Years' },
              { name: 'Master of Commerce', dept: 'Commerce', duration: '2 Years' },
              { name: 'Master of Philosophy', dept: 'Research', duration: '1-2 Years' },
              { name: 'Doctor of Philosophy', dept: 'All Departments', duration: '3-5 Years' },
            ].map((prog, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all"
              >
                <h3 className="text-lg font-bold text-primary-navy mb-2">{prog.name}</h3>
                <p className="text-gray-600 text-sm mb-1">Department: {prog.dept}</p>
                <p className="text-primary-blue font-semibold text-sm">Duration: {prog.duration}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Learning Methodology */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Our Learning Methodology"
            subtitle="Comprehensive approach to education"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Experiential Learning',
                description: 'Hands-on projects, case studies, and real-world applications',
              },
              {
                title: 'Industry Partnerships',
                description: 'Internships, industry visits, and guest lectures from professionals',
              },
              {
                title: 'Research Focus',
                description: 'Encouragement of student research and publication',
              },
              {
                title: 'Digital Learning',
                description: 'Online resources, digital libraries, and blended learning approaches',
              },
              {
                title: 'Global Perspective',
                description: 'Exchange programs and international academic collaborations',
              },
              {
                title: 'Mentorship',
                description: 'Faculty mentoring and career guidance for student development',
              },
            ].map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-blue to-secondary-emerald mb-4"></div>
                <h3 className="text-lg font-bold text-primary-navy mb-2">{method.title}</h3>
                <p className="text-gray-600">{method.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Academic Calendar */}
      <Section>
        <Container>
          <SectionTitle
            title="Academic Calendar"
            subtitle="Important dates and deadlines for the academic year"
          />
          <div className="bg-white rounded-xl p-8 shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { event: 'Admissions Open', date: 'June 1, 2026' },
                { event: 'Classes Begin', date: 'June 15, 2026' },
                { event: 'Mid-Semester Exams', date: 'September 2026' },
                { event: 'Mid-Year Break', date: 'December 20-31, 2026' },
                { event: 'End-Semester Exams', date: 'April 2027' },
                { event: 'Convocation', date: 'May 15, 2027' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4 pb-4 border-b border-neutral-gray last:border-b-0"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-primary-navy">{item.event}</p>
                    <p className="text-sm text-gray-600">{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Frequently Asked Questions */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Frequently Asked Questions"
            subtitle="Get answers to common academic questions"
          />
          <Accordion items={academicFaq} />
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-r from-primary-navy to-primary-blue text-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Apply now and become part of our thriving academic community.
            </p>
            <Link href="/admissions/apply">
              <Button variant="secondary" size="lg">
                Apply Now
              </Button>
            </Link>
          </motion.div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
