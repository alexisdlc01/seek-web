import { useRef } from "react";
import {
	motion,
	useTransform,
	useSpring,
	useMotionTemplate,
	useScroll
} from "framer-motion";

export default function ContactPage() {
	const { scrollY } = useScroll();
	const videoRef = useRef(null);

	const BLUR_START = 50;
	const BLUR_END = 300;
	const MAX_BLUR = 12;
	const MAX_SCALE = 1.05;
	const MIN_BRIGHTNESS = 0.5;

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

	const section1Opacity = useTransform(scrollY, [0, 300], [1, 0]);
	const section1Y = useTransform(scrollY, [0, 300], [0, -50]);

	const blur1Opacity = useTransform(scrollY, [600, 900, 1400], [0, 1, 0]);
	const blur1X = useTransform(scrollY, [600, 900], [-100, 0]);

	const blur2Opacity = useTransform(scrollY, [1000, 1300, 1700], [0, 1, 0]);
	const blur2X = useTransform(scrollY, [1000, 1300], [100, 0]);

	const blur3Opacity = useTransform(scrollY, [1500, 1800, 2200], [0, 1, 0]);
	const blur3X = useTransform(scrollY, [1500, 1800], [-100, 0]);

	const greyOverlayOpacity = useTransform(
		scrollY,
		[BLUR_END, BLUR_END + 100],
		[0, 1]
	);

	return (
		<div className="relative h-[400vh] overflow-x-hidden">
			{/* Video Background */}
			<div className="fixed inset-0 z-[-2] overflow-hidden">
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

			{/* Grey Overlay */}
			<motion.div
				className="fixed inset-0 z-[-1] bg-[#0F0F23]"
				style={{ opacity: greyOverlayOpacity }}
			/>

			{/* Tiny Floating Particles (appear over grey background) */}
			<motion.div
				className="fixed inset-0 z-[-1] pointer-events-none"
				style={{ opacity: greyOverlayOpacity }}
			>
				{[...Array(30)].map((_, i) => (
					<motion.div
						key={i}
						style={{
							position: "absolute",
							width: 8,
							height: 8,
							background: "#8B5CF6",
							borderRadius: "50%",
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`
						}}
						animate={{
							y: [0, -100, 0],
							opacity: [0, 1, 0],
							scale: [0.8, 1.2, 0.8]
						}}
						transition={{
							duration: 3 + Math.random() * 2,
							repeat: Infinity,
							delay: Math.random() * 2
						}}
					/>
				))}
			</motion.div>

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
								top: 900,
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
						opacity: blur1Opacity,
						x: blur1X,
						transformOrigin: "left"
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
						opacity: blur2Opacity,
						x: blur2X,
						transformOrigin: "right"
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
						opacity: blur3Opacity,
						x: blur3X,
						transformOrigin: "left"
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
