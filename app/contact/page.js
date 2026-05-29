'use client'

import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function Contact() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Contact Us"
        subtitle="Get in Touch With MISS College"
        cta1Text="Send Message"
        cta1Link="#form"
      />

      <Section>
        <Container>
          <SectionTitle title="Contact Information" subtitle="We're here to help" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-light rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="font-bold text-primary-navy mb-2">Address</h3>
              <p className="text-gray-600 text-sm">
                MISS College, Madurai<br />
                Tamil Nadu, India - 625001
              </p>
            </div>

            <div className="bg-neutral-light rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} />
              </div>
              <h3 className="font-bold text-primary-navy mb-2">Phone</h3>
              <p className="text-gray-600 text-sm">
                <a href="tel:+914527777777" className="hover:text-primary-blue">
                  +91 452 777 7777
                </a>
                <br />
                <a href="tel:+914521234567" className="hover:text-primary-blue">
                  +91 452 123 4567
                </a>
              </p>
            </div>

            <div className="bg-neutral-light rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="font-bold text-primary-navy mb-2">Email</h3>
              <p className="text-gray-600 text-sm">
                <a href="mailto:info@misscollege.edu.in" className="hover:text-primary-blue">
                  info@misscollege.edu.in
                </a>
                <br />
                <a href="mailto:admissions@misscollege.edu.in" className="hover:text-primary-blue">
                  admissions@misscollege.edu.in
                </a>
              </p>
            </div>

            <div className="bg-neutral-light rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-primary-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="font-bold text-primary-navy mb-2">Hours</h3>
              <p className="text-gray-600 text-sm">
                Mon - Fri: 9:00 AM - 6:00 PM<br />
                Sat: 10:00 AM - 4:00 PM<br />
                Sun: Closed
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Contact Form */}
      <Section id="form" className="bg-neutral-light">
        <Container>
          <SectionTitle title="Send Us a Message" subtitle="We'll get back to you soon" />
          <div className="max-w-2xl mx-auto">
            <form className="bg-white rounded-xl p-8 shadow-soft space-y-6">
              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-navy mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-navy mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Your phone"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue">
                  <option>Select Subject</option>
                  <option>Admissions Inquiry</option>
                  <option>Academic Information</option>
                  <option>Placement Query</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Your message"
                  rows="5"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                ></textarea>
              </div>

              <Button variant="primary" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
