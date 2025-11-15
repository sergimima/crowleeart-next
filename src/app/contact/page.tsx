'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { toast } from 'react-toastify'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top when pathname changes
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.scrollTop = 0
    }
  }, [pathname])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields.')
      return false
    }
    if (!formData.email.includes('@')) {
      toast.error('Invalid email address.')
      return false
    }
    if (formData.message.length < 10) {
      toast.error('Message must be at least 10 characters.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Your message has been sent successfully!')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error('Error sending your message.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error sending your message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      className="w-full max-w-3xl mx-auto px-4 py-8 md:py-16 text-white min-h-[calc(100vh-4rem)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-purple-400">
        Contact Us
      </h1>

      <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-lg border border-white/20 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded focus:outline-none focus:border-purple-400 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded focus:outline-none focus:border-purple-400 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded focus:outline-none focus:border-purple-400 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded focus:outline-none focus:border-purple-400 text-white resize-none"
            placeholder="Write your message here..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <div className="mt-10 text-center text-white/70">
        <p>Or reach us directly:</p>
        <p className="mt-2">Email: info@crowleeart.com</p>
        <p>Phone: +44 7123 456 789</p>
      </div>
    </motion.section>
  )
}
