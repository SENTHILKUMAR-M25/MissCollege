'use client'

import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { Section, Container, SectionTitle } from '../../components/UI'
import HeroBanner from '../../components/HeroBanner'
import ApplyModal from '../../components/ApplyModal'

export default function ApplyPage() {
  const [isModalOpen, setIsModalOpen] = useState(true)

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Application Form"
        subtitle="Apply to MISS College and start your journey"
        cta1Text="Back to Admissions"
        cta1Link="/admissions"
      />

      <Section>
        <Container>
          <SectionTitle
            title="Join Our Community"
            subtitle="Complete your application in just a few simple steps"
          />
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 mb-6">
              Thank you for your interest in MISS College. Please fill out the application form below with accurate information. 
              Our admissions team will review your application and contact you within 2-3 working days.
            </p>
            <div className="bg-blue-50 border border-primary-blue/20 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-primary-navy mb-3">Required Documents:</h3>
              <ul className="text-sm text-gray-700 space-y-1 text-left">
                <li>• 10th Standard Mark Sheet</li>
                <li>• 12th Standard Mark Sheet</li>
                <li>• Entrance Exam Score Card (if applicable)</li>
                <li>• ID Proof (Aadhaar/Passport/Driving License)</li>
                <li>• Address Proof</li>
                <li>• Passport Size Photo (4x6 cm)</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <ApplyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <Footer />
    </>
  )
}
