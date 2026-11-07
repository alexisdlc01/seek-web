import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, ErrorState, Loading, Page, PageHeader } from "../components/sk.jsx";
import { AdviceCard, Notice } from "../components/StudentBits.jsx";
import { api, errMessage, fmtDate, gbp } from "../lib/landlord.js";
import { useMyTenancy } from "../lib/student.js";

const CATEGORY = {
	ENERGY: "Energy",
	WATER: "Water",
	BROADBAND: "Broadband",
	COUNCIL_TAX: "Council tax",
	TV_LICENCE: "TV licence",
	OTHER: "Other"
};

export default function StudentBills() {
	const qc = useQueryClient();
	const { tenancy, isLoading, isError, error, refetch } = useMyTenancy();
	const tid = tenancy?._id;
	const billsQ = useQuery({ queryKey: ["bills", tid], enabled: !!tid, queryFn: async () => (await api.get(`/bills/tenancy/${tid}`)).data });
	const [notice, setNotice] = useState(null);

	const markPaid = useMutation({
		mutationFn: (id) => api.patch(`/bills/${id}/paid`),
		onSuccess: () => {
			setNotice({ tone: "ok", text: "Your share is marked as paid." });
			qc.invalidateQueries({ queryKey: ["bills", tid] });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't update this bill.") })
	});

	if (isLoading || (tid && billsQ.isLoading)) return <Page><Loading label="Loading bills" /></Page>;
	if (isError) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;
	if (billsQ.isError) return <Page><ErrorState error={billsQ.error} onRetry={() => billsQ.refetch()} /></Page>;

	const back = <Link to="/student/home" className="text-sk-link no-underline">← My home</Link>;
	if (!tenancy)
		return (
			<Page>
				<PageHeader eyebrow={back} title="Bills" />
				<Card><span className="text-sm text-sk-text2">Your household bills show here once you have a tenancy.</span></Card>
			</Page>
		);

	const bills = billsQ.data ?? [];
	const included = bills.filter((b) => b.includedInRent);
	const extra = bills.filter((b) => !b.includedInRent);
	const due = extra.filter((b) => b.status !== "PAID" && !b.myPaid);
	const people = tenancy.tenants?.length || tenancy.listing?.numOfPeople || 1;

	return (
		<Page className="!gap-[22px]">
			<PageHeader eyebrow={back} title="Bills" />
			<Notice notice={notice} />

			<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
				<div className="flex flex-col gap-1.5 rounded-2xl bg-sk-card2 p-[18px]">
					<span className="text-[13px] text-sk-muted">Your share to pay</span>
					<span className="font-display text-[28px] font-semibold">{gbp(due.reduce((s, b) => s + (b.myShare ?? 0), 0))}</span>
					<span className="text-[12.5px] text-sk-text2">{due.length ? `${due.length} ${due.length === 1 ? "bill" : "bills"} · split ${people} ways` : "Nothing due"}</span>
				</div>
				<div className="flex flex-col gap-1.5 rounded-2xl border border-sk-border bg-sk-card p-[18px]">
					<span className="text-[13px] text-sk-muted">Included in rent</span>
					<span className="font-display text-[28px] font-semibold">{included.length}</span>
					<span className="text-[12.5px] text-sk-ok">{included.map((b) => CATEGORY[b.category] ?? b.category).join(", ") || "None"}</span>
				</div>
			</div>

			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[1.4_1_480px] flex-col gap-4">
					<Card title="To sort out as a household" className="!gap-3">
						{extra.length === 0 && <span className="text-sm text-sk-text2">{tenancy.listing?.billsIncluded ? "All bills are included in your rent." : "No bills added yet."}</span>}
						{extra.map((b) => (
							<div key={b._id} className="flex items-center justify-between gap-3 border-b border-sk-hair pb-3 last:border-none last:pb-0">
								<span className="flex min-w-0 flex-col">
									<span className="text-sm font-semibold">
										{CATEGORY[b.category] ?? b.category}
										{b.provider ? ` · ${b.provider}` : ""}
									</span>
									<span className="text-[12.5px] text-sk-muted">
										{gbp(b.amount)} total · your share {gbp(b.myShare)}
										{b.shares?.length ? ` · ${b.shares.filter((x) => x.paid).length} of ${b.shares.length} paid` : ""}
										{b.paidByName ? ` · paid upfront by ${b.paidByName}` : ""}
										{b.dueDate ? ` · due ${fmtDate(b.dueDate)}` : ""}
									</span>
								</span>
								{b.status === "PAID" ? (
									<span className="shrink-0 text-[13px] font-semibold text-sk-ok">Paid</span>
								) : b.myPaid ? (
									<span className="shrink-0 text-[13px] font-semibold text-sk-ok">You've paid</span>
								) : (
									<button
										type="button"
										onClick={() => markPaid.mutate(b._id)}
										disabled={markPaid.isPending}
										className="h-9 shrink-0 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text disabled:opacity-60"
									>
										Mark my share paid
									</button>
								)}
							</div>
						))}
					</Card>

					{included.length > 0 && (
						<Card title="Included in your rent" className="!gap-2.5">
							{included.map((b) => (
								<div key={b._id} className="flex justify-between gap-3 text-sm">
									<span>{CATEGORY[b.category] ?? b.category}{b.provider ? ` · ${b.provider}` : ""}</span>
									<span className="font-semibold text-sk-ok">Included</span>
								</div>
							))}
						</Card>
					)}
				</div>
				<aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
					<AdviceCard topic="bills" tenancyId={tid} />
				</aside>
			</div>
		</Page>
	);
}
