'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Shield, Cookie, Database, Mail, Scale } from 'lucide-react'

export default function PrivacyPage() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    if (main) main.scrollTop = 0
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (hash === '#cookies') {
      const el = document.getElementById('cookies')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  }

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16 text-white min-h-[calc(100vh-4rem)]"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      custom={0}
    >
      <motion.div className="space-y-2 mb-12" variants={fadeIn} custom={1}>
        <h1 className="text-3xl md:text-4xl font-bold text-purple-400 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Privacy Policy
        </h1>
        <p className="text-white/80">
          Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      <div className="space-y-10">
        <motion.article variants={fadeIn} custom={2}>
          <h2 className="text-xl font-semibold text-white mb-3">1. Data controller</h2>
          <p className="text-white/80 leading-relaxed">
            Crowlee Art («The Art Of Maintenance») is the data controller for the personal data you provide through this website and related services (bookings, contact, user profiles). You can contact us to exercise your rights or ask any questions about privacy.
          </p>
        </motion.article>

        <motion.article variants={fadeIn} custom={3}>
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            2. Data we collect
          </h2>
          <p className="text-white/80 leading-relaxed mb-2">
            We may collect and process, depending on how you use the site:
          </p>
          <ul className="list-disc list-inside text-white/80 space-y-1 ml-2">
            <li>Identification and contact data (name, email, phone) when you register, book or get in touch.</li>
            <li>Usage data (login, bookings, messages) needed for the service to work.</li>
            <li>Location data (only if you allow it, e.g. for worker geolocation features).</li>
            <li>Technical information (IP address, browser type) where necessary for security and the proper functioning of the site.</li>
          </ul>
        </motion.article>

        <motion.article id="cookies" variants={fadeIn} custom={4} className="scroll-mt-24">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Cookie className="h-5 w-5 text-purple-400" />
            3. Cookies
          </h2>
          <p className="text-white/80 leading-relaxed mb-3">
            We use cookies and similar technologies for:
          </p>
          <ul className="list-disc list-inside text-white/80 space-y-1 ml-2 mb-3">
            <li><strong className="text-white">Necessary:</strong> session, authentication and essential preferences (e.g. remembering that you have accepted or rejected cookies). Without them, some parts of the site would not work properly.</li>
            <li><strong className="text-white">Optional:</strong> analytics (to understand how the site is used) and preferences (language, theme). We only enable these if you choose «Accept all» in the cookie notice.</li>
          </ul>
          <p className="text-white/80 leading-relaxed">
            You can change your choice at any time by deleting the cookie or preference in your browser and reloading the page; the cookie notice will appear again. For more on managing cookies in your browser, see your browser’s help.
          </p>
        </motion.article>

        <motion.article variants={fadeIn} custom={5}>
          <h2 className="text-xl font-semibold text-white mb-3">4. Purpose and legal basis</h2>
          <p className="text-white/80 leading-relaxed">
            We process your data to manage bookings, users, contact messages and the proper functioning of the platform. The legal basis is performance of the service you request, your consent (when we ask for it explicitly, e.g. for non-essential cookies) and, where applicable, compliance with legal obligations.
          </p>
        </motion.article>

        <motion.article variants={fadeIn} custom={6}>
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-400" />
            5. Your rights
          </h2>
          <p className="text-white/80 leading-relaxed mb-2">
            You have the right to access, rectify, erase, restrict processing, object and to data portability, as well as to lodge a complaint with a supervisory authority. To exercise these rights, contact us using the details below and state your request clearly.
          </p>
        </motion.article>

        <motion.article variants={fadeIn} custom={7}>
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-400" />
            6. Contact
          </h2>
          <p className="text-white/80 leading-relaxed">
            For any questions about privacy or cookies, you can contact us via our{' '}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              contact page
            </Link>
            {' '}or the email address on the website. We aim to respond within a reasonable time.
          </p>
        </motion.article>
      </div>

      <motion.p className="mt-12 text-sm text-white/60" variants={fadeIn} custom={8}>
        This policy may be updated. Any significant changes will be reflected on this page with a new «Last updated» date.
      </motion.p>
    </motion.section>
  )
}
