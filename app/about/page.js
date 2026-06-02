'use client'

import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Section, SectionTitle, Container, Timeline, Accordion, Button } from '../components/UI'
import HeroBanner from '../components/HeroBanner'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import logo from '../assets/logo.png'
function ProfileDropdownCard({ item, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-soft border border-neutral-gray overflow-hidden"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className="w-full flex items-center justify-between px-5 py-4 transition-colors group cursor-default"
        style={{ backgroundColor: open ? '#eff6ff' : '' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div className="text-left">
            <p className="font-bold text-primary-navy text-sm group-hover:text-primary-blue transition-colors">{item.label}</p>
            <p className="text-xs text-primary-blue font-semibold">{item.value}</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180 text-primary-blue' : ''}`}
        />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-neutral-gray bg-neutral-light">
              {item.details.map((d) => (
                <div key={d.k} className="bg-white rounded-lg px-4 py-3 shadow-soft">
                  <p className="text-xs text-slate-500 font-medium">{d.k}</p>
                  <p className="text-sm font-bold text-primary-navy mt-0.5">{d.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function About() {
  const timelineEvents = [
    { year: '1969', description: 'Founded on 2nd October in a small house with 4 students' },
    { year: '2007', description: 'Accredited with B++ by NAAC' },
    { year: '2009', description: 'Achieved Autonomous status' },
    { year: '2014', description: 'Re-accredited with \'A\' Grade by NAAC; UGC Community College Diploma launched' },
    { year: '2016', description: 'Extension of Autonomy granted' },
    { year: '2019', description: 'Re-Accredited with "B+" Grade in the third cycle' },
    { year: 'Present', description: 'Establishing a 100-bedded Sports Hostel in Naickenpatti village' },
  ]

  const aboutAccordion = [
    {
      title: 'Vision',
      content: 'Madurai Institute of Social Sciences, as a learning organization, strives to educate and develop Human Resources to serve mankind and to establish global peace and prosperity.',
    },
    {
      title: 'Mission',
      content: 'Providing Quality Education at affordable cost by designing academic agenda in tune with the changing needs of the society, scanning the external environment through strategic planning, building faculty power in tune with the modern trend in teaching, interacting creatively with the Government and civil society, promoting applied and action research on governance and community problems and establishing System Management.',
    },
    {
      title: 'Core Values',
      content: (
        <ul className="list-decimal pl-5 space-y-2">
          <li>The worth and dignity of individual with inherent quality of humanity</li>
          <li>Excellence through unveiling the knowledge</li>
          <li>Upholding the spirit of nationalism, global peace and prosperity</li>
          <li>Communal harmony assimilated with cultural heritage</li>
          <li>The competency derived out of serving the downtrodden and all sections in the society</li>
          <li>Handholding for upliftment</li>
          <li>Development of professional and personal self</li>
        </ul>
      ),
    },
    {
      title: 'Goal',
      content: 'To develop human resources to serve mankind and establish global peace and prosperity.',
    },
    {
      title: 'Objectives',
      content: (
        <ul className="list-decimal pl-5 space-y-2">
          <li>To develop worthy citizens with high moral values, deep, professional knowledge, sharpened skills and positive frame of mind.</li>
          <li>To impart education in accordance with the changing needs of society</li>
          <li>To inculcate scientific temper in the minds of the students</li>
          <li>To provide opportunity to the students to have a closer linkage with the civil society</li>
          <li>To sensitize the student community on the social realties and to prepare them to adequately respond to those realities.</li>
          <li>To offer field relevant courses and increase the employability of the students.</li>
        </ul>
      ),
    },
  ]

  return (
    <>
      <Navbar />
      <HeroBanner
        title="About MISS College"
        subtitle="45+ Years of Educational Excellence and Innovation"
        cta1Text="Explore Programs"
        cta1Link="/academics"
        cta2Text="Contact Us"
        cta2Link="/contact"
      />

      {/* Quick Navigation */}
      <Section className="bg-neutral-light">
        <Container>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { label: 'History', href: '#history' },
              { label: 'Milestones', href: '#milestones' },
              { label: 'Founder', href: '#founder' },
              { label: 'Management', href: '#management' },
              { label: 'Vision & Mission', href: '#vision' },
              { label: 'Principal Message', href: '#principal' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-6 py-2 bg-white rounded-full font-semibold text-primary-blue hover:bg-primary-blue hover:text-white transition-colors shadow-soft"
              >
                {item.label}
              </a>
            ))}
          </div>
        </Container>
      </Section>

      {/* History Section */}
      <Section id="history">
        <Container>
          <SectionTitle
            title="Our History"
            subtitle="A Journey of Academic Excellence"
          />
          
          <div className="max-w-4xl mx-auto text-gray-700 leading-relaxed space-y-6 mb-16">
            <p>
              <strong className="text-primary-navy font-bold">Dr. (Capt).D.V.P Raja</strong> - The Founder of Madurai Institute of Social Sciences had a visionary idea of setting up an Educational Institution in the Southern part of Tamil Nadu with a view to train young men and women in “Scientific Humanism”. With the assistance and cooperation of like-minded dignitaries, it was started in a small house at 21, Beasant road, Chokkikulam, Madurai on <strong className="text-primary-blue">2nd October 1969</strong>, on the birthday centenary of Gandhiji, the Father of our Nation, with an enrolment of 4 students. Now the college has more than 1000 students housed in a large building on a beautiful campus on Alagarkoil road, Madurai.
            </p>
            <p>
              It began as a Post Graduate College with a view of meeting the long-felt need of southern districts of Tamil Nadu. Changing educational climates provided challenges that Dr. (Capt).D.V.P.Raja always met with commitment and dedication. The dynamism of the institution is displayed in all its aspects particularly in the manner in which MISS has evolved in response to societal needs and aspirations.
            </p>
            <div className="bg-white p-6 rounded-xl shadow-soft border-l-4 border-primary-blue">
              <p className="mb-4">
                The ever-vibrating mind of the founder conceived an innovative way of fulfilling the vision and mission of the institute. The result is the formation of <strong className="text-primary-navy">nineteen centers</strong>, a unique brain-child of the founder, to instill the spirit of service into the minds of the students.
              </p>
              <p>
                In order to uphold the value of the precept that action is better than preaching, the teaching-learning process in this institute is extended outside the classroom to Ground Zero through these centers, acting as a bridge between the classroom and community.
              </p>
            </div>
          </div>

          <Timeline events={timelineEvents} />
        </Container>
      </Section>

      {/* Milestones Section */}
      <Section id="milestones" className="bg-neutral-light">
        <Container>
          <SectionTitle title="Milestones of the Institute" />
          <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-neutral-gray max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary-navy text-white">
                    <th className="p-4 font-semibold w-1/3">Year</th>
                    <th className="p-4 font-semibold">Name of the Course</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 divide-y divide-gray-100">
                  {[
                    { year: '1970-1971', course: 'M.S.W - Social Work' },
                    { year: '1979-1980', course: 'PGDPMIR - Personnel Management & Industrial Relations' },
                    { year: '1984-1985', course: 'PGDC - Counselling' },
                    { year: '1989-1990', course: 'M. Phil in Social Work' },
                    { year: '1991-1992', course: 'Ph.D. in Social Work' },
                    { year: '1991-1992', course: 'M.HRM - Human Resource Management' },
                    { year: '1998-1999', course: 'B.Sc - Computer Science' },
                    { year: '1998-1999', course: 'PGDCA - Computer Applications' },
                    { year: '1999-2000', course: 'M. Sc - Master of Computer Sciences' },
                    { year: '1999-2000', course: 'B.Com - Computer Applications' },
                    { year: '2005-2006', course: 'B.S.W - Social Work' },
                    { year: '2007-2008', course: 'M.S.W - Social Work' },
                    { year: '2008-2009', course: 'B.Com' },
                    { year: '2008-2009', course: 'B.Sc - Information Technology' },
                    { year: '2009-2010', course: 'B.B.A.' },
                    { year: '2010-2011', course: 'B.A. - English' },
                    { year: '2011-2012', course: 'M.B.A - Master of Business Administration' },
                    { year: '2015-2016', course: 'M. Phil in Management Studies' },
                    { year: '2017-2018', course: 'B. Sc Psychology' },
                  ].map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="p-4 font-bold text-primary-blue">{item.year}</td>
                      <td className="p-4 font-medium">{item.course}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </Section>

      {/* Founder Section */}
      <Section id="founder" className="bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="sticky top-24 bg-gradient-to-br from-primary-blue to-secondary-emerald rounded-xl flex flex-col items-center justify-center p-8 text-center text-white shadow-elevated"
            >
              <div className="text-8xl mb-4 bg-white/20 p-6 rounded-full backdrop-blur-sm border border-white/30">👨‍🎓</div>
              <h3 className="font-bold text-3xl mb-1">Dr. (Capt) D.V.P Raja</h3>
              <p className="text-lg font-medium text-white/90 mb-4">Founder & Chairman</p>
              <div className="w-16 h-1 bg-secondary-gold rounded-full mb-6"></div>
              <p className="text-sm text-white/80 italic max-w-xs">
                "Fighting throughout his life for the upliftment and betterment of society in general and the elderly in particular."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6 text-gray-700 leading-relaxed"
            >
              <h2 className="text-4xl font-bold text-primary-navy mb-6">Our Founder's Journey</h2>
              
              <p>
                Born of agriculturist parents in a small town of Rajapalayam, <strong className="text-primary-navy">Dr. (Capt) D.V.P Raja</strong> is a self-made man of 80 years who has been fighting throughout his life for the upliftment and betterment of society in general and the elderly in particular.
              </p>

              <div className="bg-white p-6 rounded-xl shadow-soft border-l-4 border-primary-blue">
                <p className="mb-4">
                  A turning point in his life occurred when he was just 10 years of age through a divine moment which blessed him with a meeting of one gentleman Nallakutralam Pillai, a renowned social worker of those days who proved to be a source of inspiration and sowed the seeds of social service into the tender mind and heart of a budding social activist.
                </p>
                <p>
                  The candle thus lighted at age of ten was made to glow still brighter like the star of first magnitude in the firmament of social service by Rev.Fr. Bonhoure of St. Xavier’s College, Palayamkottai, Tirunelveli where Raja pursued his UG course in 1955 – 59. As the second source of inspiration he was instrumental in extending social service activities beyond a limited circle by elevating him to the level of General Secretary of Social Service Club.
                </p>
              </div>

              <p>
                That the true concept of social service is not confined to the four walls of a college campus but has to reach the last man in the society was taught to him by Prof. S. Ramanathan, an illustrious teacher and Dr. G.R. Damodaran, the Director & Founder of PSG Educational Institutions where Raja pursued PG Course in Social Work. They guided him in the right direction by encouraging him to do a microscopic analysis of the beggar problem in Tamil Nadu. The extensive survey of the problem was successfully completed when Raja completed Post Graduate Studies in Social Work in P.S.G College of Social Work.
              </p>

              <h3 className="text-2xl font-bold text-primary-navy mt-8 mb-4">Service to the Nation & Education</h3>
              <p>
                In the year 1962 when China attacked India, Emergency was declared. With a patriotic spirit, he joined the Indian Army and served as Captain during the Chinese (1962) and Pakistan (1965) wars. After emergency, he left military service just to establish a College of Social Work to inculcate the spirit of service in the minds of the youth.
              </p>
              
              <p className="font-semibold text-primary-blue">
                In the year 1969 on 2nd October, coincident with the birth centenary day of Mahatma Gandhiji, the Father of the Nation, Madurai Institute of Social Sciences was founded and his long desire was fulfilled.
              </p>
              
              <p>
                He served as Principal of the College for more than 4 decades and moved with students so closely, accepting them as they are with their strengths and weaknesses.
              </p>

              <div className="bg-neutral-light p-6 rounded-xl mt-6">
                <h4 className="font-bold text-primary-navy mb-2">The Legacy Continues</h4>
                <p className="text-sm">
                  Now Madurai Institute of Social Sciences is a multi-faculty college and research Centre. It achieved Autonomous status in 2009, was Re-accredited with ‘A’ Grade by NAAC in 2014, got extension of Autonomy in 2016, and was Re-Accredited with "B+" Grade in 2019. The college presently offers 4 Post Graduate, 8 Under Graduate, 3 Diploma, two M.Phil and Ph.D programmes. Our Founder-Chairman is instrumental behind the success of the college.
                </p>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Management Section */}
      <Section id="management">
        <Container>
          <SectionTitle
            title="Leadership"
            subtitle="Meet our experienced management team"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: 'Principal', name: 'Dr. Name' },
              { role: 'Vice Principal', name: 'Dr. Name' },
              { role: 'Dean Academics', name: 'Dr. Name' },
              { role: 'Dean Research', name: 'Dr. Name' },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl bg-neutral-light hover:shadow-medium transition-all"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-blue to-secondary-emerald mx-auto mb-4 flex items-center justify-center text-4xl">
                  👔
                </div>
                <h3 className="font-bold text-primary-navy mb-1">{member.name}</h3>
                <p className="text-primary-blue font-semibold text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Vision & Mission */}
      <Section id="vision" className="bg-neutral-light">
        <Container>
          <SectionTitle
            title="Vision, Mission & Values"
            subtitle="Our commitment to excellence"
          />
          <Accordion items={aboutAccordion} />
        </Container>
      </Section>

      {/* Principal Message */}
      <Section id="principal">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary-navy mb-6">Principal's Message</h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  "Welcome to MISS College, where excellence meets opportunity. Our institution has been at the forefront of educational innovation for over four decades, shaping minds and building futures."
                </p>
                <p>
                  "We believe that true education transcends mere academics. It encompasses holistic development, critical thinking, and a commitment to societal good. Our faculty, facilities, and programs are designed to facilitate this comprehensive growth."
                </p>
                <p>
                  "As you embark on your journey with us, you join a community of learners, innovators, and changemakers. Together, we will explore new horizons and contribute meaningfully to our world."
                </p>
                <p className="font-bold text-primary-navy pt-4">
                  Dr. Principal Name<br />
                  <span className="text-sm font-normal text-gray-600">Principal, MISS College</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="h-96 bg-gradient-to-br from-primary-navy to-primary-blue rounded-xl flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="text-8xl mb-4">👨‍💼</div>
                <p className="font-bold text-lg">Dr. Principal Name</p>
                <p className="text-sm">Principal</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* College Profile */}
      <Section className="bg-neutral-light" id="profile">
        <Container>
          <SectionTitle title="College Profile" subtitle="Key Facts About MISS College" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Left – Logo Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-gradient-to-br from-primary-navy via-primary-blue to-secondary-emerald rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[420px] shadow-elevated relative overflow-hidden"
            >
              {/* decorative rings */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/10" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full border border-white/10" />

              {/* Logo mark */}
              <div className="relative w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6 shadow-lg overflow-hidden">
                <Image src={logo} alt="MISS College Logo" fill className="object-contain p-2" />
                <div className="absolute -bottom-1 right-2 w-8 h-8 rounded-lg bg-secondary-gold flex items-center justify-center">
                  <span className="text-primary-navy font-black text-xs">A+</span>
                </div>
              </div>

              <h3 className="text-white font-black text-2xl tracking-wide mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>MISS</h3>
              <p className="text-secondary-gold font-bold text-sm tracking-widest uppercase mb-1">College</p>
              <p className="text-white/60 text-xs mb-6">Madurai Institute of Social Sciences</p>

              <div className="w-12 h-px bg-white/30 mb-6" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  { value: '1969', label: 'Est.' },
                  { value: 'Grade B+', label: 'NAAC' },
                  { value: 'Autonomous', label: 'Status' },
                  { value: '3.15 Acres', label: 'Campus' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                    <p className="text-white/60 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right – Hover Dropdown Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-3 space-y-3"
            >
              {[
                {
                  label: 'Institution Details',
                  icon: '🏫',
                  value: 'Madurai, Urban',
                  details: [
                    { k: 'Name', v: 'Madurai Institute of Social Sciences' },
                    { k: 'Address', v: 'Alagar koil Road, Madurai-625002, TN' },
                    { k: 'District', v: 'Madurai' },
                    { k: 'Location & Area', v: 'Urban / 3.15 Acres' },
                  ],
                },
                {
                  label: 'Affiliation & Management',
                  icon: '🏛️',
                  value: 'Autonomous, Co-education',
                  details: [
                    { k: 'Affiliated To', v: 'Madurai Kamaraj University' },
                    { k: 'Management', v: 'Private, Govt. Aided' },
                    { k: 'Category / Type', v: 'Co-education / Autonomous' },
                    { k: 'Faculty Type', v: 'Multi Faculty' },
                  ],
                },
                {
                  label: 'Recognition & Accreditation',
                  icon: '🏆',
                  value: 'NAAC & UGC Recognized',
                  details: [
                    { k: 'NAAC 2009', v: "Accredited 'B++'" },
                    { k: 'NAAC 2014', v: "Re-accredited 'A' Grade" },
                    { k: 'NAAC 2019', v: "Re-accredited 'B+' Grade" },
                    { k: 'UGC Recognition', v: '2(f), 12.B' },
                  ],
                },
                {
                  label: 'Courses Offered',
                  icon: '🎓',
                  value: 'Aided & Unaided Programs',
                  details: [
                    { k: 'Aided Programs', v: 'PG-1' },
                    { k: 'Unaided UG & PG', v: 'UG-8, PG-4' },
                    { k: 'Unaided Research', v: 'M.Phil-2, Ph.D.-1' },
                    { k: 'Unaided Diploma', v: 'P.G. Diploma-3, Diploma-1' },
                  ],
                },
              ].map((item, index) => (
                <ProfileDropdownCard key={index} item={item} index={index} />
              ))}
            </motion.div>

          </div>
        </Container>
      </Section>

      <Footer />
    </>
  )
}
