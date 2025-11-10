import { useEffect, useRef, useState, useContext } from "react";
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
import UserContext from "../context/UserContext.jsx";

export default function LandingPage() {
	const { scrollY, scrollYProgress } = useScroll();
	const videoRef = useRef(null);
	const { setTheme } = useNavbarTheme();
	const navigate = useNavigate();
	const { user, logout } = useContext(UserContext);
	const [isLandlord, setIsLandlord] = useState(false);
	const [isStudent, setIsStudent] = useState(false);

	useEffect(() => {
		console.log("User state changed:", user);
		if (user?.role === "LANDLORD_AGENCY") {
			setIsLandlord(true);
		} else {
			setIsLandlord(false);

			if (user?.role === "STUDENT") {
				setIsStudent(true);
			} else {
				setIsStudent(false);
			}
		}
	}, [user]);

	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		setTheme("white");

		const onResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", onResize);

		return () => {
			window.removeEventListener("resize", onResize);
			setTheme("dark");
		};
	}, [setTheme]);

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
	const HOLD_DURATION = 200;
	const GAP_BETWEEN = -300;

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
						className="text-white text-center max-w-xl px-4 space-y-8"
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

						{!user && (
							<div className="flex justify-center gap-4 flex-wrap pb-15">
								<motion.div whileHover={{ scale: 1.05 }}>
									<Button
										size="small"
										label="I'm a Student"
										className="equal-btn student"
										onClick={() =>
											navigate("/signup/student")
										}
									/>
								</motion.div>

								<motion.div whileHover={{ scale: 1.05 }}>
									<Button
										size="small"
										label="I'm a Landlord"
										className="equal-btn landlord"
										onClick={() =>
											navigate("/signup/landlord")
										}
									/>
								</motion.div>
							</div>
						)}

						{/* Centered Arrow */}
						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{
								duration: 0.8,
								ease: "easeOut",
								delay: 0.2
							}}
							className="cursor-pointer mx-auto w-12 h-12 flex items-center justify-center bg-white text-black text-2xl font-semibold rounded-full shadow-lg hover:bg-gray-200 transition"
							onClick={() =>
								window.scrollTo({
									top: BLUR1_OFFSET + 500,
									behavior: "smooth"
								})
							}
						>
							↓
						</motion.button>
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
							Our AI-optimized system, combined with powerful
							filters, precisely matches students with their ideal
							properties.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							This ensures landlords receive only highly relevant
							inquiries, drastically reducing wasted time.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Students connect exclusively with verified,
							legitimate landlords.
						</p>

						<p className="text-base md:text-lg drop-shadow">
							To guarantee this safe environment, every user
							completes a secure sign-in process, and all listings
							are thoroughly checked by our team before going live
							on the platform.
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
						className="fixed z-0 top-1/2 right-[20%] -translate-y-1/2 text-white text-left max-w-md px-4 pointer-events-none"
					>
						<h2 className="text-xl md:text-2xl font-bold mb-6 drop-shadow-lg">
							Agree & Secure Your Space in Days, Not Months
						</h2>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Tired of the endless housing hunt? Our data shows
							36% of students currently take over a month to sign
							leases.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							SEEK speeds up the entire process. Students can
							discover and apply for properties instantly with our
							app made for students, by students.
						</p>

						<p className="text-base md:text-lg drop-shadow">
							Landlords can quickly review applications, access
							uploaded student information requested prior to the
							application, and accept tenants with unprecedented
							efficiency, boosting occupancy rates.
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
							Unlike traditional platforms, SEEK is completely
							free for both students and landlords.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Students get access to comprehensive, centralized
							listings without any subscription fees.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Landlords and agencies receive powerful, free
							advertisement for their properties, reaching a
							dedicated student audience without any listing
							charges or commissions.
						</p>

						<p className="text-base md:text-lg drop-shadow">
							It’s a win-win, designed to make the St Andrews
							market more accessible and efficient for everyone.
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
							SEEK puts you in control.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Students gain unparalleled insight into the St
							Andrews market with comprehensive listings and
							direct access to landlords, helping them make
							informed decisions.
						</p>

						<p className="text-base md:text-lg drop-shadow mb-4">
							Landlords maintain full autonomy over their letting
							process, with a dedicated dashboard to manage
							listings, track application, and communicate
							directly with tenants.
						</p>

						<p className="text-base md:text-lg drop-shadow">
							Our platform fosters clear, direct communication and
							a smoother process for everyone
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
					Seek in Numbers
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
					className="flex flex-col md:flex-row justify-center gap-y-10 gap-x-16 text-[#21b9c4]"
					onFocus={() => setStartCounts(true)}
					onMouseEnter={() => setStartCounts(true)}
				>
					<div>
						<div className="text-5xl font-extrabold">
							{startCounts ? (
								<CountUp
									start={0}
									end={100}
									duration={1.4}
									separator=","
								/>
							) : (
								0
							)}
							+
						</div>
						<p className="mt-2 opacity-90 text-lg md:text-xl">
							Users on Seek
						</p>
					</div>

					<div>
						<div className="text-5xl font-extrabold">
							{startCounts ? (
								<CountUp
									start={0}
									end={300}
									duration={1.6}
									separator=","
								/>
							) : (
								0
							)}
							+
						</div>
						<p className="mt-2 opacity-90 text-lg md:text-xl">
							Properties Listed
						</p>
					</div>

					<div>
						<div className="text-5xl font-extrabold">
							{startCounts ? (
								<CountUp
									start={0}
									end={35}
									duration={1.5}
									separator=","
								/>
							) : (
								0
							)}
						</div>
						<p className="mt-2 opacity-90 text-lg md:text-xl">
							Days untill app launch
						</p>
					</div>
				</motion.div>
			</section>

			<motion.section
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="px-6 text-white"
			>
				<div className="max-w-6xl mx-auto">
					<div className="max-w-6xl mx-auto flex justify-center items-center text-center px-6">
						{/* Quote */}
						<div className="text-white max-w-3xl">
							<div className="text-[#21b9c4] text-9xl font-bold leading-none mb-[-40px]">
								“
							</div>

							<p className="text-4xl font-bold leading-snug mt-0">
								Housing is the biggest stress students shouldn’t
								have to carry. Our first priority is to lift it.
							</p>

							<p className="mt-6 text-4xl font-bold leading-snug">
								At Seek, we replace luck with{" "}
								<span style={{ color: "#21b9c4" }}>choice</span>
								.”
							</p>

							<p className="mt-6 text-lg text-white/90">
								Victor Trinel and Alexis de La Chapelle,{" "}
								<span
									style={{
										color: "#21b9c4",
										display: "block"
									}}
								>
									Co-founders
								</span>
							</p>
						</div>
					</div>
				</div>
			</motion.section>

			<div className="h-30" />
			<h2 className="text-2xl md:text-4xl font-bold mb-10 max-w-6xl mx-auto">
				Hear from our Partners & Customers
			</h2>
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
					{isLandlord
						? "Add a listing to get started today."
						: isStudent
							? "Join our mailing list today."
							: "Join thousands of students and landlords already using Seek."}
				</motion.p>

				<div className="flex justify-center">
					{!user ? (
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="Sign Up Today"
								className="equal-btn student"
								onClick={() =>
									window.scrollTo({
										top: 0,
										behavior: "smooth"
									})
								}
							/>
						</motion.div>
					) : isStudent ? (
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="Go to Download"
								className="equal-btn student"
								onClick={() => navigate("/download")}
							/>
						</motion.div>
					) : isLandlord ? (
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="Go to Dashboard"
								className="equal-btn landlord"
								onClick={() => navigate("/dashboard")}
							/>
						</motion.div>
					) : null}
				</div>
			</section>

			<div className="h-30" />
		</div>
	);
}
