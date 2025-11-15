'use client'

import { Suspense } from 'react'
import QRTracker from './QRTracker'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <QRTracker />
      </Suspense>
      {children}
    </>
  )
}
