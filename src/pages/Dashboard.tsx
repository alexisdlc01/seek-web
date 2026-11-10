import UserContext from "../context/UserContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Alternative } from "../components/Alternative.tsx";
import { useContext, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import {
	api,
	gbp,
	fmtDay,
	monthLabel,
	timeAgo,
	activityRoute,
	engineerLink,
	currentMonth,
	createDraftListing,
	errMessage,
	greeting,
	remindLate
} from "../lib/landlord.js";
import { useLandlordRepairs } from "../components/RepairsPanel.jsx";
import ListingsContext from "../context/ListingsContext";
import {
	Page,
	PageHeader,
	Card,
	Tile,
	Table,
	Tr,
	Chip,
	btnPrimary,
	btnGhost,
	btnSmPrimary,
	btnSmGhost,
	Loading,
	Empty,
	ErrorState
} from "../components/sk.jsx";

/* -------------------- Dashboard -------------------- */

type Overview = {
	month: string;
	rentCollectedThisMonth: number;
	rentExpectedThisMonth: number;
	latePayments: number;
	lateAmount: number;
	seekFeeThisMonth: number;
	occupancy: { let: number; total: number };
	applicants: { total: number; qualified: number };
	autopay: { on: number; total: number };
	deposits: { protected: number; total: number };
	compliance: {
		listing: string;
		listingTitle: string;
		tenancy: string | null;
		kind: string;
		dueDate: string;
		severity: "low" | "medium" | "high";
		message: string;
	}[];
	properties: {
		listingId: string;
		roomsLet: number;
		roomsTotal: number;
		applicationsNextYear: number;
		rentStatus: "NOT_LET" | "LATE" | "PAID" | "DUE" | "NOT_DUE";
		rentCollected: number;
		arrears: number;
		complianceStatus: "OK" | "DUE_SOON" | "ACTION_NEEDED";
	}[];
	todo?: { kind: string; applicationId?: string; listingId?: string; listingTitle?: string; members?: number }[];
	recentActivity: { kind: string; at: string; title: string; link: string }[];
};

const SEVERITY_DOT: Record<string, string> = {
	high: "bg-sk-danger",
	medium: "bg-sk-warn",
	low: "bg-sk-muted"
};

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function Dashboard() {
	const { listings } = useContext(ListingsContext);

	const overview = useQuery<Overview>({
		queryKey: ["landlord-overview"],
		queryFn: async () => (await api.get("/landlord/overview")).data
	});
	const ov = overview.data;

	const toast = useRef<Toast>(null);
	const payments = useQuery({
		queryKey: ["landlord-payments", currentMonth()],
		queryFn: async () => (await api.get("/payments/landlord", { params: { month: currentMonth() } })).data
	});
	const tenancies = useQuery({
		queryKey: ["landlord-tenancies"],
		queryFn: async () => (await api.get("/tenancies/landlord")).data
	});
	const repairs = useLandlordRepairs();
	const payRows: any[] = payments.data?.rows ?? [];
	const lateRows = payRows.filter(r => r.status === "LATE");
	const openRepairs: any[] = (repairs.data ?? []).filter((r: any) => r.status !== "FIXED");

	const remind = async (rows: any[]) => {
		try {
			const { sent, skipped } = await remindLate(rows);
			toast.current?.show({
				severity: sent ? "success" : "warn",
				summary: sent ? "Reminder sent" : "No reminder sent",
				detail: skipped ? `${skipped} already reminded in the last 24 hours.` : "They will see it in their Seek thread.",
				life: 5000
			});
		} catch (err) {
			toast.current?.show({ severity: "error", summary: "Could not send the reminder", detail: errMessage(err), life: 5000 });
		}
	};

	// Month CSV: the KPIs, then one line per payment (/payments/landlord rows).
	const exportCsv = () => {
		const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
		const pounds = (p: number | null | undefined) => ((p ?? 0) / 100).toFixed(2);
		const m = currentMonth();
		const lines: unknown[][] = [
			["Seek export", m],
			["Rent collected", pounds(ov?.rentCollectedThisMonth)],
			["Rent expected", pounds(ov?.rentExpectedThisMonth)],
			["Late payments", ov?.latePayments ?? 0],
			["Late amount", pounds(ov?.lateAmount)],
			["Seek fee", pounds(ov?.seekFeeThisMonth)],
			[],
			["Tenant", "Property", "Amount", "Status", "Fee", "Payout"],
			...payRows.map(r => [r.tenant?.name, r.property, pounds(r.amount), r.status, pounds(r.fee), pounds(r.payout)])
		];
		const blob = new Blob([lines.map(l => l.map(cell).join(",")).join("\n")], { type: "text/csv" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `seek-${m}.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
	};

	const addProperty = async () => {
		try {
			navigate(`/add-listing/${await createDraftListing()}`);
		} catch (err) {
			toast.current?.show({ severity: "error", summary: "Could not start a property", detail: errMessage(err), life: 5000 });
		}
	};

	// Per-property figures (rooms let, open queue) come from the overview.
	const applicationCounts: Record<string, number> = Object.fromEntries(
		(ov?.properties ?? []).map(p => [p.listingId, p.applicationsNextYear])
	);

	const { user } = useContext(UserContext);
	const navigate = useNavigate();

	const today = new Date().toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long"
	});
	const firstName = (user?.name ?? "").split(" ")[0];

	const offers = (ov?.todo ?? []).filter((t: any) => t.kind === "MAKE_OFFER" && t.applicationId) as any[];
	type Item = { dot: string; title: string; sub: string; cta: string; to: string; primary: boolean; onClick?: () => void; href?: string };
	const needsYou: Item[] = ov
		? [
				...(offers.length > 0
					? offers.map(t => ({
							dot: "bg-sk-accent",
							title: t.title,
							sub: `${t.members ?? 1} ${t.members === 1 ? "person" : "people"} · all passports verified`,
							cta: "Make offer",
							to: `/application?listing=${t.listingId}&id=${t.applicationId}`,
							primary: true
						}))
					: ov.applicants.qualified > 0
					? [
							{
								dot: "bg-sk-accent",
								title: `${ov.applicants.qualified} qualified ${ov.applicants.qualified === 1 ? "household" : "households"} waiting`,
								sub: "Passport complete, ready for a decision",
								cta: "Review",
								to: "/applicants",
								primary: true
							}
						]
					: []),
				...lateRows.map(r => ({
					dot: "bg-sk-danger",
					title: `Rent late: ${r.tenant?.name ?? "Tenant"}, ${r.property ?? "your property"}`,
					sub: `${gbp(r.amount)} · due ${fmtDay(r.dueDate)}${r.remindersSent ? " · reminded" : ""}`,
					cta: "Remind",
					onClick: () => remind([r]),
					to: `/inbox?tenancy=${r.tenancy}`,
					primary: false
				})),
				...openRepairs.map((r: any) => ({
					dot: "bg-sk-warn",
					title: `Repair: ${r.title}, ${r.tenancy?.listing?.propertyTitle ?? r.tenancy?.listing?.streetAddress ?? "your property"}`,
					sub:
						r.status === "SCHEDULED" && r.scheduledFor
							? `Booked ${new Date(r.scheduledFor).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}`
							: `Reported by ${r.reportedBy?.name ?? "a tenant"}, not booked yet`,
					cta: "Thread",
					to: `/inbox?tenancy=${r.tenancy?._id ?? ""}`,
					primary: false
				})),
				...[...ov.compliance]
					.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
					.map(c => ({
						dot: SEVERITY_DOT[c.severity],
						title: `${c.listingTitle}: ${c.message}`,
						sub: `Due ${fmtDay(c.dueDate)}`,
						cta: engineerLink(c.kind)?.label ?? "Open",
						to: "/contracts",
						href: engineerLink(c.kind)?.href,
						primary: false,
						onClick: undefined
					}))
			]
		: [];

	return (
		<Page>
			<Toast ref={toast} position="bottom-right" />
			<PageHeader
				eyebrow={today}
				title={firstName ? `${greeting()}, ${firstName}` : greeting()}
			>
				<button type="button" className={btnGhost} onClick={exportCsv} disabled={!ov || payments.isLoading}>
					Export
				</button>
				<button type="button" className={btnGhost} onClick={() => navigate("/inbox")}>
					Messages
				</button>
				<button type="button" className={btnPrimary} onClick={addProperty}>
					Add property
				</button>
			</PageHeader>

			{overview.isLoading && <Loading label="Loading your overview" />}
			{overview.isError && (
				<ErrorState error={overview.error} onRetry={() => overview.refetch()} />
			)}

			{ov && (
				<>
					<div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
						<Tile
							label={`Rent collected · ${monthLabel(ov.month).split(" ")[0]}`}
							value={gbp(ov.rentCollectedThisMonth)}
							progress={
								ov.rentExpectedThisMonth
									? Math.min(100, Math.round((ov.rentCollectedThisMonth / ov.rentExpectedThisMonth) * 100))
									: 0
							}
							sub={`of ${gbp(ov.rentExpectedThisMonth)} expected`}
						/>
						<Tile
							label="Late payments"
							value={String(ov.latePayments)}
							sub={ov.latePayments ? `${gbp(ov.lateAmount)} outstanding` : "Nobody is late"}
							subClass={ov.latePayments ? "font-semibold text-sk-warn" : "text-sk-text2"}
						/>
						<Tile
							label="Occupancy"
							value={`${ov.occupancy.let} of ${ov.occupancy.total}`}
							sub={`${ov.autopay.on} of ${ov.autopay.total} tenants on autopay`}
						/>
						<Tile
							label="Qualified applicants"
							value={String(ov.applicants.qualified)}
							sub={`${ov.applicants.total} applications in total`}
						/>
						<Tile
							label="Deposits protected"
							value={`${ov.deposits.protected} of ${ov.deposits.total}`}
							sub={ov.deposits.protected < ov.deposits.total ? "Some still need protecting" : "All protected"}
							subClass={ov.deposits.protected < ov.deposits.total ? "font-semibold text-sk-warn" : "text-sk-text2"}
						/>
						<Tile
							label="Seek fee this month"
							value={gbp(ov.seekFeeThisMonth)}
							sub="1% of rent collected. No fee if rent isn't paid."
						/>
					</div>

					<div className="flex flex-wrap items-start gap-6">
						<Card title="Needs you today" className="min-w-0 flex-[1_1_360px] !gap-1">
							{needsYou.length === 0 && (
								<Empty title="You're all caught up">Nothing needs your attention right now.</Empty>
							)}
							{needsYou.map(item => (
								<div
									key={item.title}
									className="flex items-center gap-3 border-t border-sk-hair py-3"
								>
									<span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dot}`} />
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<span className="text-sm font-semibold">{item.title}</span>
										<span className="text-[12.5px] text-sk-muted">{item.sub}</span>
									</div>
									{item.onClick ? (
										<button type="button" className={btnSmGhost} onClick={item.onClick}>
											{item.cta}
										</button>
									) : item.href ? (
										<a href={item.href} target="_blank" rel="noopener noreferrer" className={btnSmGhost}>
											{item.cta}
										</a>
									) : (
										<Link to={item.to} className={item.primary ? btnSmPrimary : btnSmGhost}>
											{item.cta}
										</Link>
									)}
								</div>
							))}
						</Card>

						<Card title="Compliance" className="min-w-0 flex-[1_1_360px] !gap-1">
							{ov.compliance.length === 0 && (
								<Empty title="Nothing due">Certificates and licences are up to date.</Empty>
							)}
							{[...ov.compliance].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]).map((c, i) => (
								<div key={i} className="flex items-start gap-3 border-t border-sk-hair py-3">
									<span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${SEVERITY_DOT[c.severity]}`} />
									<div className="flex min-w-0 flex-1 flex-col gap-0.5">
										<span className="text-sm font-semibold">{c.listingTitle}</span>
										<span className="text-[12.5px] text-sk-text2">{c.message}</span>
									</div>
									<span className="shrink-0 text-[12.5px] text-sk-muted">{fmtDay(c.dueDate)}</span>
								</div>
							))}
						</Card>
					</div>

					<Card title="Recent activity" className="!gap-1">
						{ov.recentActivity.length === 0 && (
							<Empty title="No activity yet">Payments, applications and repairs show up here.</Empty>
						)}
						{ov.recentActivity.map((a, i) => (
							<Link
								key={i}
								to={activityRoute(a.kind, a.link)}
								className="flex items-center justify-between gap-3 border-t border-sk-hair py-3 text-sm text-sk-text no-underline hover:underline"
							>
								<span className="min-w-0 flex-1 truncate">{a.title}</span>
								<span className="shrink-0 text-[12.5px] text-sk-muted">{timeAgo(a.at)}</span>
							</Link>
						))}
					</Card>
				</>
			)}

			<Card title="Properties" className="min-w-0">
				<Alternative
					ok={listings && listings.length > 0}
					fallback={<ListingsPlaceholder onAdd={addProperty} />}
				>
					<Table head={["Property", "Rooms", `Rent · ${monthLabel(currentMonth()).split(" ")[0].slice(0, 3)}`, "Collected", "Arrears", "Compliance", "Next year"]}>
						{(listings ?? []).map((l: any) => {
							const name = l.propertyTitle || l.streetAddress || "Untitled listing";
							const homeTenancies: any[] = (tenancies.data ?? []).filter(
								(t: any) => t.listing?._id === l._id && t.status === "ACTIVE"
							);
							const row = ov?.properties?.find(p => p.listingId === l._id);
							const let_ = row?.roomsLet ?? 0;
							const total = row?.roomsTotal ?? l.numOfPeople ?? 0;
							const endDates = homeTenancies
								.map((t: any) => t.endDate)
								.filter(Boolean)
								.sort();
							const apps = row?.applicationsNextYear ?? 0;
							return (
								<Tr key={l._id}>
									<td className="py-3 pr-2 font-semibold">
										<Link
											to={`/applicants/${l._id}`}
											className="text-sk-text no-underline hover:underline"
										>
											{name}
										</Link>
									</td>
									<td className="px-2 py-3">{l.isDraft || !total ? "-" : `${let_} of ${total}`}</td>
									<td className="px-2 py-3">
										{!row || row.rentStatus === "NOT_LET" ? "-" : row.rentStatus === "PAID" ? "All paid" : row.rentStatus === "LATE" ? "Late" : row.rentStatus === "NOT_DUE" ? "Not due yet" : "Due"}
									</td>
									<td className="px-2 py-3">{row ? gbp(row.rentCollected) : "-"}</td>
									<td className={`px-2 py-3 ${row?.arrears ? "font-semibold text-sk-warn" : ""}`}>{row ? (row.arrears ? gbp(row.arrears) : "None") : "-"}</td>
									<td className="px-2 py-3">
										{!row ? "-" : row.complianceStatus === "OK" ? <Chip tone="ok">Up to date</Chip> : row.complianceStatus === "DUE_SOON" ? <Chip tone="warn">Due soon</Chip> : <Chip tone="warn">Action needed</Chip>}
									</td>
									<td className="px-2 py-3">
										{l.isDraft ? (
											<Chip tone="muted">Draft</Chip>
										) : !l.isVerified ? (
											<Chip tone="warn">Awaiting verification</Chip>
										) : total && let_ < total ? (
											<Chip tone="accent">Listed · {apps} {apps === 1 ? "application" : "applications"}</Chip>
										) : endDates.length ? (
											<Chip tone="ok">Ends {new Date(endDates[0]).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</Chip>
										) : (
											<Chip tone="muted">Not listed</Chip>
										)}
									</td>
								</Tr>
							);
						})}
					</Table>
				</Alternative>
			</Card>

			{listings && listings.length > 0 && (
				<PropertyAnalytics
					listings={listings}
					applicationCounts={applicationCounts}
				/>
			)}
		</Page>
	);
}

function ListingsPlaceholder({ onAdd }: { onAdd: () => void }) {
	return (
		<div className="flex flex-col items-center gap-2 rounded-xl bg-sk-hair py-6">
			<h2 className="font-display text-lg font-semibold">No properties yet</h2>
			<p className="text-sm text-sk-muted">Add a property to see its applicants and rent here.</p>
			<button type="button" className={btnSmPrimary} onClick={onAdd}>Add a property</button>
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
		<Card title="Property analytics">
			<select
				value={selectedId}
				onChange={e => setSelectedId(e.target.value)}
				aria-label="Property"
				className="h-11 w-full rounded-xl border border-sk-border2 bg-sk-card2 px-3 text-sm text-sk-text md:w-96"
			>
				{listings.map(l => (
					<option key={l._id} value={l._id}>
						{l.streetAddress || "No address set"}
					</option>
				))}
			</select>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
				<Tile label="Applications" value={String(applicationsCount)} className="!bg-sk-card2" />
				<Tile label="Saves" value={String(savesCount)} className="!bg-sk-card2" />
				<Tile label="Time on market" value={`${timeOnMarketDays}d`} className="!bg-sk-card2" />
				<Tile
					label="Applications per save"
					value={savesCount ? (applicationsCount / savesCount).toFixed(1) : "0"}
					className="!bg-sk-card2"
				/>
			</div>
		</Card>
	);
}
