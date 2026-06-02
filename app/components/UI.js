'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function Section({ children, className = '', id = '' }) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

export function SectionTitle({ title,  align = 'center' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className={`mb-12 ${alignClass}`}
    >
      <h2 className="text-4xl sm:text-5xl font-bold text-primary-navy mb-4">{title}</h2>
    </motion.div>
  )
}

export function Container({ children, className = '' }) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = React.useState(0)

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={false}
          className="border border-neutral-gray rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="w-full px-6 py-4 bg-neutral-light hover:bg-neutral-gray transition-colors text-left font-semibold text-primary-navy flex items-center justify-between"
          >
            {item.title}
            <span
              className={`transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>
          {openIndex === index && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 py-4 bg-white text-gray-600"
            >
              {item.content}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export function Timeline({ events }) {
  return (
    <div className="relative">
      {/* Centre vertical line */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-blue via-secondary-emerald to-transparent hidden md:block" />

      <div className="space-y-10">
        {events.map((event, index) => {
          const isLeft = index % 2 === 0
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`relative flex items-center gap-0 md:gap-8 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex-row`}
            >
              {/* Card */}
              <div className="flex-1">
                <div className={`group bg-white rounded-2xl border border-neutral-gray shadow-soft hover:shadow-elevated transition-all duration-300 p-6 ${
                  isLeft ? 'md:mr-8' : 'md:ml-8'
                }`}>
                  {/* Year badge */}
                  <span className="inline-block bg-primary-blue/10 text-primary-blue text-xs font-black px-3 py-1 rounded-full mb-3 tracking-wider">
                    {event.year}
                  </span>
                  <p className="text-primary-navy font-semibold text-base leading-relaxed">{event.description}</p>
                  {/* Bottom accent */}
                  <div className="mt-4 h-0.5 w-10 bg-gradient-to-r from-primary-blue to-secondary-emerald rounded-full group-hover:w-20 transition-all duration-500" />
                </div>
              </div>

              {/* Centre dot — desktop */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary-blue to-secondary-emerald items-center justify-center shadow-medium z-10 flex-shrink-0">
                <span className="text-white font-black text-xs">{event.year.slice(2)}</span>
              </div>

              {/* Mobile left dot */}
              <div className="md:hidden flex-shrink-0 w-3 h-3 rounded-full bg-primary-blue mr-4 mt-1" />

              {/* Empty spacer for the other side */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const baseClass = 'font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center'
  
  const variants = {
    primary: 'bg-primary-blue text-white hover:bg-primary-navy shadow-soft hover:shadow-medium',
    secondary: 'bg-secondary-gold text-primary-navy hover:bg-secondary-emerald shadow-soft hover:shadow-medium',
    outline: 'border-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white',
    ghost: 'text-primary-blue hover:bg-primary-blue/10',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'primary' }) {
  const variants = {
    primary: 'bg-primary-blue text-white',
    secondary: 'bg-secondary-gold text-primary-navy',
    outline: 'border border-primary-blue text-primary-blue',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
