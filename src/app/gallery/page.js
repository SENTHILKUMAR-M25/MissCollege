'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { motion } from 'framer-motion'

export default function Gallery() {
  const galleryCategories = [
    { title: 'Campus Views', count: 120, icon: '🏫' },
    { title: 'Events', count: 250, icon: '🎉' },
    { title: 'Sports', count: 180, icon: '⚽' },
    { title: 'Academic', count: 90, icon: '📚' },
    { title: 'Facilities', count: 75, icon: '🏗️' },
    { title: 'Cultural', count: 150, icon: '🎭' },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Gallery"
        subtitle="Explore Campus Life Through Images and Videos"
        cta1Text="View All Photos"
        cta1Link="#gallery"
      />

      <Section id="gallery">
        <Container>
          <SectionTitle title="Photo Gallery" subtitle="Explore our campus and events" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all cursor-pointer"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-blue to-secondary-emerald flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <div className="text-center text-white relative z-10">
                    <div className="text-6xl mb-2">{category.icon}</div>
                    <p className="text-xl font-bold">{category.title}</p>
                    <p className="text-sm mt-1">{category.count} photos</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="Video Gallery" subtitle="Campus videos and event highlights" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Campus Tour', duration: '5:30' },
              { title: 'Faculty Introduction', duration: '3:45' },
              { title: 'Student Experience', duration: '7:20' },
              { title: 'Placement Success', duration: '4:15' },
              { title: 'Research Highlights', duration: '6:00' },
              { title: 'Annual Fest Highlights', duration: '8:45' },
            ].map((video, index) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all group cursor-pointer"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-navy to-primary-blue flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-secondary-gold/20 rounded-full flex items-center justify-center group-hover:bg-secondary-gold/40 transition-all">
                    <div className="w-0 h-0 border-l-8 border-l-white border-t-5 border-t-transparent border-b-5 border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="font-semibold text-primary-navy">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
