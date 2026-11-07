import { MouseEventHandler, useContext, useRef, useState } from "react";
import { Button } from "primereact/button";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import React from "react";
import { FiHome } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ListingsContext from "../context/ListingsContext.jsx";
import {
	Page,
	Card,
	Chip,
	Table,
	Tr,
	Loading,
	ErrorState,
	btnGhost,
	btnPrimary,
	btnSmGhost,
	btnSmPrimary
} from "../components/sk.jsx";
import DeclineDialog from "../components/DeclineDialog";
import { AdviceCard } from "../components/StudentBits.jsx";
import axios from "axios";
import { api, errMessage, fmtDate, fmtDateTime, openAttachment } from "../lib/landlord.js";

type PassportItem = {
	type: string;
	label: string;
	status: string;
	required: boolean;
	expiresAt?: string | null;
	url?: string | null;
	key?: string | null;
};
type Member = {
	user: string;
	name: string;
	shareExpiresAt?: string | null;
	universityDetails?: { text: string; university?: string; course?: string; year?: string } | null;
	passport?: {
		ready: boolean;
		percent: number;
		missingRequired: string[];
		sections: { key: string; label: string; items: PassportItem[] }[];
	};
};
type ApplicationData = {
	_id: string;
	stage: string;
	createdAt: string;
	sentAt?: string | null;
	viewingAt?: string | null;
	offerExpiresAt?: string | null;
	readiness: number;
	qualified: boolean;
	criteria?: { key?: string; label: string; passed: boolean; detail?: string }[];
	owner: string;
	conversation?: string | { _id?: string };
	applicantUsers?: { _id: string; name: string; email?: string }[];
	members: Member[];
};

const itemOf = (m: Member, type: string): PassportItem | undefined =>
	m.passport?.sections.flatMap(s => s.items).find(i => i.type === type);

function Cell({ item }: { item?: PassportItem }) {
	if (!item || item.status === "MISSING")
		return <span className="font-semibold text-sk-muted">Missing</span>;
	if (item.status === "VERIFIED")
		return <span className="font-semibold text-sk-ok">Verified</span>;
	return <span className="font-semibold text-sk-warn">Checking</span>;
}

const shareActive = (m: Member) =>
	!m.shareExpiresAt || new Date(m.shareExpiresAt).getTime() > Date.now();

const openItem = (item: PassportItem) =>
	openAttachment(item).catch(e => window.alert(errMessage(e, "We couldn't open this document.")));

