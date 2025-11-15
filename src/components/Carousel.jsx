import {
	motion,
	useAnimationFrame,
	useMotionValue,
	useTransform
} from "framer-motion";
import { useRef, useLayoutEffect, useState } from "react";

function wrap(min, max, v) {
	const range = max - min;
	return ((((v - min) % range) + range) % range) + min;
}

export default function QuotesCarouselSection() {
	const quotes = [
		{
			text: "The old way of searching was a nightmare. Seek is the organized, professional alternative.",
			name: "Hannah",
			role: "3rd year student"
		},
		{
			text: "I’m really looking forward finally having a stress-free house seeking process.",
			name: "Anya",
			role: "2nd year student"
		},
		{
			text: "This app will definitely save us, as students, a lot of time eliminating any stress we ever had.",
			name: "Ethan",
			role: "3rd year student"
		},
		{
			text: "Last year’s system was chaotic, so glad a solution has finally appeared.",
			name: "Ben",
			role: "2nd year student"
		},
		{
			text: "I’m very annoyed that this is my last year and won’t be able to experience Seek.",
			name: "Sarah",
			role: "4th year student"
		},
		{
			text: "Very excited for this idea. Looks like finding housing will be quick and easy.",
			name: "Chloe",
			role: "1st year student"
		},
		{
			text: "Having participated in Seek’s development, this will be a great way for landlords to find reliable tenants.",
			name: "Alexandre",
			role: "Landlord"
		}
	];

	const base = useMotionValue(0);
	const baseSpeed = 60;

	const containerRef = useRef(null);
	const [contentWidth, setContentWidth] = useState(0);

	useLayoutEffect(() => {
		if (containerRef.current) {
			setContentWidth(containerRef.current.scrollWidth / 2);
		}
	}, []);

	useAnimationFrame((_, delta) => {
		base.set(base.get() + (baseSpeed * delta) / 1000);
	});

	const x = useTransform(base, v =>
		contentWidth ? -wrap(0, contentWidth, v) : 0
	);

	return (
		<section className="px-6 text-white">
			<div className="max-w-6xl mx-auto">
				<div className="relative overflow-hidden">
					<motion.div
						ref={containerRef}
						aria-label="Quotes carousel"
						role="list"
						className="flex gap-12 whitespace-nowrap py-8 md:py-10 will-change-transform"
						style={{ x }}
					>
						{[...Array(2)].map((_, k) => (
							<div key={k} className="flex gap-12">
								{quotes.map((q, i) => (
									<figure
										key={`${k}-${i}`}
										className="shrink-0 w-[18rem] md:w-[20rem] whitespace-normal
             flex flex-col justify-between min-h-[128m]"									>
										<blockquote className="text-lg md:text-xl leading-relaxed">
											“{q.text}”
										</blockquote>
										<figcaption className="mt-3 flex justify-end items-center">
											<div className="text-right">
												<div className="text-sm md:text-base font-semibold">
													{q.name}
												</div>
												<div className="text-xs md:text-sm opacity-70">
													{q.role}
												</div>
											</div>
											<div className="h-6 md:h-8 w-px bg-sky-500/80 ml-2" />
										</figcaption>
									</figure>
								))}
							</div>
						))}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
