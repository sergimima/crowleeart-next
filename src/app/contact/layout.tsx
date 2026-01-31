import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact – Crowlee Art',
  description: 'Get in touch with Crowlee Art for maintenance, repairs and home services in London and Hertfordshire.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
