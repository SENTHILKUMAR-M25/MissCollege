'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { StatisticCard } from '../components/Cards'
import { motion } from 'framer-motion'

export default function Research() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Research at MISS College"
        subtitle="Innovation and Discovery Through Rigorous Research"
        cta1Text="View Publications"
        cta1Link="#publications"
        cta2Text="Contact Research Team"
        cta2Link="/contact"
      />

      {/* Research Statistics */}
      <Section>
        <Container>
          <SectionTitle title="Research Impact" subtitle="Contributing to knowledge and innovation" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatisticCard number="50+" label="Research Projects" index={0} />
            <StatisticCard number="100+" label="Publications" index={1} />
            <StatisticCard number="25+" label="Patents Filed" index={2} />
            <StatisticCard number="8" label="Research Centers" index={3} />
          </div>
        </Container>
      </Section>

      {/* Research Centers */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="Research Centers" subtitle="Specialized research facilities" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Center for AI & Machine Learning', focus: 'Artificial Intelligence Research' },
              { name: 'Biotechnology Research Center', focus: 'Life Sciences Innovation' },
              { name: 'Social Sciences Research Institute', focus: 'Societal Studies' },
              { name: 'Business Research Center', focus: 'Economic and Business Studies' },
            ].map((center, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all"
              >
                <h3 className="text-xl font-bold text-primary-navy mb-3">{center.name}</h3>
                <p className="text-gray-600">{center.focus}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
