'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { submitContactForm } from '@/actions/admissions'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await submitContactForm({ ...form, message: form.message })
    res.success ? setSuccess(true) : setError(res.error || 'Failed to send')
    setLoading(false)
  }

  if (success) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h2>
          <p className="text-gray-600 mb-6">Thank you for reaching out. Our team will respond shortly.</p>
          <button onClick={() => { setSuccess(false); setForm({ name:'',email:'',phone:'',subject:'General Inquiry',message:'' }) }} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">Send Another Message</button>
        </div>
      </div>
      <Footer />
    </>
  )

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
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-soft space-y-6">
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Full Name
                </label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  type="text"
                  required
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
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    type="email"
                    required
                    placeholder="Your email"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-navy mb-2">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    type="tel"
                    required
                    placeholder="Your phone"
                    className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-navy mb-2">
                  Subject
                </label>
                <select value={form.subject} onChange={e => set('subject', e.target.value)} className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue">
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
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  required
                  placeholder="Your message"
                  rows="5"
                  className="w-full px-4 py-3 border border-neutral-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                ></textarea>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
