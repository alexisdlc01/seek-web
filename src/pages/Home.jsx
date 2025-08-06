import { useEffect, useRef } from "react";
import {
	motion,
	useTransform,
	useSpring,
	useMotionTemplate,
	useScroll
} from "framer-motion";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";

export default function LandingPage() {
	const { scrollY } = useScroll();
	const videoRef = useRef(null);
	const { setTheme } = useNavbarTheme();

	// —— Global video blur/scale settings ——
	const BLUR_START = 50;
	const BLUR_END = 300;
	const MAX_BLUR = 12;
	const MAX_SCALE = 1.05;
	const MIN_BRIGHTNESS = 0.5;

	// —— Hero section scroll threshold ——
	const HERO_SCROLL_END = 300;

	// —— Blur animation timing ——
	const FADE_IN_DURATION = 300; // px to fade-in
	const HOLD_DURATION = 400; // px to hold

	// —— Per-section starting offsets ——
	const BLUR1_OFFSET = 500;
	const BLUR2_OFFSET = 1100;
	const BLUR3_OFFSET = 1700;

	// springify the video filters
	const blurValue = useTransform(
		scrollY,
		[BLUR_START, BLUR_END],
		[0, MAX_BLUR]
	);
	const scaleValueVid = useTransform(
		scrollY,
		[BLUR_START, BLUR_END],
		[1, MAX_SCALE]
	);
	const brightValue = useTransform(
		scrollY,
		[BLUR_START, BLUR_END],
		[1, MIN_BRIGHTNESS]
	);

	const blurSpring = useSpring(blurValue, { stiffness: 80, damping: 20 });
	const scaleSpringVid = useSpring(scaleValueVid, {
		stiffness: 80,
		damping: 20
	});
	const brightSpring = useSpring(brightValue, { stiffness: 80, damping: 20 });

	const filterStyle = useMotionTemplate`
    blur(${blurSpring}px) brightness(${brightSpring})
  `;

	useEffect(() => {
		const unsub = scrollY.onChange(latest => {
			if (!videoRef.current) return;
			if (latest > BLUR_END) {
				videoRef.current.pause();
				setTheme("dark");
			} else {
				videoRef.current.play();
				setTheme("white");
			}
		});
		return () => unsub();
	}, [scrollY]);

	// Hero section transforms
	const section1Opacity = useTransform(scrollY, [0, HERO_SCROLL_END], [1, 0]);
	const section1Y = useTransform(scrollY, [0, HERO_SCROLL_END], [0, -50]);

	// Utility to build each blur section’s timing + rotation + scale
	const makeSection = (offset, xFrom, xTo) => {
		const fadeInEnd = offset + FADE_IN_DURATION;
		const holdEnd = fadeInEnd + HOLD_DURATION;
		const fadeOutEnd = holdEnd + FADE_IN_DURATION;

		const opacity = useTransform(
			scrollY,
			[offset, fadeInEnd, holdEnd, fadeOutEnd],
			[0, 1, 1, 0]
		);
		const x = useTransform(scrollY, [offset, fadeInEnd], [xFrom, xTo]);
		const rotate = useTransform(scrollY, [offset, fadeInEnd], [6, 0]);
		const scale = useTransform(scrollY, [offset, fadeInEnd], [0.8, 1]);

		return { opacity, x, rotate, scale };
	};

	const blur1 = makeSection(BLUR1_OFFSET, -100, 0);
	const blur2 = makeSection(BLUR2_OFFSET, 100, 0);
	const blur3 = makeSection(BLUR3_OFFSET, -100, 0);

	return (
		<div className="relative h-[500vh] overflow-x-hidden">
			{/* Videix Background */}
			<div className="fixed inset-0 z-[-1] overflow-hidden">
				<motion.video
					ref={videoRef}
					autoPlay
					loop
					muted
					playsInline
					className="w-full h-full object-cover"
					style={{ filter: filterStyle, scale: scaleSpringVid }}
				>
					<source src="/dummy_background.mp4" type="video/mp4" />
				</motion.video>
			</div>

			{/* Hero Section */}
			<div className="sticky top-0 h-screen flex items-center justify-center">
				<motion.div
					style={{ opacity: section1Opacity, y: section1Y }}
					className="absolute text-white text-center max-w-xl px-4"
				>
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
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
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{
							duration: 0.8,
							ease: "easeOut",
							delay: 0.2
						}}
						className="mt-4 px-6 py-3 bg-white text-black font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
						onClick={() =>
							window.scrollTo({
								top: BLUR1_OFFSET,
								behavior: "smooth"
							})
						}
					>
						↓ Scroll to Learn More
					</motion.button>
				</motion.div>
			</div>

			{/* Blur Section 1 – Left */}
			<div className="h-screen relative">
				<motion.div
					style={{
						opacity: blur1.opacity,
						x: blur1.x,
						rotate: blur1.rotate,
						scale: blur1.scale,
						transformOrigin: "left center"
					}}
					className="fixed top-1/2 left-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
				>
					<h1 className="text-xl font-semibold mb-4 drop-shadow-lg">
						Ready to Move In?
					</h1>
					<p className="text-lg drop-shadow">
						Start exploring listings today and secure your new home
						with confidence. Every property is hand-checked, and
						listings update in real-time as availability changes.
					</p>
				</motion.div>
			</div>

			{/* Blur Section 2 – Right */}
			<div className="h-screen relative">
				<motion.div
					style={{
						opacity: blur2.opacity,
						x: blur2.x,
						rotate: blur2.rotate,
						scale: blur2.scale,
						transformOrigin: "right center"
					}}
					className="fixed top-1/2 right-[20%] -translate-y-1/2 text-white text-right max-w-md px-4 pointer-events-none"
				>
					<h1 className="text-xl font-semibold mb-4 drop-shadow-lg">
						Only Real Listings
					</h1>
					<p className="text-lg drop-shadow">
						We eliminate scams and outdated posts, showing you only
						what’s genuinely available. Our moderation team actively
						reviews every listing so you don't waste time.
					</p>
				</motion.div>
			</div>

			{/* Blur Section 3 – Left */}
			<div className="h-screen relative">
				<motion.div
					style={{
						opacity: blur3.opacity,
						x: blur3.x,
						rotate: blur3.rotate,
						scale: blur3.scale,
						transformOrigin: "left center"
					}}
					className="fixed top-1/2 left-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
				>
					<h1 className="text-xl font-semibold mb-4 drop-shadow-lg">
						Instant Apply
					</h1>
					<p className="text-lg drop-shadow">
						No more endless paperwork. Tap once to apply, attach
						your details, and receive confirmation directly. It’s
						that simple — moving in has never been faster.
					</p>
				</motion.div>
			</div>
		</div>
	);
}
