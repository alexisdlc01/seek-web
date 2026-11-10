import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, ErrorState, Loading, Page, PageHeader, btnSmGhost, btnSmPrimary } from "../components/sk.jsx";
import { AdviceCard, Notice } from "../components/StudentBits.jsx";
import { api, errMessage, fmtDate, gbp, openFile } from "../lib/landlord.js";
import { useMyTenancy } from "../lib/student.js";
import UserContext from "../context/UserContext.jsx";

const CATEGORY = {
	ENERGY: "Energy",
	WATER: "Water",
	BROADBAND: "Broadband",
	COUNCIL_TAX: "Council tax",
	TV_LICENCE: "TV licence",
	OTHER: "Other"
};

const EXPENSE = [["OTHER", "Other"], ["ENERGY", "Energy"], ["WATER", "Water"], ["BROADBAND", "Broadband"]];
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";
const MAX_BYTES = 15 * 1024 * 1024;
const INSURANCE = "Contents insurance";
const field = "rounded-[10px] border border-sk-border2 bg-sk-card px-3 py-2 text-sm text-sk-text outline-none focus:border-sk-accent";

// Council tax exemption / contents insurance: upload privately, then file on the tenancy.
function FileDoc({ tenancy, doc, type, title, add, replace, onDone }) {
	const [error, setError] = useState("");
	const upload = useMutation({
		mutationFn: async (file) => {
			const { data } = await api.get("/upload/presign", { params: { filename: file.name, fileType: file.type, fileSize: file.size, folder: "private" } });
			try {
				const res = await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
				if (!res.ok) throw new Error(String(res.status));
			} catch (e) {
				// Local dev has no real bucket: keep the record so the flow can be tested.
				if (!import.meta.env.DEV) throw new Error("Your file couldn't be uploaded. Please try again.", { cause: e });
			}
			await api.post(`/tenancies/${tenancy._id}/documents`, { type, title, url: data.fileUrl, key: data.key, source: "UPLOAD" });
		},
		onSuccess: () => onDone({ tone: "ok", text: "Saved to your tenancy documents." }),
		onError: (e) => setError(errMessage(e, e.message || "We couldn't upload that file."))
	});
	const pick = (f) => {
		setError("");
		if (!f) return;
		if (f.size > MAX_BYTES) return setError("Files can be up to 15 MB.");
		if (!ACCEPT.split(",").includes(f.type)) return setError("Use a PDF or a photo (JPEG, PNG or WebP).");
		upload.mutate(f);
	};
	return (
		<span className="flex shrink-0 flex-col items-end gap-1">
			<span className="flex items-center gap-2">
				{doc && <button type="button" onClick={() => openFile(doc)} className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-sk-ok">On file</button>}
				<label className={`${btnSmGhost} ${upload.isPending ? "opacity-60" : ""}`}>
					{upload.isPending ? "Uploading…" : doc ? replace : add}
					<input type="file" accept={ACCEPT} disabled={upload.isPending} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" />
				</label>
			</span>
			{error && <span role="alert" className="text-[12.5px] text-sk-warn">{error}</span>}
		</span>
	);
}

// A cost one housemate paid up front (cleaner, streaming...), split between every tenant.
function AddExpense({ tenancy, onDone }) {
	const [open, setOpen] = useState(false);
	const [provider, setProvider] = useState("");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("OTHER");
	const [error, setError] = useState("");
	const people = tenancy.tenants?.length || 1;
	const create = useMutation({
		mutationFn: (pence) => api.post("/bills", { tenancy: tenancy._id, provider: provider.trim(), category, amount: pence, source: "MANUAL" }),
		onSuccess: () => {
			setProvider("");
			setAmount("");
			setCategory("OTHER");
			setOpen(false);
			onDone({ tone: "ok", text: `Expense added and split ${people} ways. Your share is marked paid; the others owe you.` });
		},
		onError: (e) => setError(errMessage(e, "We couldn't add that expense. Please try again."))
	});
	const submit = (e) => {
		e.preventDefault();
		setError("");
		const pounds = Number.parseFloat(amount.replace(",", "."));
		if (!provider.trim()) return setError("Say what the expense is for.");
		if (!Number.isFinite(pounds) || pounds <= 0 || pounds > 10000) return setError("Enter the total you paid, in pounds.");
		create.mutate(Math.round(pounds * 100));
	};
	if (!open) return <button type="button" onClick={() => setOpen(true)} className={`${btnSmGhost} self-start`}>Add a shared expense</button>;
	return (
		<form onSubmit={submit} className="flex flex-col gap-2.5 rounded-xl bg-sk-card2 p-3.5">
			<span className="text-[12.5px] text-sk-text2">Something you paid up front, split between all {people} of you.</span>
			<input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="What for, e.g. Cleaner" maxLength={80} aria-label="What the expense is for" className={field} />
			<div className="flex gap-2">
				<input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Total paid (£)" aria-label="Total paid in pounds" className={`${field} min-w-0 flex-1`} />
				<select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className={field}>
					{EXPENSE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
				</select>
			</div>
			{error && <div role="alert" className="text-[12.5px] text-sk-warn">{error}</div>}
			<div className="flex gap-2">
				<button type="submit" disabled={create.isPending} className={`${btnSmPrimary} disabled:opacity-60`}>{create.isPending ? "Adding…" : "Add expense"}</button>
				<button type="button" onClick={() => setOpen(false)} className={btnSmGhost}>Cancel</button>
			</div>
		</form>
	);
}

export default function StudentBills() {
	const qc = useQueryClient();
	const { user } = useContext(UserContext);
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
	const docs = tenancy.documents ?? [];
	const councilTaxDoc = docs.findLast((d) => d.type === "COUNCIL_TAX_EXEMPTION");
	const insuranceDoc = docs.findLast((d) => d.title?.startsWith(INSURANCE));
	const councilTaxBill = bills.find((b) => b.category === "COUNCIL_TAX");
	const done = (n) => {
		setNotice(n);
		qc.invalidateQueries({ queryKey: ["student-tenancies"] });
		qc.invalidateQueries({ queryKey: ["bills", tid] });
	};

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
					{bills.filter((b) => b.allowance).map((b) => {
						const a = b.allowance;
						const mine = a.overagePerMember?.find((m) => m.user === user?._id)?.amount;
						return (
							<Card key={`allowance-${b._id}`} title="Energy fair-use allowance" className="!gap-2.5">
								<div className="h-2 rounded bg-sk-border" aria-hidden="true">
									<div className={`h-2 rounded ${a.overage > 0 ? "bg-sk-warn" : "bg-sk-accent"}`} style={{ width: `${Math.min(100, a.percentUsed)}%` }} />
								</div>
								<span className="text-[12.5px] text-sk-text2">{gbp(a.used)} of {gbp(a.allowance)} · {a.percentUsed}% used</span>
								{a.overage > 0 && (
									<span role="status" className="text-[12.5px] text-sk-warn">
										{gbp(a.overage)} over the allowance, shared between the household{mine != null ? `. Your part: ${gbp(mine)}` : ""}.
									</span>
								)}
							</Card>
						);
					})}

					<Card title="To sort out as a household" className="!gap-3">
						<div className="flex flex-col gap-3 border-b border-sk-hair pb-3">
							<div className="flex items-center justify-between gap-3">
								<span className="flex min-w-0 flex-col">
									<span className="text-sm font-semibold">Council tax</span>
									<span className="text-[12.5px] text-sk-muted">
										{councilTaxBill?.includedInRent
											? "Included in your rent."
											: councilTaxDoc
												? "Exemption certificate on file. Send it to your council if they ask."
												: "A house of full-time students is usually exempt. Get a certificate from your university and file it here."}
									</span>
								</span>
								{!councilTaxBill?.includedInRent && <FileDoc tenancy={tenancy} doc={councilTaxDoc} type="COUNCIL_TAX_EXEMPTION" title="Council tax exemption" add="File exemption" replace="Replace" onDone={done} />}
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="flex min-w-0 flex-col">
									<span className="text-sm font-semibold">TV Licence</span>
									<span className="text-[12.5px] text-sk-muted">Only needed if you watch live TV or BBC iPlayer.</span>
								</span>
								<a href="https://www.tvlicensing.co.uk/check-if-you-need-one" target="_blank" rel="noopener noreferrer" className={`${btnSmGhost} shrink-0`}>Check</a>
							</div>
							<div className="flex items-center justify-between gap-3">
								<span className="flex min-w-0 flex-col">
									<span className="text-sm font-semibold">Contents insurance</span>
									<span className="text-[12.5px] text-sk-muted">Laptop, bike, phone. Your landlord's insurance does not cover them.</span>
								</span>
								<FileDoc tenancy={tenancy} doc={insuranceDoc} type="OTHER" title={INSURANCE} add="Add policy" replace="Replace" onDone={done} />
							</div>
						</div>
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
						<AddExpense tenancy={tenancy} onDone={done} />
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
