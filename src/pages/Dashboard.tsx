import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Dropdown } from "primereact/dropdown";
import { Chart } from "primereact/chart";
import "chart.js/auto";
import UserContext from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { listingsControllerMyListingsOptions } from "../client/@tanstack/react-query.gen.js";
import { useQuery } from "@tanstack/react-query";
import { Alternative } from "../components/Alternative.tsx";
import React, { useContext, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";

/* -------------------- Marketing Section -------------------- */

export function SeekPerformanceSection({ onGetReport }) {
	const left = [
		{
			t: "Portfolio performance at a glance",
			d: "Find all your personal dashboard analytics and KPIs in one place, transformed into a comprehensive, easy-to-understand analysis."
		},
		{
			t: "A macro view of the market",
			d: "High-level overview of the entire St Andrews market including demand/supply trends, hotspots, and property-type breakdowns."
		},
		{
			t: "Audience insights",
			d: "Analytics on top search filters, amenities, application demographics, and lease duration trends."
		},
		{
			t: "Competitive analysis",
			d: "Benchmark your listings against the market to optimize pricing and maximize performance."
		}
	];

	const right = [
		{
			t: "Student behavior & intent analysis",
			d: "Understand student intent via search patterns and listing interactions on SEEK to attract ideal tenants."
		},
		{
			t: "Financial & Attribute Benchmarking",
			d: "Objective financial analysis benchmarking your pricing and property attributes against the wider market."
		},
		{
			t: "Actionable Strategy & Recommendations",
			d: "Personalized, data-driven strategy and trend forecast to stay ahead and maximize returns."
		}
	];

	const Check = () => (
		<span
			className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs"
			style={{
				borderColor: "var(--primary-color)",
				color: "var(--primary-color)"
			}}
		>
			✓
		</span>
	);

	return (
		<section className="py-12">
			<div className="mx-auto max-w-5xl px-4">
				<div className="flex items-center gap-4">
					<span className="h-[2px] flex-1 bg-white/30" />
					<h2 className="text-center text-xl font-semibold text-[var(--primary-color)]">
						Ready to Get to Know
						<br />
						Your Market?
					</h2>
					<span className="h-[2px] flex-1 bg-white/30" />
				</div>
				<p className="mt-4 text-center text-[var(--text-secondary-color)]">
					With SEEKPerformance, go beyond your portfolio. Get the
					data-driven edge you need to optimize pricing, forecast
					demand, and attract the right tenants.
				</p>
			</div>

			<div className="mx-auto mt-10 max-w-6xl px-4">
				<p className="text-lg font-semibold text-[var(--primary-color)]">
					SEEKPerformance: Your Competitive Edge
				</p>
				<p className="mt-1 text-[var(--text-secondary-color)]">
					What’s included?
				</p>

				{/* Stacks on mobile, 2 cols on md+ */}
				<div className="mt-8 grid gap-10 md:grid-cols-2">
					<ul className="space-y-6">
						{left.map((x, i) => (
							<li key={i} className="flex gap-3">
								<Check />
								<div>
									<p className="font-semibold text-[var(--text-color)]">
										{x.t}
									</p>
									<p className="mt-1 text-sm text-[var(--text-secondary-color)]">
										{x.d}
									</p>
								</div>
							</li>
						))}
					</ul>

					<ul className="space-y-6">
						{right.map((x, i) => (
							<li key={i} className="flex gap-3">
								<Check />
								<div>
									<p className="font-semibold text-[var(--text-color)]">
										{x.t}
									</p>
									<p className="mt-1 text-sm text-[var(--text-secondary-color)]">
										{x.d}
									</p>
								</div>
							</li>
						))}
					</ul>
				</div>

				{/* CTA: centered on mobile, right on desktop */}
				<div className="mt-8 flex items-center justify-center md:justify-end gap-4">
					<Button
						label="Get My Report"
						onClick={onGetReport}
						className="px-4"
						style={{
							background: "var(--primary-color)",
							borderColor: "var(--primary-color)",
							color: "black"
						}}
					/>
				</div>
			</div>
		</section>
	);
}

/* -------------------- Dashboard -------------------- */

export default function Dashboard() {
	const { data, isLoading } = useQuery(
		listingsControllerMyListingsOptions({ cache: "no-cache" })
	);
	const listings = data;
	const numListings = listings?.length;

	const [range, setRange] = useState("All time");
	const { user } = useContext(UserContext);
	const navigate = useNavigate();

	const ranges = ["7 days", "30 days", "All time"].map(r => ({
		label: r,
		value: r
	}));

	const lineData = {
		labels: [
			"14 Feb",
			"15 Feb",
			"16 Feb",
			"17 Feb",
			"18 Feb",
			"19 Feb",
			"20 Feb",
			"21 Feb",
			"22 Feb",
			"23 Feb",
			"24 Feb",
			"25 Feb",
			"26 Feb",
			"27 Feb"
		],
		datasets: [
			{
				label: "Sessions",
				data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				borderColor: "#23b7c5",
				backgroundColor: "rgba(35,183,197,0.16)",
				borderWidth: 3,
				tension: 0.35,
				pointRadius: 3,
				pointHoverRadius: 5,
				pointBackgroundColor: "#23b7c5",
				pointBorderWidth: 0,
				fill: true,
				spanGaps: true
			}
		]
	};

	const lineOptions = {
		maintainAspectRatio: false,
		responsive: true,
		layout: { padding: { top: 24, right: 12, bottom: 12, left: 12 } },
		elements: { line: { borderCapStyle: "round" } },
		plugins: {
			legend: { display: false },
			tooltip: {
				enabled: true,
				mode: "index",
				intersect: false,
				backgroundColor: "#0f1523",
				borderColor: "rgba(230,237,243,0.25)",
				borderWidth: 1,
				titleColor: "#626262",
				bodyColor: "#626262",
				displayColors: false
			}
		},
		scales: {
			x: {
				grid: { color: "rgba(230,237,243,0.10)" },
				ticks: {
					color: "#626262",
					maxRotation: 0,
					autoSkip: true,
					font: { size: 12 }
				}
			},
			y: {
				grid: { color: "rgba(230,237,243,0.10)" },
				ticks: {
					color: "#626262",
					font: { size: 12 },
					callback: v => Number(v).toLocaleString()
				},
				suggestedMin: 0
			}
		}
	};

	return (
		<div
			className="min-h-screen"
			style={{ background: "var(--surface-ground)" }}
		>
			{/* ===================== DESKTOP (unchanged) ===================== */}
			<div className="block px-6 lg:px-8 py-6">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* Header */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">
							Welcome back, {user.name}
						</h1>
						<div className="flex gap-3">
							<div className="relative">
								<Button
									label="Applications"
									icon="pi pi-inbox"
									onClick={() => navigate("/application")}
								/>
								{false && (
									<Badge
										value="0"
										severity="danger"
										className="absolute -top-2 -right-2"
									/>
								)}
							</div>
							<div className="relative">
								<Button
									label="Messages"
									icon="pi pi-comments"
									onClick={() => navigate("/chat")}
								/>
								{false && (
									<Badge
										value="0"
										severity="danger"
										className="absolute -top-2 -right-2"
									/>
								)}
							</div>
							<Button
								icon="pi pi-pencil"
								rounded
								outlined
								aria-label="Edit"
							/>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-12 items-stretch">
						{/* Big chart */}
						<div
							className="md:col-span-8 rounded-xl border border-[var(--surface-border)] p-4 flex flex-col h-full"
							style={{ background: "var(--primary-color)" }}
						>
							<div className="flex items-center justify-between mb-3">
								<p className="font-bold text-primary-text">
									Portfolio Engagement Trends:
								</p>
								<Dropdown
									value={range}
									onChange={e => setRange(e.value)}
									options={ranges}
									className="w-36 !rounded-lg"
								/>
							</div>
							<div className="relative flex-1 min-h-0">
								<Chart
									type="line"
									data={lineData}
									options={{
										...lineOptions,
										maintainAspectRatio: false,
										scales: {
											x: {
												ticks: {
													minRotation: 45,
													maxRotation: 45
												}
											}
										}
									}}
									className="w-full h-full"
									style={{
										background: "white",
										borderRadius: "8px"
									}}
								/>
							</div>
						</div>
						<KpiRail />
					</div>
					<Alternative
						ok={listings && listings.length > 0}
						fallback={<ListingsPlaceholder />}
					>
						<PropertyAnalytics listings={listings ?? []} />
					</Alternative>
				</div>
			</div>
		</div>
	);
}

function ListingsPlaceholder() {
	return (
		<div className="bg-primary rounded-md py-4 items-center flex flex-col gap-2 w-full">
			<h2 className="font-bold text-xl text-primary-text">No Listings</h2>
			<FiAlertCircle className="text-black" size={24} />
			<p className="text-primary-text">
				Add Listings to View Listings Specific Data
			</p>
		</div>
	);
}

/* -------------------- Small helpers -------------------- */

type KPIProps = { title: string; value: string; icon: string; small?: boolean };

function KpiRail() {
	return (
		<div className="md:col-span-4 space-y-6">
			<Kpi title="Total Applications" value="0" icon="pi pi-file" />
			<Kpi
				title="Top Performing Property"
				value="None"
				icon="pi pi-chart-bar"
			/>
			<Kpi
				title="Average Time to Lease"
				value="0 Days"
				icon="pi pi-clock"
			/>
			<Kpi
				title="Portfolio Occupancy Rate"
				value="0%"
				icon="pi pi-home"
			/>
		</div>
	);
}

function Kpi({ title, value, icon, small }: KPIProps) {
	return (
		<div
			className="rounded-xl border border-[var(--surface-border)] p-4"
			style={{ background: "var(--primary-color)" }}
		>
			<div className="flex items-center gap-3">
				<i
					className={`${icon} text-xl`}
					style={{ color: "var(--primary-color-text)" }}
				/>
				<p className="text-sm text-[var(--primary-color-text)]">
					{title}
				</p>
			</div>
			<p
				className={`mt-2 font-semibold text-[var(--primary-color-text)] ${
					small ? "text-sm" : "text-2xl"
				}`}
			>
				{value}
			</p>
		</div>
	);
}

type PropertyAnalyticsProps = {
	listings: unknown[];
};

function PropertyAnalytics({ listings }: PropertyAnalyticsProps) {
	const [selected, setSelected] = useState();
	const properties: SelectItem[] = listings.map(listing => ({
		label: "test",
		value: "test"
	}));

	return (
		<React.Fragment>
			<p className="font-bold text-2xl text-white mt-10">
				Property Analytics
			</p>
			<div className="grid gap-6 md:grid-cols-12">
				<div className="md:col-span-9">
					<div
						className="rounded-2xl p-6"
						style={{
							background: "var(--primary-color)"
						}}
					>
						<div className="flex items-center gap-3">
							<Dropdown
								value={selected}
								onChange={e => setSelected(e.value)}
								options={properties}
								className="mr-auto w-full md:w-96 property-dropdown !rounded-lg"
								placeholder="Select a property"
							/>
						</div>

						<div className="mt-4 grid gap-5 md:grid-cols-12">
							<div className="md:col-span-7">
								<div
									className="h-54 rounded-xl"
									style={{
										background: "var(--gray-62)"
									}}
								/>
							</div>

							<div className="md:col-span-5 flex flex-col gap-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-file mr-2 text-lg md:text-xl" />
											Total Applications
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											0
										</div>
									</div>
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-bookmark mr-2 text-lg md:text-xl" />
											Saves
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											0
										</div>
									</div>
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-share-alt mr-2 text-lg md:text-xl" />
											Shares
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											8
										</div>
									</div>
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-bolt mr-2 text-lg md:text-xl" />
											Interaction Rate (%)
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											0
										</div>
									</div>
								</div>

								<div className="self-start">
									<span className="font-semibold text-[var(--primary-color-text)]">
										Time on market: 0d
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<aside className="md:col-span-3">
					<div
						className="rounded-2xl p-6 border border-[var(--surface-border)] h-full"
						style={{ background: "var(--gray-62)" }}
					>
						<p className="text-lg font-semibold text-[var(--text-color)]">
							Go even further with{" "}
							<span className="text-[var(--primary-color)]">
								SEEKPerformance
							</span>
						</p>
						<p className="mt-3 text-sm leading-6 text-[var(white)]">
							SEEKPerformance takes you beyond your portfolio’s
							limits with a comprehensive, data-driven view of the
							market to sharpen your competitive edge.
						</p>
						<button
							className="mt-5 w-full md:w-auto rounded-xl px-4 py-2 font-medium border border-[var(--surface-border)]"
							style={{
								background: "var(--primary-color-text)",
								color: "var(white)"
							}}
						>
							Coming soon
						</button>
					</div>
				</aside>
			</div>
		</React.Fragment>
	);
}

// GRAHAM MOBIKLE SHIT
// {
// 	/* ===================== MOBILE (custom layout) ===================== */
// }
// <div className="md:hidden px-4 py-5">
// 	{/* Header */}
// 	<div className="flex flex-col gap-3">
// 		<h1 className="text-xl font-bold text-[var(--text-color)]">
// 			Welcome back, Graham!
// 		</h1>
// 		<div className="flex gap-2">
// 			<div className="relative">
// 				<Button
// 					label="Applications"
// 					icon="pi pi-inbox"
// 					className="w-full"
// 					onClick={() => navigate("/application")}
// 				/>
// 				{false && (
// 					<Badge
// 						value="0"
// 						severity="danger"
// 						className="absolute -top-2 -right-2"
// 					/>
// 				)}
// 			</div>
// 			<div className="relative">
// 				<Button
// 					label="Messages"
// 					icon="pi pi-comments"
// 					className="w-full"
// 				/>
// 				{false && (
// 					<Badge
// 						value="0"
// 						severity="danger"
// 						className="absolute -top-2 -right-2"
// 					/>
// 				)}
// 			</div>
// 			<Button icon="pi pi-pencil" rounded outlined aria-label="Edit" />
// 		</div>
// 	</div>
//
// 	{/* Active listings */}
// 	<p className="mt-6 mb-2 text-[var(--text-secondary-color)]">
// 		You have 0 Active Listings:
// 	</p>
// 	<div
// 		className="rounded-xl border border-[var(--surface-border)] p-4"
// 		style={{ background: "var(--gray-62)" }}
// 	>
// 		<div className="flex items-center gap-3">
// 			<div
// 				className="h-8 w-12 rounded-md"
// 				style={{ background: "var(--surface-500)" }}
// 			/>
// 			<div className="flex-1">
// 				<p className="text-[var(--text-color)]">
// 					You have 0 active listings
// 				</p>
// 				<p className="text-xs text-[var(--text-secondary-color)]">
// 					{/* Last edited: 20/08/2025 */}
// 				</p>
// 			</div>
// 			<Tag value="Active" rounded />
// 		</div>
// 	</div>
//
// 	{/* Chart card */}
// 	<div
// 		className="mt-6 rounded-xl border border-[var(--surface-border)] p-4"
// 		style={{ background: "var(--primary-color)" }}
// 	>
// 		<div className="flex items-center gap-3 mb-3">
// 			<p className="font-bold text-[var(--primary-color-text)]">
// 				Portfolio Engagement Trends:
// 			</p>
// 			<Dropdown
// 				value={range}
// 				onChange={e => setRange(e.value)}
// 				options={ranges}
// 				className="ml-auto w-36 !rounded-lg"
// 			/>
// 		</div>
// 		<div
// 			className="h-64 rounded-md overflow-hidden"
// 			style={{ background: "white" }}
// 		>
// 			<Chart
// 				type="line"
// 				data={lineData}
// 				options={{
// 					...lineOptions,
// 					maintainAspectRatio: false
// 				}}
// 				className="w-full h-full"
// 			/>
// 		</div>
// 	</div>
//
// 	{/* KPIs grid */}
// 	<div className="mt-6 grid grid-cols-2 gap-4">
// 		<Kpi title="Total Applications" value="0" icon="pi pi-file" />
// 		<Kpi
// 			title="Top Performing Property"
// 			value="..."
// 			icon="pi pi-chart-bar"
// 			small
// 		/>
// 		<Kpi title="Average Time to Lease" value="0 Days" icon="pi pi-clock" />
// 		<Kpi title="Portfolio Occupancy Rate" value="0%" icon="pi pi-home" />
// 	</div>
//
// 	{/* Property Analytics */}
// 	<p className="font-bold text-xl text-white mt-8">Property Analytics</p>
//
// 	<div
// 		className="mt-4 rounded-2xl p-4"
// 		style={{ background: "var(--primary-color)" }}
// 	>
// 		<Dropdown
// 			value={selectedProperty}
// 			onChange={e => setSelectedProperty(e.value)}
// 			options={properties}
// 			className="w-full property-dropdown !rounded-lg"
// 			placeholder="Select a property"
// 		/>
//
// 		<p className="mt-4 text-xl font-semibold text-[var(--primary-color-text)]">
// 			{/* Spacious 2-bed flat with garden: */}
// 		</p>
//
// 		<div className="mt-4">
// 			<div
// 				className="h-44 rounded-xl"
// 				style={{ background: "var(--gray-62)" }}
// 			/>
// 		</div>
//
// 		<div className="mt-4 grid grid-cols-2 gap-3">
// 			<div className="metric-tile">
// 				<div className="metric-label text-base font-semibold">
// 					<i className="pi pi-file mr-2 text-base" />
// 					Total Applications
// 				</div>
// 				<div className="metric-value text-2xl font-semibold">0</div>
// 			</div>
// 			<div className="metric-tile">
// 				<div className="metric-label text-base font-semibold">
// 					<i className="pi pi-bookmark mr-2 text-base" />
// 					Saves
// 				</div>
// 				<div className="metric-value text-2xl font-semibold">0</div>
// 			</div>
// 			<div className="metric-tile">
// 				<div className="metric-label text-base font-semibold">
// 					<i className="pi pi-share-alt mr-2 text-base" />
// 					Shares
// 				</div>
// 				<div className="metric-value text-2xl font-semibold">0</div>
// 			</div>
// 			<div className="metric-tile">
// 				<div className="metric-label text-base font-semibold">
// 					<i className="pi pi-bolt mr-2 text-base" />
// 					Interaction Rate (%)
// 				</div>
// 				<div className="metric-value text-2xl font-semibold">0</div>
// 			</div>
// 		</div>
//
// 		<div className="mt-3">
// 			<span className="font-semibold text-[var(--primary-color-text)]">
// 				Time on market: 0d
// 			</span>
// 		</div>
// 	</div>
//
// 	{/* Learn more card (moved below on mobile) */}
// 	<div
// 		className="mt-6 rounded-2xl p-5 border border-[var(--surface-border)]"
// 		style={{ background: "var(--gray-62)" }}
// 	>
// 		<p className="text-lg font-semibold text-[var(--text-color)]">
// 			Go even further with{" "}
// 			<span className="text-[var(--primary-color)]">SEEKPerformance</span>
// 		</p>
// 		<p className="mt-3 text-sm leading-6 text-[var(white)]">
// 			SEEKPerformance takes you beyond your portfolio’s limits with a
// 			comprehensive, data-driven view of the market to sharpen your
// 			competitive edge.
// 		</p>
// 		<button
// 			className="mt-4 w-full rounded-xl px-4 py-2 font-medium border border-[var(--surface-border)]"
// 			style={{
// 				background: "var(--primary-color-text)",
// 				color: "var(white)"
// 			}}
// 		>
// 			Coming Soon
// 		</button>
// 	</div>
// </div>;
//
