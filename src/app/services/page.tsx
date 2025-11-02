'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Service {
  id: number
  title: string
  description: string
  price: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        setServices(data.services || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
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
      className="w-full max-w-7xl mx-auto px-4 py-16 text-white"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      custom={0}
    >
      <motion.div className="text-center space-y-6" variants={fadeIn} custom={1}>
        <h1 className="text-4xl md:text-6xl font-bold text-purple-400 drop-shadow-lg">
          Our Services
        </h1>
        <p className="text-lg md:text-xl max-w-4xl mx-auto text-white/80">
          At Crowlee Art, we believe true craftsmanship starts with care and ends with excellence.
          Whether it's a minor repair or a major installation, we bring dedication, detail and expertise to every job.
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12"
        variants={fadeIn}
        custom={2}
      >
        {loading ? (
          <p className="text-center col-span-full text-white/70">Loading services...</p>
        ) : services.length > 0 ? (
          services.map((service, index) => (
            <motion.div
              key={service.id}
              className="bg-white/10 p-6 rounded-lg border border-white/10 hover:scale-105 transition-transform duration-300"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-2xl font-semibold mb-2 text-purple-300">
                {service.title}
              </h2>
              <p className="text-white/80 mb-4">{service.description}</p>
              <div className="text-white/60 space-y-1 mb-4">
                <p className="text-2xl font-bold text-white">£{service.price.toFixed(2)}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-white/70">
            No services available at the moment.
          </p>
        )}
      </motion.div>

      <motion.div className="text-center pt-16" variants={fadeIn} custom={3}>
        <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          We're not just a service, we're your trusted partner.
        </h3>
        <p className="max-w-2xl mx-auto text-white/70">
          Let us take care of what matters most. Contact us today and enjoy the peace of mind of working with true professionals.
        </p>
      </motion.div>
    </motion.section>
  )
}
