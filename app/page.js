'use client'

import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HeroBanner from './components/HeroBanner'
import { GlassCard, DepartmentCard, StatisticCard, EventCard, NewsCard } from './components/Cards'
import { Section, SectionTitle, Container, Button } from './components/UI'
import { BookOpen, Users, Award, Zap, TrendingUp, Microscope } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  const stats = [
    { number: '45+', label: 'Years of Excellence', icon: Award },
    { number: '8000+', label: 'Students', icon: Users },
    { number: '150+', label: 'Faculty Members', icon: BookOpen },
    { number: '12', label: 'Departments', icon: Zap },
  ]

  const departments = [
    {
      name: 'Computer Science',
      description: 'Modern computing and technology education',
      href: '/departments#computer-science',
    },
    {
      name: 'Commerce',
      description: 'Business and commerce expertise',
      href: '/departments#commerce',
    },
    {
      name: 'Science',
      description: 'Advanced scientific research and learning',
      href: '/departments#science',
    },
    {
      name: 'Humanities',
      description: 'Liberal arts and social sciences',
      href: '/departments#humanities',
    },
  ]

  const announcements = [
    {
      title: 'Admissions Open for 2026-27',
      excerpt: 'Applications are now being accepted for all undergraduate and postgraduate programs.',
      date: '2026-05-29',
      category: 'Admissions',
      href: '/admissions',
    },
    {
      title: 'Campus Placement Drive',
      excerpt: 'Multiple companies to visit campus for recruitment. Register now to participate.',
      date: '2026-05-25',
      category: 'Placements',
      href: '/placements',
    },
    {
      title: 'NAAC Accreditation Result',
      excerpt: 'MISS College has been accredited with Grade A by NAAC.',
      date: '2026-05-20',
      category: 'News',
      href: '/naac',
    },
  ]

  const upcomingEvents = [
    {
      title: 'Orientation Program for New Students',
      date: 'June 15, 2026',
      time: '10:00 AM',
      location: 'Main Campus',
      category: 'Academic',
      href: '/events',
    },
    {
      title: 'Annual Sports Meet 2026',
      date: 'June 20-22, 2026',
      time: '9:00 AM',
      location: 'Sports Complex',
      category: 'Sports',
      href: '/events',
    },
    {
      title: 'Research Symposium',
      date: 'June 25, 2026',
      time: '2:00 PM',
      location: 'Research Center',
      category: 'Research',
      href: '/events',
    },
  ]

  const features = [
    {
      title: 'World-Class Academics',
      description: 'Comprehensive programs with industry-relevant curriculum and expert faculty',
      icon: BookOpen,
    },
    {
      title: 'Research Excellence',
      description: 'Multiple research centers with publications and patents',
      icon: Microscope,
    },
    {
      title: 'Industry Partnerships',
      description: 'Strong ties with leading companies for placements and internships',
      icon: TrendingUp,
    },
    {
      title: 'Campus Life',
      description: 'Vibrant student community with clubs, sports, and cultural activities',
      icon: Users,
    },
  ]

  return (
    <>
      <Navbar />

      {/* Hero Banner */}
      <HeroBanner
        title="Welcome to MISS College"
        subtitle="Premier Institution for Excellence in Education, Research, and Innovation"
        cta1Text="Apply Now"
        cta1Link="/admissions#apply"
        cta2Text="Explore Programs"
        cta2Link="/academics"
      />

      {/* Quick Actions */}
      <Section className="bg-neutral-light -mt-0">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/academics">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-medium transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">📚</div>
                <h3 className="font-bold text-primary-navy mb-2">Academics</h3>
                <p className="text-sm text-gray-600">Explore our programs</p>
              </motion.div>
            </Link>

            <Link href="/admissions">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-medium transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-bold text-primary-navy mb-2">Admissions</h3>
                <p className="text-sm text-gray-600">Apply to MISS</p>
              </motion.div>
            </Link>

            <Link href="/student-corner">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-medium transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">👤</div>
                <h3 className="font-bold text-primary-navy mb-2">Student Portal</h3>
                <p className="text-sm text-gray-600">Access your account</p>
              </motion.div>
            </Link>

            <Link href="/examinations">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-medium transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-primary-navy mb-2">Examinations</h3>
                <p className="text-sm text-gray-600">View exam details</p>
              </motion.div>
            </Link>
          </div>
        </Container>
      </Section>

      {/* About Section */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-primary-navy mb-6">About MISS College</h2>
              <p className="text-lg text-gray-600 mb-4">
                Madurai Institute of Social Sciences is a premier educational institution dedicated to academic excellence, research innovation, and holistic development of students.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With over 45 years of excellence, MISS College has established itself as a leading institution in higher education, offering diverse programs across multiple disciplines.
              </p>
              <Link href="/about">
                <Button variant="primary">Learn More About Us</Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-gradient-to-br from-primary-blue to-primary-navy rounded-xl h-48 flex items-center justify-center text-white text-center p-6">
                <div>
                  <div className="text-3xl font-bold mb-2">45+</div>
                  <p>Years of Excellence</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-secondary-gold to-secondary-emerald rounded-xl h-48 flex items-center justify-center text-white text-center p-6">
                <div>
                  <div className="text-3xl font-bold mb-2">8000+</div>
                  <p>Happy Students</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-secondary-emerald to-primary-blue rounded-xl h-48 flex items-center justify-center text-white text-center p-6">
                <div>
                  <div className="text-3xl font-bold mb-2">150+</div>
                  <p>Expert Faculty</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary-navy to-secondary-gold rounded-xl h-48 flex items-center justify-center text-white text-center p-6">
                <div>
                  <div className="text-3xl font-bold mb-2">12</div>
                  <p>Departments</p>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Key Statistics */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="By The Numbers"
            subtitle="MISS College in numbers - A testament to our excellence"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatisticCard key={index} {...stat} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section>
        <Container>
          <SectionTitle
            title="Why Choose MISS College"
            subtitle="Discover what makes us a premier educational institution"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <GlassCard key={index} {...feature} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Departments */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Our Departments"
            subtitle="Explore our diverse academic departments"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {departments.map((dept, index) => (
              <DepartmentCard key={index} {...dept} index={index} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/departments">
              <Button variant="primary" size="lg">
                View All Departments
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Announcements */}
      <Section>
        <Container>
          <SectionTitle
            title="Latest Announcements"
            subtitle="Stay updated with recent news and announcements"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {announcements.map((news, index) => (
              <NewsCard key={index} {...news} index={index} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/events">
              <Button variant="primary">View All News</Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Upcoming Events */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Upcoming Events"
            subtitle="Join us for exciting events and activities"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {upcomingEvents.map((event, index) => (
              <EventCard key={index} {...event} index={index} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/events">
              <Button variant="primary">View Calendar</Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Testimonials Section */}
      <Section>
        <Container>
          <SectionTitle
            title="Student Testimonials"
            subtitle="Hear from our amazing students and alumni"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-secondary-gold text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6">
                  "MISS College has transformed my life with its excellent education, supportive faculty, and amazing campus environment. I'm grateful for every moment here."
                </p>
                <div>
                  <p className="font-bold text-primary-navy">Student Name</p>
                  <p className="text-sm text-gray-600">Class of 2024</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Recruiters Section */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Our Recruiters"
            subtitle="Leading companies trust MISS College graduates"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 flex items-center justify-center h-24 shadow-soft hover:shadow-medium transition-all"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-blue">TCS</div>
                  <p className="text-xs text-gray-600 mt-1">Partner</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Call to Action */}
      <Section className="bg-gradient-to-r from-primary-navy via-primary-blue to-secondary-emerald text-white">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Join MISS College?</h2>
            <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              Take the first step towards an excellent educational journey with us.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/admissions#apply">
                <Button variant="secondary" size="lg">
                  Apply Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-navy">
                  Get in Touch
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
