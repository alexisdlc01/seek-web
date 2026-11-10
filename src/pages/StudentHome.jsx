import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserContext from "../context/UserContext.jsx";
import { Card, ErrorState, Loading, Page, PageHeader, btnGhost, btnPrimary } from "../components/sk.jsx";
import { AdviceCard, Modal, Notice, PayNowButton, useCheckoutReturn } from "../components/StudentBits.jsx";
import { api, errMessage, fmtDate, fmtDay, gbp, greeting, openFile } from "../lib/landlord.js";
import { PLAN_LABEL, idOf, useMyApplications, useMyTenancy } from "../lib/student.js";

const DOC_LABEL = {
	TENANCY_AGREEMENT: "Tenancy agreement",
	DEPOSIT_CERTIFICATE: "Deposit certificate",
	GAS_SAFETY: "Gas safety",
	COUNCIL_TAX_EXEMPTION: "Council tax exemption",
	EPC: "EPC",
	EICR: "Electrical safety (EICR)",
	HOW_TO_RENT: "How to Rent guide"
};
const SOURCE_LABEL = { SEEK: "Added on Seek", EMAIL: "Received by email", UPLOAD: "Uploaded" };
const OPEN = ["SCHEDULED", "PENDING", "LATE", "FAILED"];
const STAGE = {
	NOT_SENT: { text: "Draft · not sent yet", tone: "text-sk-muted" },
	SENT: { text: "Sent · in the landlord's queue", tone: "text-sk-warn" },
	VIEWED: { text: "Viewing booked", tone: "text-sk-warn" },
	OFFERED: { text: "Offer made", tone: "text-sk-ok" },
	SIGNED: { text: "Signed", tone: "text-sk-ok" },
	ACCEPTED: { text: "Accepted", tone: "text-sk-ok" },
	REJECTED: { text: "Not successful", tone: "text-sk-muted" }
};


const Check = ({ checked, onChange, disabled, children }) => (
	<label className="flex min-h-9 items-center gap-2.5 text-sm">
		<input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="h-[18px] w-[18px] accent-[var(--sk-accent)]" />
		{children}
	</label>
);

const FileIcon = () => (
	<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-sk-tint text-sk-link">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></svg>
	</div>
);

function ReportRepairModal({ tenancyId, onClose }) {
	const qc = useQueryClient();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const create = useMutation({
		mutationFn: () => api.post("/repairs", { tenancy: tenancyId, title: title.trim(), description: description.trim() || undefined }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["repairs", tenancyId] });
			onClose();
		}
	});
	const field = "w-full rounded-[10px] border border-sk-border2 bg-sk-card px-3 py-2.5 text-sm text-sk-text outline-none focus:border-sk-accent";
	return (
		<Modal title="Report a problem" onClose={onClose}>
			<form
				className="flex flex-col gap-3"
				onSubmit={(e) => {
					e.preventDefault();
					if (title.trim()) create.mutate();
				}}
			>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					What's wrong?
					<input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="e.g. Boiler cutting out" className={field} />
				</label>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					Details <span className="font-normal text-sk-muted">(optional)</span>
					<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} placeholder="When it started, which room, good times for a visit" className={field} />
				</label>
				<span className="text-[12.5px] text-sk-muted">Your landlord is told straight away. Gas leak or no heating in winter? Call them too.</span>
				{create.isError && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{errMessage(create.error, "We couldn't send this report.")}</div>}
				<button type="submit" disabled={create.isPending || !title.trim()} className={`${btnPrimary} disabled:opacity-60`}>
					{create.isPending ? "Sending…" : "Send to landlord"}
				</button>
			</form>
		</Modal>
	);
}

