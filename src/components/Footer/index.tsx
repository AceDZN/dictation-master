import Link from 'next/link'

export function Footer() {
	return (
		<footer className="mt-auto py-6 border-t border-gray-200 bg-white/75 backdrop-blur-lg">
			<div className="container mx-auto px-4">
				<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
					<div className="text-sm text-gray-500">
						© {new Date().getFullYear()} Dictation Master
					</div>
					<nav className="flex gap-6">
						<Link
							href="/privacy-policy"
							className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
						>
							Privacy Policy
						</Link>
					</nav>
				</div>
			</div>
		</footer>
	)
} 