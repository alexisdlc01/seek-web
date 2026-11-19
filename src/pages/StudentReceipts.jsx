import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, Empty, ErrorState, Loading, Page, PageHeader, btnGhost } from "../components/sk.jsx";
import { Modal } from "../components/StudentBits.jsx";
import { api, fmtDate, gbp } from "../lib/landlord.js";

const KIND = { RENT: "Rent", HOLDING_DEPOSIT: "Holding deposit" };

export default function StudentReceipts() {
	const [receipt, setReceipt] = useState(null);
	// All tenancies on purpose, same as the mobile app: past homes keep their receipts.
	const q = useQuery({ queryKey: ["my-payments"], queryFn: async () => (await api.get("/payments/mine")).data });
	const paid = (q.data ?? [])
		.filter((p) => p.status === "PAID")
		.sort((a, b) => new Date(b.paidAt ?? b.dueDate) - new Date(a.paidAt ?? a.dueDate));
	const title = (p) => p.tenancy?.listing?.propertyTitle;

	return (
		<Page className="!gap-[22px]">
			<PageHeader eyebrow={<Link to="/student/home" className="text-sk-link no-underline">← My home</Link>} title="Receipts" />
			{q.isLoading && <Loading label="Loading your receipts" />}
			{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
			{q.data && paid.length === 0 && <Empty title="No receipts yet">Paid rent and holding deposits will appear here.</Empty>}
			{paid.length > 0 && (
				<Card className="!gap-3">
					{paid.map((p) => (
						<div key={p._id} className="flex items-center justify-between gap-2 border-b border-sk-hair pb-3 text-sm last:border-none last:pb-0">
							<span className="flex flex-col">
								<span className="font-semibold">{gbp(p.amount)}</span>
								<span className="text-[12.5px] text-sk-muted">{KIND[p.kind] ?? p.kind} · paid {fmtDate(p.paidAt ?? p.dueDate)}{title(p) ? ` · ${title(p)}` : ""}</span>
							</span>
							<button type="button" onClick={() => setReceipt(p)} className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-sk-link">Receipt</button>
						</div>
					))}
				</Card>
			)}
			{receipt && (
				<Modal title="Receipt" onClose={() => setReceipt(null)}>
					<style>{"@media print{body *{visibility:hidden}#receipt,#receipt *{visibility:visible}#receipt{position:fixed;inset:0;padding:24px;background:#fff;color:#000}}"}</style>
					<dl id="receipt" className="flex flex-col gap-2 text-sm">
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">Amount paid</dt><dd className="font-semibold">{gbp(receipt.amount)}</dd></div>
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">Paid on</dt><dd>{fmtDate(receipt.paidAt ?? receipt.dueDate)}</dd></div>
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">For</dt><dd>{KIND[receipt.kind] ?? receipt.kind} · due {fmtDate(receipt.dueDate)}</dd></div>
						{title(receipt) && <div className="flex justify-between gap-3"><dt className="text-sk-muted">Property</dt><dd>{title(receipt)}</dd></div>}
						<div className="flex justify-between gap-3"><dt className="text-sk-muted">Reference</dt><dd className="break-all font-mono text-[12.5px]">{receipt._id}</dd></div>
					</dl>
					<button type="button" onClick={() => window.print()} className={`${btnGhost} self-start`}>Print</button>
				</Modal>
			)}
		</Page>
	);
}
