'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { NewsCard } from '../components/Cards'

export default function News() {
  const news = [
    {
      title: 'MISS College Achieves NAAC Grade A Accreditation',
      excerpt: 'Proud to announce that MISS College has been accredited with Grade A by NAAC for excellence in education.',
      date: 'May 28, 2026',
      category: 'News',
      href: '#',
    },
    {
      title: 'Campus Placement Drive - 500+ Companies',
      excerpt: 'Multiple leading companies to visit campus for recruitment. Students can register for interviews starting June 1.',
      date: 'May 25, 2026',
      category: 'Placements',
      href: '#',
    },
    {
      title: 'Research Paper Published in International Journal',
      excerpt: 'Faculty and students from Computer Science Department published groundbreaking research in IEEE Transactions.',
      date: 'May 20, 2026',
      category: 'Research',
      href: '#',
    },
    {
      title: 'New State-of-the-Art Laboratory Inaugurated',
      excerpt: 'Advanced AI and Machine Learning lab with cutting-edge equipment now open for student and faculty research.',
      date: 'May 15, 2026',
      category: 'Infrastructure',
      href: '#',
    },
    {
      title: 'Student Wins National Essay Competition',
      excerpt: 'Congratulations to our student for winning the prestigious National Essay Writing Competition.',
      date: 'May 10, 2026',
      category: 'Achievements',
      href: '#',
    },
    {
      title: 'Summer Internship Programs Open for Registration',
      excerpt: 'Apply now for exciting summer internship opportunities with leading companies and research institutions.',
      date: 'May 5, 2026',
      category: 'Internships',
      href: '#',
    },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="News & Announcements"
        subtitle="Stay Updated with MISS College"
        cta1Text="View Latest"
        cta1Link="#latest"
      />

      <Section id="latest">
        <Container>
          <SectionTitle title="Latest News" subtitle="Recent updates and announcements" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <NewsCard key={index} {...article} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
