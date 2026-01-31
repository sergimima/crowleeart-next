'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import ClientLayout from '@/components/ClientLayout'

interface Service {
  id: number
  title: string
  price: number
}

interface BookingForm {
  phone: string
  serviceId: string
  date: string
  description: string
}

export default function BookingPage() {
  const router = useRouter()
  const t = useTranslations('booking')
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState<BookingForm>({
    phone: '',
    serviceId: '',
    date: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(err => console.error(err))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('alertImageSize'))
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error(t('alertImageType'))
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const validateForm = () => {
    if (!formData.serviceId || !formData.date || !formData.description || !formData.phone) {
      toast.error(t('alertRequired'))
      return false
    }

    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast.error(t('alertFutureDate'))
      return false
    }

    if (formData.description.length < 10) {
      toast.error(t('alertDescriptionLength'))
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      let imageUrl = null

      // Upload image if exists
      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('file', imageFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        } else {
          toast.error(t('alertUploadFailed'))
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: Number(formData.serviceId),
          date: formData.date,
          description: formData.description,
          phone: formData.phone,
          imageUrl: imageUrl,
        })
      })

      if (response.ok) {
        toast.success(t('alertSuccess'))
        setFormData({ phone: '', serviceId: '', date: '', description: '' })
        setImageFile(null)
        setImagePreview(null)

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          router.push('/dashboard/client')
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.error || t('alertError'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('alertError'))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = 'w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500'

  return (
    <ClientLayout>
      <motion.div
        className="w-full max-w-3xl mx-auto px-4 py-16 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-purple-400 mb-10 text-center">{t('title')}</h1>

      <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-lg border border-white/20 space-y-6">
        <div>
          <label className="block text-white mb-2">{t('phone')}</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2">{t('service')}</label>
          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            className={`${inputStyle} cursor-pointer`}
            required
          >
            <option value="">{t('selectService')}</option>
            {services.map(service => (
              <option key={service.id} value={service.id} className="bg-gray-800">
                {service.title} - £{service.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white mb-2">{t('date')}</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2">{t('description')} *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className={`${inputStyle} resize-none`}
            placeholder={t('descriptionPlaceholder')}
            required
            minLength={10}
          />
        </div>

        <div>
          <label className="block text-white mb-2">{t('refImageLabel')}</label>
          <p className="text-sm text-white/60 mb-3">{t('refImageHint')}</p>

          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-white/60" />
                <p className="text-sm text-white/60">
                  <span className="font-semibold">{t('uploadHint')}</span>
                </p>
                <p className="text-xs text-white/40 mt-1">{t('uploadFormat')}</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/20">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded transition cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? t('loading') : t('submit')}
        </button>
      </form>

      <div className="mt-8 text-center text-white/70 text-sm">
        <p>{t('noteLogin')}</p>
        <p className="mt-2">{t('noAccount')} <a href="/login" className="text-purple-400 hover:underline">{t('signUpLink')}</a></p>
      </div>
      </motion.div>
    </ClientLayout>
  )
}
