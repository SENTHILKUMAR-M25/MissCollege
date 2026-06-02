'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { EventCard } from '../components/Cards'

export default function Events() {
  const events = [
    {
      title: 'Orientation Program for New Students',
      date: 'June 15, 2026',
      time: '10:00 AM',
      location: 'Main Campus',
      category: 'Academic',
      href: '#',
    },
    {
      title: 'Annual Sports Meet 2026',
      date: 'June 20-22, 2026',
      time: '9:00 AM',
      location: 'Sports Complex',
      category: 'Sports',
      href: '#',
    },
    {
      title: 'Research Symposium',
      date: 'June 25, 2026',
      time: '2:00 PM',
      location: 'Research Center',
      category: 'Research',
      href: '#',
    },
    {
      title: "Founder's Day Celebration",
      date: 'July 10, 2026',
      time: '11:00 AM',
      location: 'Auditorium',
      category: 'Cultural',
      href: '#',
    },
    {
      title: 'Technical Workshop Series',
      date: 'July 15, 2026',
      time: '3:00 PM',
      location: 'Tech Building',
      category: 'Workshop',
      href: '#',
    },
    {
      title: 'Annual Cultural Fest',
      date: 'August 1-3, 2026',
      time: '5:00 PM',
      location: 'Campus Grounds',
      category: 'Cultural',
      href: '#',
    },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="Events & Seminars"
        subtitle="Exciting Events Throughout the Year"
        cta1Text="View Calendar"
        cta1Link="#calendar"
      />

      <Section id="calendar">
        <Container>
          <SectionTitle title="Upcoming Events" subtitle="Register and participate in our events" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <EventCard key={index} {...event} index={index} />
            ))}
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
