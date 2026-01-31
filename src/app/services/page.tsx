'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Service {
  id: number
  title: string
  description: string
  price: number
  marketPrice: number
}

export default function ServicesPage() {
  const t = useTranslations('services')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

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

  useEffect(() => {
    // Scroll to top when pathname changes
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTop = 0
    }
  }, [pathname])

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
      className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16 text-white min-h-[calc(100vh-4rem)]"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      custom={0}
    >
      <motion.div className="text-center space-y-6" variants={fadeIn} custom={1}>
        <h1 className="text-4xl md:text-6xl font-bold text-purple-400 drop-shadow-lg">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl max-w-4xl mx-auto text-white/80">
          {t('description')}
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12"
        variants={fadeIn}
        custom={2}
      >
        {loading ? (
          <p className="text-center col-span-full text-white/70">{t('loading')}</p>
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
                {service.marketPrice > 0 && service.marketPrice > service.price ? (
                  <div className="space-y-1">
                    <p className="text-sm text-white/50 line-through">
                      Was £{service.marketPrice.toFixed(2)}
                    </p>
                    <p className="text-2xl font-bold text-green-400">
                      Now from £{service.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-400 font-semibold">
                      Save £{(service.marketPrice - service.price).toFixed(2)}!
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">From £{service.price.toFixed(2)}</p>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-white/70">
            {t('noServices')}
          </p>
        )}
      </motion.div>

      <motion.div className="text-center pt-16" variants={fadeIn} custom={3}>
        <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          {t('finalTitle')}
        </h3>
        <p className="max-w-2xl mx-auto text-white/70">
          {t('finalText')}
        </p>
      </motion.div>
    </motion.section>
  )
}
