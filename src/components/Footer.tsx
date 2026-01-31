import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function Footer() {
  const t = await getTranslations('footer')
  return (
    <footer className="bg-gradient-to-r from-[#0f172a] via-[#11383a] to-[#1e40af] text-white py-6 text-center border-t border-white/10 snap-start">
      <p className="text-sm opacity-80">
        &copy; {new Date().getFullYear()} {t('copyright')}
      </p>
      <p className="mt-2 text-sm opacity-80">
        <Link href="/privacy" className="text-purple-300 hover:text-purple-200 underline underline-offset-2">
          {t('privacy')}
        </Link>
      </p>
    </footer>
  )
}
