'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Cookie } from 'lucide-react'

const STORAGE_KEY = 'crowleeart-cookie-consent'

export type CookiePreference = 'all' | 'necessary'

export function getStoredConsent(): CookiePreference | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'all' || raw === 'necessary') return raw
  return null
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  const save = (value: CookiePreference) => {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-5 shadow-lg border-t border-white/10 bg-[#0f1729]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f1729]/90"
    >
      <div className="mx-auto max-w-4xl flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-purple-600/20 p-2">
            <Cookie className="h-5 w-5 text-purple-400" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Utilizamos cookies
            </p>
            <p className="text-sm text-white/80 mt-0.5">
              Usamos cookies propias y de terceros para el funcionamiento del sitio, analíticas y preferencias. Puedes aceptar todas, solo las necesarias o ver más en nuestra política de cookies.
            </p>
            <Link
              href="/privacy#cookies"
              className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2 mt-1 inline-block"
            >
              Política de cookies
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => save('necessary')}
          >
            Solo necesarias
          </Button>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-500 text-white"
            onClick={() => save('all')}
          >
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  )
}
