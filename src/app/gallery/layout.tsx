import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery – Crowlee Art',
  description: 'Portfolio of completed work by Crowlee Art – maintenance, repairs, plumbing, decorating and more.',
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
