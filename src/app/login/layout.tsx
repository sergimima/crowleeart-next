import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in – Crowlee Art',
  description: 'Sign in to your Crowlee Art account to manage bookings and profile.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
