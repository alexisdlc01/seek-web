// DownloadCTA.tsx
import React from "react";
import "primeicons/primeicons.css";

const StoreBadge = ({ type, href = "#" }) => (
	<a
		href={href}
		className="inline-flex items-center gap-3 bg-black rounded-lg px-3.5 py-2.5 shadow"
	>
		<i
			className={`pi ${type === "apple" ? "pi-apple" : "pi-google"} text-white text-xl`}
		/>
		<div className="leading-tight">
			<div className="text-[10px] text-white/70">
				{type === "apple" ? "Download on the" : "GET IT ON"}
			</div>
			<div className="text-sm font-semibold text-white">
				{type === "apple" ? "App Store" : "Google Play"}
			</div>
		</div>
	</a>
);

export default function DownloadCTA() {
	return (
		<section className="bg-[#49BBC4] text-[#0B0D17] py-6">
			<div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-6">
				{/* Left copy */}
				<div className="w-full md:w-auto">
					<h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
						DOWNLOAD
					</h3>
					<div className="text-4xl sm:text-5xl font-extrabold -mt-1">
						NOW
					</div>
				</div>

				{/* Right badges + QR */}
				<div className="w-full md:w-auto flex items-center md:items-center justify-end gap-6">
					<div className="flex flex-col gap-3">
						<StoreBadge type="apple" />
						<StoreBadge type="google" />
					</div>
					<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-white/70 grid place-items-center text-xs text-[#0B0D17]/70">
						QR Code
					</div>
				</div>
			</div>
		</section>
	);
}
