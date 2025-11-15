'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function QRTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const refCode = searchParams?.get('ref')

    if (refCode) {
      // Track the QR code scan
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refCode })
      }).catch(err => {
        // Silently fail - tracking is not critical
        console.debug('Tracking failed:', err)
      })
    }
  }, [searchParams])

  return null // This component doesn't render anything
}
