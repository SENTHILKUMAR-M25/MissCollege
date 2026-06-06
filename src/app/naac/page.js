'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'

export default function NAAC() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="NAAC Accreditation"
        subtitle="National Assessment and Accreditation Council Recognition"
        cta1Text="View Documents"
        cta1Link="#documents"
      />

      <Section>
        <Container>
          <SectionTitle title="NAAC Status" subtitle="Our accreditation achievement" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-secondary-gold to-secondary-emerald rounded-xl p-12 text-white text-center">
              <div className="text-6xl font-bold mb-4">A</div>
              <p className="text-2xl font-bold">Grade A Accreditation</p>
              <p className="text-lg mt-2">CGPA: 3.48 out of 4</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary-navy mb-6">NAAC Assessment Criteria</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">1.</span>
                  <span>Curricular Aspects</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">2.</span>
                  <span>Teaching-Learning and Evaluation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">3.</span>
                  <span>Research, Consultancy and Extension</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">4.</span>
                  <span>Infrastructure and Learning Resources</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-blue font-bold mt-1">5.</span>
                  <span>Student Support and Progression</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
