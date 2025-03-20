'use client'

import { useEffect, useState } from 'react'

export function AdBlockDetector() {
	const [isBlocked, setIsBlocked] = useState(false)

	useEffect(() => {
		const detectAdBlock = async () => {
			try {
				const testAd = document.createElement('div')
				testAd.className = 'adsbygoogle'
				testAd.style.height = '1px'
				testAd.style.position = 'absolute'
				testAd.style.left = '-999px'
				document.body.appendChild(testAd)

				// Wait briefly to see if the ad element gets hidden or removed
				await new Promise(resolve => setTimeout(resolve, 100))

				const isAdBlocked = !testAd.offsetHeight || 
					!testAd.clientHeight || 
					!document.querySelector('.adsbygoogle')

				setIsBlocked(isAdBlocked)
				testAd.remove()
			} catch (error) {
				setIsBlocked(true)
                console.warn('error occured in adblock detector',error)
			}
		}

		detectAdBlock()
	}, [])

	if (!isBlocked) return null

	return (
		<div className="p-4 mb-4 text-sm text-amber-800 bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400 rounded-lg">
			<p>
				{`We noticed you're using an ad blocker. We keep this site free by showing minimal, 
				non-intrusive ads. Please consider disabling your ad blocker to support us.`}
			</p>
		</div>
	)
} 