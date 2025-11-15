'use client'

import { useEffect } from 'react'

export default function WhatsAppWidget() {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script')
    script.src = 'https://wsp.lixsa.ai/whatsapp-widget.js'
    script.setAttribute('phone', '447732455178')
    script.setAttribute('message', 'Hello! I would like to inquire about your services.')
    script.async = true

    // Append script to body
    document.body.appendChild(script)

    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  return null // This component doesn't render anything visible
}
