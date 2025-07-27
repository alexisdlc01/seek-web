import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useState } from "react";

export default function LandingPage() {
	const navigate = useNavigate();
	const [showPlus, setShowPlus] = useState(false);

	return (
		<div className="min-h-screen flex flex-col">
			<motion.section
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="relative h-screen text-center flex items-center justify-center px-4 overflow-hidden"
			>
				<video
					autoPlay
					loop
					muted
					playsInline
					className="absolute top-0 left-0 w-full h-full object-cover z-0"
				>
					<source src="/dummy_background.mp4" type="video/mp4" />
					Your browser does not support the background video.
				</video>

				{/* Overlay */}
				<div className="relative z-10 text-white max-w-2xl">
					<h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
						Find Your Perfect Student Home with Seek
					</h1>
					<p className="text-lg md:text-xl mb-6 drop-shadow">
						Connecting students with trusted landlords in St Andrews
					</p>
					<div className="flex justify-center gap-4 flex-wrap">
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="I'm a Student"
								className="bg-white text-[var(--primary-color)] font-bold px-4 py-2"
								onClick={() => navigate("/signup/student")}
							/>
						</motion.div>
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="I'm a Landlord"
								className="bg-white text-[var(--primary-color)] font-bold px-4 py-2"
								onClick={() => navigate("/signup/landlord")}
							/>
						</motion.div>
					</div>
				</div>
			</motion.section>

			{/* Features Section */}
			<motion.section
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="bg-[var(--surface-a)] py-16 px-4 text-center"
			>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
					{[
						{
							icon: "pi pi-search",
							title: "Easy Search",
							desc: "Find properties that match your needs with our advanced search filters"
						},
						{
							icon: "pi pi-check-circle text-green-500",
							title: "Verified Listings",
							desc: "All properties are verified to ensure quality and safety standards"
						},
						{
							icon: "pi pi-comment",
							title: "Direct Communication",
							desc: "Message landlords directly through our secure platform"
						}
					].map((item, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.2 }}
						>
							<div className="flex justify-center mb-3">
								<motion.span
									whileHover={{ scale: 1.1 }}
									className={`${item.icon} text-4xl bg-[var(--surface-c)] p-4 rounded-full text-[var(--text-color)]`}
								></motion.span>
							</div>
							<h3 className="text-lg font-semibold mb-2 text-[var(--text-color)]">
								{item.title}
							</h3>
							<p className="text-[var(--text-color-secondary)] text-sm">
								{item.desc}
							</p>
						</motion.div>
					))}
				</div>
			</motion.section>

			{/* Call to Action */}
			<motion.section
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="text-center py-12 px-4 bg-[var(--surface-a)]"
			>
				<h2 className="text-2xl font-bold mb-2 text-[var(--text-color)]">
					Ready to Get Started?
				</h2>
				<p className="text-[var(--text-color-secondary)] mb-4">
					Connect with thousands of students and landlords and use
					Seek
				</p>
				<motion.div whileHover={{ scale: 1.05 }}>
					<Button
						label="Sign Up Today"
						className="bg-[var(--primary-color)] text-[var(--primary-color-text)] px-5 py-3 font-semibold"
					/>
				</motion.div>
			</motion.section>

			{/* Stats Section */}
			<motion.section
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="py-16 bg-white text-center"
			>
				<h2 className="text-2xl md:text-3xl font-bold mb-6 text-[var(--text-color)]">
					Trusted by Over
				</h2>
				<div className="text-5xl font-extrabold text-[var(--primary-color)]">
					<CountUp
						end={100}
						duration={1}
						enableScrollSpy
						onEnd={() => setShowPlus(true)}
					/>
					{showPlus && "+"}
				</div>

				<p className="text-[var(--text-color-secondary)] mt-2">
					Landlords nationwide
				</p>
			</motion.section>
		</div>
	);
}
