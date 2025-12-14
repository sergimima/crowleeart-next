'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function CheckatradeWidget() {
    return (
        <>
            <Script
                src="https://www.checkatrade.com/static/js/reviews-score-widget.js"
                data-company-id="1183206"
                strategy="lazyOnload"
            />
        </>
    )
}
