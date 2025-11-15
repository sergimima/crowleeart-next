'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Service {
  id: number
  title: string
  description: string
  price: number
  marketPrice: number
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(err => console.error(err))
  }, [])

  const scrollToNextSection = () => {
    const servicesSection = document.getElementById('services-section')
    servicesSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section')
    featuresSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToGallery = () => {
    const gallerySection = document.getElementById('gallery-section')
    gallerySection?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    const mainElement = document.querySelector('main')
    mainElement?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.2, duration: 0.6 },
    }),
  }

  return (
    <div className="text-white">
      {/* Hero Section */}
      <motion.section
        className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 md:px-20 relative snap-start snap-always"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        custom={0}
      >
        {/* Hero Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        {/* Main Content - Centered Layout */}
        <div className="max-w-6xl w-full relative z-10 space-y-12">
          {/* Header Section - Centered */}
          <motion.div
            className="space-y-6 text-center"
            variants={fadeIn}
            custom={1}
          >
            <motion.h1
              className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Crowlee Art
            </motion.h1>

            <motion.p
              className="text-3xl md:text-4xl font-semibold text-white leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              The Art Of Maintenance
            </motion.p>

            <motion.p
              className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Expert maintenance for homes and small businesses across London and Hertfordshire.
            </motion.p>
          </motion.div>

          {/* Key Benefits - Grid Layout Below */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              { icon: "⭐", title: "Expert Team", desc: "Skilled Professionals", gradientClass: "group-hover:from-purple-400/50 group-hover:to-purple-400/0", hoverClass: "group-hover:text-purple-300", bgClass: "from-purple-600/10 to-purple-600/5" },
              { icon: "📍", title: "Local Service", desc: "London & Herts", gradientClass: "group-hover:from-blue-400/50 group-hover:to-blue-400/0", hoverClass: "group-hover:text-blue-300", bgClass: "from-blue-600/10 to-blue-600/5" },
              { icon: "💷", title: "Fair Pricing", desc: "Transparent Costs", gradientClass: "group-hover:from-green-400/50 group-hover:to-green-400/0", hoverClass: "group-hover:text-green-300", bgClass: "from-green-600/10 to-green-600/5" },
              { icon: "✅", title: "Quality Guarantee", desc: "Satisfaction Assured", gradientClass: "group-hover:from-orange-400/50 group-hover:to-orange-400/0", hoverClass: "group-hover:text-orange-300", bgClass: "from-orange-600/10 to-orange-600/5" },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="group flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className={`text-lg font-bold text-white mb-2 ${benefit.hoverClass} transition-colors`}>
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.button
          onClick={scrollToNextSection}
          className="absolute bottom-10 cursor-pointer hover:scale-110 transition-transform z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-label="Scroll to next section"
        >
          <ChevronDown className="w-8 h-8 text-purple-400" />
        </motion.button>
      </motion.section>

      {/* Services Preview */}
      <section id="services-section" className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 md:px-20 py-20 relative snap-start snap-always">
        {/* Services Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl w-full space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Our Services</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Professional maintenance services for your home and business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.length === 0 ? (
              <p className="text-white text-center col-span-full">Loading services...</p>
            ) : (
              services.slice(0, 3).map((service, index) => (
                <motion.div
                  key={service.id}
                  className="bg-white/10 p-6 rounded-lg shadow-xl border-2 border-purple-400/30 hover:border-purple-400 hover:bg-white/20 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">{service.title}</h3>
                  <p className="text-gray-300 mb-4">{service.description}</p>
                  {service.marketPrice > 0 && service.marketPrice > service.price ? (
                    <div className="space-y-1">
                      <p className="text-sm text-white/50 line-through">
                        Was £{service.marketPrice.toFixed(2)}
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        Now from £{service.price.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-white">From £{service.price.toFixed(2)}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              View All Services
            </Link>
          </div>
        </div>

        <motion.button
          onClick={scrollToFeatures}
          className="absolute bottom-10 cursor-pointer hover:scale-110 transition-transform z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-label="Scroll to features section"
        >
          <ChevronDown className="w-8 h-8 text-purple-400" />
        </motion.button>
      </section>

      {/* Features */}
      <section id="features-section" className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 md:px-20 py-20 relative snap-start snap-always">
        {/* Features Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-1/3 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/3 w-[650px] h-[650px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl w-full space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Why Choose Us</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Professional expertise and dedication in every service we provide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gradient-to-br from-purple-900/20 to-transparent p-8 rounded-lg border border-purple-400/20 hover:border-purple-400/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <h3 className="text-2xl font-bold mb-4">🛠️ General Home Maintenance</h3>
              <p className="text-gray-300">
                From minor repairs, decoration and installation checks, we make sure everything works smoothly.
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-blue-900/20 to-transparent p-8 rounded-lg border border-blue-400/20 hover:border-blue-400/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-4">🚪 Custom Door Installation</h3>
              <p className="text-gray-300">
                We repair, cut, hang and install conventional or digital locks with precision and safety.
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-green-900/20 to-transparent p-8 rounded-lg border border-green-400/20 hover:border-green-400/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4">🔧 Emergency Repairs</h3>
              <p className="text-gray-300">
                Unexpected problems? We help you manage and quickly resolve the situation. 24/7 assistance.
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-yellow-900/20 to-transparent p-8 rounded-lg border border-yellow-400/20 hover:border-yellow-400/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold mb-4">📅 Simple Online Booking</h3>
              <p className="text-gray-300">
                Contact us or easily book your service through our system.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.button
          onClick={scrollToGallery}
          className="absolute bottom-10 cursor-pointer hover:scale-110 transition-transform z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-label="Scroll to gallery section"
        >
          <ChevronDown className="w-8 h-8 text-purple-400" />
        </motion.button>
      </section>

      {/* Gallery & Testimonials CTA */}
      <section id="gallery-section" className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 md:px-20 pt-20 pb-0 relative snap-start">
        {/* Gallery Background Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          className="max-w-4xl w-full text-center space-y-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-12 md:p-16 rounded-lg border border-purple-400/30 relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold">📸 Gallery & Testimonials</h2>
          <p className="text-xl md:text-2xl text-gray-300">
            Discover real projects and testimonials from satisfied customers who trust Crowlee Art.
          </p>
          <Link
            href="/gallery"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-lg transition text-lg"
          >
            View Our Work
          </Link>
          <p className="text-lg text-gray-400 pt-8">
            Start your project with us and enjoy hassle-free home improvement.
          </p>
        </motion.div>

        <motion.button
          onClick={scrollToTop}
          className="absolute bottom-10 cursor-pointer hover:scale-110 transition-transform z-20"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-8 h-8 text-purple-400" />
        </motion.button>
      </section>
    </div>
  )
}
