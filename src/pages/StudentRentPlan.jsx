import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, ErrorState, Loading, Page, PageHeader, btnGhost, btnPrimary } from "../components/sk.jsx";
import { AdviceCard, Modal, Notice, PayNowButton } from "../components/StudentBits.jsx";
import { api, errMessage, fmtDate, gbp } from "../lib/landlord.js";
import { PLAN_LABEL, useMyTenancy } from "../lib/student.js";

const OPTIONS = [
	{ value: "MONTHLY", months: 1, hint: "Pay each month" },
	{ value: "SIX_MONTHS", months: 6, hint: "Two payments a year" },
	{ value: "YEARLY", months: 12, hint: "One payment for the year" }
];
const STATUS = {
	PAID: { text: "Paid", tone: "text-sk-ok" },
	SCHEDULED: { text: "Scheduled", tone: "text-sk-text2" },
	PENDING: { text: "Processing", tone: "text-sk-text2" },
	LATE: { text: "Overdue", tone: "text-sk-warn" },
	FAILED: { text: "Failed", tone: "text-sk-warn" }
};

const Toggle = ({ checked, onChange, children }) => (
	<label className="flex min-h-9 items-center gap-2.5 text-sm">
		<input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-[18px] w-[18px] accent-[var(--sk-accent)]" />
		{children}
	</label>
);

