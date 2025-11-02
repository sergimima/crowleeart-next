'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface GalleryItem {
  id: number
  category: string
  title: string
  imageUrl: string
}

const predefinedItems: GalleryItem[] = [
  { id: 1, category: 'Doors', title: 'Door Install and Repair', imageUrl: '/assets/Gallery/imagenes/door1.png' },
  { id: 2, category: 'Flooring', title: 'Modern Flooring', imageUrl: '/assets/Gallery/imagenes/Vinylflooring.jpg' },
  { id: 3, category: 'Painting', title: 'Decorating', imageUrl: '/assets/Gallery/imagenes/Decorating1.png' },
  { id: 4, category: 'Plumbing', title: 'Leak', imageUrl: '/assets/Gallery/imagenes/Plumbing1.jpg' },
  { id: 5, category: 'Drywall', title: 'Repair Drywall', imageUrl: '/assets/Gallery/imagenes/drywall1.jpg' },
  { id: 6, category: 'Furniture', title: 'Damaged Cabinets', imageUrl: '/assets/Gallery/imagenes/kitchen1.jpg' }
]

const otherImages = [
  '/assets/Gallery/fotos/Break framejpeg.jpeg',
  '/assets/Gallery/fotos/Door-latch.png',
  '/assets/Gallery/fotos/Leaking-tap.jpg',
  '/assets/Gallery/fotos/New Basin_Tap.jpg',
  '/assets/Gallery/fotos/cistern.png',
  '/assets/Gallery/fotos/damp.jpg'
]

export default function GalleryPage() {
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Other', ...Array.from(new Set(predefinedItems.map(item => item.category)))]

  const filteredItems = filter === 'All'
    ? predefinedItems
    : predefinedItems.filter(item => item.category === filter)

  return (
    <motion.section
      className="min-h-screen px-6 py-20 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-4xl font-bold text-center mb-10 text-purple-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Gallery of Our Work
      </motion.h1>

      <div className="flex justify-center gap-4 flex-wrap mb-10">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-full border transition duration-300 ${
              filter === category
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {filter !== 'Other' && filteredItems.map(item => (
            <motion.div
              key={item.id}
              className="bg-white/10 p-3 rounded shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-48 bg-gray-800 rounded overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="font-semibold text-lg text-purple-300">{item.title}</h2>
                <p className="text-sm text-white/60">{item.category}</p>
              </div>
            </motion.div>
          ))}

          {filter === 'Other' && otherImages.map((src, index) => (
            <motion.div
              key={`other-${index}`}
              className="bg-white/10 p-3 rounded shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative w-full h-48 bg-gray-800 rounded overflow-hidden">
                <Image
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="text-center bg-purple-800/30 mt-20 p-10 rounded-lg shadow-lg max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-3xl font-semibold text-white mb-4">
          ✨ Impressed with our work?
        </h3>
        <p className="text-white/80 mb-6">
          We bring this quality to your home. Book your service today or contact us for a personalized quote.
        </p>
        <Link
          href="/booking"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded shadow-md transition"
        >
          Book Now
        </Link>
      </motion.div>
    </motion.section>
  )
}
