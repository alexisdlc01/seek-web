export default function Terms() {
	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-4 py-16">
			<div className="max-w-3xl mx-auto space-y-8">
				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)]">
					Terms & Conditions
				</h1>
				<p className="text-[var(--text-color-secondary)]">
					Last updated: January 2024
				</p>

				{/* Sections */}
				<div className="space-y-6">
					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							1. Acceptance of Terms
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							By accessing and using Seek St Andrews ("the
							Service"), you accept and agree to be bound by the
							terms and provision of this agreement. If you do not
							agree to abide by the above, please do not use this
							service.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							2. Use of the Service
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							The Service is intended for use by students seeking
							accommodation and landlords offering properties in
							St Andrews. You must be at least 18 years old to use
							this Service. You are responsible for maintaining
							the confidentiality of your account information.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							3. User Conduct
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							Users agree to use the Service only for lawful
							purposes. You agree not to post any content that is
							false, misleading, defamatory, or infringes on the
							rights of others. Seek reserves the right to remove
							any content that violates these terms.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							4. Property Listings
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							Landlords are responsible for ensuring that all
							information provided about their properties is
							accurate and up-to-date. Seek does not guarantee the
							accuracy of listings and encourages users to verify
							all information independently.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							5. Privacy
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							Your use of our Service is also governed by our
							Privacy Policy. Please review our Privacy Policy,
							which also governs the Site and informs users of our
							data collection practices.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							6. Limitation of Liability
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							Seek St Andrews provides the Service on an "as is"
							basis and makes no warranties regarding the Service.
							We are not liable for any damages arising from your
							use of the Service.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							7. Modifications
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We reserve the right to modify these terms at any
							time. We will notify users of any changes by posting
							the new Terms & Conditions on this page.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							8. Contact Information
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							If you have any questions about these Terms &
							Conditions, please contact us at{" "}
							<a
								href="mailto:legal@seekstandrews.com"
								className="text-[var(--primary-color)] underline"
							>
								legal@seekstandrews.com
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
