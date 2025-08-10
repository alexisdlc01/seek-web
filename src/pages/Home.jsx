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
import Carousel from "../components/Carousel.jsx";

export default function LandingPage() {
	const { scrollY, scrollYProgress } = useScroll();
	const videoRef = useRef(null);
	const { setTheme } = useNavbarTheme();
	const navigate = useNavigate();

	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	useEffect(() => {
		const onResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

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
	const GAP_BETWEEN = -200;

	const SECTION_LENGTH = FADE_IN_DURATION + HOLD_DURATION + FADE_IN_DURATION;

	const BLUR1_OFFSET = 500;
	const BLUR2_OFFSET = BLUR1_OFFSET + SECTION_LENGTH + GAP_BETWEEN;
	const BLUR3_OFFSET = BLUR2_OFFSET + SECTION_LENGTH + GAP_BETWEEN;
	const BLUR4_OFFSET = BLUR3_OFFSET + SECTION_LENGTH + GAP_BETWEEN;

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

	const makeSection = (offset, xFrom, xTo) => {
		const fadeInEnd = offset + FADE_IN_DURATION;
		const holdEnd = fadeInEnd + HOLD_DURATION;
		const fadeOutEnd = holdEnd + FADE_IN_DURATION;

		const opacity = useTransform(
			scrollY,
			[offset, fadeInEnd, holdEnd, fadeOutEnd],
			[0, 1, 1, 0]
		);

		const x = isMobile
			? useTransform(scrollY, [0, 1], [0, 0])
			: useTransform(scrollY, [offset, fadeInEnd], [xFrom, xTo]);

		const scale = isMobile
			? useTransform(scrollY, [0, 1], [1, 1])
			: useTransform(scrollY, [offset, fadeInEnd], [0.9, 1.1]);

		return { opacity, x, scale };
	};

	const blurSpring = useSpring(blurValue, { stiffness: 80, damping: 20 });
	const scaleSpringVid = useSpring(scaleValueVid, {
		stiffness: 80,
		damping: 20
	});
	const brightSpring = useSpring(brightValue, { stiffness: 80, damping: 20 });

	const filterStyle = useMotionTemplate`blur(${blurSpring}px) brightness(${brightSpring})`;

	// Stop the scrollytelling after blur4
	const TIMELINE_END = BLUR4_OFFSET + SECTION_LENGTH;
	const spacerHeight = TIMELINE_END + window.innerHeight * 0.6;

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

	const blur1 = makeSection(BLUR1_OFFSET, -100, 0);
	const blur2 = makeSection(BLUR2_OFFSET, 100, 0);
	const blur3 = makeSection(BLUR3_OFFSET, -100, 0);
	const blur4 = makeSection(BLUR4_OFFSET, 100, 0);

	// Progress bar
	const progressX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	});

	// CountUp trigger (no scroll math; set once when section comes into view/hover/focus)
	const [startCounts, setStartCounts] = useState(false);

	return (
		<div className="relative overflow-x-hidden">
			<motion.div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: 4,
					background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
					zIndex: 50,
					transformOrigin: "left",
					scaleX: progressX
				}}
			/>

			{/* Scrollytelling container (video + hero + blur1..4) */}
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
							className="text-lg md:text-xl drop-shadow mb-8"
						>
							Connecting students with trusted landlords in St
							Andrews
						</motion.p>

						<div className="flex justify-center gap-4 flex-wrap">
							<motion.div whileHover={{ scale: 1.05 }}>
								<Button
									label="I'm a Student"
									className="equal-btn student"
									onClick={() => navigate("/signup/student")}
								/>
							</motion.div>

							<motion.div whileHover={{ scale: 1.05 }}>
								<Button
									label="I'm a Landlord"
									className="equal-btn landlord"
									onClick={() => navigate("/signup/landlord")}
								/>
							</motion.div>
						</div>
					</motion.div>
				</div>

				{/* Blur Section 1 – Left */}
				<div className="h-screen relative">
					<motion.div
						style={{
							opacity: blur1.opacity,
							x: blur1.x,
							scale: blur1.scale,
							transformOrigin: "left center"
						}}
						className="fixed z-0 top-1/2 left-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h2 className="text-xl md:text-2xl font-bold mb-6 drop-shadow-lg">
							Trusted & Relevant Matches Guaranteed
						</h2>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Our advanced AI-Opimized algorithms and powerful
							filters connect students with their ideal properties
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Only serious, high-fit applications reach landlords,
							cutting irrelevant inquiries.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Students engage exclusively with legitimate,
							verified landlords.
						</p>

						<p className="text-base md:text-lg drop-shadow">
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
							scale: blur2.scale,
							transformOrigin: "right center"
						}}
						className="fixed z-0 top-1/2 right-[20%] -translate-y-1/2 text-white text-right max-w-md px-4 pointer-events-none"
					>
						<h2 className="text-xl md:text-2xl font-bold mb-6 drop-shadow-lg">
							Agree & Secure Your Space in Days, Not Months
						</h2>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Built by students for students, our app speeds up
							the entire housing process through a comprehensive
							and trending user experience.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							As a Student, you instantly discover verified
							properties and can apply in seconds with all
							required information ready.
						</p>

						<p className="text-base md:text-lg drop-shadow">
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
							scale: blur3.scale,
							transformOrigin: "left center"
						}}
						className="fixed z-0 top-1/2 left-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h2 className="text-xl md:text-2xl font-bold mb-6 drop-shadow-lg">
							Completely Free of Charge: SEEK is On Us, For You
						</h2>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Unlike traditional platforms, SEEK is 100% free of
							charge for everyone.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Students get access to comprehensive, centralized
							listings with no subscription fees.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Landlords and Agencies get powerful, free
							advertising for properties – no listing charges or
							commissions.
						</p>

						<p className="text-base md:text-lg drop-shadow">
							SEEK is a true win-win that makes the St Andrews
							housing market more accessible and efficient for
							everyone.
						</p>
					</motion.div>
				</div>

				{/* Blur Section 4 – Right */}
				<div className="h-screen relative">
					<motion.div
						style={{
							opacity: blur4.opacity,
							x: blur4.x,
							scale: blur4.scale,
							transformOrigin: "right center"
						}}
						className="fixed z-0 top-1/2 right-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h2 className="text-xl md:text-2xl font-bold mb-6 drop-shadow-lg">
							Complete Transparency & Control
						</h2>

						<p className="text-base md:text-lg drop-shadow mb-4">
							You maintain full control
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							As a student, you gain unparalleled insight into the
							St Andrews market, browse comprehensive listings
							with direct landlord access, and make confident,
							informed housing decisions.
						</p>

						<p className="text-base md:text-lg drop-shadow">
							As a landlord, you retain full autonomy through a
							dedicated management dashboard where you can easily
							manage your listings and track applications while
							communicating directly with tenants.
						</p>
					</motion.div>
				</div>
			</div>

			{/* Normal page content starts here */}
			<section className="relative py-24 text-white text-center px-6">
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg"
				>
					Our Experiences
				</motion.h2>

				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ delay: 0.1, duration: 0.6 }}
					className="text-lg md:text-xl drop-shadow mb-12 max-w-3xl mx-auto"
				>
					Join a growing community of students and landlords who trust
					Seek to deliver the best rental experience.
				</motion.p>

				<motion.div
					onViewportEnter={() => setStartCounts(true)}
					viewport={{ once: true, amount: 0.4 }}
					className="flex flex-col md:flex-row justify-center gap-y-10 gap-x-16"
					onFocus={() => setStartCounts(true)}
					onMouseEnter={() => setStartCounts(true)}
				>
					<div>
						<div className="text-6xl font-extrabold">
							{startCounts ? (
								<CountUp
									start={0}
									end={50}
									duration={1.4}
									separator=","
								/>
							) : (
								0
							)}
							+
						</div>
						<p className="mt-2 opacity-90 text-lg md:text-xl">
							Landlords already on Seek
						</p>
					</div>

					<div>
						<div className="text-6xl font-extrabold">
							{startCounts ? (
								<CountUp
									start={0}
									end={1000}
									duration={1.6}
									separator=","
								/>
							) : (
								0
							)}
							+
						</div>
						<p className="mt-2 opacity-90 text-lg md:text-xl">
							New Properties Listed Weekly
						</p>
					</div>

					<div>
						<div className="text-6xl font-extrabold">
							{startCounts ? (
								<CountUp
									start={0}
									end={500}
									duration={1.5}
									separator=","
								/>
							) : (
								0
							)}
							+
						</div>
						<p className="mt-2 opacity-90 text-lg md:text-xl">
							Downloads of the Seek App
						</p>
					</div>
				</motion.div>
			</section>

			<div className="h-30" />

			<motion.section
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="px-6 text-white"
			>
				<div className="max-w-6xl mx-auto">
					<h2 className="text-2xl md:text-4xl font-bold mb-10">
						Discover Seek in X minutes
					</h2>

					<div className="grid md:grid-cols-2 gap-10 items-center">
						{/* Placeholder “video” (replace with your <video> later) */}
						<div className="w-full">
							<div className="relative aspect-video rounded-2xl bg-neutral-400/60">
								{/* simple play badge */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center">
										<svg
											width="28"
											height="28"
											viewBox="0 0 24 24"
											fill="currentColor"
											className="text-black/80"
										>
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</div>
							</div>
						</div>

						{/* Quote */}
						<div>
							<p className="text-2xl md:text-3xl font-semibold leading-snug opacity-95">
								“Housing should be as easy as scrolling TikTok —
								that’s what Seek is here to fix.”
							</p>
							<p className="mt-6 text-xl opacity-90">
								Victor Trinel and Alexis de La Chapelle,
								Co-founders
							</p>
						</div>
					</div>
				</div>
			</motion.section>

			<div className="h-10" />
			<Carousel />
			<div className="h-30" />

			{/* Ready to Get Started? */}
			<section className="relative py-24 text-white text-center px-6">
				<motion.h2
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg"
				>
					Ready to Get Started?
				</motion.h2>

				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ delay: 0.1, duration: 0.6 }}
					className="text-lg md:text-xl opacity-80 drop-shadow mb-12 max-w-3xl mx-auto"
				>
					Join thousands of students and landlords already using Seek
				</motion.p>

				<div className="flex justify-center">
					<motion.div whileHover={{ scale: 1.05 }}>
						<Button
							label="Sign Up as a Landlord"
							className="equal-btn student"
							onClick={() => navigate("/signup/student")}
						/>
					</motion.div>
				</div>
			</section>

			<div className="h-30" />
		</div>
	);
}
