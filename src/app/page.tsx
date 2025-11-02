'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Service {
  id: number
  title: string
  description: string
  price: number
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(err => console.error(err))
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.2, duration: 0.6 },
    }),
  }

  return (
    <motion.section
      className="min-h-screen text-white px-6 md:px-20 py-20 space-y-20"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      custom={0}
    >
      {/* Hero Section */}
      <motion.div
        className="text-center space-y-6"
        variants={fadeIn}
        custom={1}
      >
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Crowlee Art
        </h1>
        <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto">
          Expert maintenance for homes and small businesses. Door repair and installation, flooring, painting, plumbing, and more.
        </p>
        <p className="text-gray-400">
          Crowlee Art operates across London and Hertfordshire. Our team is committed to professionalism, reliability, and quality.
        </p>
      </motion.div>

      {/* Services Preview */}
      <div className="space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white">Our Services</h2>
        <p className="text-center text-gray-300 max-w-2xl mx-auto">
          Professional maintenance services for your home and business
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.length === 0 ? (
            <p className="text-white text-center col-span-full">Loading services...</p>
          ) : (
            services.slice(0, 3).map((service) => (
              <div
                key={service.id}
                className="bg-white/10 p-6 rounded-lg shadow-xl border-2 border-purple-400/30 hover:border-purple-400 hover:bg-white/20 transition-all"
              >
                <h3 className="text-xl font-semibold text-purple-400 mb-2">{service.title}</h3>
                <p className="text-gray-300 mb-4">{service.description}</p>
                <p className="text-2xl font-bold text-white">From £{service.price}</p>
              </div>
            ))
          )}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/services"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            View All Services
          </Link>
        </div>
      </div>

      {/* Features */}
      <motion.div variants={fadeIn} custom={4} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-purple-900/20 to-transparent p-8 rounded-lg border border-purple-400/20">
          <h3 className="text-2xl font-bold mb-4">🛠️ General Home Maintenance</h3>
          <p className="text-gray-300">
            From minor repairs, decoration and installation checks, we make sure everything works smoothly.
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/20 to-transparent p-8 rounded-lg border border-blue-400/20">
          <h3 className="text-2xl font-bold mb-4">🚪 Custom Door Installation</h3>
          <p className="text-gray-300">
            We repair, cut, hang and install conventional or digital locks with precision and safety.
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-transparent p-8 rounded-lg border border-green-400/20">
          <h3 className="text-2xl font-bold mb-4">🔧 Emergency Repairs</h3>
          <p className="text-gray-300">
            Unexpected problems? We help you manage and quickly resolve the situation. 24/7 assistance.
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/20 to-transparent p-8 rounded-lg border border-yellow-400/20">
          <h3 className="text-2xl font-bold mb-4">📅 Simple Online Booking</h3>
          <p className="text-gray-300">
            Contact us or easily book your service through our system.
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={fadeIn}
        custom={5}
        className="text-center space-y-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-12 rounded-lg border border-purple-400/30"
      >
        <h2 className="text-3xl md:text-4xl font-bold">📸 Gallery & Testimonials</h2>
        <p className="text-xl text-gray-300">
          Discover real projects and testimonials from satisfied customers who trust Crowlee Art.
        </p>
        <Link
          href="/gallery"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          View Our Work
        </Link>
      </motion.div>

      {/* Footer CTA */}
      <motion.div variants={fadeIn} custom={6} className="text-center text-gray-400">
        <p className="text-lg">
          Start your project with us and enjoy hassle-free home improvement.
        </p>
      </motion.div>
    </motion.section>
  )
}
