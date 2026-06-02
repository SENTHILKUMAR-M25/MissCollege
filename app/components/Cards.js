'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

export function GlassCard({ title, description, icon: Icon, href, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(15, 23, 42, 0.16)' }}
      className="group glass rounded-xl p-8 backdrop-blur-xl border border-white/20 hover:border-primary-blue/50 transition-all duration-300 cursor-pointer h-full"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-blue to-secondary-emerald flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon size={24} className="text-white" />
        </div>
      )}
      <h3 className="text-xl font-bold text-primary-navy mb-3">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      {href && (
        <div className="flex items-center text-primary-blue font-semibold text-sm group-hover:space-x-2 transition-all">
          <span>Learn More</span>
          <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </motion.div>
  )
}

export function DepartmentCard({ name, description, image, href, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
    >
      {/* Image banner or gradient fallback */}
      <div className="relative h-48 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-secondary-emerald" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />
        {/* Name label */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-white font-bold text-base drop-shadow">{name}</span>
        </div>
      </div>
      <div className="p-6 bg-white">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        <a
          href={href}
          className="inline-flex items-center space-x-2 text-primary-blue font-semibold text-sm group-hover:space-x-3 transition-all"
        >
          <span>View Details</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  )
}

export function StatisticCard({ number, label, icon: Icon, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="text-center p-6 rounded-xl bg-neutral-light hover:shadow-soft transition-all duration-300"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-blue to-secondary-emerald flex items-center justify-center mx-auto mb-4">
          <Icon size={32} className="text-white" />
        </div>
      )}
      <h3 className="text-4xl font-bold text-primary-navy mb-2">{number}</h3>
      <p className="text-gray-600 font-semibold">{label}</p>
    </motion.div>
  )
}

export function EventCard({ title, date, time, location, category, image, href, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col"
    >
      <div className="relative h-40 bg-gradient-to-br from-primary-blue/20 to-secondary-emerald/20 overflow-hidden">
        <div className="absolute top-3 right-3 bg-secondary-gold text-primary-navy px-3 py-1 rounded-full text-xs font-bold">
          {category}
        </div>
      </div>
      <div className="p-6 bg-white flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-primary-navy mb-3 line-clamp-2">{title}</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
          <p>📅 {date}</p>
          <p>🕐 {time}</p>
          <p>📍 {location}</p>
        </div>
        <a
          href={href}
          className="inline-flex items-center space-x-2 text-primary-blue font-semibold text-sm group-hover:space-x-3 transition-all"
        >
          <span>Register Now</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  )
}

export function NewsCard({ title, excerpt, date, category, image, href, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 bg-gradient-to-br from-primary-blue/10 to-secondary-emerald/10 overflow-hidden">
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
      </div>
      <div className="p-6 bg-white flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-secondary-gold uppercase">{category}</span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <h3 className="text-lg font-bold text-primary-navy mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{excerpt}</p>
        <a
          href={href}
          className="inline-flex items-center space-x-2 text-primary-blue font-semibold text-sm group-hover:space-x-3 transition-all"
        >
          <span>Read More</span>
          <ArrowRight size={16} />
        </a>
      </div>
    </motion.div>
  )
}

export function FacultyCard({ name, designation, department, email, image, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group text-center rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
    >
      <div className="h-48 bg-gradient-to-br from-primary-blue to-secondary-emerald flex items-center justify-center group-hover:scale-105 transition-transform">
        <div className="text-6xl">👨‍🏫</div>
      </div>
      <div className="p-6 bg-white">
        <h3 className="text-lg font-bold text-primary-navy mb-1">{name}</h3>
        <p className="text-primary-blue font-semibold text-sm mb-1">{designation}</p>
        <p className="text-gray-600 text-xs mb-3">{department}</p>
        <a
          href={`mailto:${email}`}
          className="text-gray-600 text-xs hover:text-primary-blue transition-colors"
        >
          {email}
        </a>
      </div>
    </motion.div>
  )
}
