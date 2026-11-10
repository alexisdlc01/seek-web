import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import axios, { AxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import DeclineDialog from "../components/DeclineDialog";
import ListingsContext from "../context/ListingsContext.jsx";
import { Chip, Page, PageHeader, btnSmGhost, btnSmPrimary } from "../components/sk.jsx";
import { VerifiedStudentBadge } from "../components/StudentVerification.jsx";
import { API_BASE, fmtDate, gbp, timeAgo } from "../lib/landlord.js";

type Applicant = {
	_id: string;
	name: string;
	email?: string;
	profilePicUrl?: string;
	studentVerified?: boolean;
	university?: string | null;
};

type ApplicationStage = "NOT_SENT" | "SENT" | "VIEWED" | "OFFERED" | "ACCEPTED" | "SIGNED" | "REJECTED";

type Application = {
	_id: string;
	stage: ApplicationStage;
	createdAt: string;
	conversation?: string | { _id?: string };
	applicants: string[];
	applicantUsers?: Applicant[];
	listing?: string | { _id?: string };
	readiness?: number;
	qualified?: boolean;
	viewingAt?: string | null;
	holdingDeposit?: number | null;
	offerExpiresAt?: string | null;
	sentAt?: string | null;
	members?: {
		user: string;
		name: string;
		shareExpiresAt?: string | null;
		passport?: { ready?: boolean };
	}[];
	// Attached client-side so the all-listings view can say which property
	// each application is for.
	listingTitle?: string;
	listingPeople?: number;
};

type ColumnKey = "SUBMITTED" | "QUALIFIED" | "VIEWED" | "OFFER" | "SIGNED";

const COLUMNS: { key: ColumnKey; label: string; empty: string }[] = [
	{ key: "SUBMITTED", label: "Submitted", empty: "New applications land here." },
	{ key: "QUALIFIED", label: "Qualified", empty: "Households whose passports are all complete appear here, first come first served." },
	{ key: "VIEWED", label: "Viewed", empty: "Households move here after their viewing. Make the offer in one click." },
	{ key: "OFFER", label: "Offer and hold", empty: "Holding deposit collected (max one week). 15-day clock to sign." },
	{ key: "SIGNED", label: "Signed", empty: "Contract emailed to all and filed in their app. Deposit registration starts." }
];

// Where an application sits on the board. Rejected ones are off the board.
function columnOf(a: Application, signed: Set<string>): ColumnKey | null {
	if (a.stage === "SIGNED") return "SIGNED";
	if (a.stage === "ACCEPTED") return signed.has(a._id) ? "SIGNED" : "OFFER";
	if (a.stage === "OFFERED") return "OFFER";
	if (a.stage === "VIEWED") return "VIEWED";
	if (a.stage !== "SENT") return null;
	if (a.viewingAt && new Date(a.viewingAt).getTime() <= Date.now()) return "VIEWED";
	return a.qualified ? "QUALIFIED" : "SUBMITTED";
}

export default function Applicants() {
	const navigate = useNavigate();
	const { listingId } = useParams<{ listingId: string }>();
	const { listings } = useContext(ListingsContext)!;
	const toast = useRef<Toast>(null);
	const [decliningApp, setDecliningApp] = useState<Application | null>(null);

	const [applications, setApplications] = useState<Application[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<string | null>(null);
	// Applications whose tenancy contract is fully signed.
	const [signedIds, setSignedIds] = useState<Set<string>>(new Set());

	// With a listingId, show that listing's applications; without one (the
	// Dashboard's "Applications" button), show applications across every
	// listing the landlord owns.
	const listing = listingId ? listings?.find(l => l._id === listingId) : undefined;
	const targetListings = listingId
		? [listing ?? { _id: listingId }]
		: listings ?? [];
	
	const targetIds = targetListings.map(l => l._id).join(",");

	// Criteria come from the listing itself; Right to Rent is required by law.
	const criteria: string[] = ["Right to Rent"];
	if (listing) {
		const c = listing.criteria ?? {};
		const G: Record<string, string> = { UK_ONLY: "UK guarantor needed", UK_OR_SERVICE: "UK guarantor or guarantor service", NONE: "No guarantor needed" };
		if (c.guarantor && G[c.guarantor]) criteria.push(G[c.guarantor]);
		if (c.referencesRequired) criteria.push("References required");
		if (c.maxHousehold) criteria.push(`Up to ${c.maxHousehold} people`);
		if (listing.monthlyRent && listing.numOfPeople) {
			criteria.push(`${gbp(Math.round((listing.monthlyRent * 100) / listing.numOfPeople))} pcm each, fixed (no bidding)`);
		}
		criteria.push("First qualified household is first in line");
	} else {
		criteria.push("Fixed rent, no bidding", "First qualified household is first in line");
	}

	const loadApplications = useCallback(async () => {
		if (targetListings.length === 0) {
			setApplications([]);
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		setLoadError(null);
		try {
			const perListing = await Promise.all(
				targetListings.map(async l => {
					const { data } = await axios.get<Application[]>(
						`${API_BASE}/application/listing/${l._id}`,
						{ withCredentials: true }
					);
					return (data ?? []).map(a => ({
						...a,
						listing: a.listing ?? l._id,
						listingTitle: listingTitleOf(l),
						listingPeople: l.numOfPeople
					}));
				})
			);
			// Keep the order the API returns (qualified first, then first sent):
			// the home goes to the first qualified household, no bidding.
			const all = perListing.flat();
			setApplications(all);

			if (all.some(a => a.stage === "ACCEPTED")) {
				try {
					const [tenancies, contracts] = await Promise.all([
						axios.get<{ _id: string; application?: string | null }[]>(`${API_BASE}/tenancies/landlord`, { withCredentials: true }),
						axios.get<{ status: string; tenancy?: { _id?: string } | string }[]>(`${API_BASE}/contracts/landlord`, { withCredentials: true })
					]);
					const signedTenancies = new Set(
						(contracts.data ?? [])
							.filter(c => c.status === "SIGNED")
							.map(c => (typeof c.tenancy === "string" ? c.tenancy : c.tenancy?._id))
					);
					setSignedIds(
						new Set(
							(tenancies.data ?? [])
								.filter(t => t.application && signedTenancies.has(t._id))
								.map(t => String(t.application))
						)
					);
				} catch {
					setSignedIds(new Set());
				}
			}
		} catch (error) {
			setLoadError(getErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
		// targetIds captures which listings we're loading for.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [targetIds]);

	useEffect(() => {
		loadApplications();
	}, [loadApplications]);

	const updateStage = async (application: Application, action: "offer" | "reject", reason?: string) => {
		setPendingId(application._id);
		try {
			// The offer is a POST (15 days to accept, holding deposit recorded); reject is a PATCH.
			await axios.request({
				method: action === "offer" ? "post" : "patch",
				url: `${API_BASE}/application/${application._id}/${action}`,
				data: reason ? { reason } : {},
				withCredentials: true
			});
			await loadApplications();
		} catch (error) {
			const queueBlocked = axios.isAxiosError(error) && error.response?.status === 409;
			if (queueBlocked) await loadApplications();
			toast.current?.show({
				severity: queueBlocked ? "warn" : "error",
				summary: queueBlocked ? "Not next in line" : action === "offer" ? "Offer failed" : "Reject failed",
				detail: getErrorMessage(error),
				life: 4000
			});
		} finally {
			setPendingId(null);
		}
	};

	const openChat = (application: Application) => {
		const conversationId = getConversationId(application);
		if (!conversationId) {
			toast.current?.show({
				severity: "warn",
				summary: "No conversation",
				detail: "This application has no chat attached to it.",
				life: 3000
			});
			return;
		}
		navigate(`/chat?conversation=${conversationId}`);
	};

	// The first qualified household of each listing is first in line.
	const firstInLine = new Set<string>();
	// A live offer on a listing blocks its queue (the backend answers 409).
	const seenListings = new Set<string>(
		applications
			.filter(a => a.stage === "OFFERED" && !!a.offerExpiresAt && new Date(a.offerExpiresAt).getTime() > Date.now())
			.map(getListingId)
	);
	for (const a of applications) {
		const lid = getListingId(a);
		if (["SENT", "VIEWED"].includes(a.stage) && a.qualified && !seenListings.has(lid)) {
			seenListings.add(lid);
			firstInLine.add(a._id);
		}
	}
	const rejectedCount = applications.filter(a => a.stage === "REJECTED").length;

	const renderApplicationCard = (application: Application) => {
		const applicants = application.applicantUsers ?? [];
		const busy = pendingId === application._id;
		const count = applicants.length || application.applicants.length;
		const members = application.members ?? [];
		const passportsReady = members.filter(m => m.passport?.ready).length;
		const verified = applicants.filter(a => a.studentVerified);

		return (
			<article
				key={application._id}
				className="flex flex-col gap-2 rounded-xl bg-sk-card2 p-3"
			>
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sk-tint text-xs font-bold text-sk-link">
						{initialsOf(applicants)}
					</div>
					<span className="min-w-0 flex-1 truncate text-sm font-semibold">
						{formatApplicantNames(applicants)}
					</span>
					{firstInLine.has(application._id) && <Chip tone="ok">First in line</Chip>}
				</div>
				{!listingId && application.listingTitle && (
					<span className="truncate text-[12.5px] font-semibold text-sk-link">
						{application.listingTitle}
					</span>
				)}
				<div className="flex flex-wrap items-center gap-2">
					<Chip tone={application.qualified ? "ok" : "warn"}>
						Passports {passportsReady} of {members.length || count}
					</Chip>
					{verified.length > 0 && (
						count === 1
							? <VerifiedStudentBadge university={verified[0].university} />
							: <Chip tone="ok">{verified.length} of {count} verified students</Chip>
					)}
					{application.viewingAt && (
						<Chip tone="accent">Viewing {formatViewing(application.viewingAt)}</Chip>
					)}
					{application.stage === "OFFERED" && (
						<Chip tone="accent">
							Offer out{application.offerExpiresAt ? ` · until ${new Date(application.offerExpiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}
						</Chip>
					)}
					{application.holdingDeposit ? <Chip tone="muted">Holding deposit £{application.holdingDeposit} each</Chip> : null}
				</div>
				<span className="text-xs text-sk-muted">
					{application.qualified
						? "All criteria pass"
						: application.listingPeople && (members.length || count) < application.listingPeople
							? `${members.length || count} ${(members.length || count) === 1 ? "person" : "people"}, needs ${application.listingPeople}`
							: "Waiting on students"}
					{" · "}Sent {timeAgo(application.sentAt || application.createdAt)}
				</span>
				<div className="flex flex-wrap gap-2 pt-1">
					<Link
						to={`/application?listing=${getListingId(application)}&id=${application._id}`}
						className={btnSmGhost}
					>
						Review
					</Link>
					<button
						type="button"
						className={btnSmGhost}
						onClick={() => openChat(application)}
					>
						Chat
					</button>
					{["SENT", "VIEWED"].includes(application.stage) && (
						<button
							type="button"
							className={`${btnSmPrimary} disabled:opacity-50`}
							disabled={busy || !firstInLine.has(application._id)}
							title={firstInLine.has(application._id) ? undefined : "Only the first qualified household can get the offer."}
							onClick={() => updateStage(application, "offer")}
						>
							{busy ? "Working…" : "Make offer"}
						</button>
					)}
					{application.stage !== "REJECTED" && (
						<button
							type="button"
							className={`${btnSmGhost} !text-sk-danger disabled:opacity-50`}
							disabled={busy}
							onClick={() => setDecliningApp(application)}
						>
							Reject
						</button>
					)}
				</div>
			</article>
		);
	};

	return (
		<Page>
			<Toast ref={toast} position="bottom-right" />
			<DeclineDialog
				visible={!!decliningApp}
				busy={!!pendingId}
				onHide={() => setDecliningApp(null)}
				onConfirm={async reason => {
					if (decliningApp) await updateStage(decliningApp, "reject", reason);
					setDecliningApp(null);
				}}
			/>

			<PageHeader
				eyebrow={listing ? "Applications for" : "Applications across all properties"}
				title={listing ? listingTitleOf(listing) : "Applicants"}
			>
				<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
					Property
					<select
						className="h-11 min-w-[220px] rounded-xl border border-sk-border2 bg-sk-card px-3 text-sm text-sk-text"
						value={listingId ?? ""}
						onChange={e =>
							navigate(e.target.value ? `/applicants/${e.target.value}` : "/applicants")
						}
					>
						<option value="">All properties</option>
						{(listings ?? []).map(l => (
							<option key={l._id} value={l._id}>
								{listingTitleOf(l)}
							</option>
						))}
					</select>
				</label>
			</PageHeader>

			<section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-sk-border bg-sk-card px-5 py-4">
				<span className="text-sm font-semibold">Criteria checked automatically</span>
				<div className="flex flex-1 flex-wrap gap-2 text-[13px]">
					{criteria.map(c => (
						<span key={c} className="rounded-lg bg-sk-hair px-2.5 py-1.5">
							{c}
						</span>
					))}
				</div>
				{listing && (
					<Link to={`/add-listing/${listing._id}`} className={btnSmGhost}>
						Edit criteria
					</Link>
				)}
			</section>

			{isLoading ? (
				<p className="text-sm text-sk-muted">Loading applications...</p>
			) : loadError ? (
				<p className="text-sm text-sk-danger">{loadError}</p>
			) : targetListings.length === 0 ? (
				<p className="text-sm text-sk-muted">
					You have no listings yet, so there are no applications to show.
				</p>
			) : (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] items-start gap-4">
					{COLUMNS.map(col => {
						const items = applications.filter(a => columnOf(a, signedIds) === col.key);
						return (
							<section
								key={col.key}
								className="flex flex-col gap-2.5 rounded-2xl bg-sk-hair p-3"
							>
								<h2 className="flex justify-between px-1 pt-1 text-sm font-semibold">
									{col.label}
									<span className="text-sk-muted">{items.length}</span>
								</h2>
								{items.length === 0 ? (
									<p className="p-1 text-[12.5px] text-sk-muted">{col.empty}</p>
								) : (
									items.map(renderApplicationCard)
								)}
							</section>
						);
					})}
				</div>
			)}
			{!isLoading && !loadError && rejectedCount > 0 && (
				<p className="text-[12.5px] text-sk-muted">
					{rejectedCount} declined {rejectedCount === 1 ? "household is" : "households are"} not shown.
				</p>
			)}
		</Page>
	);
}

function listingTitleOf(listing: { _id: string; streetAddress?: string; propertyTitle?: string }): string {
	return listing.streetAddress || listing.propertyTitle || "Untitled listing";
}

function getListingId(application: Application): string {
	const { listing } = application;
	return (typeof listing === "string" ? listing : listing?._id) ?? "";
}

function getConversationId(application: Application): string | undefined {
	const { conversation } = application;
	if (!conversation) return undefined;
	return typeof conversation === "string" ? conversation : conversation._id;
}

function formatApplicantNames(applicants: Applicant[]): string {
	const names = applicants.map(a => a.name).filter(Boolean);
	if (names.length === 0) return "Applicant";
	if (names.length <= 2) return names.join(" and ");
	return `${names[0]} & ${names.length - 1} others`;
}

function initialsOf(applicants: Applicant[]): string {
	const name = applicants[0]?.name ?? "";
	const initials = name
		.split(" ")
		.map(word => word[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
	return initials || "?";
}

function formatViewing(dateStr: string): string {
	return new Date(dateStr).toLocaleString("en-GB", {
		weekday: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}

function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<{ message?: string | string[] }>;
		const message = axiosError.response?.data?.message;
		if (Array.isArray(message)) return message.join(", ");
		return message ?? axiosError.message;
	}
	return "Please try again shortly.";
}
