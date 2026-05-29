'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { FacultyCard } from '../components/Cards'

export default function Administration() {
  const administrativeTeam = [
    { name: 'Dr. Principal Name', designation: 'Principal', department: 'Office of Principal', email: 'principal@misscollege.edu.in' },
    { name: 'Dr. Vice Principal', designation: 'Vice Principal', department: 'Academic Affairs', email: 'vp@misscollege.edu.in' },
    { name: 'Dr. Dean Academics', designation: 'Dean - Academics', department: 'Academic Division', email: 'dean@misscollege.edu.in' },
    { name: 'Dr. Dean Research', designation: 'Dean - Research', department: 'Research Division', email: 'research@misscollege.edu.in' },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Administration"
        subtitle="Leadership and Management of MISS College"
        cta1Text="Contact Admin"
        cta1Link="/contact"
      />

      {/* Organizational Structure */}
      <Section>
        <Container>
          <SectionTitle
            title="Organizational Structure"
            subtitle="Meet our administrative leadership"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {administrativeTeam.map((member, index) => (
              <FacultyCard key={index} {...member} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Administrative Departments */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Administrative Departments"
            subtitle="Supporting academic excellence"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: 'Office of the Principal',
                functions: [
                  'Strategic planning and policy implementation',
                  'Overall institutional governance',
                  'External relations and partnerships',
                ],
              },
              {
                name: 'Academic Division',
                functions: [
                  'Curriculum development and review',
                  'Faculty management and development',
                  'Academic quality assurance',
                ],
              },
              {
                name: 'Finance and Administration',
                functions: [
                  'Budget planning and management',
                  'Financial accounting and auditing',
                  'Administrative operations',
                ],
              },
              {
                name: 'Admissions and Student Affairs',
                functions: [
                  'Admission process management',
                  'Student welfare and support',
                  'Records and documentation',
                ],
              },
              {
                name: 'Research and Innovation',
                functions: [
                  'Research project support',
                  'Grant management',
                  'Publication assistance',
                ],
              },
              {
                name: 'Infrastructure and Facilities',
                functions: [
                  'Campus maintenance',
                  'Lab and facility management',
                  'Hostel operations',
                ],
              },
            ].map((dept, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-soft hover:shadow-medium transition-all"
              >
                <h3 className="text-xl font-bold text-primary-navy mb-4">{dept.name}</h3>
                <ul className="space-y-2">
                  {dept.functions.map((func, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                      <span className="text-primary-blue font-bold mt-1">•</span>
                      <span>{func}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
