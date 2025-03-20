import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Privacy Policy | Dictation Master',
	description: 'Privacy policy for Dictation Master - How we handle your data'
}

export default function PrivacyPolicy() {
	return (
		<div className="container mx-auto px-4 py-8 max-w-3xl">
			<h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
			
			<div className="space-y-6">
				<section>
					<h2 className="text-2xl font-semibold mb-4">Overview</h2>
					<p className="text-gray-700 dark:text-gray-300">
						{`Dictation Master is a personal tool designed to help users practice dictation.
						We are committed to protecting your privacy and being transparent about our practices.`}
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">Data Collection</h2>
					<p className="text-gray-700 dark:text-gray-300">
						{`We do not collect or store any personal data about our users. This website
						is designed to be a simple, helpful tool that respects your privacy.`}
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">Advertising</h2>
					{/*<p className="text-gray-700 dark:text-gray-300">
						{`We use Google AdSense on our website. Google AdSense may use cookies
						and data to serve personalized ads. This is the only third-party service
						that may collect any information on our website.`}
					</p>*/}
					<p className="text-gray-700 dark:text-gray-300 mt-2">
						{`You can learn more about how Google uses data when you use our site by
						visiting `}<a
							href="https://policies.google.com/technologies/partner-sites"
							className="text-blue-600 dark:text-blue-400 hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							{`Google Privacy & Terms`}
						</a>
						.
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">Contact</h2>
					<p className="text-gray-700 dark:text-gray-300">
						{`If you have any questions about this privacy policy, you can reach out
						through our website or GitHub repository.`}
					</p>
				</section>

				<section>
					<h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
					<p className="text-gray-700 dark:text-gray-300">
						{`We may update this privacy policy from time to time. Any changes will be
						reflected on this page.`}
					</p>
				</section>

				<footer className="text-sm text-gray-500 dark:text-gray-400 mt-8">
					{`Last updated: ${new Date().toLocaleDateString()}`}
				</footer>
			</div>
		</div>
	)
} 