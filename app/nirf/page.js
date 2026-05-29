'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'

export default function NIRF() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="NIRF Rankings"
        subtitle="National Institutional Ranking Framework"
        cta1Text="View Ranking Details"
        cta1Link="#rankings"
      />

      <Section>
        <Container>
          <SectionTitle title="NIRF 2026 Rankings" subtitle="Our institutional performance" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <p className="text-gray-600 font-semibold">Overall Category</p>
              <p className="text-4xl font-bold text-primary-blue mt-2">Rank 125</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <p className="text-gray-600 font-semibold">College Category</p>
              <p className="text-4xl font-bold text-secondary-gold mt-2">Rank 45</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-soft text-center">
              <p className="text-gray-600 font-semibold">Teaching Quality</p>
              <p className="text-4xl font-bold text-secondary-emerald mt-2">Rank 80</p>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
