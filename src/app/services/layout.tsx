import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Services – Crowlee Art',
  description: 'Expert maintenance and repair services for homes and small businesses. Plumbing, decorating, drywall and more in London and Hertfordshire.',
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
