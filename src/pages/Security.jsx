import React from "react";

export default function Security() {
	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-4 py-16">
			<div className="max-w-3xl mx-auto space-y-8">
				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)]">
					Security & Confidentiality
				</h1>

				{/* Sections */}
				<div className="space-y-6">
					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Our Commitment to Security
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							At Seek St Andrews, we take the security of your
							personal information seriously. We employ
							industry-standard security measures to protect your
							data from unauthorized access, disclosure,
							alteration, and destruction.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Data Encryption
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							All data transmitted between your device and our
							servers is encrypted using SSL/TLS technology. This
							ensures that your personal information remains
							confidential during transmission.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Secure Storage
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							Your data is stored on secure servers with
							restricted access. We use firewalls and intrusion
							detection systems to prevent unauthorized access to
							our systems.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Access Controls
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							Access to personal information is limited to
							authorized personnel who need it to perform their
							job functions. All employees are trained on data
							protection and confidentiality.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Regular Security Audits
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							We conduct regular security audits and assessments
							to identify and address potential vulnerabilities in
							our systems.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							User Responsibilities
						</h2>
						<p className="text-[var(--text-color-secondary)] mb-2">
							While we implement robust security measures, users
							also play a crucial role in maintaining security:
						</p>
						<ul className="list-disc list-inside space-y-1 text-[var(--text-color-secondary)]">
							<li>
								Use strong, unique passwords for your account
							</li>
							<li>
								Never share your login credentials with others
							</li>
							<li>
								Log out of your account when using shared
								devices
							</li>
							<li>Report any suspicious activity immediately</li>
						</ul>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Incident Response
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							In the unlikely event of a security breach, we have
							procedures in place to respond quickly and minimize
							any potential impact. Affected users will be
							notified promptly with information about the
							incident and steps to protect themselves.
						</p>
					</div>

					<div>
						<h2 className="font-semibold text-[var(--text-color)]">
							Contact Security Team
						</h2>
						<p className="text-[var(--text-color-secondary)]">
							If you have any security concerns or need to report
							a security issue, please contact our security team
							immediately at{" "}
							<a
								href="mailto:security@seekstandrews.com"
								className="text-[var(--primary-color)] underline"
							>
								security@seekstandrews.com
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
