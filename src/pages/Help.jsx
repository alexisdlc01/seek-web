import React from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import { small } from "framer-motion/client";

export default function AnimatedPage() {
	const { scrollY } = useViewportScroll();
	const bgY = useTransform(scrollY, [0, 800], [0, -400]);
	const rotateCircle = useTransform(scrollY, [1000, 1600], [0, 720]);
	const floatY = useTransform(scrollY, [600, 1200], [0, -200]);
	const WaveBar = ({ delay }) => {
		const [height, setHeight] = useState(20);

		useEffect(() => {
			const interval = setInterval(() => {
				setHeight(20 + Math.random() * 120);
			}, 300 + Math.random() * 300);

			return () => clearInterval(interval);
		}, []);

		return (
			<motion.div
				animate={{ height }}
				transition={{
					duration: 0.3,
					ease: "easeInOut",
					delay: delay / 1000
				}}
				className="w-2 rounded-full"
				style={{
					background: "linear-gradient(to top, #06b6d4, #8b5cf6)",
					height
				}}
			/>
		);
	};

	return (
		<div className="relative overflow-x-hidden">
			{/* Parallax Solid Background */}
			<motion.div
				style={{ y: bgY }}
				className="absolute top-0 left-0 w-full h-screen bg-blue-600"
			/>

			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center">
				<motion.h1
					initial={{ opacity: 0, x: -200, scale: 0.7 }}
					animate={{ opacity: 1, x: 0, scale: 1 }}
					transition={{ duration: 1 }}
					className="text-7xl font-extrabold text-white drop-shadow-2xl"
				>
					Lorem Ipsum Dolor
				</motion.h1>
			</section>

			{/* Feature Cards */}
			<section className="relative min-h-screen bg-white flex items-center justify-center p-8">
				<motion.div
					className="grid grid-cols-1 md:grid-cols-3 gap-6"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					variants={{
						hidden: {},
						visible: { transition: { staggerChildren: 0.15 } }
					}}
				>
					{[1, 2, 3].map(i => (
						<motion.div
							key={i}
							variants={{
								hidden: { opacity: 0, y: 100, rotate: -10 },
								visible: { opacity: 1, y: 0, rotate: 0 }
							}}
							transition={{
								type: "spring",
								stiffness: 100,
								damping: 10
							}}
							whileHover={{ scale: 0.9, rotate: 5 }}
						>
							<Card
								title={`Feature ${i}`}
								className="shadow-2xl rounded-3xl"
							>
								<p3 className="leading-relaxed">
									Lorem ipsum dolor sit amet, consectetur
									adipiscing elit.
								</p3>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* Animated List */}
			<section className="relative min-h-screen bg-white flex flex-col items-center justify-center p-8 space-y-4">
				{["One", "Two", "Three", "Four"].map((item, idx) => (
					<motion.div
						key={idx}
						initial={{ x: -200, opacity: 0 }}
						whileInView={{ x: 0, opacity: 1 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{
							delay: idx * 0.2,
							type: "spring",
							stiffness: 80
						}}
						className="w-full max-w-md p-6 bg-blue-50 rounded-xl shadow-lg"
					>
						<h4 className="text-2xl font-semibold">{`Item ${item}`}</h4>
						<p>Lorem ipsum dolor sit amet.</p>
					</motion.div>
				))}
			</section>
			
		</div>
	);
}
