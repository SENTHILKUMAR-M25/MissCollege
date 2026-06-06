'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'

export default function IQAC() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="IQAC - Internal Quality Assurance Cell"
        subtitle="Ensuring Quality and Excellence in Education"
        cta1Text="View Reports"
        cta1Link="#reports"
      />

      <Section>
        <Container>
          <SectionTitle title="About IQAC" subtitle="Our commitment to quality assurance" />
          <div className="prose max-w-4xl">
            <p className="text-lg text-gray-600 mb-6">
              The Internal Quality Assurance Cell (IQAC) of MISS College is dedicated to assessing and enhancing the quality of education, research, and administrative functions.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="IQAC Objectives" subtitle="Our focus areas" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Quality enhancement through regular assessment',
              'Development of quality benchmarks',
              'Faculty development programs',
              'Student feedback and improvement',
              'Research promotion and support',
              'Infrastructure development',
            ].map((obj, index) => (
              <div key={index} className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-soft">
                <div className="text-2xl">✓</div>
                <div>{obj}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
