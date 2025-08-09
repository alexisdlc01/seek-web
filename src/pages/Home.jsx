import { useEffect, useRef, useState } from "react";
import {
	motion,
	useTransform,
	useSpring,
	useMotionTemplate,
	useScroll
} from "framer-motion";
import { useNavbarTheme } from "../context/NavBarThemeContext.jsx";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";

export default function LandingPage() {
	const { scrollY } = useScroll();
	const videoRef = useRef(null);
	const { setTheme } = useNavbarTheme();
	const navigate = useNavigate();

	// —— Global video blur/scale settings ——
	const BLUR_START = 50;
	const BLUR_END = 300;
	const MAX_BLUR = 12;
	const MAX_SCALE = 1.05;
	const MIN_BRIGHTNESS = 0.5;

	// —— Hero section scroll threshold ——
	const HERO_SCROLL_END = 300;

	// —— Side-panel timing ——
	const FADE_IN_DURATION = 300;
	const HOLD_DURATION = 400;
	const GAP_BETWEEN = 200;

	const SECTION_LENGTH = FADE_IN_DURATION + HOLD_DURATION + FADE_IN_DURATION;

	const BLUR1_OFFSET = 500;
	const BLUR2_OFFSET = BLUR1_OFFSET + SECTION_LENGTH + GAP_BETWEEN;
	const BLUR3_OFFSET = BLUR2_OFFSET + SECTION_LENGTH + GAP_BETWEEN;
	const BLUR4_OFFSET = BLUR3_OFFSET + SECTION_LENGTH + GAP_BETWEEN;

	// —— Experiences timing (longer hold) ——
	const EXP_FADE_IN_DURATION = 300;
	const EXP_HOLD_DURATION = 900; // longer stay before fade-out
	const EXP_FADE_OUT_DURATION = 300;
	const EXP_SECTION_LENGTH =
		EXP_FADE_IN_DURATION + EXP_HOLD_DURATION + EXP_FADE_OUT_DURATION;

	const EXP_OFFSET = BLUR4_OFFSET + SECTION_LENGTH + GAP_BETWEEN;

	// —— CTA timing (fade/hold/fade) ——
	const CTA_FADE_IN_DURATION = 300;
	const CTA_HOLD_DURATION = 900; // stays on screen longer
	const CTA_FADE_OUT_DURATION = 300;
	const CTA_SECTION_LENGTH =
		CTA_FADE_IN_DURATION + CTA_HOLD_DURATION + CTA_FADE_OUT_DURATION;

	// start CTA after Experiences
	const CTA_OFFSET = EXP_OFFSET + EXP_SECTION_LENGTH + GAP_BETWEEN;

	// Video filters
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

	const filterStyle = useMotionTemplate`blur(${blurSpring}px) brightness(${brightSpring})`;

	// Scroll spacer to push past all four panels
	const TIMELINE_END = CTA_OFFSET + CTA_SECTION_LENGTH;
	const spacerHeight = TIMELINE_END + 2 * window.innerHeight;

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
	}, [scrollY, setTheme]);

	// Hero section transforms
	const section1Opacity = useTransform(scrollY, [0, HERO_SCROLL_END], [1, 0]);
	const section1Y = useTransform(scrollY, [0, HERO_SCROLL_END], [0, -50]);

	// Utility for each side blur panel
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
		const scale = useTransform(scrollY, [offset, fadeInEnd], [0.8, 1.2]);

		return { opacity, x, rotate, scale };
	};

	const blur1 = makeSection(BLUR1_OFFSET, -100, 0);
	const blur2 = makeSection(BLUR2_OFFSET, 100, 0);
	const blur3 = makeSection(BLUR3_OFFSET, -100, 0);
	const blur4 = makeSection(BLUR4_OFFSET, 100, 0);

	// Experiences panel transforms (centered, transparent)
	const expFadeInEnd = EXP_OFFSET + EXP_FADE_IN_DURATION;
	const expHoldEnd = expFadeInEnd + EXP_HOLD_DURATION;
	const expFadeOutEnd = expHoldEnd + EXP_FADE_OUT_DURATION;

	const ctaFadeInEnd = CTA_OFFSET + CTA_FADE_IN_DURATION;
	const ctaHoldEnd = ctaFadeInEnd + CTA_HOLD_DURATION;
	const ctaFadeOutEnd = ctaHoldEnd + CTA_FADE_OUT_DURATION;

	const ctaOpacity = useTransform(
		scrollY,
		[CTA_OFFSET, ctaFadeInEnd, ctaHoldEnd, ctaFadeOutEnd],
		[0, 1, 1, 0]
	);
	const ctaY = useTransform(scrollY, [CTA_OFFSET, ctaFadeInEnd], [24, 0]);
	const ctaScale = useTransform(
		scrollY,
		[CTA_OFFSET, ctaFadeInEnd],
		[0.96, 1.03]
	);

	const expOpacity = useTransform(
		scrollY,
		[EXP_OFFSET, expFadeInEnd, expHoldEnd, expFadeOutEnd],
		[0, 1, 1, 0]
	);
	const expY = useTransform(scrollY, [EXP_OFFSET, expFadeInEnd], [24, 0]);
	const expScale = useTransform(
		scrollY,
		[EXP_OFFSET, expFadeInEnd],
		[0.94, 1.04]
	);

	// Start CountUp only when experiences panel is active (animates numbers up)
	const [startCounts, setStartCounts] = useState(false);
	useEffect(() => {
		const unsub = scrollY.on("change", v => {
			if (!startCounts && v > EXP_OFFSET + 80 && v < expFadeOutEnd) {
				setStartCounts(true);
			}
		});
		return () => unsub();
	}, [scrollY, startCounts, EXP_OFFSET, expFadeOutEnd]);

	return (
		<div className="relative overflow-x-hidden">
			<div style={{ height: spacerHeight }}>
				{/* Fixed Video Background */}
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
							Connecting students with trusted landlords in St
							Andrews
						</motion.p>

						<div className="flex justify-center gap-4 flex-wrap">
							<motion.div whileHover={{ scale: 1.05 }}>
								<Button
									label="I'm a Student"
									className="!bg-white !text-[var(--primary-color)] !font-bold !px-6 !py-3 !rounded-xl !shadow-none !border-none hover:!opacity-90"
									onClick={() => navigate("/signup/student")}
								/>
							</motion.div>

							<motion.div whileHover={{ scale: 1.05 }}>
								<Button
									label="I'm a Landlord"
									className="!bg-transparent !text-white !font-bold !px-6 !py-3 !rounded-xl !border-2 !border-white/80 hover:!bg-white/10"
									onClick={() => navigate("/signup/landlord")}
								/>
							</motion.div>
						</div>

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
						className="fixed z-0 top-1/2 left-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h1 className="text-xl font-semibold mb-4 drop-shadow-lg">
							Trusted & Relevant Matches Guaranteed
						</h1>

						<p className="text-lg drop-shadow mb-3">
							Our advanced AI-Opimized algorithms and powerful
							filters connect students with their ideal properties
						</p>

						<p className="text-lg drop-shadow mb-3">
							Only serious, high-fit applications reach landlords,
							cutting irrelevant inquiries.
						</p>

						<p className="text-lg drop-shadow mb-3">
							Students engage exclusively with legitimate,
							verified landlords.
						</p>

						<p className="text-lg drop-shadow">
							Every user signs in through a secure process; all
							applications and listings are verified by our team
							before going live.
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
						className="fixed z-0 top-1/2 right-[20%] -translate-y-1/2 text-white text-right max-w-md px-4 pointer-events-none"
					>
						<h1 className="text-xl font-semibold mb-4 drop-shadow-lg">
							Agree & Secure Your Space in Days, Not Months
						</h1>

						<p className="text-lg drop-shadow mb-3">
							Built by students for students, our app speeds up
							the entire housing process through a comprehensive
							and trending user experience.
						</p>

						<p className="text-lg drop-shadow mb-3">
							As a Student, you instantly discover verified
							properties and can apply in seconds with all
							required information ready.
						</p>

						<p className="text-lg drop-shadow">
							As Landlord, you can review complete applications
							quickly, access pre-submitted student details
							instantly, accept tenants faster to reduce vacancy
							periods and boost occupancy rates.
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
						className="fixed z-0 top-1/2 left-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h1 className="text-xl font-semibold mb-4 drop-shadow-lg">
							Completely Free of Charge: SEEK is On Us, For You
						</h1>

						<p className="text-lg drop-shadow mb-3">
							Unlike traditional platforms, SEEK is 100% free of
							charge for everyone.
						</p>

						<p className="text-lg drop-shadow mb-3">
							Students get access to comprehensive, centralized
							listings with no subscription fees.
						</p>

						<p className="text-lg drop-shadow mb-3">
							Landlords and Agencies get powerful, free
							advertising for properties – no listing charges or
							commissions.
						</p>

						<p className="text-lg drop-shadow">
							SEEK is a true win-win that makes the St Andrews
							housing market more accessible and efficient for
							everyone.
						</p>
					</motion.div>
				</div>

				{/* Blur Section 3 – Left */}
				<div className="h-screen relative">
					<motion.div
						style={{
							opacity: blur4.opacity,
							x: blur4.x,
							rotate: blur4.rotate,
							scale: blur4.scale,
							transformOrigin: "right center"
						}}
						className="fixed z-0 top-1/2 right-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h1 className="text-xl font-semibold mb-2 drop-shadow-lg">
							Complete Transparency & Control
						</h1>

						<p className="text-lg drop-shadow mb-4">
							You maintain full control
						</p>

						<p className="text-lg drop-shadow mb-3">
							As a student, you gain unparalleled insight into the
							St Andrews market, browse comprehensive listings
							with direct landlord access, and make confident,
							informed housing decisions.
						</p>

						<p className="text-lg drop-shadow mb-3">
							As a landlord, you retain full autonomy through a
							dedicated management dashboard where you can easily
							manage your listings and track applications while
							communicating directly with tenants.
						</p>

						<p className="text-lg drop-shadow">
							SEEK means clear communication, a smoother process,
							and better outcomes for everyone.
						</p>
					</motion.div>
				</div>

				{/* Experiences Panel — Centered, transparent, longer hold */}
				<div className="h-screen relative">
					<motion.div
						style={{
							opacity: expOpacity,
							y: expY,
							scale: expScale
						}}
						className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center px-6 pointer-events-none"
					>
						<motion.h2
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: "easeOut" }}
							className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg"
						>
							Our Experiences
						</motion.h2>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1, duration: 0.6 }}
							className="text-lg md:text-xl drop-shadow mb-12 max-w-3xl mx-auto"
						>
							Join a growing community of students and landlords
							who trust Seek to deliver the best rental
							experience.
						</motion.p>

						<div className="flex flex-col md:flex-row justify-center gap-y-10 gap-x-16">
							<div>
								<div className="text-6xl font-extrabold">
									{startCounts && (
										<CountUp
											start={0}
											end={50}
											duration={1.4}
											separator=","
										/>
									)}
									+
								</div>
								<p className="mt-2 opacity-90 text-lg">
									Landlords already on Seek
								</p>
							</div>

							<div>
								<div className="text-6xl font-extrabold">
									{startCounts && (
										<CountUp
											start={0}
											end={1000}
											duration={1.6}
											separator=","
										/>
									)}
									+
								</div>
								<p className="mt-2 opacity-90 text-lg">
									New Properties Listed Weekly
								</p>
							</div>

							<div>
								<div className="text-6xl font-extrabold">
									{startCounts && (
										<CountUp
											start={0}
											end={500}
											duration={1.5}
											separator=","
										/>
									)}
									+
								</div>
								<p className="mt-2 opacity-90 text-lg">
									Downloads of the Seek App
								</p>
							</div>
						</div>
					</motion.div>
				</div>

				<div className="h-screen relative">
					<motion.div
						style={{
							opacity: ctaOpacity,
							y: ctaY,
							scale: ctaScale
						}}
						className="fixed z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center px-6 pointer-events-none"
					>
						<motion.h2
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: "easeOut" }}
							className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-lg"
						>
							Ready to Get Started?
						</motion.h2>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1, duration: 0.6 }}
							className="text-xl md:text-2xl opacity-80 drop-shadow mb-12 max-w-3xl mx-auto"
						>
							Join thousands of students and landlords already
							using Seek
						</motion.p>

						<div className="flex justify-center">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.98 }}
								className="!bg-transparent !text-white !font-bold !px-6 !py-3 !rounded-xl !border-2 !border-white/80 hover:!bg-white/10"
								onClick={() => navigate("/signup")}
							>
								Sign up today
							</motion.button>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
