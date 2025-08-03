import  { useEffect, useRef } from "react";
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
					<h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
						One Swipe Closer to Home
					</h1>
					<p className="text-xl drop-shadow">
						Connecting students with trusted landlords in St Andrews
					</p>
				</motion.div>
			</div>
		</div>
	);
}
