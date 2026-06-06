'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary-navy text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo & About */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image src="/logo.png" alt="MISS College Logo" fill className="object-contain bg-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">MISS</span>
                <span className="text-xs text-secondary-gold font-semibold">College</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Madurai Institute of Social Sciences - Excellence in Education Since 1969
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-secondary-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary-gold transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-secondary-gold transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-secondary-gold rounded mr-3"></span>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/academics" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Academics
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Admissions */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-secondary-gold rounded mr-3"></span>
              Admissions
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/admissions#procedure" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Procedure
                </Link>
              </li>
              <li>
                <Link href="/admissions#eligibility" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Eligibility
                </Link>
              </li>
              <li>
                <Link href="/admissions#scholarships" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/admissions#fees" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Fee Structure
                </Link>
              </li>
              <li>
                <Link href="/admissions#apply" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm font-semibold">
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-secondary-gold rounded mr-3"></span>
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/library" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Library
                </Link>
              </li>
              <li>
                <Link href="/student-corner" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Downloads
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-secondary-gold rounded mr-3"></span>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="text-secondary-gold mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm"><a href="https://maps.app.goo.gl/M4sBXbA8c8S4VRn56" target="_blank" rel="noopener noreferrer">
                  No 9, Alagar Koil Road, Madurai - 625 002.
                </a></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-secondary-gold" />
                <a href="tel:0452-2537142" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  0452-2537142
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-secondary-gold" />
                <a href="mailto:principal@misscollege.edu.in" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  principal@misscollege.edu.in
                </a>
              </li>
            </ul>
          </div>
        </div>

       

        {/* Bottom Footer */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2026 MISS College. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-secondary-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-secondary-gold transition-colors">
              Terms of Use
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-secondary-gold transition-colors">
              Accessibility
            </Link>
            <Link href="https://maps.app.goo.gl/M4sBXbA8c8S4VRn56" target='_blank' className="text-gray-400 hover:text-secondary-gold transition-colors">
              Sitemap
            </Link>
          </div>
          
        </div><div className="mt-4 text-center text-gray-500 text-xs">
            Developed by <a href="https://www.jodtech.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-secondary-gold hover:text-secondary-emerald transition-colors font-semibold">
              JoDTech</a>
          </div>
      </div>
    </footer>
  )
}
