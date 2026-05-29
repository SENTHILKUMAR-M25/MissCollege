// 'use client'

// import React from 'react'
// import { motion } from 'framer-motion'

// export default function HeroBanner({ title, subtitle, cta1Text, cta1Link, cta2Text, cta2Link, backgroundImage }) {
//   return (
//     <div className="relative h-screen w-full overflow-hidden">
//       {/* Background */}
//       <div
//         className="absolute inset-0 bg-gradient-to-br from-primary-navy via-primary-blue to-secondary-emerald"
//         style={{
//           backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       >
//         <div className="absolute inset-0 bg-black/40"></div>
//       </div>

//       {/* Content */}
//       <div className="relative h-full flex items-center justify-center">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
//           >
//             {title}
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto"
//           >
//             {subtitle}
//           </motion.p>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
//           >
//             {cta1Text && (
//               <a
//                 href={cta1Link}
//                 className="px-8 py-3 bg-secondary-gold text-primary-navy rounded-lg font-bold hover:bg-secondary-emerald transition-colors shadow-elevated"
//               >
//                 {cta1Text}
//               </a>
//             )}
//             {cta2Text && (
//               <a
//                 href={cta2Link}
//                 className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-primary-navy transition-colors"
//               >
//                 {cta2Text}
//               </a>
//             )}
//           </motion.div>
//         </div>
//       </div>

//       {/* Scroll Indicator */}
//       <motion.div
//         animate={{ y: [0, 10, 0] }}
//         transition={{ duration: 2, repeat: Infinity }}
//         className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
//       >
//         <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center pt-2">
//           <div className="w-1 h-2 bg-white rounded-full"></div>
//         </div>
//       </motion.div>
//     </div>
//   )
// }


'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function HeroBanner({
  title,
  subtitle,
  cta1Text,
  cta1Link,
  cta2Text,
  cta2Link,
  backgroundImages = [
    "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEC4b1FSs6z0ec4AO7uf9R-QgkeaHptQlLiGOflQV8V94HugxUqv0VdOacK-TKhW4Xwxfq7eeQFl-d_uGrWbsokMSmJoWb2Jo9B7Kpc6oaG2dyZMEVIiRyhBewB4ZdTWSWCAMzjxA=w141-h101-n-k-no-nu",
    "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEojcOkhcc9_Wfej7pRWc-lo_5VsO7z81Prkrt40W8YHfHHRzSQwJOHfm9Q6wxOOvOaAeOc3-K1Arn0Jp7NXl7T7Eoqa6L2zdU1apFpahQ5lZTMgkxQIfOseci6q0lXaE35uez17Q=w141-h235-n-k-no-nu",
    "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEhubYXrJqEjy3j_Tgfn8cHcEu20jQ0AnmRryKCAETZcHDg8w2wIVrVSS2woMeItvTvZV5-R2xOvRnBt81g_1zbk9xRwM37LaKeZCJcm44YmPWqjBBRqho1veZ53wHsuTdoySa6BjnkNSBC=s1360-w1360-h1020-rw",
    "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFDXcaCOxVx9i94xqb6FgG2VzEeVqZb4BtDxc-A_ivNL5cfd5qD-0r721Sdbqlshq1buU0cxXi4wBjpGJca7AsQlYMRikAUP3HNdI5RDwhJXskQbA1ETctBBXDY9lM3QencNQ4H1jh1TW5e=s1360-w1360-h1020-rw",
],
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (backgroundImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === backgroundImages.length - 1 ? 0 : prev + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [backgroundImages])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              backgroundImage: `url(${backgroundImages[currentIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {cta1Text && (
              <a
                href={cta1Link}
                className="px-8 py-4 bg-yellow-500 text-black rounded-xl font-semibold hover:scale-105 transition"
              >
                {cta1Text}
              </a>
            )}

            {cta2Text && (
              <a
                href={cta2Link}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-black transition"
              >
                {cta2Text}
              </a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              currentIndex === index
                ? 'bg-white w-8'
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}