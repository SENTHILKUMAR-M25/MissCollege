'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'

export default function Library() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Central Library"
        subtitle="Your Gateway to Knowledge"
        cta1Text="Browse E-Library"
        cta1Link="#elibrary"
      />

      <Section id="elibrary">
        <Container>
          <SectionTitle title="Library Services" subtitle="Comprehensive information resources" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Physical Books', count: '50,000+', icon: '📚' },
              { title: 'E-Journals', count: '5,000+', icon: '📖' },
              { title: 'E-Books', count: '10,000+', icon: '💻' },
              { title: 'Databases', count: '20+', icon: '🗄️' },
            ].map((resource, index) => (
              <div key={index} className="bg-neutral-light rounded-xl p-8 text-center hover:shadow-soft transition-all">
                <div className="text-5xl mb-3">{resource.icon}</div>
                <h3 className="font-bold text-primary-navy mb-1">{resource.title}</h3>
                <p className="text-2xl text-primary-blue font-bold">{resource.count}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="Library Facilities" subtitle="State-of-the-art infrastructure" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Reading rooms with comfortable seating',
              'Computer labs with internet access',
              'Group study areas',
              'Quiet study zones',
              'Rare book collection',
              'Audio-visual media center',
              '24/7 digital access',
              'Professional librarian assistance',
            ].map((facility, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-soft flex items-center gap-4">
                <span className="text-3xl">✓</span>
                <span className="text-gray-700 font-semibold">{facility}</span>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
