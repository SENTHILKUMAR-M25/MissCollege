'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'

export default function StudentCorner() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Student Corner"
        subtitle="Your Personal Academic Hub"
        cta1Text="Login"
        cta1Link="#login"
      />

      <Section id="login">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionTitle
                title="Student Portal"
                subtitle="Access your academic information and resources"
                align="left"
              />
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <span className="text-gray-700">View attendance records</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <span className="text-gray-700">Check exam results</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <span className="text-gray-700">Download assignments and notes</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <span className="text-gray-700">Check class timetable</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <span className="text-gray-700">View fee details</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📜</span>
                  <span className="text-gray-700">Download certificates</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-soft">
              <h3 className="text-2xl font-bold text-primary-navy mb-6">Login to Your Account</h3>
              <form className="space-y-4">
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
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <Button variant="primary" size="lg" className="w-full">
                  Sign In
                </Button>
              </form>
              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account? <a href="#" className="text-primary-blue font-semibold">Register here</a>
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
