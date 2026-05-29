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
                <Image src="/logo.png" alt="MISS College Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">MISS</span>
                <span className="text-xs text-secondary-gold font-semibold">College</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Madurai Institute of Social Sciences - Excellence in Education Since 1980
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
                <span className="text-gray-300 text-sm">Madurai, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-secondary-gold" />
                <a href="tel:+914527777777" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  +91 452 777 7777
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-secondary-gold" />
                <a href="mailto:info@misscollege.edu.in" className="text-gray-300 hover:text-secondary-gold transition-colors text-sm">
                  info@misscollege.edu.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="py-8 border-y border-gray-700">
          <div className="max-w-md">
            <h4 className="font-bold text-white mb-3">Subscribe to Newsletter</h4>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-gold"
              />
              <button className="px-4 py-2 bg-secondary-gold text-primary-navy rounded-lg font-semibold hover:bg-secondary-emerald transition-colors text-sm">
                Subscribe
              </button>
            </form>
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
            <Link href="/sitemap" className="text-gray-400 hover:text-secondary-gold transition-colors">
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
