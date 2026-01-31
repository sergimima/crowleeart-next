'use client'

import { useState, useEffect, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useTranslations } from 'next-intl'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')
  const t = useTranslations('login')

  const [isRegister, setIsRegister] = useState(false)
  const [inviteRole, setInviteRole] = useState<string | null>(null)
  const [inviteValidating, setInviteValidating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)

  // Validate invite token on mount
  useEffect(() => {
    if (inviteToken) {
      setInviteValidating(true)
      setIsRegister(true) // Switch to register mode

      fetch(`/api/invitations/validate?token=${inviteToken}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setInviteRole(data.role)
            toast.success(t('inviteValid', { role: data.role }))
          } else {
            toast.error(data.error || t('inviteInvalid'))
            setInviteRole(null)
          }
        })
        .catch(() => {
          toast.error(t('inviteError'))
          setInviteRole(null)
        })
        .finally(() => {
          setInviteValidating(false)
        })
    }
  }, [inviteToken])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone } = formData

    if (!email.trim().includes('@')) {
      toast.error(t('alertInvalidEmail'))
      return false
    }
    if (isRegister) {
      if (password.trim().length < 8) {
        toast.error(t('alertPasswordLength'))
        return false
      }
      if (!/[A-Z]/.test(password)) {
        toast.error(t('alertPasswordUppercase'))
        return false
      }
      if (!/[0-9]/.test(password)) {
        toast.error(t('alertPasswordNumber'))
        return false
      }
      if (password !== confirmPassword) {
        toast.error(t('alertPasswordsMatch'))
        return false
      }
      if (!/^\d+$/.test(phone.trim())) {
        toast.error(t('alertInvalidPhone'))
        return false
      }
      if (!name.trim()) {
        toast.error(t('alertNameRequired'))
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const cleanedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
    }

    try {
      if (isRegister) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...cleanedData,
            inviteToken: inviteToken || undefined
          }),
          credentials: 'include' // Important para cookies
        })

        if (response.ok) {
          const data = await response.json()
          toast.success('User registered successfully!')

          // Auto-login después de registro, redirigir con window.location
          if (data.role === 'admin') {
            window.location.href = '/dashboard/admin'
          } else if (data.role === 'worker') {
            window.location.href = '/dashboard/worker'
          } else {
            window.location.href = '/dashboard/client'
          }
        } else {
          const error = await response.json()
          toast.error(error.error || 'Registration failed')
        }
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanedData.email,
            password: cleanedData.password,
          }),
          credentials: 'include' // Important para cookies
        })

        if (response.ok) {
          const data = await response.json()
          toast.success('Login successful!')

          // Esperar un poco para que la cookie se establezca antes de redirigir
          await new Promise(resolve => setTimeout(resolve, 200))

          // Redirigir según rol
          if (data.role === 'admin') {
            window.location.href = '/dashboard/admin'
          } else if (data.role === 'worker') {
            window.location.href = '/dashboard/worker'
          } else {
            window.location.href = '/dashboard/client'
          }
        } else {
          const error = await response.json()
          toast.error(error.error || 'Login failed')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = 'w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500'

  return (
    <motion.div
      className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-center text-purple-400">
          {isRegister ? t('createAccount') : t('title')}
        </h1>

        {/* Show invite role badge */}
        {inviteToken && inviteRole && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
            <p className="text-green-400 text-sm">
              {t('registeringAs')} <span className="font-bold capitalize">{inviteRole}</span>
            </p>
          </div>
        )}

        {inviteValidating && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center">
            <p className="text-blue-400 text-sm">{t('validatingInvite')}</p>
          </div>
        )}

        {isRegister && (
          <div>
            <label htmlFor="login-name" className="sr-only">{t('name')}</label>
            <input
              id="login-name"
              type="text"
              name="name"
              placeholder={t('name')}
              value={formData.name}
              onChange={handleChange}
              className={inputStyle}
              required
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="sr-only">{t('email')}</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder={t('email')}
            value={formData.email}
            onChange={handleChange}
            className={inputStyle}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="sr-only">{t('password')}</label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder={t('password')}
            value={formData.password}
            onChange={handleChange}
            className={inputStyle}
            required
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </div>

        {isRegister && (
          <>
            <div>
              <label htmlFor="login-confirmPassword" className="sr-only">{t('confirmPassword')}</label>
              <input
                id="login-confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder={t('confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputStyle}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="text-xs text-white/70 -mt-2">
              {t('passwordHint')}
            </div>
            <div>
              <label htmlFor="login-address" className="sr-only">{t('address')}</label>
              <input
                id="login-address"
                type="text"
                name="address"
                placeholder={t('address')}
                value={formData.address}
                onChange={handleChange}
                className={inputStyle}
                autoComplete="street-address"
              />
            </div>
            <div>
              <label htmlFor="login-phone" className="sr-only">{t('phone')}</label>
              <input
                id="login-phone"
                type="tel"
                name="phone"
                placeholder={t('phone')}
                value={formData.phone}
                onChange={handleChange}
                className={inputStyle}
                required
                autoComplete="tel"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
        >
          {loading ? t('processing') : (isRegister ? t('submitRegister') : t('submit'))}
        </button>

        {/* Only show toggle if not using invite link */}
        {!inviteToken && (
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-purple-400 hover:underline text-sm"
          >
            {isRegister ? t('haveAccount') : t('noAccount')}
          </button>
        )}
      </motion.form>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
