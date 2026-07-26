import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Chart } from "primereact/chart";
import "chart.js/auto";
import UserContext from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { Alternative } from "../components/Alternative.tsx";
import { useContext, useEffect, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { SelectItem } from "primereact/selectitem";
import axios from "axios";
import ListingsContext from "../context/ListingsContext";
// @ts-ignore
const BASE_URL = import.meta.env.VITE_BASE_URL;

/* -------------------- Dashboard -------------------- */

export default function Dashboard() {
	const { listings } = useContext(ListingsContext);

	// Map of listingId -> number of (sent/rejected) applications, fetched per-listing
	// since the backend has no single "all applications across my listings" endpoint.
	const [applicationCounts, setApplicationCounts] = useState<
		Record<string, number>
	>({});

	useEffect(() => {
		if (!listings || listings.length === 0) {
			setApplicationCounts({});
			return;
		}
		(async () => {
			const entries = await Promise.all(
				listings.map(async (listing: any) => {
					try {
						const res = await axios.get(
							`${BASE_URL}/application/listing/${listing._id}`,
							{ withCredentials: true }
						);
						return [listing._id, res.data.length] as const;
					} catch {
						return [listing._id, 0] as const;
					}
				})
			);
			setApplicationCounts(Object.fromEntries(entries));
		})();
	}, [listings]);

	const totalApplications = Object.values(applicationCounts).reduce(
		(sum, count) => sum + count,
		0
	);

	const topPerformingProperty = (() => {
		if (!listings || listings.length === 0) return "None";
		let best: any = null;
		for (const listing of listings as any[]) {
			const count = applicationCounts[listing._id] ?? 0;
			if (!best || count > (applicationCounts[best._id] ?? 0)) {
				best = listing;
			}
		}
		const bestCount = best ? (applicationCounts[best._id] ?? 0) : 0;
		return bestCount > 0
			? best.streetAddress || best.propertyTitle || "Unnamed property"
			: "None";
	})();

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
				titleColor: "#dbe7f2",
				bodyColor: "#dbe7f2",
				displayColors: false
			}
		},
		scales: {
			x: {
				grid: { color: "#626262" },
				ticks: {
					color: "#626262",
					maxRotation: 0,
					autoSkip: true,
					font: { size: 12 }
				}
			},
			y: {
				grid: { color: "#626262" },
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
									className="dashboard-action-button"
									onClick={() => navigate("/application")}
								/>
							</div>
							<div className="relative">
								<Button
									label="Messages"
									icon="pi pi-comments"
									className="dashboard-action-button"
									onClick={() => navigate("/chat")}
								/>
							</div>
							<Button
								icon="pi pi-pencil"
								rounded
								outlined
								className="dashboard-action-button"
								aria-label="Edit"
							/>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-12 items-stretch">
						{/* Big chart */}
						<div
							className="md:col-span-8 rounded-xl border border-[var(--surface-border)] p-4 flex flex-col h-full"
							style={{ background: "var(--surface-ground)" }}
						>
							<div className="flex items-center justify-between mb-3">
								<p className="font-bold text-white">
									Portfolio Engagement Trends:
								</p>
								<Dropdown
									value={range}
									onChange={e => setRange(e.value)}
									options={ranges}
									className="listing-flow-dropdown w-36 !rounded-lg"
									panelClassName="listing-flow-panel"
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
											...lineOptions.scales,
											x: {
												...lineOptions.scales.x,
												ticks: {
													...lineOptions.scales.x.ticks,
													minRotation: 45,
													maxRotation: 45
												}
											}
										}
									}}
									className="w-full h-full"
									style={{
										background: "var(--surface-ground)",
										borderRadius: "8px"
									}}
								/>
							</div>
						</div>
						<KpiRail
							totalApplications={totalApplications}
							topPerformingProperty={topPerformingProperty}
						/>
					</div>
					<Alternative
						ok={listings && listings.length > 0}
						fallback={<ListingsPlaceholder />}
					>
						<PropertyAnalytics
							listings={listings ?? []}
							applicationCounts={applicationCounts}
						/>
					</Alternative>
				</div>
			</div>
		</div>
	);
}

function ListingsPlaceholder() {
	return (
		<div className="rounded-md py-4 items-center flex flex-col gap-2 w-full" style={{ background: "var(--surface-100)", color: "var(--surface-900)" }}>
			<h2 className="font-bold text-xl" style={{ color: "var(--surface-900)" }}>No Listings</h2>
			<FiAlertCircle className="text-[var(--surface-900)]" size={24} />
			<p style={{ color: "var(--surface-900)" }}>
				Add Listings to View Listings Specific Data
			</p>
		</div>
	);
}

