import { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import ListingsContext from "../context/ListingsContext.jsx";
import { Card, Chip, Empty, ErrorState, Loading, Page, PageHeader, Table, Tile, Tr, btnSmGhost } from "../components/sk.jsx";
import { api, currentMonth, errMessage, fmtDay, gbp, monthLabel, remindLate, shiftMonth } from "../lib/landlord.js";
import { PLAN_LABEL } from "../lib/student.js";

const STATUS = {
	PAID: { tone: "ok", label: "Paid" },
	LATE: { tone: "warn", label: "Late" },
	FAILED: { tone: "warn", label: "Failed" },
	PENDING: { tone: "accent", label: "Processing" },
	SCHEDULED: { tone: "muted", label: "Scheduled" }
};


// "£695 · 3 days late", "£695 · paid 1 Nov", "£695 · due 1 Dec".
function periodText(r) {
	if (r.status === "PAID") return `${gbp(r.amount)} · paid ${fmtDay(r.paidAt ?? r.dueDate)}`;
	if (r.status === "LATE") {
		const days = Math.max(1, Math.floor((Date.now() - new Date(r.dueDate).getTime()) / 86_400_000));
		return `${gbp(r.amount)} · ${days} ${days === 1 ? "day" : "days"} late`;
	}
	return `${gbp(r.amount)} · due ${fmtDay(r.dueDate)}`;
}

export default function Rent() {
	const [month, setMonth] = useState(currentMonth());
	const [reminding, setReminding] = useState(false);
	const toast = useRef(null);
	const { listings } = useContext(ListingsContext);
	// Tenancies tell us the nation of each home: England is monthly only.
	const tenancies = useQuery({
		queryKey: ["landlord-tenancies"],
		queryFn: async () => (await api.get("/tenancies/landlord")).data
	});
	const nationOf = (tenancyId) => tenancies.data?.find((t) => t._id === tenancyId)?.listing?.nation;
	const q = useQuery({
		queryKey: ["landlord-payments", month],
		queryFn: async () => (await api.get("/payments/landlord", { params: { month } })).data
	});
	const connect = useQuery({
		queryKey: ["connect-status"],
		retry: false,
		queryFn: async () => (await api.get("/payments/connect/status")).data
	});
	const bank = connect.data?.payoutBank;
	const qc = useQueryClient();
	const schedule = useQuery({
		queryKey: ["reminder-schedule"],
		queryFn: async () => (await api.get("/payments/landlord/reminder-schedule")).data
	});
	const saveSchedule = useMutation({
		mutationFn: async patch => (await api.put("/payments/landlord/reminder-schedule", { ...schedule.data, ...patch })).data,
		onSuccess: data => qc.setQueryData(["reminder-schedule"], data),
		onError: err => toast.current?.show({ severity: "error", summary: "Could not save", detail: errMessage(err), life: 5000 })
	});
	const remindOne = async r => {
		try {
			await api.post(`/payments/${r.payment}/remind`);
			toast.current?.show({ severity: "success", summary: "Reminder sent", detail: `${r.tenant?.name ?? "The tenant"} will see it in their Seek thread.`, life: 5000 });
			q.refetch();
		} catch (err) {
			toast.current?.show({ severity: "error", summary: "No reminder sent", detail: errMessage(err), life: 5000 });
		}
	};
	const d = q.data;
	const outstanding = d ? Math.max(0, d.expected - d.collected) : 0;
	const paidCount = d ? d.rows.filter((r) => r.status === "PAID").length : 0;
	const lateRows = d ? d.rows.filter((r) => r.status === "LATE") : [];

	const remindEveryone = async () => {
		setReminding(true);
		try {
			const { sent, skipped } = await remindLate(lateRows);
			toast.current?.show({
				severity: sent ? "success" : "warn",
				summary: sent ? `Reminder sent to ${sent} ${sent === 1 ? "tenant" : "tenants"}` : "No reminder sent",
				detail: skipped ? `${skipped} already reminded in the last 24 hours.` : "They will see it in their Seek thread.",
				life: 5000
			});
		} catch (err) {
			toast.current?.show({ severity: "error", summary: "Could not send reminders", detail: errMessage(err), life: 5000 });
		} finally {
			setReminding(false);
		}
	};

	// Plans on offer per nation, from the landlord's listings.
	const nations = [...new Set((listings ?? []).filter((l) => !l.isDraft).map((l) => l.nation || "ENGLAND"))];
	const NATION_NAME = { ENGLAND: "England", WALES: "Wales", SCOTLAND: "Scotland", NORTHERN_IRELAND: "Northern Ireland" };

	return (
		<Page>
			<Toast ref={toast} position="bottom-right" />
			<PageHeader eyebrow={monthLabel(month)} title="Rent collection">
				<button
					type="button"
					className={btnSmGhost}
					onClick={remindEveryone}
					disabled={reminding || lateRows.length === 0}
				>
					{reminding ? "Sending…" : "Remind everyone late"}
				</button>
				<button type="button" className={btnSmGhost} onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">
					‹ Previous
				</button>
				<button type="button" className={btnSmGhost} onClick={() => setMonth(currentMonth())} disabled={month === currentMonth()}>
					This month
				</button>
				<button type="button" className={btnSmGhost} onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">
					Next ›
				</button>
			</PageHeader>

			{q.isLoading && <Loading label="Loading rent" />}
			{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}

			{d && (
				<>
					<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
						<Tile label="Collected" value={gbp(d.collected)} sub={`${paidCount} ${paidCount === 1 ? "payment" : "payments"} of ${d.rows.length}`} />
						<Tile
							label="Outstanding"
							value={gbp(outstanding)}
							sub={d.late ? `${d.late} late · ${gbp(d.lateAmount)}` : "Nobody is late"}
							className="[&>span:nth-child(2)]:text-sk-warn"
						/>
						<div className="flex flex-col gap-1.5 rounded-2xl bg-sk-card2 p-[18px]">
							<span className="text-[13px] text-sk-muted">Payout for {monthLabel(month).split(" ")[0]}</span>
							<span className="font-display text-[28px] font-semibold">{gbp(d.payouts)}</span>
							{(d.nextPayoutDate || bank?.last4) && (
								<span className="text-[12.5px] text-sk-text2">
									Next payout{d.nextPayoutDate ? ` · ${fmtDay(d.nextPayoutDate)}` : ""}
									{bank?.last4 ? ` to ${bank.bankName ? `${bank.bankName} ` : ""}ending ${bank.last4}` : ""}
								</span>
							)}
							<span className="mt-0.5 border-t border-sk-border pt-2 text-[12.5px] text-sk-text2">
								{gbp(d.collected)} rent{d.holdingDepositsCollected ? ` + ${gbp(d.holdingDepositsCollected)} holding deposits` : ""} − {gbp(d.seekFee)} Seek fee (0.5% of rent collected). No fee if rent isn't paid.
							</span>
						</div>
					</div>

					<Card title="Tenants">
						{d.rows.length === 0 ? (
							<Empty title="No rent due this month">Payments appear here once a tenancy has a rent plan.</Empty>
						) : (
							<Table head={["Tenant", "Plan", "Pays by", "This period", "Status", "Next payout", "Action"]} minWidth={860}>
								{d.rows.map((r) => {
									const st = STATUS[r.status] || STATUS.SCHEDULED;
									return (
										<Tr key={r.payment}>
											<td>
												<span className="font-semibold">{r.tenant?.name}</span>
												<br />
												<span className="text-[12.5px] text-sk-muted">{r.property}</span>
											</td>
											<td>
												{r.kind === "HOLDING_DEPOSIT" ? "Holding deposit" : PLAN_LABEL[r.plan] ?? (nationOf(r.tenancy) === "ENGLAND" ? "Monthly" : "-")}
											</td>
											<td>{r.autopay === true ? "Autopay" : r.autopay === false ? "Reminder" : "-"}</td>
											<td className="font-semibold">{periodText(r)}</td>
											<td><Chip tone={st.tone}>{st.label}</Chip>{r.refundDue && <Chip tone="warn" className="ml-1.5">Refund due (7 days)</Chip>}</td>
											<td>
												{r.status === "PAID" ? `${gbp(r.payout)} · ${fmtDay(r.nextPayout)}` : r.nextPayout ? fmtDay(r.nextPayout) : "-"}
											</td>
											<td className="text-right">
												{(r.status === "LATE" || r.status === "FAILED") && (
													<span className="inline-flex gap-2">
														<button type="button" className={btnSmGhost} onClick={() => remindOne(r)}>Remind</button>
														<Link to={`/inbox?tenancy=${r.tenancy}`} className={btnSmGhost}>Message</Link>
													</span>
												)}
											</td>
										</Tr>
									);
								})}
							</Table>
						)}
					</Card>

					<div className="flex flex-wrap items-start gap-6">
						<Card title="Plans you offer" className="min-w-0 flex-[1_1_360px]">
							{nations.length === 0 && <Empty title="No live properties">Plans show once a property is listed.</Empty>}
							{nations.map((n) => {
								const england = n === "ENGLAND";
								const homes = listings.filter((l) => !l.isDraft && (l.nation || "ENGLAND") === n);
								const offered = new Set(homes.flatMap((l) => l.paymentPlans ?? []));
								return (
									<div key={n} className="flex flex-col gap-1.5 border-t border-sk-hair pt-3">
										<span className="text-sm font-semibold">
											{homes.length} {homes.length === 1 ? "property" : "properties"} in {NATION_NAME[n] ?? n}
										</span>
										{england ? (
											<span className="text-[12.5px] text-sk-text2">
												Monthly only. Rent in advance is capped at one month.
											</span>
										) : (
											<div className="flex flex-wrap gap-2">
												<Chip tone="ok">Monthly (always on)</Chip>
												<Chip tone={offered.has("SIX_MONTHS") ? "ok" : "muted"}>Half-year</Chip>
												<Chip tone={offered.has("YEARLY") ? "ok" : "muted"}>Full year</Chip>
											</div>
										)}
									</div>
								);
							})}
						</Card>

						<Card title="Reminders for non-autopay tenants" className="min-w-0 flex-[1_1_360px]">
							<div className="flex flex-col gap-1">
								{[
									["beforeDue", "Before the due date"],
									["onDueDay", "On the day"],
									["lateAfterThreeDays", "3 days late"]
								].map(([key, label]) => (
									<label key={key} className="flex min-h-9 items-center gap-2.5 text-sm">
										<input
											type="checkbox"
											checked={schedule.data?.[key] ?? false}
											disabled={!schedule.data || saveSchedule.isPending}
											onChange={e => saveSchedule.mutate({ [key]: e.target.checked })}
											className="h-[18px] w-[18px] accent-[var(--sk-accent)]"
										/>
										{label}
									</label>
								))}
							</div>
							<span className="text-[12.5px] text-sk-text2">
								Sent by push, email and in the Seek thread. Tenants choose how many days before (3 by default). You're notified at each payment.
							</span>
						</Card>
					</div>
				</>
			)}
		</Page>
	);
}
