import React from "react";
import { Card } from "primereact/card";

export default function Help() {
	const helpItems = [
		{
			emoji: "🔍",
			title: "Finding Properties",
			desc: "Learn how to search for properties, use filters, and save your favorites."
		},
		{
			emoji: "📝",
			title: "Creating Listings",
			desc: "Step-by-step guide for landlords to create and manage property listings."
		},
		{
			emoji: "💬",
			title: "Messaging",
			desc: "How to communicate safely and effectively through our platform."
		},
		{
			emoji: "💳",
			title: "Payments & Billing",
			desc: "Information about subscriptions, fees, and payment methods."
		}
	];

	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-4 py-16">
			<div className="max-w-3xl mx-auto space-y-10">
				<h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)]">
					Help Center
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{helpItems.map((item, idx) => (
						<div
							key={idx}
							className="rounded-lg bg-[var(--surface-b)] p-4 shadow-sm"
						>
							<h3 className="font-semibold mb-1 text-[var(--text-color)]">
								<span className="mr-2">{item.emoji}</span>
								{item.title}
							</h3>
							<p className="text-sm text-[var(--text-color-secondary)]">
								{item.desc}
							</p>
						</div>
					))}
				</div>
				<div className="space-y-6 pt-10">
					<h2 className="text-xl font-semibold text-[var(--text-color)]">
						Frequently Asked Questions
					</h2>
					<div>
						<h3 className="font-medium text-[var(--text-color)]">
							How do I create an account?
						</h3>
						<p className="text-[var(--text-color-secondary)]">
							Click the "Sign Up" button and choose whether you're
							a student or landlord. Fill in your details and
							verify your email address to get started.
						</p>
					</div>
					<div>
						<h3 className="font-medium text-[var(--text-color)]">
							Is Seek free to use?
						</h3>
						<p className="text-[var(--text-color-secondary)]">
							Students can browse and contact landlords for free.
							Landlords have various subscription options to list
							their properties.
						</p>
					</div>
					<div>
						<h3 className="font-medium text-[var(--text-color)]">
							How are properties verified?
						</h3>
						<p className="text-[var(--text-color-secondary)]">
							We verify all properties through documentation
							checks and ensure they meet safety standards before
							appearing on our platform.
						</p>
					</div>
					<div>
						<h3 className="font-medium text-[var(--text-color)]">
							Can I schedule viewings through Seek?
						</h3>
						<p className="text-[var(--text-color-secondary)]"></p>
						<h3 className="font-medium text-[var(--text-color)]">
							How are properties verified?
						</h3>
						<p className="text-[var(--text-color-secondary)]">
							We verify all properties through documentation
							checks and ensure they meet safety standards before
							appearing on our platform.
						</p>
					</div>

					<div>
						<h3 className="font-medium text-[var(--text-color)]">
							Can I schedule viewings through Seek?
						</h3>
						<p className="text-[var(--text-color-secondary)]">
							Yes! Landlords can set available viewing times, and
							students can request viewings directly through the
							platform.
						</p>
					</div>
				</div>

				<div className="pt-10">
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-2">
						Still Need Help?
					</h2>
					<p className="text-[var(--text-color-secondary)] mb-3">
						Our support team is here to help you. Contact us at:
					</p>
					<ul className="text-[var(--text-color-secondary)] space-y-1">
						<li>📧 support@seekstandrews.com</li>
						<li>📱 +44 1334 123456</li>
						<li>🕒 Monday – Friday, 9am – 5pm GMT</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
