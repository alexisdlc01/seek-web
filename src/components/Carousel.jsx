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
			text: "Housing should be as easy as scrolling TikTok.",
			name: "Sarah Thompson",
			role: "Student"
		},
		{
			text: "Only verified landlords. Only serious applications.",
			name: "Alexis de La Chapelle",
			role: "Landlord"
		},
		{
			text: "Agree & secure your space in days, not months.",
			name: "James Liu",
			role: "Tenant"
		},
		{
			text: "SEEK is free for students and landlords.",
			name: "Emily Carter",
			role: "Landlord"
		},
		{
			text: "Complete transparency and control for everyone.",
			name: "Michael O’Neill",
			role: "Student"
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
										className="shrink-0 w-[18rem] md:w-[20rem] whitespace-normal"
									>
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
