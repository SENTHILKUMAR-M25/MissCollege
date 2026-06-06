import React from 'react'
import './globals.css'

export const metadata = {
  title: 'MISS College - Madurai Institute of Social Sciences',
  description: 'Premier educational institution dedicated to academic excellence and holistic development',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://misscollege.edu.in',
    siteName: 'MISS College',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F172A',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-neutral-white text-primary-navy">
        {children}
      </body>
    </html>
  )
}
