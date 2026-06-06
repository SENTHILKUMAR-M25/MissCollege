'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import { motion } from 'framer-motion'
import { Clock, BookOpen, Monitor, ExternalLink, CheckCircle, ChevronDown } from 'lucide-react'

const timings = [
  { day: 'Monday to Friday', time: '9:00 AM to 6:00 PM' },
  { day: 'Saturdays', time: '10:00 AM to 1:30 PM' },
  { day: 'Study Holidays (Examination Days)', time: '10:00 AM to 7:00 PM' },
]

const resources = [
  { label: 'Total No. of Volumes', value: '18,005' },
  { label: 'Total No. of Titles', value: '10,995' },
  { label: 'National Journals', value: '16' },
  { label: 'Magazines', value: '10' },
  { label: 'Reference Books', value: '2,472' },
  { label: 'Back Volumes of Periodicals', value: '2,586' },
  { label: 'Research Project Reports', value: '3,351' },
  { label: 'Book Bank', value: '549' },
  { label: 'Educational CDs', value: '439' },
]

const services = [
  'Circulation Services',
  'Current Awareness Services',
  'Reference Services',
  'Internet Browsing Services',
  'Newspaper Clipping',
  'Journal Content Services',
  'Display of New Arrival Services',
  'Bibliography Services',
  'Reprography Services',
]

const ejournals = [
  { publisher: 'American Institute of Physics', titles: '18 titles', url: 'http://journals.aip.org/' },
  { publisher: 'American Physical Society', titles: '10 titles', url: 'http://publish.aps.org/browse.html' },
  { publisher: 'Annual Reviews', titles: '33 titles', url: 'http://arjournals.annualreviews.org/' },
  { publisher: 'Cambridge University Press', titles: '224 titles', url: 'http://journals.cambridge.org/' },
  { publisher: 'Economic and Political Weekly (EPW)', titles: '1 title', url: 'http://www.epw.in/' },
  { publisher: 'Indian Journals', titles: '186 titles', url: 'http://www.indianjournals.com/' },
  { publisher: 'Institute of Physics', titles: '46 titles', url: 'http://iopscience.iop.org/' },
  { publisher: 'Oxford University Press', titles: '206 titles', url: 'http://www.oxfordjournals.org' },
  { publisher: 'Royal Society of Chemistry', titles: '29 titles', url: 'http://www.rsc.org/Publishing/Journals/' },
  { publisher: 'W. Wilson', titles: '3,075 titles', url: 'http://search.ebscohost.com' },
]

const ebooks = [
  { publisher: 'Cambridge Books Online', titles: '1,000+ titles', url: 'http://ebooks.cambridge.org' },
  { publisher: 'E-brary', titles: '70,000+ titles', url: 'http://site.ebrary.com/lib/inflibnet' },
  { publisher: 'Hindustan Book Agency', titles: '65+ titles', url: 'http://hindustan.igpublish.com' },
  { publisher: 'Institute of South East Asian Studies (ISEAS)', titles: '382 titles', url: 'http://iseas.igpublish.com' },
  { publisher: 'Oxford Scholarship', titles: '902 titles', url: 'http://www.oxfordscholarship.com/' },
  { publisher: 'Springer eBooks', titles: '1,500+ titles', url: 'http://link.springer.com' },
  { publisher: 'Sage Publication eBooks', titles: '1,000 titles', url: 'http://knowledge.segepub.com' },
  { publisher: 'Taylor & Francis eBooks', titles: '1,000+ titles', url: 'http://www.tandfebooks.com' },
  { publisher: 'Myilibrary – McGraw Hill', titles: '1,124 titles', url: 'http://lib.myilibrary.com/' },
]

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-neutral-gray rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-neutral-light hover:bg-blue-50 transition-colors text-left">
        <span className="font-bold text-primary-navy">{title}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 py-5 bg-white">{children}</div>}
    </div>
  )
}