export default function ApplicationPage() {
	const toast = useRef<Toast>(null);
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [params] = useSearchParams();
	const listingId = params.get("listing") ?? "";
	const applicationId = params.get("id") ?? "";
	const { listings } = useContext(ListingsContext)!;

	const q = useQuery<ApplicationData[]>({
		queryKey: ["application-listing", listingId],
		enabled: !!listingId,
		queryFn: async () => (await api.get(`/application/listing/${listingId}`)).data
	});
	const application = q.data?.find(a => a._id === applicationId);
	// First-come queue of qualified households: only the first one can get the offer.
	const offerOpen = !!q.data?.some(a => a.stage === "OFFERED" && !!a.offerExpiresAt && new Date(a.offerExpiresAt).getTime() > Date.now());
	const nextInLine = offerOpen ? undefined : q.data?.find(a => ["SENT", "VIEWED"].includes(a.stage) && a.qualified);
	const canOffer = !!application && nextInLine?._id === application._id;
	const listing = listings?.find(l => l._id === listingId);
	const property = listing?.streetAddress || listing?.propertyTitle || "this property";

	const decide = useMutation({
		// The offer is a POST (15 days to accept, holding deposit recorded); reject is a PATCH.
		mutationFn: async ({ action, reason }: { action: "offer" | "reject"; reason?: string }) =>
			(await (action === "offer" ? api.post(`/application/${applicationId}/offer`) : api.patch(`/application/${applicationId}/reject`, { reason }))).data,
		onSuccess: (_d, { action }) => {
			setDeclining(false);
			qc.invalidateQueries({ queryKey: ["application-listing", listingId] });
			toast.current?.show({
				severity: action === "offer" ? "success" : "warn",
				summary: action === "offer" ? "Offer sent" : "Rejected",
				detail: action === "offer" ? "The household has 15 days to accept." : "You have rejected the application",
				life: 3000
			});
		},
		onError: e => {
			const queue = axios.isAxiosError(e) && e.response?.status === 409;
			if (queue) qc.invalidateQueries({ queryKey: ["application-listing", listingId] });
			toast.current?.show({
				severity: queue ? "warn" : "error",
				summary: queue ? "Not next in line" : "Couldn't update",
				detail: errMessage(e),
				life: 5000
			});
		}
	});

	const viewing = useMutation({
		mutationFn: async (viewingAt: string) =>
			(await api.patch(`/application/${applicationId}/viewing`, { viewingAt })).data,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["application-listing", listingId] });
			toast.current?.show({ severity: "success", summary: "Viewing scheduled", life: 3000 });
		},
		onError: e =>
			toast.current?.show({ severity: "error", summary: "Couldn't schedule", detail: errMessage(e), life: 4000 })
	});

	const report = useMutation({
		mutationFn: async (text: string) =>
			(await api.post("/flags", { text, category: "OTHER", reportedUser: application?.owner })).data,
		onSuccess: () =>
			toast.current?.show({
				severity: "info",
				summary: "Report submitted",
				detail: "Thanks, our team will take a look.",
				life: 4000
			}),
		onError: e =>
			toast.current?.show({ severity: "error", summary: "Couldn't report", detail: errMessage(e), life: 4000 })
	});

	const [declining, setDeclining] = useState(false);
	const confirmOffer: MouseEventHandler<HTMLButtonElement> = event => {
		confirmPopup({
			target: event.currentTarget,
			message: "Make an offer to this household?",
			icon: "pi pi-info-circle",
			defaultFocus: "accept",
			accept: () => decide.mutate({ action: "offer" })
		});
	};

	const openChat = () => {
		const c = application?.conversation;
		const id = typeof c === "string" ? c : c?._id;
		navigate(id ? `/chat?conversation=${id}` : "/inbox");
	};

	return (
		<Page>
			<Toast ref={toast} />
			<ConfirmPopup />
			<DeclineDialog
				visible={declining}
				busy={decide.isPending}
				onHide={() => setDeclining(false)}
				onConfirm={reason => decide.mutate({ action: "reject", reason })}
			/>

			{!listingId || !applicationId ? (
				<EmptyApplications text="Pick an application from the Applicants page to review it." />
			) : q.isLoading ? (
				<Loading label="Loading application" />
			) : q.isError ? (
				<ErrorState error={q.error} onRetry={() => q.refetch()} />
			) : !application ? (
				<EmptyApplications text="This application could not be found. It may have been withdrawn." />
			) : (
				<ApplicationCard
					data={application}
					property={property}
					holdingDeposit={listing?.holdingDeposit}
					accept={confirmOffer}
					canOffer={canOffer}
					viewingSlots={listing?.viewingSlots}
					reject={() => setDeclining(true)}
					chat={openChat}
					busy={decide.isPending}
					onViewing={v => viewing.mutate(v)}
					viewingBusy={viewing.isPending}
					onReport={text => report.mutate(text)}
				/>
			)}
		</Page>
	);
}

const STAGE_LABEL: Record<string, string> = {
	SENT: "Submitted",
	VIEWED: "Viewed",
	OFFERED: "Offer sent",
	ACCEPTED: "Offer accepted",
	SIGNED: "Signed",
	REJECTED: "Rejected"
};

