'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function MainWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  
  return (
    <main className={`pt-16 overflow-y-auto h-screen ${isHome ? 'snap-y snap-mandatory' : ''}`}>
      {children}
    </main>
  )
}

