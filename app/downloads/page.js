'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { Download } from 'lucide-react'

export default function Downloads() {
  const downloads = [
    { category: 'Academic', items: [
      { name: 'Academic Prospectus 2026-27', type: 'PDF', size: '2.5 MB' },
      { name: 'Academic Calendar 2026-27', type: 'PDF', size: '1.2 MB' },
      { name: 'Course Syllabus - All Programs', type: 'ZIP', size: '15 MB' },
      { name: 'Academic Regulations', type: 'PDF', size: '0.8 MB' },
    ] },
    { category: 'Admissions', items: [
      { name: 'Admission Form', type: 'PDF', size: '0.5 MB' },
      { name: 'Eligibility Criteria', type: 'PDF', size: '0.6 MB' },
      { name: 'Fee Structure Details', type: 'PDF', size: '0.7 MB' },
      { name: 'Scholarship Information', type: 'PDF', size: '1.1 MB' },
    ] },
    { category: 'Forms & Certificates', items: [
      { name: 'Character Certificate Form', type: 'PDF', size: '0.3 MB' },
      { name: 'Transcript Request Form', type: 'PDF', size: '0.4 MB' },
      { name: 'Bonafide Certificate', type: 'PDF', size: '0.3 MB' },
      { name: 'Experience Certificate', type: 'PDF', size: '0.4 MB' },
    ] },
    { category: 'Circulars & Notices', items: [
      { name: 'Semester Exam Circular', type: 'PDF', size: '0.9 MB' },
      { name: 'Holiday Calendar', type: 'PDF', size: '0.5 MB' },
      { name: 'Important Announcements', type: 'PDF', size: '0.7 MB' },
      { name: 'Academic Notifications', type: 'PDF', size: '1.3 MB' },
    ] },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Downloads"
        subtitle="Access Important Documents and Forms"
        cta1Text="Browse Documents"
        cta1Link="#downloads"
      />

      <Section id="downloads">
        <Container>
          <SectionTitle
            title="Important Documents"
            subtitle="Download required forms, prospectus, and information"
          />

          <div className="space-y-8">
            {downloads.map((section, secIndex) => (
              <div key={secIndex}>
                <h3 className="text-2xl font-bold text-primary-navy mb-6 flex items-center">
                  <span className="w-1 h-8 bg-primary-blue rounded mr-3"></span>
                  {section.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-primary-navy">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.type} • {item.size}</p>
                      </div>
                      <button className="ml-4 p-3 bg-primary-blue text-white rounded-lg hover:bg-primary-navy transition-colors">
                        <Download size={20} />
                      </button>
                    </div>
                  ))}
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
