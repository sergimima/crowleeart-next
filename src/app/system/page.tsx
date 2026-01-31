'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'pending'
  message: string
  duration?: number
}

export default function SystemPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const updateResult = (name: string, status: 'success' | 'error', message: string, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, duration } : r)
      }
      return [...prev, { name, status, message, duration }]
    })
  }

  const testAPI = async (name: string, url: string, options?: RequestInit) => {
    const start = Date.now()
    try {
      const response = await fetch(url, options)
      const duration = Date.now() - start
      const data = await response.json()

      if (response.ok) {
        updateResult(name, 'success', `✅ ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`, duration)
        return true
      } else {
        updateResult(name, 'error', `❌ ${response.status} - ${data.error || 'Error'}`, duration)
        return false
      }
    } catch (error: any) {
      const duration = Date.now() - start
      updateResult(name, 'error', `❌ ${error.message}`, duration)
      return false
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])
    toast.info('Iniciando tests...')

    // Test 1: Health Check
    await testAPI('Health Check', '/api/health')

    // Test 2: Get Services
    await testAPI('GET /api/services', '/api/services')

    // Test 3: Register new user
    const randomEmail = `test${Date.now()}@test.com`
    await testAPI('POST /api/auth/register', '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: randomEmail,
        password: '123456',
        phone: '123456789'
      })
    })

    // Test 4: Login
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@crowleeart.com',
        password: '123456'
      })
    })

    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      const token = loginData.token
      const duration = Date.now()
      updateResult('POST /api/auth/login', 'success', `✅ Login exitoso - Token: ${token.substring(0, 20)}...`, duration)

      // Test 5: Get Profile (with auth)
      await testAPI('GET /api/user/profile (Auth)', '/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Test 6: Update Profile (with auth)
      await testAPI('PUT /api/user/update-profile (Auth)', '/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Admin Crowlee Updated',
          address: 'Nueva dirección',
          phone: '+34600123456'
        })
      })

      // Test 7: Get Admin Data (with auth)
      await testAPI('GET /api/admin/full-data (Auth)', '/api/admin/full-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Test 8: Get Bookings (with auth)
      await testAPI('GET /api/bookings (Auth)', '/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } else {
      updateResult('POST /api/auth/login', 'error', '❌ Login falló')
    }

    // Test 9: Create Contact Message
    await testAPI('POST /api/contact', '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Contact',
        email: 'contact@test.com',
        phone: '123456789',
        subject: 'Test Subject',
        message: 'Test message from system page'
      })
    })

    setTesting(false)
    toast.success('Tests completados!')
  }

  const clearResults = () => {
    setResults([])
    toast.info('Resultados limpiados')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-purple-400">🔧 System Dashboard</h1>
        <p className="text-gray-400 mb-8">Health checks, API testing & System information</p>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={runAllTests}
            disabled={testing}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            {testing ? '⏳ Testing...' : '🚀 Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            🗑️ Clear Results
          </button>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white/5 p-6 rounded-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm text-gray-400 mb-1">Environment</h3>
            <p className="text-2xl font-bold text-green-400">Development</p>
          </motion.div>

          <motion.div
            className="bg-white/5 p-6 rounded-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm text-gray-400 mb-1">Framework</h3>
            <p className="text-2xl font-bold text-blue-400">Next.js 15.5</p>
          </motion.div>

          <motion.div
            className="bg-white/5 p-6 rounded-xl border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm text-gray-400 mb-1">Database</h3>
            <p className="text-2xl font-bold text-purple-400">PostgreSQL</p>
          </motion.div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6"
          >
            <h2 className="text-2xl font-bold mb-4">📊 Test Results</h2>

            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{result.name}</h3>
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                    {result.duration && (
                      <span className="text-xs text-gray-400 ml-4">{result.duration}ms</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex gap-6">
                <div>
                  <span className="text-gray-400">Total: </span>
                  <span className="font-bold">{results.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Passed: </span>
                  <span className="font-bold text-green-400">
                    {results.filter(r => r.status === 'success').length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Failed: </span>
                  <span className="font-bold text-red-400">
                    {results.filter(r => r.status === 'error').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* API Endpoints List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-white/5 rounded-xl border border-white/10 p-6"
        >
          <h2 className="text-2xl font-bold mb-4">📡 Available API Endpoints</h2>

          <div className="space-y-2">
            {[
              { method: 'GET', path: '/api/health', auth: false, desc: 'Health check + DB connection' },
              { method: 'GET', path: '/api/services', auth: false, desc: 'Get all services' },
              { method: 'POST', path: '/api/auth/register', auth: false, desc: 'Register new user' },
              { method: 'POST', path: '/api/auth/login', auth: false, desc: 'Login user (returns JWT)' },
              { method: 'GET', path: '/api/user/profile', auth: true, desc: 'Get user profile' },
              { method: 'PUT', path: '/api/user/update-profile', auth: true, desc: 'Update user profile' },
              { method: 'GET', path: '/api/bookings', auth: true, desc: 'Get user bookings' },
              { method: 'POST', path: '/api/bookings', auth: false, desc: 'Create booking' },
              { method: 'POST', path: '/api/contact', auth: false, desc: 'Send contact message' },
              { method: 'GET', path: '/api/admin/full-data', auth: true, desc: 'Get admin dashboard data (admin only)' },
            ].map((endpoint, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-300' :
                  endpoint.method === 'POST' ? 'bg-green-500/20 text-green-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-purple-300 font-mono text-sm flex-1">{endpoint.path}</code>
                {endpoint.auth && (
                  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                    🔒 Auth
                  </span>
                )}
                <span className="text-xs text-gray-400">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pages Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-white/5 rounded-xl border border-white/10 p-6"
        >
          <h2 className="text-2xl font-bold mb-4">📄 Pages</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { path: '/', name: 'Homepage', public: true },
              { path: '/services', name: 'Services', public: true },
              { path: '/gallery', name: 'Gallery', public: true },
              { path: '/contact', name: 'Contact', public: true },
              { path: '/booking', name: 'Booking', public: true },
              { path: '/login', name: 'Login/Register', public: true },
              { path: '/profile', name: 'Profile Settings', public: false },
              { path: '/dashboard/client', name: 'Client Dashboard', public: false },
              { path: '/dashboard/admin', name: 'Admin Dashboard', public: false },
            ].map((page, index) => (
              <a
                key={index}
                href={page.path}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition group"
              >
                <div>
                  <span className="font-semibold group-hover:text-purple-400 transition">{page.name}</span>
                  <code className="block text-xs text-gray-400 font-mono">{page.path}</code>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  page.public
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-orange-500/20 text-orange-300'
                }`}>
                  {page.public ? '🌐 Public' : '🔒 Protected'}
                </span>
              </a>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
