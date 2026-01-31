import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – Crowlee Art',
  description: 'Privacy policy and cookie information for Crowlee Art – The Art Of Maintenance. How we collect, use and protect your data.',
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