export default function StudentRentPlan() {
	const qc = useQueryClient();
	const { tenancy, isLoading, isError, error, refetch } = useMyTenancy();
	const tid = tenancy?._id;
	const paidQ = useQuery({ queryKey: ["my-payments"], enabled: !!tid, queryFn: async () => (await api.get("/payments/mine")).data });
	const planQ = useQuery({ queryKey: ["rent-plan", tid], enabled: !!tid, queryFn: async () => (await api.get(`/payments/plan/${tid}`)).data });
	const [form, setForm] = useState(null);
	const [notice, setNotice] = useState(null);
	const [receipt, setReceipt] = useState(null);

	useEffect(() => {
		const p = planQ.data?.plan;
		if (planQ.data && !form)
			setForm({
				frequency: p?.frequency ?? "MONTHLY",
				autopay: p?.autopay ?? true,
				notifyEveryPayment: p?.notifyEveryPayment ?? true,
				remindDaysBefore: p?.remindDaysBefore ?? 3
			});
	}, [planQ.data, form]);

	const save = useMutation({
		mutationFn: (body) => api.put(`/payments/plan/${tid}`, body),
		onSuccess: () => {
			setNotice({ tone: "ok", text: "Rent plan saved." });
			qc.invalidateQueries({ queryKey: ["rent-plan", tid] });
			qc.invalidateQueries({ queryKey: ["my-payments"] });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't save your rent plan.") })
	});

	if (isLoading || (tid && planQ.isLoading)) return <Page><Loading label="Loading your rent plan" /></Page>;
	if (isError) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;
	if (planQ.isError) return <Page><ErrorState error={planQ.error} onRetry={() => planQ.refetch()} /></Page>;
	if (!tenancy)
		return (
			<Page>
				<PageHeader eyebrow="My home" title="Rent plan" />
				<Card><span className="text-sm text-sk-text2">You'll set up rent once you have a tenancy.</span></Card>
			</Page>
		);

	const data = planQ.data;
	const allowed = data?.allowedFrequencies ?? ["MONTHLY"];
	const rent = data?.monthlyRent ?? tenancy.monthlyRent;
	const set = (patch) => setForm((f) => ({ ...f, ...patch }));
	const upcoming = data?.upcoming ?? [];
	const history = (paidQ.data ?? []).filter((p) => p.status === "PAID").sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

	return (
		<Page className="!gap-[22px]">
			<PageHeader eyebrow={<Link to="/student/home" className="text-sk-link no-underline">← My home</Link>} title="Rent plan" />
			<Notice notice={notice} />

			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[1.4_1_480px] flex-col gap-4">
					<Card title="How you pay">
						<fieldset className="m-0 flex flex-col gap-2.5 border-none p-0">
							<legend className="sr-only">Payment frequency</legend>
							{OPTIONS.map((o) => {
								const locked = !allowed.includes(o.value);
								const on = form?.frequency === o.value;
								return (
									<label
										key={o.value}
										className={`flex items-center gap-3 rounded-xl border-2 p-3.5 ${on ? "border-sk-accent bg-sk-tint" : "border-sk-border bg-sk-card"} ${locked ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
									>
										<input type="radio" name="frequency" value={o.value} checked={on} disabled={locked} onChange={() => set({ frequency: o.value })} className="h-[18px] w-[18px] accent-[var(--sk-accent)]" />
										<span className="flex flex-1 flex-col">
											<span className="text-sm font-semibold">{PLAN_LABEL[o.value]}</span>
											<span className="text-[12.5px] text-sk-muted">{locked ? "Not allowed for this home" : o.hint}</span>
										</span>
										<span className="font-display text-lg font-semibold">{gbp(rent * o.months)}</span>
									</label>
								);
							})}
						</fieldset>
						{data?.restrictionReason && (
							<div className="rounded-xl bg-sk-card2 p-3 text-[13px] leading-snug text-sk-text2">
								<strong className="text-sk-text">Why only monthly? </strong>
								{data.restrictionReason}
							</div>
						)}
					</Card>

					{form && (
						<Card title="Reminders and receipts" className="!gap-2.5">
							<div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Autopay">
								{[
									[true, "Autopay on the due date"],
									[false, "Remind me, I'll pay"]
								].map(([v, label]) => (
									<button
										key={label}
										type="button"
										role="radio"
										aria-checked={form.autopay === v}
										onClick={() => set({ autopay: v })}
										className={`h-[38px] cursor-pointer rounded-full px-3.5 text-[13px] ${form.autopay === v ? "border-none bg-sk-accent font-semibold text-sk-on-accent" : "border border-sk-border2 bg-transparent text-sk-text"}`}
									>
										{label}
									</button>
								))}
							</div>
							{form.autopay && !data?.autopayCardSaved && <span className="text-[12.5px] text-sk-warn">Autopay starts after you pay once by card. Until then, pay each rent yourself.</span>}
							<Toggle checked={form.notifyEveryPayment} onChange={(v) => set({ notifyEveryPayment: v })}>Notify me every payment</Toggle>
							<label className="flex min-h-9 items-center gap-2.5 text-sm">
								Remind me
								<input
									type="number"
									min={0}
									max={14}
									value={form.remindDaysBefore}
									onChange={(e) => set({ remindDaysBefore: Math.max(0, Math.min(14, Number(e.target.value) || 0)) })}
									className="h-9 w-16 rounded-[10px] border border-sk-border2 bg-sk-card px-2 text-sm text-sk-text"
								/>
								days before rent is due
							</label>
							<button type="button" onClick={() => save.mutate(form)} disabled={save.isPending} className={`${btnPrimary} self-start disabled:opacity-60`}>
								{save.isPending ? "Saving…" : data?.exists ? "Save changes" : "Confirm plan"}
							</button>
						</Card>
					)}
				</div>

				<aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
					<Card title="Upcoming payments" className="!gap-3">
						{upcoming.length === 0 && <span className="text-sm text-sk-text2">No payments scheduled yet. Confirm your plan to schedule them.</span>}
						{upcoming.map((p) => (
							<div key={p._id} className="flex flex-col gap-1.5 border-b border-sk-hair pb-3 last:border-none last:pb-0">
								<div className="flex items-center justify-between gap-2 text-sm">
									<span className="flex flex-col">
										<span className="font-semibold">{gbp(p.amount)}</span>
										<span className="text-[12.5px] text-sk-muted">
											Due {fmtDate(p.dueDate)}
											{p.coversMonths > 1 ? ` · covers ${p.coversMonths} months` : ""}
										</span>
										{p.holdingDepositCredit > 0 && <span className="text-[12.5px] text-sk-ok">Holding deposit {gbp(p.holdingDepositCredit)} applied to first rent</span>}
									</span>
									<span className={`text-[13px] font-semibold ${STATUS[p.status]?.tone ?? ""}`}>{STATUS[p.status]?.text ?? p.status}</span>
								</div>
								<PayNowButton payment={p} className="h-9 self-start rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text" />
							</div>
						))}
						{data?.mode === "simulated" && <span className="text-[12px] text-sk-muted">Test mode: payments are simulated and no card is charged.</span>}
					</Card>
					{history.length > 0 && (
						<Card title="Payment history" className="!gap-3">
							{history.map((p) => (
								<div key={p._id} className="flex items-center justify-between gap-2 border-b border-sk-hair pb-3 text-sm last:border-none last:pb-0">
									<span className="flex flex-col">
										<span className="font-semibold">{gbp(p.amount)}</span>
										<span className="text-[12.5px] text-sk-muted">{p.kind === "HOLDING_DEPOSIT" ? "Holding deposit" : "Rent"} · paid {fmtDate(p.paidAt)}</span>
										{p.holdingDepositCredit > 0 && <span className="text-[12.5px] text-sk-ok">Holding deposit {gbp(p.holdingDepositCredit)} applied to first rent</span>}
									</span>
									<button type="button" onClick={() => setReceipt(p)} className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-sk-link">Receipt</button>
								</div>
							))}
						</Card>
					)}
					<AdviceCard topic="rent" tenancyId={tid} />
				</aside>
			</div>
			{receipt && (
				<Modal title="Receipt" onClose={() => setReceipt(null)}>
					<style>{"@media print{body *{visibility:hidden}#receipt,#receipt *{visibility:visible}#receipt{position:fixed;inset:0;padding:24px;background:#fff;color:#000}}"}</style>
					<dl id="receipt" className="flex flex-col gap-2 text-sm">
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">Amount paid</dt><dd className="font-semibold">{gbp(receipt.amount)}</dd></div>
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">Paid on</dt><dd>{fmtDate(receipt.paidAt)}</dd></div>
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">For</dt><dd>{receipt.kind === "HOLDING_DEPOSIT" ? "Holding deposit" : "Rent"} · due {fmtDate(receipt.dueDate)}</dd></div>
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">Reference</dt><dd className="break-all font-mono text-[12.5px]">{receipt._id}</dd></div>
					</dl>
					<button type="button" onClick={() => window.print()} className={`${btnGhost} self-start`}>Print</button>
				</Modal>
			)}
		</Page>
	);
}
