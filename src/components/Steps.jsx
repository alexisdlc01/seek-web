import React, { useRef, useEffect, useState } from "react";

const STEPS = [
	{
		title: "Step 1 Title",
		heading: "Create your account",
		cards: [
			{
				heading: "Quick Sign-up",
				body: "Sign up using your student email in seconds."
			},
			{
				heading: "Verify Email",
				body: "Confirm your identity through a secure link."
			},
			{
				heading: "Set Preferences",
				body: "Customize your profile to get relevant listings."
			}
		]
	},
	{
		title: "Step 2 Title",
		heading: "Search listings",
		cards: [
			{
				heading: "Use Filters",
				body: "Narrow down by price, size, and amenities."
			},
			{
				heading: "Interactive Map",
				body: "View listings by location on the map."
			},
			{
				heading: "Save Favorites",
				body: "Bookmark listings you like to view later."
			}
		]
	},
	{
		title: "Step 3 Title",
		heading: "Apply & communicate",
		cards: [
			{
				heading: "One-click Apply",
				body: "Apply directly within the platform."
			},
			{
				heading: "Secure Messaging",
				body: "Talk to landlords without sharing your personal info."
			},
			{
				heading: "Track Status",
				body: "Know when your application is viewed or accepted."
			}
		]
	},
	{
		title: "Step 4 Title",
		heading: "Secure down‑payment",
		cards: [
			{
				heading: "Reserve Property",
				body: "Lock in your spot with a small deposit."
			},
			{
				heading: "Digital Contract",
				body: "Sign everything online — no printing needed."
			},
			{
				heading: "Get Ready to Move",
				body: "Checklists and reminders to prepare you."
			}
		]
	}
];

export default function Steps() {
	const refs = useRef([]);
	const [maxSeen, setMaxSeen] = useState(-1);

	/* reveal tracker */
	useEffect(() => {
		const io = new IntersectionObserver(
			entries => {
				entries.forEach(e => {
					if (e.isIntersecting) {
						const idx = Number(e.target.dataset.idx);
						setMaxSeen(p => (idx > p ? idx : p));
					}
				});
			},
			{ threshold: 0.5 }
		);
		refs.current.forEach(el => el && io.observe(el));
		return () => refs.current.forEach(el => el && io.unobserve(el));
	}, []);

	/* smooth scroll utility */
	const goTo = idx =>
		refs.current[idx]?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});

	return (
		<div className="w-full">
			<div className="relative mx-auto max-w-7xl lg:flex scroll-smooth">
				{/* LEFT sticky list */}
				{/* LEFT sticky list */}
				{/* LEFT sticky list */}
				<aside
					className="
    lg:w-60 shrink-0 lg:pr-8
    lg:border-r  border-[var(--surface-border)]  /* ← vertical divider */
  "
				>
					{maxSeen >= 0 && (
						<div className="sticky top-24 flex flex-col divide-y divide-[var(--surface-border)]">
							{STEPS.slice(0, maxSeen + 1).map((s, i) => (
								<button
									key={s.title}
									onClick={() => goTo(i)}
									className="
            block w-full text-left
            py-3 px-1 font-semibold
            text-[var(--primary-color)]
            hover:bg-[var(--surface-b)]
            focus:outline-none
          "
								>
									{s.title}
								</button>
							))}
						</div>
					)}
				</aside>

				{/* RIGHT panels */}
				<main className="flex-1 px-6 lg:pl-12">
					{STEPS.map((s, i) => (
						<section
							key={s.title}
							data-idx={i}
							ref={el => (refs.current[i] = el)}
							className="
  min-h-screen flex flex-col
  border-b border-[var(--surface-border)] last:border-b-0
  max-w-7xl mx-auto py-12
"
						>
							{/* Step Heading */}
							<div className="text-center mb-12 mt-6">
								<h2 className="text-3xl md:text-4xl font-extrabold text-[var(--primary-color)]">
									{s.heading}
								</h2>
							</div>

							{/* 2 cards per step */}
							<div className="flex flex-col md:flex-row gap-6 flex-grow">
								{s.cards.slice(0, 2).map(card => (
									<div
										key={card.heading}
										className="
              flex flex-col justify-between
              flex-1 bg-[var(--surface-b)] rounded-xl p-6 shadow-sm
            "
									>
										<div>
											<h3 className="mb-2 font-semibold text-[var(--primary-color)]">
												{card.heading}
											</h3>
											<p className="text-[var(--text-color-secondary)]">
												{card.body}
											</p>
										</div>
									</div>
								))}
							</div>
						</section>
					))}
				</main>
			</div>
		</div>
	);
}
