import { useEffect, useRef } from "react";
import {
	motion,
	useTransform,
	useSpring,
	useMotionTemplate,
	useScroll
} from "framer-motion";

export default function LandingPage() {
	const { scrollY } = useScroll();
	const videoRef = useRef(null);

	// Scroll range
	const BLUR_START = 50;
	const BLUR_END = 300;
	const MAX_BLUR = 12; // px
	const MAX_SCALE = 1.05;
	const MIN_BRIGHTNESS = 0.5;

	// Motion values
	const blurValue = useTransform(
		scrollY,
		[BLUR_START, BLUR_END],
		[0, MAX_BLUR]
	);
	const scaleValue = useTransform(
		scrollY,
		[BLUR_START, BLUR_END],
		[1, MAX_SCALE]
	);
	const brightnessValue = useTransform(
		scrollY,
		[BLUR_START, BLUR_END],
		[1, MIN_BRIGHTNESS]
	);

	const blurSpring = useSpring(blurValue, { stiffness: 80, damping: 20 });
	const scaleSpring = useSpring(scaleValue, { stiffness: 80, damping: 20 });
	const brightnessSpring = useSpring(brightnessValue, {
		stiffness: 80,
		damping: 20
	});

	const filterStyle = useMotionTemplate`blur(${blurSpring}px) brightness(${brightnessSpring})`;

	useEffect(() => {
		const unsubscribe = scrollY.onChange(latest => {
			if (videoRef.current) {
				if (latest > BLUR_END) videoRef.current.pause();
				else videoRef.current.play();
			}
		});
		return () => unsubscribe();
	}, [scrollY]);

	// Text animation transforms
	const section1Opacity = useTransform(scrollY, [0, 300], [1, 0]);
	const section1Y = useTransform(scrollY, [0, 300], [0, -50]);

	const section3Opacity = useTransform(scrollY, [800, 1300], [0, 1]);
	const section3Y = useTransform(scrollY, [800, 1300], [50, 0]);

	const section4Start = 1300;
	const section4End = 1900;

	const section4Scale = useTransform(
		scrollY,
		[section4Start, (section4Start + section4End) / 2, section4End],
		[1, 1.2, 0.5]
	);

	const section4Opacity = useTransform(
		scrollY,
		[section4Start, (section4Start + section4End) / 2, section4End],
		[0, 1, 0]
	);

	const section4X = useTransform(
		scrollY,
		[section4Start, section4End],
		[-100, 0]
	);

	// Blurb 1 – left
	const blurb1Opacity = useTransform(scrollY, [2000, 2200, 2400], [0, 1, 0]);
	const blurb1X = useTransform(scrollY, [2000, 2200], [-200, 0]);

	// Blurb 2 – right
	const blurb2Opacity = useTransform(scrollY, [2500, 2700, 2900], [0, 1, 0]);
	const blurb2X = useTransform(scrollY, [2500, 2700], [200, 0]);

	return (
		<div className="relative h-[300vh] overflow-x-hidden">
			{/* Video Background */}
			<div className="fixed inset-0 z-[-1] overflow-hidden">
				<motion.video
					ref={videoRef}
					autoPlay
					loop
					muted
					playsInline
					className="w-full h-full object-cover"
					style={{
						filter: filterStyle,
						scale: scaleSpring
					}}
				>
					<source src="/dummy_background.mp4" type="video/mp4" />
				</motion.video>
			</div>

			{/* Overlay Sections */}
			<div className="sticky top-0 h-screen flex items-center justify-center">
				<motion.div
					style={{ opacity: section1Opacity, y: section1Y }}
					className="absolute text-white text-center max-w-xl px-4"
				>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							ease: "easeOut",
							delay: 0
						}}
						className="text-5xl font-bold mb-4 drop-shadow-lg"
					>
						One Swipe Closer to Home
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							ease: "easeOut",
							delay: 0.1
						}}
						className="text-xl drop-shadow mb-8"
					>
						Connecting students with trusted landlords in St Andrews
					</motion.p>
					<motion.button
						initial={{ opacity: 0, y: 0 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							ease: "easeOut",
							delay: 0
						}}
						className="mt-4 px-6 py-3 bg-white text-black font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
						onClick={() =>
							window.scrollTo({
								top: window.innerHeight,
								behavior: "smooth"
							})
						}
					>
						↓ Scroll to Learn More
					</motion.button>
				</motion.div>
			</div>

			{/* Section 3 */}
			<div className="sticky top-0 h-screen flex items-center justify-center">
				<motion.div
					style={{ opacity: section3Opacity, y: section3Y }}
					className="absolute text-white text-center max-w-xl px-4"
				>
					<h1 className="text-4xl font-semibold mb-4 drop-shadow-lg">
						Find Your Match
					</h1>
					<p className="text-lg drop-shadow">
						Filter listings by budget, location, and amenities to
						find what suits you.
					</p>
				</motion.div>
			</div>

			{/* Section 4 */}
			<div className="h-screen relative">
				<motion.div
					style={{
						scale: section4Scale,
						opacity: section4Opacity,
						x: section4X,
						transformOrigin: "center"
					}}
					className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center max-w-xl px-4 pointer-events-none"
				>
					<h1 className="text-4xl font-semibold mb-4 drop-shadow-lg">
						Ready to Move In?
					</h1>
					<p className="text-lg drop-shadow">
						Start exploring listings today and secure your new home.
					</p>
				</motion.div>
			</div>
		</div>
	);
}