export default function Library() {
  return (
    <>
      <Navbar />
      <HeroBanner
        title="Martin Henry Library"
        subtitle="MADURAI INSTITUTE OF SOCIAL SCIENCES — No.9, Alagarkoil Road, Madurai – 02"
        cta1Text="N-LIST Resources"
        cta1Link="#nlist"
      />

      {/* About */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <motion.div className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-black text-primary-navy mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>
                About the Library
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our college library functions with all modern facilities which fulfil the needs of the students in the latest development in the different areas of study. The library has a various collection of books and journals. We follow the <strong>Open Access System</strong> for the convenience of users.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The library is fully automated through <strong>"MODERNLIB" Library Management Software</strong> and users can access resources through <strong>OPAC (Online Public Access Catalogue)</strong>. It also provides access to e-resources through the <strong>N-LIST</strong> (National Library and Information Services Infrastructure for Scholarly Contents) programme.
              </p>
            </motion.div>

            {/* Timings card */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-navy to-primary-blue rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg">Library Timings</h3>
              </div>
              <div className="space-y-4">
                {timings.map((t, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs font-semibold mb-1">{t.day}</p>
                    <p className="text-white font-bold text-sm">{t.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Library Resources Stats */}
      <Section className="bg-neutral-light">
        <Container>
          <SectionTitle title="Library Resources" subtitle="Our comprehensive collection at a glance" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {resources.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                className="bg-white rounded-2xl p-5 text-center shadow-soft hover:shadow-medium transition-all">
                <p className="text-2xl font-black text-primary-blue mb-1">{r.value}</p>
                <p className="text-xs text-slate-500 leading-snug">{r.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Library Services */}
      <Section>
        <Container>
          <SectionTitle title="Library Services" subtitle="Services available to all registered users" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                className="flex items-center gap-3 bg-blue-50 border border-primary-blue/20 rounded-xl p-4">
                <CheckCircle size={18} className="text-primary-blue flex-shrink-0" />
                <span className="text-slate-700 font-medium text-sm">{s}</span>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* N-LIST Section */}
      <Section id="nlist" className="bg-neutral-light">
        <Container>
          <SectionTitle title="Online Resources – N-LIST" subtitle="UGC – INFLIBNET N-LIST Programme" />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-soft mb-8 border-l-4 border-primary-blue">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                <Monitor size={20} className="text-primary-blue" />
              </div>
              <div>
                <h3 className="font-bold text-primary-navy text-lg mb-1">About N-LIST</h3>
                <a href="http://nlist.inflibnet.ac.in/" target="_blank" rel="noreferrer"
                  className="text-primary-blue text-sm hover:underline flex items-center gap-1">
                  http://nlist.inflibnet.ac.in/ <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              The Project entitled <strong>"National Library and Information Services Infrastructure for Scholarly Content (N-LIST)"</strong>, being jointly executed by the UGC-INFONET Digital Library Consortium, INFLIBNET Centre and the INDEST-AICTE Consortium, IIT Delhi provides cross-subscription to e-resources and access to selected e-resources to colleges.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              As an authorised user from colleges registered under N-LIST programme, you will have access to e-resources including <strong>3,800+ e-journals</strong> and <strong>80,400+ e-books</strong> directly from the publisher's website.
            </p>
          </motion.div>

          {/* E-Resources accordion */}
          <div className="space-y-4">
            <AccordionItem title="E-Journals (Full Text) — 10 Publishers">
              <div className="space-y-3">
                {ejournals.map((j, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-neutral-gray last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-primary-navy">{j.publisher}</p>
                      <p className="text-xs text-slate-500">{j.titles}</p>
                    </div>
                    <a href={j.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-primary-blue hover:underline flex-shrink-0">
                      Visit <ExternalLink size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem title="E-Books — 9 Publishers">
              <div className="space-y-3">
                {ebooks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-neutral-gray last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-primary-navy">{b.publisher}</p>
                      <p className="text-xs text-slate-500">{b.titles}</p>
                    </div>
                    <a href={b.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-primary-blue hover:underline flex-shrink-0">
                      Visit <ExternalLink size={11} />
                    </a>
                  </div>
                ))}
              </div>
            </AccordionItem>

            <AccordionItem title="Bibliographic Database">
              <div className="flex items-center justify-between gap-4 py-2">
                <div>
                  <p className="text-sm font-semibold text-primary-navy">MathSciNet</p>
                  <p className="text-xs text-slate-500">American Mathematical Society</p>
                </div>
                <a href="https://mathscinet.ams.org" target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-primary-blue hover:underline flex-shrink-0">
                  https://mathscinet.ams.org <ExternalLink size={11} />
                </a>
              </div>
            </AccordionItem>
          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
