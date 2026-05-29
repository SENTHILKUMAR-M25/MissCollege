'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import Link from 'next/link'

export default function Alumni() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Alumni Network"
        subtitle="Join Our Proud Community of Graduates"
        cta1Text="Register Now"
        cta1Link="#register"
      />

      <Section id="register">
        <Container>
          <SectionTitle
            title="Alumni Association"
            subtitle="Connecting generations of MISS College graduates"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-neutral-light rounded-xl p-6">
                <h3 className="font-bold text-primary-navy mb-3">Why Join Alumni Network?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Connect with fellow graduates</li>
                  <li>✓ Networking opportunities</li>
                  <li>✓ Career advancement support</li>
                  <li>✓ Mentoring opportunities</li>
                  <li>✓ Exclusive events and reunions</li>
                  <li>✓ College updates and news</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-primary-navy mb-6">Register as Alumni</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                <input
                  type="text"
                  placeholder="Registration Number"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                <input
                  type="text"
                  placeholder="Graduation Year"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                <Button variant="primary" size="lg" className="w-full">
                  Register
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
