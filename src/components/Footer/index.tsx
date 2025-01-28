import Link from 'next/link'

export function Footer() {
	return (
		<footer className="w-full border-t border-gray-200 bg-white/75">
			<div className="container mx-auto px-4 py-6">
				<div className="flex justify-between items-center">
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