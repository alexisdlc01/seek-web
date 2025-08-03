import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import Steps from "../components/Steps";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";
import { useViewportScroll, useTransform, motion } from "framer-motion";

export default function LandingPage() {
	const navigate = useNavigate();
	const { scrollY } = useViewportScroll();
	const videoY = useTransform(scrollY, [0, 600], [0, -300]);

	return (
		<div className="min-h-screen flex flex-col">
			<motion.section
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="relative h-screen text-center flex items-center justify-center px-4 overflow-hidden"
			>
				<motion.video
					autoPlay
					loop
					muted
					playsInline
					style={{ y: videoY }}
					className="absolute top-0 left-0 w-full h-full object-cover z-0"
					onContextMenu={e => e.preventDefault()}
				>
					<source src="/dummy_background.mp4" type="video/mp4" />
					Your browser does not support the background video.
				</motion.video>

				<div className="relative z-10 text-white max-w-2xl">
					<h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
						One Swipe Closer to Home
					</h1>
					<p className="text-lg md:text-xl mb-6 drop-shadow">
						Connecting students with trusted landlords in St Andrews
					</p>
					<div className="flex justify-center gap-4 flex-wrap">
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="I'm a Student"
								className="bg-white text-[var(--primary-color)] font-bold px-5 py-3"
								onClick={() => navigate("/signup/student")}
							/>
						</motion.div>
						<motion.div whileHover={{ scale: 1.05 }}>
							<Button
								label="I'm a Landlord"
								className="bg-white text-[var(--primary-color)] font-bold px-5 py-3"
								onClick={() => navigate("/signup/landlord")}
							/>
						</motion.div>
					</div>
				</div>
			</motion.section>
			<section className="relative pt-0 pb-32 bg-white overflow-hidden">
				{/* Background Shape */}
				<div className="absolute inset-0 z-0">
					<svg
						className="w-full h-full"
						viewBox="0 0 1440 600"
						preserveAspectRatio="none"
					>
						<path
							fill="#1E3A8A"
							d="M0,0 C400,400 1040,0 1440,300 L1440,600 L0,600 Z"
						/>
					</svg>
				</div>

				<div className="relative z-10 max-w-6xl mx-auto px-4 text-center mb-15">
					<motion.h2
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-4xl font-bold text-[var(--text-color)] mb-8"
					>
						Some Text here
					</motion.h2>

					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="text-lg text-[var(--text-color-secondary)] max-w-3xl mx-auto mb-50"
					>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Suspendisse potenti. Duis non tortor justo. Sed euismod,
						nisi vel consectetur interdum, nisl nisi aliquet nunc,
						nec aliquet nunc nisl euismod nisi.
					</motion.p>

					<div className="grid md:grid-cols-3 gap-10 text-left mt-20">
						{[
							{
								title: "Feature 1 Title",
								body: "Feature 1 description goes here. This should be a brief overview of what the feature does and how it benefits users."
							},
							{
								title: "Feature 2 Title",
								body: "Feature 2 description goes here. This should be a brief overview of what the feature does and how it benefits users."
							},
							{
								title: "Feature 3 Title",
								body: "Feature 3 description goes here. This should be a brief overview of what the feature does and how it benefits users."
							}
						].map((card, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.2, duration: 0.5 }}
								className="bg-white shadow-lg rounded-2xl p-6"
							>
								<h3 className="text-xl font-semibold text-[var(--primary-color)] mb-2">
									{card.title}
								</h3>
								<p className="text-[var(--text-color-secondary)]">
									{card.body}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="bg-white py-20">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-4xl font-bold text-[var(--text-color)] mb-8"
					>
						How It Works
					</motion.h2>
					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="text-lg text-[var(--text-color-secondary)] max-w-3xl mx-auto mb-16"
					>
						A quick breakdown of the process for students and
						landlords. We've made it simple and straightforward to
						get started.
					</motion.p>
					<Steps />
				</div>
			</section>

			<section className="py-2 bg-gray-50 h-[100px]">
				<div className="max-w-6xl mx-auto px-4 text-center mb-4">
					<motion.h2
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-4xl font-bold text-[var(--text-color)] mb-8"
					>
						Some Text here
					</motion.h2>

					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="text-lg text-[var(--text-color-secondary)] max-w-3xl mx-auto mb-16"
					>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Suspendisse potenti. Duis non tortor justo. Sed euismod,
						nisi vel consectetur interdum, nisl nisi aliquet nunc,
						nec aliquet nunc nisl euismod nisi.
					</motion.p>
				</div>

				<div className="w-full h-full bg-gray-50 pointer-events-none">
					<ReactFlow
						style={{ width: "100%", height: "100%" }}
						fitView
						fitViewOptions={{ padding: 0.4 }}
						nodesDraggable={false}
						nodesConnectable={false}
						elementsSelectable={false}
						zoomOnScroll={false}
						panOnScroll={false}
						zoomOnPinch={false}
						zoomOnDoubleClick={false}
						panOnDrag={false}
						proOptions={{ hideAttribution: true }}
						nodes={[
							{
								id: "1",
								position: { x: 0, y: 0 },
								className: "custom-node",

								data: {
									label: (
										<div className="bg-white shadow-lg rounded-2xl p-8 w-[340px]">
											<h3 className="text-3xl font-bold text-[var(--primary-color)] mb-3">
												Some Node
											</h3>
											<p className="text-2xl leading-relaxed text-[var(--text-color-secondary)]">
												Lorem ipsum dolor sit amet,
												consectetur adipiscing elit.
												Quisque sed urna at justo cursus
												facilisis.
											</p>
										</div>
									)
								}
							},
							{
								id: "2",
								position: { x: 800, y: 0 },
								className: "custom-node",

								data: {
									label: (
										<div className="bg-white shadow-lg rounded-2xl p-8 w-[340px]">
											<h3 className="text-3xl font-bold text-[var(--primary-color)] mb-3">
												Some Node
											</h3>
											<p className="text-2xl leading-relaxed text-[var(--text-color-secondary)]">
												Lorem ipsum dolor sit amet,
												consectetur adipiscing elit.
												Quisque sed urna at justo cursus
												facilisis.
											</p>
										</div>
									)
								}
							},
							{
								id: "3",
								position: { x: 0, y: 500 },
								className: "custom-node",

								data: {
									label: (
										<div className="bg-white shadow-lg rounded-2xl p-8 w-[340px]">
											<h3 className="text-3xl font-bold text-[var(--primary-color)] mb-3">
												Some Node
											</h3>
											<p className="text-2xl leading-relaxed text-[var(--text-color-secondary)]">
												Lorem ipsum dolor sit amet,
												consectetur adipiscing elit.
												Quisque sed urna at justo cursus
												facilisis.
											</p>
										</div>
									)
								}
							},
							{
								id: "4",
								position: { x: 800, y: 500 },
								className: "custom-node",

								data: {
									label: (
										<div className="bg-white shadow-lg rounded-2xl p-8 w-[340px]">
											<h3 className="text-3xl font-bold text-[var(--primary-color)] mb-3">
												Some Node
											</h3>
											<p className="text-2xl leading-relaxed text-[var(--text-color-secondary)]">
												Lorem ipsum dolor sit amet,
												consectetur adipiscing elit.
												Quisque sed urna at justo cursus
												facilisis.
											</p>
										</div>
									)
								}
							},
							{
								id: "6",
								position: { x: 400, y: 500 },
								className: "custom-node",

								data: {
									label: (
										<div className="bg-white shadow-lg rounded-2xl p-8 w-[340px]">
											<h3 className="text-3xl font-bold text-[var(--primary-color)] mb-3">
												Some Node
											</h3>
											<p className="text-2xl leading-relaxed text-[var(--text-color-secondary)]">
												Lorem ipsum dolor sit amet,
												consectetur adipiscing elit.
												Quisque sed urna at justo cursus
												facilisis.
											</p>
										</div>
									)
								}
							}
						]}
						edges={[
							{
								id: "e1-2",
								source: "1",
								target: "2",
								animated: true,
								style: {
									strokeWidth: 6,
									stroke: "var(--primary-color)"
								}
							},
							{
								id: "e2-3",
								source: "2",
								target: "3",
								animated: true,
								style: {
									strokeWidth: 6,
									stroke: "var(--primary-color)"
								}
							},
							{
								id: "e2-4",
								source: "2",
								target: "4",
								animated: true,
								style: {
									strokeWidth: 6,
									stroke: "var(--primary-color)"
								}
							},
							{
								id: "e5-6",
								source: "4",
								target: "6",
								animated: true,
								style: {
									strokeWidth: 6,
									stroke: "var(--primary-color)"
								}
							}
						]}
					/>
				</div>
			</section>
			<div className="h-30" />

			<section className="py-20 bg-gray-50">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-4xl font-bold text-[var(--text-color)] mb-8"
					>
						Our Experiences
					</motion.h2>

					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="text-lg text-[var(--text-color-secondary)] max-w-3xl mx-auto mb-16"
					>
						Join a growing community of students and landlords who
						trust Seek to deliver the best rental experience.
					</motion.p>

					<div className="flex flex-col md:flex-row justify-center gap-y-10 gap-x-8 sm:gap-x-12 md:gap-x-16 lg:gap-x-24 xl:gap-x-40 2xl:gap-x-60">
						<div>
							<div className="w-24 text-5xl font-extrabold text-[var(--primary-color)]">
								<CountUp
									end={50}
									duration={1}
									enableScrollSpy
								/>
								{"+"}
							</div>
							<p className="text-[var(--text-color-secondary)] mt-2">
								Landlords already on Seek
							</p>
						</div>

						<div>
							<div className="w-24 text-5xl font-extrabold text-[var(--primary-color)]">
								<CountUp
									end={1000}
									duration={1}
									enableScrollSpy
								/>
								{"+"}
							</div>
							<p className="text-[var(--text-color-secondary)] mt-2">
								New Properties Listed Weekly
							</p>
						</div>

						<div>
							<div className="w-24 text-5xl font-extrabold text-[var(--primary-color)]">
								<CountUp
									end={500}
									duration={1}
									enableScrollSpy
								/>
								{"+"}
							</div>
							<p className="text-[var(--text-color-secondary)] mt-2">
								Downloads of the Seek App
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="text-center py-20 bg-white">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-4xl font-bold text-[var(--text-color)] mb-8"
					>
						Ready to Get Started?
					</motion.h2>
					<motion.p
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="text-lg text-[var(--text-color-secondary)] max-w-3xl mx-auto mb-16"
					>
						Connect with thousands of students and landlords. Create
						an account today and find what you're looking for.
					</motion.p>
					<motion.div whileHover={{ scale: 1.05 }}>
						<Button
							label="Sign Up Today"
							className="bg-[var(--primary-color)] text-[var(--primary-color-text)] px-5 py-3 font-bold"
						/>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
