'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { UserCircle, ChevronDown } from 'lucide-react'

const LOCALE_COOKIE = 'locale'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale() as 'en' | 'es'
  const t = useTranslations('navbar')

  useEffect(() => {
    // Verificar sesión usando la API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(data.isAuthenticated)
          setUserRole(data.user?.role || null)
        } else {
          setIsLoggedIn(false)
          setUserRole(null)
        }
      } catch (error) {
        setIsLoggedIn(false)
        setUserRole(null)
      }
    }

    checkAuth()
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      setIsLoggedIn(false)
      setUserRole(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'es' : 'en'
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
    router.refresh()
  }

  const navLinks = [
    { label: t('home'), path: '/' },
    { label: t('gallery'), path: '/gallery' },
    { label: t('services'), path: '/services' },
    { label: t('contact'), path: '/contact' },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0f172a]/90 backdrop-blur-md border-b border-white/10 shadow z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center h-full py-1">
          <Image
            src="/images/logos/logo-crowlee Background clear.png"
            alt="Crowlee Art Logo"
            width={180}
            height={60}
            className="h-full w-auto object-contain object-center hover:scale-105 transition-transform duration-300"
            priority
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0f172a] rounded md:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          ☰
        </button>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              href={path}
              className={`text-lg px-4 py-2 hover:text-purple-400 transition ${
                pathname === path ? 'text-purple-400' : 'text-white'
              }`}
            >
              {label}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 text-white hover:text-purple-400 transition focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0f172a] rounded"
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
              >
                <UserCircle size={28} />
                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                  {userRole === 'client' && (
                    <Link
                      href="/booking"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-purple-600/20 text-white transition"
                    >
                      {t('bookService')}
                    </Link>
                  )}
                  <Link
                    href={userRole === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-purple-600/20 text-white transition"
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-purple-600/20 text-white transition"
                  >
                    {t('profile')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsUserMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-400 transition"
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
            >
              {t('login')}
            </Link>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">{locale.toUpperCase()}</span>
            <button
              type="button"
              onClick={toggleLanguage}
              title="Toggle language"
              aria-label="Toggle language"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition hover:bg-purple-700"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  locale === 'en' ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0f172a]/95 border-t border-white/10 py-4">
          <div className="flex flex-col items-center gap-4">
            {navLinks.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                onClick={() => setIsOpen(false)}
                className="text-lg px-4 py-2 hover:text-purple-400 transition text-white"
              >
                {label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                {userRole === 'client' && (
                  <Link
                    href="/booking"
                    onClick={() => setIsOpen(false)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                  >
                    {t('bookService')}
                  </Link>
                )}
                <Link
                  href={userRole === 'admin' ? '/dashboard/admin' : '/dashboard/client'}
                  onClick={() => setIsOpen(false)}
                  className="text-lg px-4 py-2 hover:text-purple-400 transition text-white"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-lg px-4 py-2 hover:text-purple-400 transition text-white"
                >
                  {t('profile')}
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition"
              >
                {t('login')}
              </Link>
            )}

            {/* Language Selector Mobile */}
            <div className="flex items-center gap-2 justify-center">
              <span className="text-sm text-white/70">{locale.toUpperCase()}</span>
              <button
                type="button"
                onClick={toggleLanguage}
                title="Toggle language"
                aria-label="Toggle language"
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition hover:bg-purple-700"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    locale === 'en' ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
