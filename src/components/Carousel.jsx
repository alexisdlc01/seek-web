// QuotesCarouselSection.jsx
import {
	motion,
	useAnimationFrame,
	useMotionValue,
	useTransform
} from "framer-motion";

function wrap(min, max, v) {
	const range = max - min;
	return ((((v - min) % range) + range) % range) + min;
}

export default function QuotesCarouselSection() {
	const quotes = [
		"Housing should be as easy as scrolling TikTok.",
		"Only verified landlords. Only serious applications.",
		"Agree & secure your space in days, not months.",
		"SEEK is free for students and landlords.",
		"Complete transparency and control for everyone."
	];

	const base = useMotionValue(0);
	const baseSpeed = 3;

	useAnimationFrame((_, delta) => {
		base.set(base.get() + (baseSpeed * delta) / 1000);
	});

	const x = useTransform(base, v => `${wrap(-100, 0, -v)}%`);

	return (
		<section className="px-6 text-white">
			<div className="max-w-6xl mx-auto">
				<div className="relative overflow-hidden">
					<motion.div
						aria-label="Quotes carousel"
						role="list"
						className="flex gap-12 whitespace-nowrap py-8 md:py-10 will-change-transform"
						style={{ x }}
					>
						{[...Array(2)].map((_, k) => (
							<div key={k} className="flex gap-26">
								{quotes.map((q, i) => (
									<figure
										key={`${k}-${i}`}
										className="shrink-0 w-[18rem] md:w-[20rem] whitespace-normal"
									>
										<blockquote className="text-lg md:text-xl leading-relaxed">
											“{q}”
										</blockquote>
										<figcaption className="mt-3 flex items-center">
											<div className="mr-4">
												<div className="text-sm md:text-base font-semibold">
													Graham Heathcote
												</div>
												<div className="text-xs md:text-sm opacity-70">
													Seek User
												</div>
											</div>
											<div className="h-6 md:h-8 w-px bg-sky-500/80" />
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