/* -------------------- Small helpers -------------------- */

type KPIProps = { title: string; value: string; icon: string; small?: boolean };

type KPIRailProps = {
	totalApplications: number;
	topPerformingProperty: string;
};

function KpiRail({ totalApplications, topPerformingProperty }: KPIRailProps) {
	return (
		<div className="md:col-span-4 space-y-6">
			<Kpi
				title="Total Applications"
				value={`${totalApplications}`}
				icon="pi pi-file"
			/>
			<Kpi
				title="Top Performing Property"
				value={topPerformingProperty}
				icon="pi pi-chart-bar"
			/>
			<Kpi
				title="Average Time to Lease"
				value="N/A"
				icon="pi pi-clock"
			/>
			<Kpi
				title="Portfolio Occupancy Rate"
				value="N/A"
				icon="pi pi-home"
			/>
		</div>
	);
}

function Kpi({ title, value, icon, small }: KPIProps) {
	return (
		<div
			className="rounded-xl border border-white/70 p-4"
			style={{ background: "var(--surface-ground)" }}
		>
			<div className="flex items-center gap-3">
				<i className={`${icon} text-xl text-white`} />
				<p className="text-sm text-white">{title}</p>
			</div>
			<p
				className={`mt-2 font-semibold text-white truncate ${
					small ? "text-sm" : "text-2xl"
				}`}
			>
				{value}
			</p>
		</div>
	);
}

type PropertyAnalyticsProps = {
	listings: any[];
	applicationCounts: Record<string, number>;
};

function PropertyAnalytics({
	listings,
	applicationCounts
}: PropertyAnalyticsProps) {
	const [selectedId, setSelectedId] = useState<string | undefined>(
		listings[0]?._id
	);
	const selected = listings.find(listing => listing._id === selectedId);

	const properties: SelectItem[] = listings.map(listing => ({
		label: listing.streetAddress || "No address set",
		value: listing._id
	}));

	const applicationsCount = selected
		? (applicationCounts[selected._id] ?? 0)
		: 0;
	const savesCount = selected?.likedBy?.length ?? 0;
	const timeOnMarketDays = selected?.createdAt
		? Math.max(
				0,
				Math.floor(
					(Date.now() - new Date(selected.createdAt).getTime()) /
						86400000
				)
			)
		: 0;

	return (
		<div className="rounded-xl border border-[var(--surface-border)] p-4 mt-10">
			<p className="font-bold text-2xl text-white">
				Property Analytics
			</p>
			<div className="grid gap-6 md:grid-cols-12 mt-4">
				<div className="md:col-span-9">
					<div
						className="rounded-2xl p-6"
						style={{
							background: "var(--surface-ground)",
						}}
					>
						<div className="flex items-center gap-3">
							<Dropdown
								value={selectedId}
								onChange={e => setSelectedId(e.value)}
								options={properties}
								className="mr-auto w-full md:w-96 listing-flow-dropdown !rounded-lg"
								panelClassName="listing-flow-panel"
								placeholder="Select a property"
							/>
						</div>

						<div className="mt-4 grid gap-5 md:grid-cols-12">
							<div className="md:col-span-7">
								<div
									className="h-54 rounded-xl"
									style={{
										background: "var(--gray-62)",
										// backgroundImage: `url(`${selected.photos[0]}`)`
									}}
								/>
							</div>

							<div className="md:col-span-5 flex flex-col gap-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-file mr-2 text-lg md:text-xl" />
											Applications
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											{applicationsCount}
										</div>
									</div>
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-bookmark mr-2 text-lg md:text-xl" />
											Saves
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											{savesCount}
										</div>
									</div>
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-share-alt mr-2 text-lg md:text-xl" />
											Shares
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											N/A
										</div>
									</div>
									<div className="metric-tile">
										<div className="metric-label text-lg md:text-xl font-semibold">
											<i className="pi pi-bolt mr-2 text-lg md:text-xl" />
											Performance
										</div>
										<div className="metric-value text-2xl md:text-3xl font-semibold">
											{(applicationsCount / savesCount || 0)}
										</div>
									</div>
								</div>

								<div className="self-start">
									<span className="font-semibold text-[var(--primary-color-text)]">
										Time on market: {timeOnMarketDays}d
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
							// className="mt-5 w-full md:w-auto rounded-xl px-4 py-2 font-medium border border-[var(--surface-border)]"
							className="listing-flow-action-button px-4 py-2.5"
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
		</div>
	);
}
