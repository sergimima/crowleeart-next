'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { FileText } from 'lucide-react'
import { TERMS_VERSION } from '@/lib/terms'

const sections: [string, string][] = [
  [
    'Bookings and payment',
    'Submitting the form is a booking request, not a confirmed appointment. We confirm availability, scope and price in writing. Your appointment is confirmed only after we receive the £80 booking payment and send written confirmation. The £80 is credited towards your labour bill, including half-day and full-day bookings; it is not an extra charge. Payment can be made by bank transfer or cash by arrangement.',
  ],
  [
    'Prices and materials',
    'Our standard labour rate is £80 for the first hour and £50 for each additional hour. Half day: £200 for up to four hours. Full day: £400 for up to eight hours. Additional time after the agreed day allowance is £50 per hour. Materials are charged separately unless explicitly included in your written quote. Any special rates, additional staff, parking or other charges will be agreed before booking. A fixed price requires a written quote. A site visit for a formal quote costs £80 and is credited against the accepted job.',
  ],
  [
    'Cancellation, rescheduling and access',
    'Please give at least 48 hours’ notice by email or WhatsApp to cancel or change your appointment. With at least 48 hours’ notice, your booking payment may be transferred to an agreed new date or refunded. With less than 48 hours’ notice, or if you do not attend or provide agreed access, we may retain up to £80 from your booking payment to cover reasonable direct losses caused by the cancellation. We take reasonable steps to refill the slot and reduce our losses, explain any deduction and refund the balance. This is not an automatic penalty and does not override statutory cancellation rights. A replacement appointment requires a new confirmation.',
  ],
  [
    'Materials and additional work',
    'We agree any special material purchases in advance. If you cancel, any separately agreed material deduction is limited to reasonable unrecoverable costs after returns or reuse; we do not charge twice for the same loss. We obtain your approval before additional work or costs beyond the agreed scope. Please ensure customer-supplied materials are suitable and available before the visit.',
  ],
  [
    'Your statutory cancellation rights',
    'Where the Consumer Contracts Regulations apply to a service contract agreed online, by telephone or away from our premises, you normally have 14 days from entering the contract to cancel without giving a reason. Email or WhatsApp us with your name, address, booking reference and a clear statement that you wish to cancel. You may use: ‘I hereby give notice that I cancel my contract for [service], agreed on [date]. Name: [name]. Address: [address]. Date: [date].’ We refund amounts due within 14 days of your cancellation notice, using the original payment method unless otherwise agreed.',
  ],
  [
    'Work requested during the cooling-off period',
    'If you want work to begin within the 14-day cancellation period, we require your separate express request before starting. If you then exercise your statutory right to cancel, you pay only a proportionate amount for services properly supplied at your request before cancellation, where legally permitted. You lose that cancellation right once the service is fully performed only if you expressly requested early performance and acknowledged this beforehand. Specific exceptions may apply to urgent repairs you expressly request; unrelated extra work remains subject to applicable rights.',
  ],
  [
    'If we cancel or you have a concern',
    'If we cannot carry out the appointment, we will contact you promptly and offer an alternative or refund payments for work not supplied. We carry out services with reasonable care and skill. Contact us promptly about any concern so we can investigate and arrange an appropriate remedy. Nothing in these terms limits your statutory rights or liability that cannot lawfully be excluded.',
  ],
  [
    'Contact',
    'Crowlee ART LTD · crowleeart@gmail.com · 07732 455178 (WhatsApp). These terms apply to new bookings agreed using this version and do not introduce charges retrospectively to earlier bookings.',
  ],
]

export default function TermsPage() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    if (main) main.scrollTop = 0
  }, [pathname])

  const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  }

  return (
    <motion.section
      className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16 text-white min-h-[calc(100vh-4rem)]"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      custom={0}
    >
      <motion.div className="space-y-2 mb-12" variants={fadeIn} custom={1}>
        <h1 className="text-3xl md:text-4xl font-bold text-purple-400 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Terms &amp; Conditions
        </h1>
        <p className="text-white/80">
          Version {TERMS_VERSION}. Please read before confirming your booking. You can print or save this page for your records.
        </p>
      </motion.div>

      <div className="space-y-10">
        {sections.map(([title, text], i) => (
          <motion.article key={title} variants={fadeIn} custom={i + 2}>
            <h2 className="text-xl font-semibold text-white mb-3">{i + 1}. {title}</h2>
            <p className="text-white/80 leading-relaxed">{text}</p>
          </motion.article>
        ))}
      </div>
    </motion.section>
  )
}
