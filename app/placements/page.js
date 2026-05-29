'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { StatisticCard } from '../components/Cards'
import { motion } from 'framer-motion'

export default function Placements() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Placements"
        subtitle="Launching Successful Careers"
        cta1Text="View Statistics"
        cta1Link="#stats"
      />

      <Section id="stats">
        <Container>
          <SectionTitle title="Placement Statistics" subtitle="Our track record of success" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatisticCard number="95%" label="Placement Rate" index={0} />
            <StatisticCard number="500+" label="Recruiters" index={1} />
            <StatisticCard number="8LPA" label="Average Package" index={2} />
            <StatisticCard number="15LPA" label="Highest Package" index={3} />
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="Top Recruiters" subtitle="Leading companies trust MISS" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Amazon', 'Google', 'Microsoft', 'Accenture', 'IBM', 'Oracle', 'Deloitte', 'EY'].map(
              (company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-6 flex items-center justify-center h-24 shadow-soft hover:shadow-medium transition-all"
                >
                  <p className="font-bold text-primary-blue text-center">{company}</p>
                </motion.div>
              )
            )}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
