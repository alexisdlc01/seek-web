import React, { useRef, useEffect, useState } from "react";

const DUMMY_TEXT = `In the heart of a forgotten forest stood a glass greenhouse, untouched by time. Vines crawled its frame, yet inside it flourished with vibrant, impossible flora—flowers that shimmered like stars and leaves that whispered secrets when brushed by wind. No path led to it, and those who stumbled upon it could never retrace their steps. \nLegend told of an old botanist who had vanished after claiming he could grow memories. Some say the plants hold echoes of his life—fragments of love, sorrow, and joy blooming eternally.`;

const STEPS = [
	{
		title: "Step 1 Title",
		heading: "Step 1 Heading",
		cards: [
			{ heading: "Sub Info 1 A", body: DUMMY_TEXT },
			{ heading: "Sub Info 1 B", body: DUMMY_TEXT }
		]
	},
	{
		title: "Step 2 Title",
		heading: "Step 2 Heading",
		cards: [
			{ heading: "Sub Info 2 A", body: DUMMY_TEXT },
			{ heading: "Sub Info 2 B", body: DUMMY_TEXT }
		]
	},
	{
		title: "Step 3 Title",
		heading: "Step 3 Heading",
		cards: [
			{ heading: "Sub Info 3 A", body: DUMMY_TEXT },
			{ heading: "Sub Info 3 B", body: DUMMY_TEXT }
		]
	},
	{
		title: "Step 4 Title",
		heading: "Step 4 Heading",
		cards: [
			{ heading: "Sub Info 4 A", body: DUMMY_TEXT },
			{ heading: "Sub Info 4 B", body: DUMMY_TEXT }
		]
	}
];

export default function Steps() {
	const refs = useRef([]);
	const [maxSeen, setMaxSeen] = useState(-1);

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

	const goTo = idx =>
		refs.current[idx]?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});

	return (
		<div className="w-full">
			<div className="mx-auto max-w-7xl lg:flex scroll-smooth">
				{/* Start of left panel */}
				{/* Start of left panel */}
<aside className="hidden lg:block lg:w-100 shrink-0 lg:pr-8 lg:border-r border-[var(--surface-border)]">
	{maxSeen >= 0 && (
		<div className="sticky top-24 flex flex-col divide-y divide-[var(--surface-border)]">
			{STEPS.slice(0, maxSeen + 1).map((s, i) => (
				<button
					key={s.title}
					onClick={() => goTo(i)}
					className="py-3 px-1 text-left font-semibold text-[var(--primary-color)] hover:bg-[var(--surface-b)] focus:outline-none"
				>
					{s.title}
				</button>
			))}
		</div>
	)}
</aside>


				{/* Start of right panel */}
				<main className="flex-1 px-6 lg:pl-12">
					{STEPS.map((s, i) => (
						<section
							key={s.title}
							data-idx={i}
							ref={el => (refs.current[i] = el)}
							className="min-h-screen flex flex-col border-b border-[var(--surface-border)] last:border-b-0 py-12"
						>
							<div className="text-center mb-12 mt-0">
								<h2 className="text-3xl md:text-4xl font-extrabold text-[var(--primary-color)]">
									{s.heading}
								</h2>
							</div>

							<div className="flex flex-col md:flex-row gap-12 flex-grow">
								{s.cards.map(card => (
									<div
										key={card.heading}
										className="flex flex-col justify-between flex-1 bg-[var(--surface-b)] rounded-xl p-8 shadow-sm"
									>
										<div>
											<h3 className="mb-7 font-semibold text-[var(--primary-color)] text-lg md:text-xl">
												{card.heading}
											</h3>
											<p className="text-[var(--text-color-secondary)] text-base md:text-lg">
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
