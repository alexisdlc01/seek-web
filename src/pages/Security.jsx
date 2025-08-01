import {
	motion,
	useScroll,
	useTransform,
	useSpring,
	useInView
} from "framer-motion";
import { useRef } from "react";

const AnimatedSection = ({ children, style = {} }) => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, amount: 0.3 });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 100 }}
			animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			style={style}
		>
			{children}
		</motion.div>
	);
};

const FloatingOrb = ({ delay = 0, size = 128 }) => {
	return (
		<motion.div
			style={{
				width: size,
				height: size,
				borderRadius: "50%",
				background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
				opacity: 0.2,
				filter: "blur(40px)",
				position: "absolute"
			}}
			animate={{
				x: [0, 100, -50, 0],
				y: [0, -100, 50, 0],
				scale: [1, 1.2, 0.8, 1]
			}}
			transition={{
				duration: 20,
				delay,
				repeat: Infinity,
				ease: "linear"
			}}
		/>
	);
};

const ParallaxText = ({ children, speed = 1 }) => {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"]
	});

	const y = useTransform(scrollYProgress, [0, 1], [0, speed * -300]);

	return (
		<motion.div ref={ref} style={{ y }}>
			{children}
		</motion.div>
	);
};

const Index = () => {
	const containerRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"]
	});

	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	});

	const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
	const textOpacity = useTransform(
		smoothProgress,
		[0, 0.2, 0.8, 1],
		[1, 0.8, 0.3, 0]
	);

	return (
		<div
			ref={containerRef}
			style={{
				position: "relative",
				minHeight: "100vh",
				background: "#0f0f23",
				overflow: "hidden"
			}}
		>
			{/* Progress Bar */}
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
					scaleX: smoothProgress
				}}
			/>

			{/* Hero Section */}
			<section
				style={{
					position: "relative",
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center"
				}}
			>
				<motion.div
					style={{
						textAlign: "center",
						padding: "0 24px",
						opacity: textOpacity
					}}
				>
					<motion.h1
						style={{
							fontSize: "4rem",
							fontWeight: "bold",
							background:
								"linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							color: "transparent",
							marginBottom: "2rem",
							"@media (min-width: 768px)": {
								fontSize: "6rem"
							}
						}}
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 1, ease: "easeOut" }}
					>
						Cosmic
					</motion.h1>
					<motion.p
						style={{
							fontSize: "1.25rem",
							color: "#94a3b8",
							maxWidth: "42rem",
							margin: "0 auto",
							"@media (min-width: 768px)": {
								fontSize: "1.5rem"
							}
						}}
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 1, delay: 0.5 }}
					>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit,
						sed do eiusmod tempor incididunt ut labore et dolore
						magna aliqua.
					</motion.p>
				</motion.div>

				{/* Animated Particles */}
				<div
					style={{
						position: "absolute",
						inset: 0,
						pointerEvents: "none"
					}}
				>
					{[...Array(20)].map((_, i) => (
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
								scale: [0, 1, 0]
							}}
							transition={{
								duration: 3 + Math.random() * 2,
								repeat: Infinity,
								delay: Math.random() * 2
							}}
						/>
					))}
				</div>
			</section>

			{/* Morphing Cards Section */}
			<AnimatedSection style={{ padding: "8rem 1.5rem" }}>
				<div style={{ maxWidth: "72rem", margin: "0 auto" }}>
					<ParallaxText speed={0.5}>
						<h2
							style={{
								fontSize: "3rem",
								fontWeight: "bold",
								textAlign: "center",
								marginBottom: "4rem",
								background:
									"linear-gradient(135deg, #8B5CF6, #06B6D4)",
								backgroundClip: "text",
								WebkitBackgroundClip: "text",
								color: "transparent"
							}}
						>
							Morphing Elements
						</h2>
					</ParallaxText>

					<div
						style={{
							display: "grid",
							gridTemplateColumns:
								"repeat(auto-fit, minmax(300px, 1fr))",
							gap: "2rem"
						}}
					>
						{[1, 2, 3].map(i => (
							<motion.div
								key={i}
								style={{
									position: "relative",
									cursor: "pointer"
								}}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<motion.div
									style={{
										background: "#1e1e2e",
										border: "1px solid #374151",
										borderRadius: "0.75rem",
										padding: "2rem",
										boxShadow:
											"0 25px 50px -12px rgba(0, 0, 0, 0.25)"
									}}
									whileHover={{
										boxShadow:
											"0 0 40px rgba(139, 92, 246, 0.4)",
										borderColor: "#8B5CF6"
									}}
									transition={{ duration: 0.3 }}
								>
									<motion.div
										style={{
											width: "4rem",
											height: "4rem",
											background:
												"linear-gradient(135deg, #06B6D4, #8B5CF6)",
											borderRadius: "0.5rem",
											marginBottom: "1.5rem",
											margin: "0 auto 1.5rem auto"
										}}
										whileHover={{ rotate: 360 }}
										transition={{ duration: 0.6 }}
									/>
									<h3
										style={{
											fontSize: "1.5rem",
											fontWeight: "600",
											marginBottom: "1rem",
											textAlign: "center",
											color: "#f8fafc"
										}}
									>
										Feature {i}
									</h3>
									<p
										style={{
											color: "#94a3b8",
											textAlign: "center"
										}}
									>
										Ut enim ad minim veniam, quis nostrud
										exercitation ullamco laboris nisi ut
										aliquip ex ea commodo consequat.
									</p>
								</motion.div>
							</motion.div>
						))}
					</div>
				</div>
			</AnimatedSection>

			

			{/* Wave Animation Section */}
			<AnimatedSection style={{ padding: "8rem 1.5rem" }}>
				<div style={{ maxWidth: "72rem", margin: "0 auto" }}>
					<ParallaxText speed={-0.3}>
						<h2
							style={{
								fontSize: "3rem",
								fontWeight: "bold",
								textAlign: "center",
								marginBottom: "4rem",
								color: "#f8fafc"
							}}
						>
							Wave Dynamics
						</h2>
					</ParallaxText>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(50, 1fr)",
							gap: "0.5rem",
							height: "16rem",
							alignItems: "end"
						}}
					>
						{[...Array(50)].map((_, i) => (
							<motion.div
								key={i}
								style={{
									background:
										"linear-gradient(135deg, #8B5CF6, #06B6D4)",
									borderRadius: "0.5rem 0.5rem 0 0"
								}}
								animate={{
									height: [
										20,
										100 + Math.sin(i * 0.5) * 50,
										20
									]
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									delay: i * 0.1,
									ease: "easeInOut"
								}}
							/>
						))}
					</div>

					<motion.p
						style={{
							textAlign: "center",
							color: "#94a3b8",
							marginTop: "4rem",
							fontSize: "1.125rem",
							maxWidth: "48rem",
							margin: "4rem auto 0"
						}}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						transition={{ duration: 1 }}
					>
						Sed ut perspiciatis unde omnis iste natus error sit
						voluptatem accusantium doloremque laudantium, totam rem
						aperiam, eaque ipsa quae ab illo inventore veritatis et
						quasi architecto beatae vitae dicta sunt explicabo.
					</motion.p>
				</div>
			</AnimatedSection>

			{/* Magnetic Grid Section */}
			<AnimatedSection style={{ padding: "8rem 1.5rem" }}>
				<div style={{ maxWidth: "56rem", margin: "0 auto" }}>
					<h2
						style={{
							fontSize: "3rem",
							fontWeight: "bold",
							textAlign: "center",
							marginBottom: "4rem",
							background:
								"radial-gradient(ellipse at center, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							color: "transparent"
						}}
					>
						Magnetic Grid
					</h2>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(6, 1fr)",
							gap: "1rem"
						}}
					>
						{[...Array(36)].map((_, i) => (
							<motion.div
								key={i}
								style={{
									aspectRatio: "1",
									background: "#06B6D4",
									borderRadius: "0.5rem",
									cursor: "pointer"
								}}
								whileHover={{
									scale: 1.2,
									zIndex: 10,
									boxShadow: "0 0 30px rgba(6, 182, 212, 0.6)"
								}}
								whileTap={{ scale: 0.9 }}
								animate={{
									rotate: [0, 180, 360]
								}}
								transition={{
									rotate: {
										duration: 10 + (i % 5),
										repeat: Infinity,
										ease: "linear"
									}
								}}
							/>
						))}
					</div>
				</div>
			</AnimatedSection>

			{/* Final CTA Section */}
			<AnimatedSection style={{ padding: "8rem 1.5rem" }}>
				<div
					style={{
						maxWidth: "56rem",
						margin: "0 auto",
						textAlign: "center"
					}}
				>
					<motion.h2
						style={{
							fontSize: "4rem",
							fontWeight: "bold",
							marginBottom: "2rem",
							background:
								"linear-gradient(90deg, #8B5CF6, #06B6D4, #8B5CF6)",
							backgroundSize: "200% 200%",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent"
						}}
						animate={{
							backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
						}}
						transition={{ duration: 5, repeat: Infinity }}
					>
						Infinite Possibilities
					</motion.h2>

					<motion.p
						style={{
							fontSize: "1.25rem",
							color: "#94a3b8",
							marginBottom: "3rem",
							maxWidth: "42rem",
							margin: "0 auto 3rem"
						}}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
					>
						Neque porro quisquam est, qui dolorem ipsum quia dolor
						sit amet, consectetur, adipisci velit, sed quia non
						numquam eius modi tempora incidunt ut labore et dolore
						magnam aliquam quaerat voluptatem.
					</motion.p>

					<motion.button
						style={{
							padding: "1rem 3rem",
							background:
								"linear-gradient(135deg, #8B5CF6, #06B6D4)",
							color: "#ffffff",
							borderRadius: "9999px",
							fontSize: "1.125rem",
							fontWeight: "600",
							border: "none",
							cursor: "pointer",
							boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)"
						}}
						whileHover={{
							scale: 1.05,
							boxShadow: "0 0 60px rgba(139, 92, 246, 0.5)"
						}}
						whileTap={{ scale: 0.95 }}
						animate={{
							boxShadow: [
								"0 0 20px rgba(139, 92, 246, 0.3)",
								"0 0 40px rgba(139, 92, 246, 0.5)",
								"0 0 20px rgba(139, 92, 246, 0.3)"
							]
						}}
						transition={{
							boxShadow: { duration: 2, repeat: Infinity }
						}}
					>
						Experience Magic
					</motion.button>
				</div>
			</AnimatedSection>

			{/* Footer Space */}
			<div style={{ height: "8rem" }} />
		</div>
	);
};

export default Index;
