import Link from 'next/link'
import { Home, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-16 md:py-24 text-white min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
      <div className="rounded-full bg-purple-600/20 p-6 mb-6">
        <FileQuestion className="h-16 w-16 text-purple-400" aria-hidden />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-purple-400 mb-3">
        404
      </h1>
      <p className="text-xl text-white/90 mb-2">
        Page not found
      </p>
      <p className="text-white/70 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0a0f1e]"
      >
        <Home className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
    </section>
  )
}
