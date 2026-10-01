import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions – Crowlee Art',
  description: 'Booking terms, payment, cancellation policy and statutory rights for Crowlee Art – The Art Of Maintenance.',
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
