import React, { useState } from "react";
import { Button } from "primereact/button";
import { Badge } from "primereact/badge";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import "chart.js/auto";

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
			{/* headline with thicker dividers */}
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

			{/* subheader */}
			<div className="mx-auto mt-10 max-w-6xl px-4">
				<p className="text-lg font-semibold text-[var(--primary-color)]">
					SEEKPerformance: Your Competitive Edge
				</p>
				<p className="mt-1 text-[var(--text-secondary-color)]">
					What’s included?
				</p>

				{/* TWO COLUMNS, both BELOW the subheader */}
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

				{/* CTA */}
				<div className="mt-8 flex items-center justify-end gap-4">
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

function StatusUpdatesCarousel({ items, onReview }) {
	const [i, setI] = useState(0);
	const n = items.length;
	const s = items[i];
	const prev = () => setI((i - 1 + n) % n);
	const next = () => setI((i + 1) % n);

	return (
		<div className="space-y-2">
			<p className="text-[var(--text-secondary-color)]">
				Status Updates ({n}):
			</p>

			<div className="grid grid-cols-4 gap-4">
				{items.map((s, i) => (
					<div
						key={i}
						className="rounded-xl border border-[var(--surface-border)] p-4 shadow-sm flex flex-col justify-between"
						style={{ background: "var(--gray-62)" }}
					>
						<div>
							<p className="font-medium text-[var(--text-color)]">
								{s.title}
							</p>
							<p className="text-sm text-[var(--text-secondary-color)] mt-1">
								{s.text}
							</p>
							<p className="text-xs text-[var(--text-secondary-color)] mt-2">
								1 day ago
							</p>
						</div>

						<div className="mt-4 flex justify-end">
							<Button
								label="Review"
								size="small"
								onClick={() => onReview?.(s)}
								className="review-btn"
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
export default function Dashboard() {
	const [range, setRange] = useState("All time");
	const [selectedProperty, setSelectedProperty] = useState(
		"123 North Street, St Andrews, KY16 9AL"
	);

	const ranges = ["7 days", "30 days", "All time"].map(r => ({
		label: r,
		value: r
	}));
	const properties = [
		"123 North Street, St Andrews, KY16 9AL",
		"28 Market Street, St Andrews, KY16 9BC",
		"12 Union St, Dundee, DD1 4BG"
	].map(p => ({ label: p, value: p }));

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
				data: [
					220, 340, 530, 480, 610, 430, 720, 690, 540, 760, 810, 700,
					620, 880
				],
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
			className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
			style={{ background: "var(--surface-ground)" }}
		>
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-color)]">
						Welcome back, Graham!
					</h1>
					<div className="flex gap-3">
						<div className="relative">
							<Button
								label="Applications"
								icon="pi pi-inbox"
								severity="primary"
							/>
							<Badge
								value="10"
								severity="danger"
								className="absolute -top-2 -right-2"
							/>
						</div>
						<div className="relative">
							<Button
								label="Messages"
								icon="pi pi-comments"
								severity="primary"
							/>
							<Badge
								value="4"
								severity="danger"
								className="absolute -top-2 -right-2"
							/>
						</div>
						<Button
							icon="pi pi-pencil"
							rounded
							outlined
							aria-label="Edit"
						/>
					</div>
				</div>

				{/* Status updates */}
				<StatusUpdatesCarousel
					items={[
						{
							title: "123 North Street, St Andrews, KY16 9AZ",
							text: "Alexis has uploaded his proof of study and passport for the application."
						},
						{
							title: "28 Market Street, St Andrews, KY16 9BC",
							text: "New application received."
						},
						{
							title: "123 North Street, St Andrews, KY16 9AZ",
							text: "Alexis has uploaded his proof of study and passport for the application."
						},
						{
							title: "28 Market Street, St Andrews, KY16 9BC",
							text: "New application received."
						}
					]}
					onReview={s => console.log("Review", s)}
				/>

				{/* Active listings (simple row) */}
				<p className="mb-2  text-[var(--text-secondary-color)]">
					You have 5 Active Listings:
				</p>
				<div
					className="flex items-center justify-between rounded-xl border border-[var(--surface-border)] p-4"
					style={{ background: "var(--gray-62)" }}
				>
					<div className="flex items-center gap-3">
						<div
							className="h-8 w-12 rounded-md"
							style={{ background: "var(--surface-500)" }}
						/>
						<div>
							<p className="text-[var(--text-color)]">
								You have 5 active listings
							</p>
							<p className="text-xs text-[var(--text-secondary-color)]">
								Last edited: 20/08/2025
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Tag value="Active" rounded />
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-12 items-stretch">
					{/* Big chart */}
					<div
						className="md:col-span-8 rounded-xl border border-[var(--surface-border)] p-4 flex flex-col h-full"
						style={{ background: "var(--primary-color)" }}
					>
						<div className="flex items-center justify-between mb-3">
							<p className="font-semibold text-[var(--primary-color-text)]">
								Portfolio Analytics
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
									maintainAspectRatio: false
								}}
								className="w-full h-full"
								style={{
									background: "white",
									borderRadius: "8px"
								}}
							/>
						</div>
					</div>

					{/* KPI right rail */}
					<div className="md:col-span-4 space-y-6">
						<Kpi
							title="Total Applications"
							value="24"
							icon="pi pi-file"
						/>
						<Kpi
							title="Top Performing Property"
							value="123 North Street, St Andrews, KY16 9AL"
							icon="pi pi-chart-bar"
							small
						/>
						<Kpi
							title="Average Time to Lease"
							value="3 Days"
							icon="pi pi-clock"
						/>
						<Kpi
							title="Portfolio Occupancy Rate"
							value="42%"
							icon="pi pi-home"
						/>
					</div>
				</div>

				<p className="font-bold text-2xl text-white mt-10">
					Property Analytics
				</p>

				{/* Property Analytics */}
				<div
					className="rounded-2xl p-4 md:p-6"
					style={{ background: "var(--primary-color)" }}
				>
					<div className="flex items-center gap-3">
						<Dropdown
							value={selectedProperty}
							onChange={e => setSelectedProperty(e.value)}
							options={properties}
							className="mr-auto w-full md:w-96 property-dropdown !rounded-lg"
						/>
					</div>

					<p className="mt-4 text-2xl font-semibold text-[var(--primary-color-text)]">
						Spacious 2-bed flat with garden:
					</p>

					{/* content: media left, metrics right */}
					<div className="mt-4 grid gap-5 md:grid-cols-12">
						{/* left image */}
						<div className="md:col-span-7">
							<div
								className="h-56 md:h-64 rounded-xl"
								style={{ background: "var(--gray-62)" }}
							/>
						</div>

						{/* right metrics */}
						<div className="md:col-span-5 flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="metric-tile">
									<div className="metric-label">
										<i className="pi pi-file mr-2" /> Total
										Applications
									</div>
									<div className="metric-value">15</div>
								</div>
								<div className="metric-tile">
									<div className="metric-label">
										<i className="pi pi-bookmark mr-2" />{" "}
										Saves
									</div>
									<div className="metric-value">50</div>
								</div>
								<div className="metric-tile">
									<div className="metric-label">
										<i className="pi pi-share-alt mr-2" />{" "}
										Shares
									</div>
									<div className="metric-value">8</div>
								</div>
								<div className="metric-tile">
									<div className="metric-label">
										<i className="pi pi-bolt mr-2" />{" "}
										Engagement Rate (%)
									</div>
									<div className="metric-value">43</div>
								</div>
							</div>

							{/* time on market aligned under tiles */}
							<div className="time-bar self-start">
								<span className="time-value font-semibold text-[var(--primary-color-text)]">
									Time on market:       24d
								</span>
							</div>
						</div>
					</div>
				</div>

				<SeekPerformanceSection
					onGetReport={() => alert("Get Report clicked!")}
				/>
			</div>
		</div>
	);
}

/* --- Small presentational helpers --- */

function Kpi({ title, value, icon, small }) {
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

function Metric({ icon, label, value }) {
	return (
		<div
			className="rounded-xl border border-[var(--surface-border)] p-4 flex items-center gap-3"
			style={{ background: "var(--surface-card)" }}
		>
			<i
				className={`${icon} text-xl`}
				style={{ color: "var(--primary-color)" }}
			/>
			<div>
				<p className="text-sm text-[var(--text-secondary-color)]">
					{label}
				</p>
				<p className="font-semibold text-[var(--text-color)]">
					{value}
				</p>
			</div>
		</div>
	);
}

function Bullet({ text }) {
	return (
		<div className="flex items-start gap-2">
			<i
				className="pi pi-check-circle mt-0.5"
				style={{ color: "var(--primary-color)" }}
			/>
			<span className="text-[var(--text-secondary-color)]">{text}</span>
		</div>
	);
}
