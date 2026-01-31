import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en', 'es'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async () => {
  const store = await cookies()
  const localeStore = store.get('locale')?.value
  const locale: Locale = localeStore === 'es' || localeStore === 'en' ? localeStore : 'en'

  const messages = (await import(`../../messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
