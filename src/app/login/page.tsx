'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone } = formData

    if (!email.trim().includes('@')) {
      toast.error('Invalid email address.')
      return false
    }
    if (isRegister) {
      if (password.trim().length < 8) {
        toast.error('Password must be at least 8 characters.')
        return false
      }
      if (!/[A-Z]/.test(password)) {
        toast.error('Password must contain at least one uppercase letter.')
        return false
      }
      if (!/[0-9]/.test(password)) {
        toast.error('Password must contain at least one number.')
        return false
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.')
        return false
      }
      if (!/^\d+$/.test(phone.trim())) {
        toast.error('Invalid phone number.')
        return false
      }
      if (!name.trim()) {
        toast.error('Name is required.')
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
          body: JSON.stringify({ ...cleanedData, role: 'client' }),
          credentials: 'include' // Important para cookies
        })

        if (response.ok) {
          const data = await response.json()
          toast.success('User registered successfully!')

          // Auto-login después de registro, redirigir con window.location
          if (data.role === 'admin') {
            window.location.href = '/dashboard/admin'
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
          {isRegister ? 'Create Account' : 'Login'}
        </h1>

        {isRegister && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className={inputStyle}
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={inputStyle}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={inputStyle}
          required
        />

        {isRegister && (
          <>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputStyle}
              required
            />
            <div className="text-xs text-white/70 -mt-2">
              Password must be at least 8 characters with one uppercase letter and one number
            </div>
            <input
              type="text"
              name="address"
              placeholder="Address (optional)"
              value={formData.address}
              onChange={handleChange}
              className={inputStyle}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
        >
          {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </button>

        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-purple-400 hover:underline text-sm"
        >
          {isRegister ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
        </button>
      </motion.form>
    </motion.div>
  )
}
