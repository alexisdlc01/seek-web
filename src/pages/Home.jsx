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

	const section2Opacity = useTransform(scrollY, [300, 800], [0, 1]);
	const section2Y = useTransform(scrollY, [300, 800], [50, 0]);

	const section3Opacity = useTransform(scrollY, [800, 1300], [0, 1]);
	const section3Y = useTransform(scrollY, [800, 1300], [50, 0]);

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

			{/* Section 2 */}
<div className="sticky top-0 h-screen flex items-center justify-center">
	<motion.div
		style={{ opacity: section2Opacity, y: section2Y }}
		className="absolute text-white text-center px-4 max-w-4xl w-full"
	>
		<div className="flex flex-col md:flex-row justify-between items-center gap-8">
			<motion.div
				initial={{ opacity: 0, x: -50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="text-2xl md:text-3xl font-semibold drop-shadow text-left w-full md:w-1/2"
			>
				Looking for your next place to live?
			</motion.div>

			<motion.div
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
				className="text-2xl md:text-3xl font-semibold drop-shadow text-right w-full md:w-1/2"
			>
				Or have a property you want to rent out?
			</motion.div>
		</div>

		{/* Buttons */}
		<div className="mt-12 flex justify-center gap-6">
			<motion.button
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
				className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
			>
				I’m a student
			</motion.button>
			<motion.button
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
				className="px-6 py-3 bg-white text-black font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
			>
				I’m a landlord
			</motion.button>
		</div>
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
		</div>
	);
}
