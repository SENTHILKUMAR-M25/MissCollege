import React from 'react'
import './globals.css'

export const metadata = {
  title: 'MISS College - Madurai Institute of Social Sciences',
  description: 'Premier educational institution dedicated to academic excellence and holistic development',
  charset: 'utf-8',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://misscollege.edu.in',
    siteName: 'MISS College',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="../app/assets/logo.png" />
        <meta name="theme-color" content="#0F172A" />
      </head>
      <body className="bg-neutral-white text-primary-navy">
        {children}
      </body>
    </html>
  )
}