const slotText = (iso) => new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** One application under "Next year": queue position, viewing slot, offer and holding deposit. */
function ApplicationRow({ a, holding, setNotice }) {
	const qc = useQueryClient();
	const [picking, setPicking] = useState(false);
	const refresh = () => qc.invalidateQueries({ queryKey: ["my-applications"] });
	const fail = (fallback) => (e) => setNotice({ tone: "warn", text: errMessage(e, fallback) });
	const book = useMutation({
		mutationFn: (viewingAt) => api.patch(`/application/${a._id}/viewing`, { viewingAt }),
		onSuccess: () => {
			setPicking(false);
			setNotice({ tone: "ok", text: "Viewing booked." });
			refresh();
		},
		onError: fail("We couldn't book that viewing.")
	});
	const accept = useMutation({
		mutationFn: () => api.patch(`/application/${a._id}/accept-offer`),
		onSuccess: () => {
			setNotice({ tone: "ok", text: "Offer accepted. Your tenancy is being set up." });
			refresh();
			qc.invalidateQueries({ queryKey: ["student-tenancies"] });
		},
		onError: fail("We couldn't accept this offer.")
	});

	const invite = useMutation({
		mutationFn: async () => (await api.post(`/application/${a._id}/invite`)).data,
		onSuccess: async (d) => {
			const link = `${window.location.origin}/student/join/${a._id}?invite=${encodeURIComponent(d.inviteToken)}`;
			try {
				await navigator.clipboard.writeText(link);
				setNotice({ tone: "ok", text: "Invite link copied. Send it to your housemates; it works for 7 days." });
			} catch {
				setNotice({ tone: "ok", text: `Send this link to your housemates: ${link}` });
			}
		},
		onError: fail("We couldn't create an invite link.")
	});

	const l = a.listing ?? {};
	// Prefer per-slot capacity; fall back to the plain list.
	const slots = (l.viewingSlotAvailability ?? (l.viewingSlots ?? []).map((at) => ({ at, remaining: null }))).filter((x) => new Date(x.at) > new Date());
	const people = a.members?.length ?? 1;
	const needed = l.numOfPeople ?? 1;
	const qualified = a.qualified && a.stage === "SENT";
	const unpaidHolding = holding && holding.status !== "PAID";
	const deposit = holding?.amount ?? (a.holdingDeposit ? a.holdingDeposit * 100 : null);
	return (
		<div className="flex flex-col gap-1.5 border-b border-sk-hair pb-2.5 last:border-none last:pb-0">
			<span className="text-sm font-semibold">{l.propertyTitle ?? "Home"}</span>
			<span className={`text-[13px] ${STAGE[a.stage]?.tone ?? "text-sk-muted"}`}>
				{qualified
					? `Qualified${a.queuePosition === 1 ? " · first in line" : a.queuePosition > 1 ? ` · #${a.queuePosition} of ${a.queueSize} in line` : ""}`
					: (STAGE[a.stage]?.text ?? a.stage)}
				{a.viewingAt ? ` · viewing ${slotText(a.viewingAt)}` : ""}
			</span>
			{["NOT_SENT", "SENT"].includes(a.stage) && needed > 1 && (
				<span className="flex flex-wrap items-center gap-x-3 text-[13px] text-sk-text2">
					{people} of {needed} people
					{people < needed && (
						<button type="button" onClick={() => invite.mutate()} disabled={invite.isPending} className="border-none bg-transparent p-0 text-[13px] font-semibold text-sk-link disabled:opacity-60">
							{invite.isPending ? "Creating link…" : "Invite housemates"}
						</button>
					)}
				</span>
			)}
			{a.stage === "SENT" && !a.qualified && a.criteria?.some((c) => !c.passed) && (
				<span className="text-[12.5px] text-sk-warn">Not qualified yet: {a.criteria.filter((c) => !c.passed).map((c) => c.label).join(", ")}</span>
			)}
			{["SENT", "VIEWED"].includes(a.stage) && slots.length > 0 && (
				<>
					<button type="button" onClick={() => setPicking((v) => !v)} className="self-start border-none bg-transparent p-0 text-[13px] font-semibold text-sk-link">
						{a.viewingAt ? "Move viewing" : "Pick a viewing time"}
					</button>
					{picking && (
						<div className="flex flex-wrap gap-2">
							{slots.map(({ at, remaining }) => (
								<button key={at} type="button" disabled={book.isPending || remaining === 0} onClick={() => book.mutate(at)} className="h-9 cursor-pointer rounded-full border border-sk-border2 bg-transparent px-3 text-[13px] text-sk-text disabled:cursor-not-allowed disabled:opacity-60">
									{slotText(at)}
									{remaining === 0 ? " · Full" : remaining != null ? ` · ${remaining} ${remaining === 1 ? "place" : "places"} left` : ""}
								</button>
							))}
						</div>
					)}
				</>
			)}
			{a.stage === "OFFERED" && (
				<div className="flex flex-col gap-1.5 rounded-xl bg-sk-card2 p-3">
					<span className="text-[13px] text-sk-text2">
						{a.offerExpiresAt ? `Accept by ${fmtDate(a.offerExpiresAt)}. ` : ""}
						{deposit != null ? `Holding deposit ${gbp(deposit)} counts towards your first rent.` : ""}
					</span>
					{unpaidHolding && (
						<div className="flex flex-wrap items-center gap-3">
							<span className="text-[13px] font-semibold">1. Pay the holding deposit</span>
							<PayNowButton payment={holding} label={`Pay holding deposit ${gbp(holding.amount)}`} className="h-9 rounded-[10px] border-none bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent" />
						</div>
					)}
					{holding?.status === "PAID" && <span className="text-[13px] font-semibold text-sk-ok">Holding deposit paid</span>}
					<div className="flex flex-wrap items-center gap-3">
						{unpaidHolding && <span className="text-[13px] font-semibold">2. Accept the offer</span>}
						<button type="button" onClick={() => accept.mutate()} disabled={accept.isPending} className="h-9 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text disabled:opacity-60">
							{accept.isPending ? "Accepting…" : "Accept offer"}
						</button>
					</div>
					{unpaidHolding && <span className="text-[12.5px] text-sk-muted">Pay first: accepting the offer cancels an unpaid holding deposit.</span>}
				</div>
			)}
		</div>
	);
}

