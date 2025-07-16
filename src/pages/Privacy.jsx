export default function Privacy() {
	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-4 py-16">
			<div className="max-w-3xl mx-auto space-y-8">
				<h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)]">
					Privacy Policy
				</h1>
				<p className="text-[var(--text-color-secondary)]">
					Last updated: January 2024
				</p>

				<div className="space-y-6">
					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							1. Information We Collect
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We collect information you provide directly to us,
							such as when you create an account, list a property,
							or contact us. This may include your name, email
							address, phone number, and property details.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							2. How We Use Your Information
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We use the information we collect to provide,
							maintain, and improve our services, to process
							transactions, to communicate with you, and to comply
							with legal obligations.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							3. Information Sharing
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We do not sell, trade, or rent your personal
							information to third parties. We may share your
							information with service providers who assist us in
							operating our platform, conducting our business, or
							serving our users.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							4. Data Security
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We implement appropriate technical and
							organizational measures to protect your personal
							information against unauthorized access, alteration,
							disclosure, or destruction.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							5. Your Rights
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							You have the right to access, update, or delete your
							personal information. You may also opt out of
							certain communications from us. To exercise these
							rights, please contact us at{" "}
							<a
								href="mailto:privacy@seekstandrews.com"
								className="text-[var(--primary-color)] underline"
							>
								privacy@seekstandrews.com
							</a>
							.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							6. Cookies
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We use cookies and similar tracking technologies to
							track activity on our Service and hold certain
							information. You can instruct your browser to refuse
							all cookies or to indicate when a cookie is being
							sent.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							7. Changes to This Policy
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We may update our Privacy Policy from time to time.
							We will notify you of any changes by posting the new
							Privacy Policy on this page and updating the "Last
							updated" date.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							8. Contact Us
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							If you have any questions about this Privacy Policy,
							please contact us at{" "}
							<a
								href="mailto:privacy@seekstandrews.com"
								className="text-[var(--primary-color)] underline"
							>
								privacy@seekstandrews.com
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
