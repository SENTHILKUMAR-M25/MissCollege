'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { GlassCard } from '../components/Cards'
import { Users, Trophy, Heart, Zap } from 'lucide-react'

export default function CampusLife() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Campus Life"
        subtitle="Experience Our Vibrant Community"
        cta1Text="View Activities"
        cta1Link="#activities"
      />

      <Section id="activities">
        <Container>
          <SectionTitle title="Campus Activities" subtitle="A holistic student experience" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <GlassCard
              title="Sports & Fitness"
              description="Cricket, football, badminton, and more. State-of-the-art sports facilities."
              icon={Trophy}
              index={0}
            />
            <GlassCard
              title="Clubs & Societies"
              description="40+ student clubs for various interests and hobbies."
              icon={Users}
              index={1}
            />
            <GlassCard
              title="Social Service"
              description="NSS and community engagement programs for social welfare."
              icon={Heart}
              index={2}
            />
            <GlassCard
              title="Cultural Events"
              description="Annual fests, concerts, and cultural celebrations throughout the year."
              icon={Zap}
              index={3}
            />
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Campus Facilities"
            subtitle="World-class infrastructure for student development"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Hostel Facilities', desc: 'Comfortable accommodation with all modern amenities' },
              { title: 'Sports Complex', desc: 'Indoor and outdoor sports facilities' },
              { title: 'Cafeteria', desc: 'Multi-cuisine dining facility' },
              { title: 'Medical Center', desc: '24/7 healthcare services' },
              { title: 'Tech Labs', desc: 'Advanced computer and engineering labs' },
              { title: 'Auditorium', desc: 'State-of-the-art event venue' },
              { title: 'Recreation Center', desc: 'Gaming and leisure facilities' },
              { title: 'Transportation', desc: 'Campus shuttle bus service' },
            ].map((facility, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all">
                <h3 className="font-bold text-primary-navy mb-2">{facility.title}</h3>
                <p className="text-gray-600 text-sm">{facility.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