function ApplicationsCard({ apps, loading, payments, setNotice, title }) {
	const holdingFor = (a) => payments.find((p) => p.kind === "HOLDING_DEPOSIT" && idOf(p.application) === a._id);
	return (
		<Card title={title} className="!gap-2.5">
			{loading && <Loading label="Loading applications" />}
			{!loading && apps.length === 0 && <span className="text-sm text-sk-text2">No applications yet.</span>}
			{apps.map((a) => (
				<ApplicationRow key={a._id} a={a} holding={holdingFor(a)} setNotice={setNotice} />
			))}
			<Link to="/student/find" className="pt-1 text-[13px] font-semibold text-sk-link">Find more homes →</Link>
		</Card>
	);
}

export default function StudentHome() {
	const qc = useQueryClient();
	const { user } = useContext(UserContext);
	const { tenancy, isLoading, isError, error, refetch } = useMyTenancy();
	const tid = tenancy?._id;
	const [reporting, setReporting] = useState(false);
	const [notice, setNotice] = useState(null);
	const returned = useCheckoutReturn();

	const planQ = useQuery({ queryKey: ["rent-plan", tid], enabled: !!tid, queryFn: async () => (await api.get(`/payments/plan/${tid}`)).data });
	const paymentsQ = useQuery({ queryKey: ["my-payments"], queryFn: async () => (await api.get("/payments/mine")).data });
	const billsQ = useQuery({ queryKey: ["bills", tid], enabled: !!tid, queryFn: async () => (await api.get(`/bills/tenancy/${tid}`)).data });
	const contractsQ = useQuery({ queryKey: ["contracts", tid], enabled: !!tid, queryFn: async () => (await api.get(`/contracts/tenancy/${tid}`)).data });
	const repairsQ = useQuery({ queryKey: ["repairs", tid], enabled: !!tid, queryFn: async () => (await api.get(`/repairs/tenancy/${tid}`)).data });
	const appsQ = useMyApplications();

	const acceptTenancy = useMutation({
		mutationFn: () => api.post(`/tenancies/${tid}/accept`),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["student-tenancies"] });
			setNotice({ tone: "ok", text: "You've joined the tenancy. Rent starts once everyone has accepted." });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't accept this tenancy.") })
	});

	const sign = useMutation({
		mutationFn: (id) => api.post(`/contracts/${id}/sign`),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["contracts", tid] });
			setNotice({ tone: "ok", text: "Signed. Everyone in the house gets a copy." });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't sign this contract.") })
	});

	// Reminders and receipts live on the rent plan, the same record the Rent plan page edits.
	const planBody = planQ.data?.plan;
	const reminderDays = planBody?.remindDaysBefore ?? 3;
	const savePlan = useMutation({
		mutationFn: (patch) =>
			api.put(`/payments/plan/${tid}`, {
				frequency: planBody.frequency,
				autopay: planBody?.autopay,
				notifyEveryPayment: planBody?.notifyEveryPayment ?? true,
				remindDaysBefore: reminderDays,
				...patch
			}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["rent-plan", tid] });
			qc.invalidateQueries({ queryKey: ["my-payments"] });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't save your notification settings.") })
	});

	if (isLoading) return <Page><Loading label="Loading your home" /></Page>;
	if (isError) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;

	const first = user?.name?.split(" ")[0];
	if (!tenancy)
		return (
			<Page>
				<PageHeader eyebrow={`${greeting()}${first ? `, ${first}` : ""}`} title="My home" />
				<Notice notice={returned} />
				<Notice notice={notice} />
				<Card title="No tenancy yet">
					<p className="text-sm text-sk-text2">When a landlord accepts your household, your contract, rent, deposit and repairs all appear here.</p>
					<Link to="/student/find" className={`${btnPrimary} self-start`}>Find a home</Link>
				</Card>
				<ApplicationsCard apps={appsQ.data ?? []} loading={appsQ.isLoading} payments={paymentsQ.data ?? []} setNotice={setNotice} title="Your applications" />
			</Page>
		);

	const l = tenancy.listing ?? {};
	const landlord = tenancy.landlord ?? {};
	const plan = planQ.data;
	const mine = (paymentsQ.data ?? []).filter((p) => idOf(p.tenancy) === tid);
	const next = mine.find((p) => OPEN.includes(p.status)) ?? plan?.upcoming?.find((p) => OPEN.includes(p.status));
	const lastPaid = [...mine].reverse().find((p) => p.status === "PAID");
	const bills = billsQ.data ?? [];
	const toPay = bills.filter((b) => !b.includedInRent && b.status !== "PAID" && !b.myPaid);
	const myBills = toPay.reduce((s, b) => s + (b.myShare ?? 0), 0);
	const contracts = (contractsQ.data ?? []).filter((c) => c.status !== "DRAFT");
	const docs = tenancy.documents ?? [];
	const repairs = repairsQ.data ?? [];
	const nextYear = (appsQ.data ?? []).filter((a) => a._id !== idOf(tenancy.application));
	const signedByMe = (c) => (c.signatures ?? []).some((s) => idOf(s.user) === user?._id && s.signedAt);

	return (
		<Page className="!gap-[22px]">
			<PageHeader eyebrow={`${greeting()}${first ? `, ${first}` : ""}`} title={l.propertyTitle ?? l.streetAddress ?? "My home"}>
				<Link to="/student/inbox" className={btnGhost}>Message {landlord.name?.split(" ")[0] ?? "landlord"} (landlord)</Link>
			</PageHeader>

			<Notice notice={returned} />
			<Notice notice={notice} />

			{tenancy.status === "PENDING_ACCEPTANCE" && (tenancy.pendingTenants ?? []).some((t) => idOf(t) === user?._id) && (
				<Card title="Your landlord has set up this tenancy" className="!gap-2.5">
					<span className="text-sm text-sk-text2">Accept to join it. Rent and the contract start once every tenant has accepted.</span>
					<button type="button" onClick={() => acceptTenancy.mutate()} disabled={acceptTenancy.isPending} className={`${btnPrimary} self-start disabled:opacity-60`}>
						{acceptTenancy.isPending ? "Accepting…" : "Accept tenancy"}
					</button>
				</Card>
			)}

			<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
				<div className="flex flex-col gap-1.5 rounded-2xl bg-sk-card2 p-[18px]">
					<span className="text-[13px] text-sk-muted">Next rent{next ? ` · ${fmtDay(next.dueDate)}` : ""}</span>
					<span className="font-display text-[28px] font-semibold">{gbp(next?.amount ?? tenancy.monthlyRent)}</span>
					<span className={`text-[12.5px] ${next?.status === "LATE" || next?.status === "FAILED" ? "text-sk-warn" : "text-sk-ok"}`}>
						{plan?.plan ? `${PLAN_LABEL[plan.plan.frequency]} ${plan.plan.autopay ? (plan.autopayCardSaved ? "autopay on" : "· autopay starts after you pay once by card") : "· reminder before it's due"}` : "No rent plan yet"}
						{lastPaid ? ` · ${new Date(lastPaid.dueDate).toLocaleDateString("en-GB", { month: "long" })} paid` : ""}
						{next?.status === "LATE" ? " · overdue" : ""}
					</span>
					<div className="flex flex-wrap items-center gap-3 pt-1">
						{next && <PayNowButton payment={next} className="h-9 rounded-[10px] border-none bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent" />}
						<Link to="/student/home/rent" className="text-[13px] font-semibold text-sk-link">Rent plan →</Link>
					</div>
				</div>
				<Link to="/student/home/deposit" className="flex flex-col gap-1.5 rounded-2xl border border-sk-border bg-sk-card p-[18px] text-inherit no-underline">
					<span className="text-[13px] text-sk-muted">Deposit</span>
					<span className="font-display text-[28px] font-semibold">{gbp(tenancy.depositAmount)}</span>
					<span className={`text-[12.5px] ${tenancy.depositProtectedAt ? "text-sk-ok" : "text-sk-warn"}`}>
						{tenancy.depositProtectedAt
							? `Protected with ${tenancy.depositScheme ?? "a scheme"}${docs.some((d) => d.type === "DEPOSIT_CERTIFICATE") ? " · certificate saved" : ""}`
							: "Not protected yet · see what to do"}
					</span>
				</Link>
				<Link to="/student/home/bills" className="flex flex-col gap-1.5 rounded-2xl border border-sk-border bg-sk-card p-[18px] text-inherit no-underline">
					<span className="text-[13px] text-sk-muted">Your share of bills</span>
					<span className="font-display text-[28px] font-semibold">{billsQ.isLoading ? "…" : gbp(myBills)}</span>
					<span className="text-[12.5px] text-sk-text2">
						{toPay.length ? `${toPay.length} to sort out · split ${l.numOfPeople ?? tenancy.tenants?.length ?? ""} ways` : l.billsIncluded ? "Bills included in rent" : "Nothing due right now"}
						{bills.some((b) => b.category === "COUNCIL_TAX" && b.includedInRent) || docs.some((d) => d.type === "COUNCIL_TAX_EXEMPTION") ? " · council tax exempt" : ""}
					</span>
				</Link>
			</div>

			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[1.4_1_480px] flex-col gap-4">
					<Card title="Contract and documents">
						{contractsQ.isLoading && <Loading label="Loading contract" />}
						{contracts.map((c) => (
							<div key={c._id} className="flex items-center gap-3 border-b border-sk-hair pb-3">
								<FileIcon />
								<div className="flex min-w-0 flex-1 flex-col">
									<span className="truncate text-sm font-semibold">{c.title}</span>
									<span className="text-[12.5px] text-sk-muted">
										{c.status === "SIGNED"
											? `Signed by all ${c.signatures?.length ?? ""}`.trim()
											: `Sent ${fmtDate(c.sentAt)} · signed by ${(c.signatures ?? []).filter((s) => s.signedAt).length} of ${c.signatures?.length ?? 0}`}
									</span>
								</div>
								{c.status === "SENT" && !signedByMe(c) && (
									<button type="button" onClick={() => sign.mutate(c._id)} disabled={sign.isPending} className="h-9 cursor-pointer rounded-[10px] border-none bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent disabled:opacity-60">
										Sign
									</button>
								)}
								{(c.url || c.key) && (
									<button type="button" onClick={() => openFile(c)} className="flex h-9 cursor-pointer items-center rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text no-underline">
										Open
									</button>
								)}
							</div>
						))}
						{docs.map((d) => (
							<div key={d.key ?? d.url ?? d.type} className="flex items-center gap-3 border-b border-sk-hair pb-3 last:border-none last:pb-0">
								<FileIcon />
								<div className="flex min-w-0 flex-1 flex-col">
									<span className="truncate text-sm font-semibold">{d.title || DOC_LABEL[d.type] || d.type}</span>
									<span className="text-[12.5px] text-sk-muted">{SOURCE_LABEL[d.source] ?? "Saved"}{d.addedAt ? ` ${fmtDate(d.addedAt)}` : ""}</span>
								</div>
								{(d.url || d.key) && (
									<button type="button" onClick={() => openFile(d)} className="flex h-9 cursor-pointer items-center rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text no-underline">
										Open
									</button>
								)}
							</div>
						))}
						{!contractsQ.isLoading && contracts.length === 0 && !docs.length && (
							<span className="text-sm text-sk-text2">No documents yet. Anything your landlord sends by email is filed here once your email is connected.</span>
						)}
						<AdviceCard topic="contract" tenancyId={tid} />
					</Card>

					<Card className="!gap-2.5">
						<div className="flex items-center justify-between">
							<h2 className="font-display text-lg font-semibold">Repairs</h2>
							<button type="button" onClick={() => setReporting(true)} className="h-9 cursor-pointer rounded-[10px] border-none bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent">Report a problem</button>
						</div>
						{repairsQ.isLoading && <Loading label="Loading repairs" />}
						{!repairsQ.isLoading && repairs.length === 0 && <span className="text-sm text-sk-text2">Nothing reported. If something breaks, report it here and your landlord is told straight away.</span>}
						{repairs.map((r) => (
							<div key={r._id} className="flex justify-between gap-2.5 text-sm">
								<span>{r.title}</span>
								<span className={`shrink-0 font-semibold ${r.status === "FIXED" ? "text-sk-ok" : "text-sk-warn"}`}>
									{r.status === "FIXED"
										? `Fixed ${fmtDate(r.fixedAt ?? r.updatedAt)}`
										: r.status === "SCHEDULED" && r.scheduledFor
											? `Visit ${new Date(r.scheduledFor).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}`
											: `Reported ${fmtDate(r.createdAt)}`}
								</span>
							</div>
						))}
					</Card>
				</div>

				<aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
					<ApplicationsCard apps={nextYear} loading={appsQ.isLoading} payments={paymentsQ.data ?? []} setNotice={setNotice} title="Next year" />
					<section className="flex flex-col gap-2.5 rounded-2xl bg-sk-card2 p-5">
						<h2 className="font-display text-lg font-semibold">Payment notifications</h2>
						<Check
							checked={reminderDays > 0}
							disabled={!planBody || savePlan.isPending}
							onChange={(on) => savePlan.mutate({ remindDaysBefore: on ? 3 : 0 })}
						>
							{reminderDays > 0 ? `Remind me ${reminderDays} days before rent` : "Remind me before rent"}
						</Check>
						<Check checked={planBody?.notifyEveryPayment ?? true} disabled={!planBody || savePlan.isPending} onChange={(on) => savePlan.mutate({ notifyEveryPayment: on })}>
							Receipt every time I pay
						</Check>
					</section>
				</aside>
			</div>

			{reporting && <ReportRepairModal tenancyId={tid} onClose={() => setReporting(false)} />}
		</Page>
	);
}
