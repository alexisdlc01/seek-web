import React from "react";
import { Button } from "primereact/button";

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-[var(--surface-a)] text-[var(--text-color)] px-4 py-16">
			<div className="max-w-3xl mx-auto space-y-10">
				<h1 className="text-3xl md:text-4xl font-bold text-[var(--primary-color)]">
					About Seek St Andrews
				</h1>
				<p>
					Seek St Andrews was founded with a simple mission: to make
					finding student accommodation in St Andrews easier, safer,
					and more transparent for both students and landlords.
				</p>
				<p>
					We understand the challenges students face when searching
					for housing in a new city, especially in a competitive
					market like St Andrews. That’s why we’ve created a platform
					that brings together verified landlords and eager students
					in one trusted marketplace.
				</p>
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-2">
						Our Mission
					</h2>
					<p>
						To revolutionize the student housing market in St
						Andrews by providing a seamless, secure, and efficient
						platform that benefits both students and landlords. We
						believe that finding a home should be exciting, not
						stressful.
					</p>
				</div>
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-2">
						Why Choose Seek?
					</h2>
					<ul className="list-disc list-inside space-y-2 text-[var(--text-color-secondary)]">
						<li>
							All properties are verified for quality and safety
						</li>
						<li>
							Direct communication with landlords – no middlemen
						</li>
						<li>Transparent pricing with no hidden fees</li>
						<li>Secure platform with data protection</li>
						<li>Local expertise in the St Andrews market</li>
					</ul>
				</div>
				<div>
					<h2 className="text-xl font-semibold text-[var(--text-color)] mb-2">
						Our Team
					</h2>
					<p>
						We're a dedicated team of professionals who understand
						the unique needs of the St Andrews student community.
						With backgrounds in technology, real estate, and student
						services, we're committed to making your housing search
						as smooth as possible.
					</p>
				</div>
				<div className="pt-6">
					<Button
						label="Get Started"
						className="bg-[var(--primary-color)] text-[var(--primary-color-text)] px-4 py-3"
					/>
				</div>
			</div>
		</div>
	);
}