const EmptyApplications: React.FC<{ text: string }> = ({ text }) => {
	return (
		<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sk-border2 bg-sk-card p-16 text-center">
			<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sk-hair">
				<FiHome className="text-sk-muted" size={50} />
			</div>
			<h3 className="mb-2 font-display text-2xl font-semibold">No application selected</h3>
			<p className="max-w-xs text-lg text-sk-muted">{text}</p>
			<Link to="/applicants" className={`${btnGhost} mt-4`}>
				Back to applicants
			</Link>
		</div>
	);
};

interface ApplicationCardProps {
	data: ApplicationData;
	property: string;
	holdingDeposit?: number;
	viewingSlots?: string[];
	accept: MouseEventHandler<HTMLButtonElement>;
	canOffer: boolean;
	reject: MouseEventHandler<HTMLButtonElement>;
	chat: () => void;
	busy: boolean;
	onViewing: (iso: string) => void;
	viewingBusy: boolean;
	onReport: (text: string) => void;
}

function ApplicationCard({
	data,
	property,
	holdingDeposit,
	viewingSlots,
	accept,
	canOffer,
	reject,
	chat,
	busy,
	onViewing,
	viewingBusy,
	onReport
}: ApplicationCardProps) {
	const [visible, setVisible] = useState(false);
	const [reportMsg, setReportMsg] = useState("");
	const [viewingInput, setViewingInput] = useState("");

	const names = data.members.map(m => m.name).join(" and ") || "Applicant";
	const notReady = data.members.filter(m => !m.passport?.ready);
	const criteria = data.criteria ?? [];
	const failed = criteria.filter(c => !c.passed);
	const summary = data.qualified
		? `Everyone has a complete Seek Passport and every criterion passes, so this household is qualified. ${data.members.length} ${data.members.length === 1 ? "person" : "people"} checked.`
		: failed.length
			? `Not qualified yet. ${failed.map(c => c.detail || c.label).join(" ")}`
			: notReady.length
				? `Not qualified yet. Still missing required documents: ${notReady.map(m => m.name).join(", ")}.`
				: "Not every person on the listing has joined this application yet.";

	const submitReport = () => {
		onReport(reportMsg.trim());
		setVisible(false);
		setReportMsg("");
	};

	return (
		<React.Fragment>
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex flex-col gap-1">
					<Link to="/applicants" className="text-[13px] font-semibold text-sk-link no-underline">
						← Applicants · {property}
					</Link>
					<h1 className="font-display text-2xl font-semibold md:text-[30px]">{names}</h1>
					<span className="flex flex-wrap items-center gap-2 text-[13.5px] text-sk-muted">
						Applied {fmtDate(data.sentAt || data.createdAt)}
						<Chip tone={data.qualified ? "ok" : "warn"}>
							{data.qualified ? "Qualified" : "Not ready"} · {data.readiness}%
						</Chip>
						<Chip tone="muted">{STAGE_LABEL[data.stage] ?? data.stage}</Chip>
					</span>
				</div>
				<div className="flex flex-wrap gap-2.5">
					<button type="button" className={btnGhost} onClick={chat}>
						Message household
					</button>
					<button type="button" className={btnGhost} onClick={() => setVisible(true)}>
						Report
					</button>
					{data.stage !== "REJECTED" && (
						<button type="button" className={`${btnGhost} !text-sk-danger`} disabled={busy} onClick={reject}>
							Reject
						</button>
					)}
					{["SENT", "VIEWED"].includes(data.stage) && (
						<button
							type="button"
							className={`${btnPrimary} disabled:opacity-50`}
							disabled={busy || !canOffer}
							title={canOffer ? undefined : "Only the first qualified household can get the offer."}
							onClick={accept}
						>
							Make offer
						</button>
					)}
				</div>
			</div>

			<section className="flex items-start gap-3.5 rounded-2xl bg-sk-card2 px-5 py-4">
				<span className="pt-0.5 text-xs font-bold text-sk-link">Readiness</span>
				<span className="text-sm leading-normal text-sk-text2">{summary}</span>
			</section>
			{["SENT", "VIEWED"].includes(data.stage) && !canOffer && (
				<span className="text-[13px] text-sk-muted">
					{data.qualified
						? "Another qualified household is first in line. Offers go out in the order households qualified."
						: "Offers go to qualified households only, in the order they qualified."}
				</span>
			)}
			<AdviceCard topic="application" applicationId={data._id} showActions={false} />
			{criteria.length > 0 && (
				<ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
					{criteria.map(c => (
						<li key={c.key ?? c.label} className="flex flex-wrap items-center gap-2">
							<Chip tone={c.passed ? "ok" : "warn"}>{c.passed ? "Pass" : "Fail"}</Chip>
							<span className="font-semibold">{c.label}</span>
							{c.detail && <span className="text-[13px] text-sk-muted">{c.detail}</span>}
						</li>
					))}
				</ul>
			)}

			<Card title="Household checks">
				<Table
					minWidth={840}
					head={["Student", "Course", "Right to Rent", "Student status", "Funds", "Guarantor", "References", "Ready"]}
				>
					{data.members.map(m => (
						<Tr key={m.user}>
							<td className="py-3 pr-2">
								<span className="font-semibold">{m.name}</span>
								{m.user === data.owner && (
									<>
										<br />
										<span className="text-[12.5px] text-sk-muted">Lead applicant</span>
									</>
								)}
							</td>
							<td className="px-2 py-3 text-[13px] text-sk-text2">
								{m.universityDetails
									? [m.universityDetails.course, m.universityDetails.year ? `Year ${m.universityDetails.year}` : ""].filter(Boolean).join(" · ") ||
										m.universityDetails.university ||
										m.universityDetails.text
									: <span className="text-sk-muted">Not given</span>}
							</td>
							<td className="px-2 py-3"><Cell item={itemOf(m, "RIGHT_TO_RENT")} /></td>
							<td className="px-2 py-3"><Cell item={itemOf(m, "STUDENT_STATUS")} /></td>
							<td className="px-2 py-3"><Cell item={itemOf(m, "PROOF_OF_FUNDS")} /></td>
							<td className="px-2 py-3"><Cell item={itemOf(m, "GUARANTOR_AGREEMENT")} /></td>
							<td className="px-2 py-3">
								<Cell item={itemOf(m, "LANDLORD_REFERENCE") ?? itemOf(m, "AGENT_REFERENCE")} />
							</td>
							<td className={`px-2 py-3 font-semibold ${m.passport?.ready ? "text-sk-ok" : "text-sk-warn"}`}>
								{m.passport?.percent ?? 0}%
							</td>
						</Tr>
					))}
				</Table>
			</Card>

			<div className="flex flex-wrap items-start gap-5">
				<Card className="min-w-0 flex-[1.3_1_420px]">
					<h2 className="font-display text-lg font-semibold">Documents</h2>
					{data.members.map(m => {
						const active = shareActive(m);
						const files = (m.passport?.sections ?? [])
							.flatMap(s => s.items)
							.filter(i => i.status !== "MISSING" && (i.url || i.key));
						return (
							<div key={m.user} className="flex flex-col gap-2 rounded-xl bg-sk-card2 p-3">
								<div className="flex items-center justify-between gap-2">
									<span className="text-sm font-semibold">{m.name}</span>
									<span className={`text-[12.5px] ${active ? "text-sk-muted" : "font-semibold text-sk-warn"}`}>
										{m.shareExpiresAt
											? active
												? `Shared until ${fmtDate(m.shareExpiresAt)}`
												: `Share expired ${fmtDate(m.shareExpiresAt)}`
											: "Not shared yet"}
									</span>
								</div>
								{!active || !m.shareExpiresAt ? (
									<span className="text-[12.5px] text-sk-muted">
										{active
											? "Ask them to share their Seek Passport with you."
											: "Ask them to share their Seek Passport again to view their files."}
									</span>
								) : files.length === 0 ? (
									<span className="text-[12.5px] text-sk-muted">No files shared.</span>
								) : (
									<div className="flex flex-wrap gap-2">
										{files.map(f => (
											<button
												key={f.type}
												type="button"
												onClick={() => openItem(f)}
												className="cursor-pointer rounded-lg border-none bg-sk-hair px-2.5 py-1.5 text-[13px] text-sk-text"
											>
												{f.label}
											</button>
										))}
									</div>
								)}
							</div>
						);
					})}
					<span className="text-[12.5px] text-sk-muted">
						Documents are shared for 14 days from each student's Seek Passport. Views are logged.
					</span>
				</Card>

				<Card title="Viewing and next steps" className="flex-[1_1_300px]">
					<div className="flex flex-col gap-2">
						<span className="text-sm text-sk-text2">
							{data.viewingAt ? `Viewing booked for ${fmtDateTime(data.viewingAt)}` : "No viewing booked yet."}
						</span>
						{viewingSlots?.length ? (
							<div className="flex flex-wrap gap-2">
								{viewingSlots.map(slot => (
									<button
										key={slot}
										type="button"
										className={data.viewingAt && new Date(data.viewingAt).getTime() === new Date(slot).getTime() ? btnSmPrimary : btnSmGhost}
										disabled={viewingBusy}
										onClick={() => onViewing(new Date(slot).toISOString())}
									>
										{fmtDateTime(slot)}
									</button>
								))}
							</div>
						) : (
						<div className="flex flex-wrap gap-2">
							<label className="sr-only" htmlFor="viewing-at">Viewing date and time</label>
							<input
								id="viewing-at"
								type="datetime-local"
								value={viewingInput}
								onChange={e => setViewingInput(e.target.value)}
								className="h-10 min-w-0 flex-1 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text"
							/>
							<button
								type="button"
								className={btnSmPrimary}
								disabled={!viewingInput || viewingBusy}
								onClick={() => onViewing(new Date(viewingInput).toISOString())}
							>
								{viewingBusy ? "Saving…" : data.viewingAt ? "Reschedule" : "Schedule viewing"}
							</button>
						</div>
						)}
					</div>
					<ol className="m-0 flex list-decimal flex-col gap-2 pl-[18px] text-[13.5px] leading-snug text-sk-text2">
						<li>Hold the viewing</li>
						<li>Make the offer. The household has 15 days to accept</li>
						{holdingDeposit ? <li>Hold the deposit ({`£${holdingDeposit.toLocaleString("en-GB")}`} per room, one week's rent at most) to reserve the room</li> : null}
						<li>Send the tenancy agreement for e-signature</li>
						<li>Protect the deposit within 30 days</li>
					</ol>
					{data.stage !== "REJECTED" && (
						<button type="button" className={`${btnSmGhost} !border-sk-danger-border !text-sk-danger`} onClick={reject}>
							Decline
						</button>
					)}
				</Card>
			</div>

			<Dialog
				header="Report Applicant"
				draggable={false}
				visible={visible}
				style={{ width: "30rem" }}
				className="rounded-xl shadow-lg border border-[var(--surface-border)]"
				modal
				onHide={() => setVisible(false)}
				footer={
					<div className="flex justify-end gap-2">
						<Button label="Cancel" severity="secondary" onClick={() => setVisible(false)} />
						<Button
							label="Submit Report"
							icon="pi pi-check"
							onClick={submitReport}
							disabled={!reportMsg.trim()}
						/>
					</div>
				}
			>
				<p className="mb-3 text-[var(--text-color-secondary)]">
					Please describe your reason for reporting this application:
				</p>
				<InputTextarea
					autoFocus
					value={reportMsg}
					onChange={e => setReportMsg(e.target.value)}
					rows={5}
					className="w-full"
					placeholder="Type your report message here..."
				/>
			</Dialog>
		</React.Fragment>
	);
}
