import Image from 'next/image'

export default function SimplyBusinessBadge() {
  return (
    <div className="w-[200px] mx-auto">
      <div className="bg-white rounded-t-[14px] border border-[#535353] p-5 text-center">
        <Image
          src="https://quote.simplybusiness.co.uk/assets/ci5/sb/badge_logo.png"
          alt="Simply Business"
          width={58}
          height={60}
          className="mx-auto"
        />
        <p className="mt-4 mb-3 px-[15px] text-sm leading-[17px] text-[#535353] font-normal">
          Business insurance provided through Simply Business.
        </p>
        <a
          href="https://quote.simplybusiness.co.uk/certificate/policy-overview/BuU0j2BrnizmrWWhI3MrCw/?ref_id=RAFXA_ZIBI5001546XB1&source=popBadge"
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="text-sm leading-[17px] text-[#00827F] underline hover:text-[#006B69]"
        >
          View our insurance details
        </a>
      </div>
      <a
        href="https://www.simplybusiness.co.uk/?ref_id=RAFXA_ZIBI5001546XB1&source=popBadge"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-sm leading-[35px] text-white bg-[#535353] rounded-b-[14px] text-center hover:bg-[#444]"
      >
        www.simplybusiness.co.uk
      </a>
    </div>
  )
}
