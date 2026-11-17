import { useEffect } from "react";

const Section = ({ title, children }) => (
	<section>
		<h2 className="font-semibold text-[var(--text-color)]">{title}</h2>
		<div className="mt-2 space-y-3 text-[var(--text-color-secondary)]">{children}</div>
	</section>
);

export default function PrivacyPolicy() {
	useEffect(() => {
		document.title = "Privacy Policy | Seek";
	}, []);
	return (
		<div className="min-h-screen bg-[var(--surface-a)] px-4 py-16 text-[var(--text-color)]">
			<div className="mx-auto max-w-3xl space-y-8">
				<h1 className="text-3xl font-bold text-[var(--primary-color)] md:text-4xl">Privacy Policy</h1>
				<p className="text-[var(--text-color-secondary)]">
					Last updated: 17 November 2026
					<br />
					Seek IT Ltd, incorporated in Scotland, United Kingdom
				</p>

				<div className="space-y-6">
					<Section title="Introduction">
						<p>Seek IT Ltd (“Seek”, “we”, “us” or “our”) is responsible for the personal information used by the Seek website and mobile app. This policy explains what we collect, why we use it, who helps us process it, how long we keep it and your rights.</p>
					</Section>

					<Section title="Information we collect">
						<ul className="list-disc space-y-1 pl-6">
							<li>Account and profile details, including your name, contact details, university and student status.</li>
							<li>Applications, property listings, tenancy records, contracts, deposits, payments, documents, photos and messages.</li>
							<li>Device, IP address, usage, cookie, crash and security information.</li>
							<li>Optional location, household and connected-mailbox information.</li>
						</ul>
					</Section>

					<Section title="Connected mailboxes">
						<p>If you connect Gmail, Microsoft or another mailbox through IMAP, Seek first checks message headers and reads only messages identified as housing-related. We use those messages to show housing conversations and file relevant tenancy documents or bills.</p>
						<p>Imported housing messages and mailbox credentials are encrypted at rest. Disconnecting a mailbox deletes its imported messages and immediately deletes or revokes its access token or IMAP credential. We do not use mailbox data for advertising or to train general-purpose AI models.</p>
						<p>Seek’s use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" className="underline" target="_blank" rel="noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
					</Section>

					<Section title="How and why we use information">
						<ul className="list-disc space-y-1 pl-6">
							<li>To provide accounts, applications, tenancies, payments and communications where needed to perform our contract with you.</li>
							<li>To meet legal, accounting, fraud-prevention and safety obligations.</li>
							<li>For service security, support and improvement where our legitimate interests do not override your rights.</li>
							<li>For optional mailbox, location or marketing features where you consent; you can withdraw consent at any time.</li>
						</ul>
						<p>Seek does not sell personal information. Any anonymous, aggregated analysis does not identify you.</p>
					</Section>

					<Section title="Who processes or receives information">
						<ul className="list-disc space-y-1 pl-6">
							<li>Stripe for card payments, deposits and landlord payouts. Stripe may act independently for identity checks and fraud prevention.</li>
							<li>Google Gmail API, Microsoft and relevant IMAP mailbox providers for mailbox connections.</li>
							<li>Google Firebase for app notifications and, where enabled, analytics and crash reporting.</li>
							<li>Render for application hosting, AWS S3 for private file storage, and our email provider for service emails.</li>
							<li>Students, household members, landlords or agents where sharing is necessary for an application or tenancy.</li>
							<li>Deposit schemes, regulators, courts or authorities where required by the service or law.</li>
						</ul>
						<p>Some providers process information outside the UK. Where required, we use recognised safeguards such as UK contractual clauses, the UK-US data bridge or another lawful transfer mechanism.</p>
					</Section>

					<Section title="How long we keep information">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[560px] border-collapse text-left text-sm">
								<thead><tr className="border-b"><th className="py-2 pr-4">Information</th><th className="py-2">Retention</th></tr></thead>
								<tbody>
									<tr className="border-b"><td className="py-2 pr-4">Payment and accounting records</td><td className="py-2">6 years after the relevant financial year</td></tr>
									<tr className="border-b"><td className="py-2 pr-4">Tenancy records, contracts, payments, tenancy messages, inventories and photos</td><td className="py-2">6 years after the tenancy ends</td></tr>
									<tr className="border-b"><td className="py-2 pr-4">Imported emails and other non-tenancy messages</td><td className="py-2">Deleted on mailbox disconnect or within 30 days of account deletion</td></tr>
									<tr className="border-b"><td className="py-2 pr-4">Mailbox tokens and IMAP credentials</td><td className="py-2">Deleted or revoked immediately on disconnect or account deletion</td></tr>
									<tr><td className="py-2 pr-4">Identity documents</td><td className="py-2">Deleted within 30 days after verification; we may retain the result and date</td></tr>
								</tbody>
							</table>
						</div>
						<p>Stripe may keep its own regulated records under its privacy policy. Backups expire through our normal secure rotation.</p>
					</Section>

					<Section title="Security">
						<p>We use encryption, access controls, restricted staff access, logging and secure hosting to protect information. No service can guarantee complete security, but we review and improve these controls.</p>
					</Section>

					<Section title="Your rights and deleting your account">
						<p>You may ask to access, correct, erase, restrict or receive your information, object to certain uses, or withdraw consent. You can also complain to the UK Information Commissioner’s Office.</p>
						<p>To delete your account, sign in, open <strong>Edit profile</strong>, select <strong>Close account</strong>, then confirm. We may first require an active tenancy or outstanding payment to be completed. You can also email privacy@seekapp.uk. Records we must keep for legal or dispute purposes remain only for the periods above.</p>
					</Section>

					<Section title="Children’s privacy">
						<p>Seek is designed for university students. We do not knowingly collect personal information from anyone under 16.</p>
					</Section>

					<Section title="Changes to this policy">
						<p>We may update this policy and will tell users about significant changes through Seek or by email.</p>
					</Section>

					<Section title="Contact us">
						<p>Seek IT Ltd<br />Email: privacy@seekapp.uk<br />Registered office: 11 Crail’s Lane, KY16 9NR, Scotland, United Kingdom</p>
					</Section>
				</div>
			</div>
		</div>
	);
}
