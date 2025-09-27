import React, { useEffect } from "react";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import DownloadCTA from "../components/DownloadCTA.jsx";
import JoinMailingList from "../components/JoinMailingList.jsx"
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";

const PhonePlaceholder = ({
	className = "",
	range = 8, // px to float up/down
	duration = 2.4, // seconds per cycle
	delay = 0 // start offset to desync
}) => {
	const reduce = useReducedMotion();
	return (
		<motion.div
			className={`z-20 w-28 sm:w-36 md:w-40 h-48 sm:h-60 md:h-64 rounded-2xl border-2 border-dashed border-slate-500/40 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] grid place-items-center text-center text-[11px] sm:text-xs text-slate-300 px-3 ${className}`}
			style={{ willChange: "transform" }}
			animate={reduce ? { y: 0 } : { y: [0, -range, 0] }}
			transition={{
				duration,
				ease: "easeInOut",
				repeat: Infinity,
				delay
			}}
		>
			Picture of
			<br />
			phone with
			<br />
			app page
		</motion.div>
	);
};
function CoreDiscovery() {
	return (
		<section
			id="core-discovery"
			className="text-slate-100 pt-20 md:pt-60 pb-16"
		>
			<div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
				{/* Left: image placeholders (now positioned, not stacked) */}
				<div className="relative mx-auto w-full max-w-md h-[320px] sm:h-[380px]">
					<PhonePlaceholder
						className="absolute -left-2 sm:-left-6 md:-left-10 top-0"
						delay={0.0}
					/>
					<PhonePlaceholder
						className="absolute -right-2 sm:-right-6 md:-right-10 top-0"
						delay={0.0}
					/>
					<PhonePlaceholder
						className="absolute left-1/2 -translate-x-1/2 bottom-0"
						delay={1.2}
					/>
				</div>

				{/* Right: copy */}
				<div>
					<h2 className="text-[#23b7c5] uppercase tracking-wide font-semibold text-xl">
						Core Discovery & Search
					</h2>

					<ul className="mt-6 space-y-5">
						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-mobile text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Our home page features an ergonomic, scrollable
								interface for browsing properties. Scroll
								through listings, visit agency or private
								landlord accounts, and easily save, share, and
								apply using the side buttons.
							</p>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-sliders-h text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Use filters such as rent price, number of rooms,
								or amenities to narrow your search. If you have
								a specific idea or address, the search bar
								supports more customized queries.
							</p>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-map-marker text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Interact with our map to view property pins
								based on location.
							</p>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-info-circle text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Tap a listing to access detailed information:
								photos, videos, descriptions, and the
								landlord/agency profile.
							</p>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
}

function ApplicationManagement() {
	return (
		<section className="text-slate-100 pt-10 pb-16">
			<div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
				{/* Left: copy */}
				<div>
					<h2 className="text-[#23b7c5] uppercase tracking-wide font-semibold text-xl">
						Application & Management
					</h2>

					<ul className="mt-6 space-y-5">
						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-tags text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Track all your applications with a dashboard
								tracker and status tags like “pending”, “viewed
								by landlord”, and “accepted”.
							</p>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-users text-[#23b7c5] text-lg" />
							</span>
							<div>
								<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
									Create or join a group to apply together.
									All members must approve the application
									before submission.
								</p>
								<p className="mt-1 text-[11px] text-slate-400 italic">
									*All group members need to be registered to
									unlock this feature.
								</p>
							</div>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-id-card text-[#23b7c5] text-lg" />
							</span>
							<div>
								<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
									Upload and store documents (ID, proof of
									study, references) in your profile for quick
									submission.
								</p>
								<p className="mt-1 text-[11px] text-slate-400 italic">
									*Requirements may vary by landlord.
								</p>
							</div>
						</li>
					</ul>
				</div>

				{/* Right: image placeholders */}
				<div className="relative mx-auto w-full max-w-md h-[320px] sm:h-[380px]">
					<PhonePlaceholder className="absolute -left-2 sm:-left-6 md:-left-10 top-0" />
					<PhonePlaceholder className="absolute -right-2 sm:-right-6 md:-right-10 top-0" />
					<PhonePlaceholder
						className="absolute left-1/2 -translate-x-1/2 bottom-0"
						delay={1.2}
					/>
				</div>
			</div>
		</section>
	);
}

function CommunicationSecurity() {
	return (
		<section className="text-slate-100 pt-10 pb-16">
			<div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
				{/* Left: image placeholders */}
				<div className="relative mx-auto w-full max-w-md h-[320px] sm:h-[380px]">
					<PhonePlaceholder className="absolute -left-2 sm:-left-6 md:-left-10 top-0" />
					<PhonePlaceholder className="absolute -right-2 sm:-right-6 md:-right-10 top-0" />
					<PhonePlaceholder
						className="absolute left-1/2 -translate-x-1/2 bottom-0"
						delay={1.2}
					/>
				</div>

				{/* Right: copy */}
				<div>
					<h2 className="text-[#23b7c5] uppercase tracking-wide font-semibold text-xl">
						Communication & Security
					</h2>

					<ul className="mt-6 space-y-5">
						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-comments text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Once your application is submitted, communicate
								directly with your landlord via our in-app
								messaging platform through automatically created
								group chats.
							</p>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-shield text-[#23b7c5] text-lg" />
							</span>
							<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
								Don’t worry about fraudulent listings—landlords
								and agency accounts are verified by our team,
								and listings undergo review before appearing in
								your feed.
							</p>
						</li>

						<li className="flex items-start gap-3">
							<span className="mt-0.5 h-9 w-9 rounded-lg border border-[#23b7c5]/30 bg-[#23b7c5]/10 grid place-items-center shrink-0">
								<i className="pi pi-lock text-[#23b7c5] text-lg" />
							</span>
							<div>
								<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
									We prioritize a safe, secure process. Unlike
									unregulated platforms, SEEK will not
									disclose your personal information,
									eliminating disclosure risks.
								</p>
								<p className="mt-1 text-[11px] text-slate-400 italic">
									*For more information, read our{" "}
									<a href="/terms" className="underline">
										Terms and Conditions
									</a>
									.
								</p>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</section>
	);
}

const FloatingDownload = () => {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		setVisible(true);

		return () => {
			setVisible(false);
		};
	}, []);

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ y: 80, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 80, opacity: 0 }}
					transition={{ type: "spring", stiffness: 200, damping: 50 }}
					className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
					style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
				>
					<div className="mx-auto pointer-events-auto">
						<JoinMailingList/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

const Download = () => {
	return (
		<div className="relative overflow-hidden scroll-smooth min-h-screen bg-[var(--surface-a)]">
			<BackgroundBubbles count={20} />

			<section className="relative z-20 text-slate-100 px-4 pt-14 md:pt-20 pb-6">
				<div className="max-w-2xl mx-auto text-center pt-14 md:pt-2">
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
						Find your home on the
						<span className="block mt-1 text-[#23b7c5]">
							SEEK App
						</span>
					</h1>

					<p className="mt-5 text-sm sm:text-base text-slate-300">
						The <span className="text-[#23b7c5]">SEEK app</span> is
						a completely free mobile-first platform designed to
						simplify the student housing search from start to
						finish.
					</p>

					<p className="mt-5 text-sm sm:text-base text-slate-300 pb-30">
						We take the fragmented process of finding a flat and
						centralize it into a single, user-friendly interface.
						Gain access to countless properties through a simple
						movement that you all know: scrolling.
					</p>

					<Button
						className="mt-16 px-6 py-3 border-0 bg-[#23b7c5] text-white rounded-md hover:opacity-90 transition"
						style={{ color: "white" }}
					>
						Learn more ↓
					</Button>
				</div>
			</section>

			<div className="relative z-20">
				<CoreDiscovery />
				<ApplicationManagement />
				<CommunicationSecurity />
				<>
					<div className="h-32 md:h-40" />
					<FloatingDownload />
				</>
			</div>
		</div>
	);
};

export default Download;
