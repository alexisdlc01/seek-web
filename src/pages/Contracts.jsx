import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Chip, Empty, ErrorState, Loading, Page, PageHeader, btnSmGhost, btnSmPrimary } from "../components/sk.jsx";
import { DEPOSIT_SCHEMES, api, engineerLink, errMessage, fmtDate, depositRules, fmtDay, gbp, openAttachment } from "../lib/landlord.js";

const SCHEME_LABEL = Object.fromEntries(DEPOSIT_SCHEMES.map((s) => [s.value, s.label]));
const CONTRACT_TONE = { DRAFT: "muted", SENT: "warn", SIGNED: "ok" };
const CONTRACT_LABEL = { DRAFT: "Draft", SENT: "Waiting for signatures", SIGNED: "Signed" };
const SEVERITY_TEXT = { high: "text-sk-danger", medium: "text-sk-warn", low: "text-sk-text2" };

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

const openDocument = doc => openAttachment(doc).catch(e => window.alert(errMessage(e, "We couldn't open this document.")));

function DepositForm({ tenancy, onDone }) {
	const qc = useQueryClient();
	const [scheme, setScheme] = useState(tenancy.depositScheme || "DPS");
	const [reference, setReference] = useState(tenancy.depositReference || "");
	const [protectedAt, setProtectedAt] = useState(toDateInput(tenancy.depositProtectedAt));
	const [receivedAt, setReceivedAt] = useState(toDateInput(tenancy.depositReceivedAt));
	const save = useMutation({
		mutationFn: () =>
			api.patch(`/tenancies/${tenancy._id}/deposit`, {
				depositScheme: scheme,
				depositReference: reference.trim(),
				...(protectedAt ? { depositProtectedAt: new Date(protectedAt).toISOString() } : {}),
				...(receivedAt ? { depositReceivedAt: new Date(receivedAt).toISOString() } : {})
			}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["landlord-tenancies"] });
			qc.invalidateQueries({ queryKey: ["landlord-overview"] });
			onDone();
		}
	});
	const input = "h-10 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text";
	return (
		<form
			className="flex flex-col gap-3 rounded-xl bg-sk-card2 p-3"
			onSubmit={(e) => {
				e.preventDefault();
				save.mutate();
			}}
		>
			<div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
				<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
					Scheme
					<select value={scheme} onChange={(e) => setScheme(e.target.value)} className={input}>
						{DEPOSIT_SCHEMES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
					</select>
				</label>
				<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
					Reference
					<input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={60} required className={input} />
				</label>
				<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
					Received on
					<input type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} className={input} />
				</label>
				<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
					Protected on
					<input type="date" value={protectedAt} onChange={(e) => setProtectedAt(e.target.value)} className={input} />
				</label>
			</div>
			{save.isError && <span role="alert" className="text-[12.5px] text-sk-warn">{errMessage(save.error)}</span>}
			<div className="flex gap-2">
				<button type="submit" className={btnSmPrimary} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save deposit"}</button>
				<button type="button" className={btnSmGhost} onClick={onDone}>Cancel</button>
			</div>
		</form>
	);
}

function EnergyForm({ tenancy }) {
	const qc = useQueryClient();
	const [energy, setEnergy] = useState(tenancy.energyAllowance != null ? String(tenancy.energyAllowance / 100) : "");
	const save = useMutation({
		mutationFn: () => api.patch(`/tenancies/${tenancy._id}/energy-allowance`, { energyAllowance: energy === "" ? null : Math.round(Number(energy) * 100) }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["landlord-tenancies"] })
	});
	return (
		<form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
			<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
				Energy allowance (£/month)
				<input type="number" min={0} step="0.01" value={energy} onChange={(e) => setEnergy(e.target.value)} className="h-10 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text" />
			</label>
			<button type="submit" className={btnSmPrimary} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save allowance"}</button>
			{save.isError && <span role="alert" className="text-[12.5px] text-sk-warn">{errMessage(save.error)}</span>}
		</form>
	);
}

const INVENTORY_START = { room: "", item: "", condition: "" };

function InventoryForm({ contract, onDone }) {
	const qc = useQueryClient();
	const [rows, setRows] = useState(contract.inventory?.items?.length ? contract.inventory.items.map(({ room, item, condition, photoUrls }) => ({ room, item, condition, photoUrls })) : [{ ...INVENTORY_START }]);
	const save = useMutation({
		mutationFn: () => api.put(`/contracts/${contract._id}/inventory`, { items: rows.filter((r) => r.room.trim() && r.item.trim() && r.condition.trim()) }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["landlord-contracts"] });
			onDone();
		}
	});
	const set = (i, k, v) => setRows((cur) => cur.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
	const input = "h-10 min-w-0 flex-1 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text";
	return (
		<form className="flex flex-col gap-2 rounded-xl bg-sk-card2 p-3" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
			{rows.map((r, i) => (
				<div key={i} className="flex flex-wrap gap-2">
					<input aria-label="Room" placeholder="Room" value={r.room} onChange={(e) => set(i, "room", e.target.value)} className={input} />
					<input aria-label="Item" placeholder="Item" value={r.item} onChange={(e) => set(i, "item", e.target.value)} className={input} />
					<input aria-label="Condition" placeholder="Condition" value={r.condition} onChange={(e) => set(i, "condition", e.target.value)} className={input} />
				</div>
			))}
			{save.isError && <span role="alert" className="text-[12.5px] text-sk-warn">{errMessage(save.error)}</span>}
			<div className="flex gap-2">
				<button type="button" className={btnSmGhost} onClick={() => setRows((cur) => [...cur, { ...INVENTORY_START }])}>Add item</button>
				<button type="submit" className={btnSmPrimary} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save inventory"}</button>
				<button type="button" className={btnSmGhost} onClick={onDone}>Cancel</button>
			</div>
		</form>
	);
}

function DeductionsForm({ contract, depositTotal, onDone }) {
	const qc = useQueryClient();
	const [rows, setRows] = useState([{ description: "", amount: "" }]);
	const items = rows.filter((r) => r.description.trim() && Number(r.amount) > 0).map((r) => ({ description: r.description.trim(), amount: Math.round(Number(r.amount) * 100) }));
	const total = items.reduce((n, i) => n + i.amount, 0);
	const save = useMutation({
		mutationFn: () => api.post(`/contracts/${contract._id}/deductions`, { items }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["landlord-contracts"] });
			onDone();
		}
	});
	const set = (i, k, v) => setRows((cur) => cur.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
	const input = "h-10 min-w-0 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text";
	return (
		<form className="flex flex-col gap-2 rounded-xl bg-sk-card2 p-3" onSubmit={(e) => { e.preventDefault(); if (items.length) save.mutate(); }}>
			{rows.map((r, i) => (
				<div key={i} className="flex flex-wrap gap-2">
					<input aria-label="What for" placeholder="What for" value={r.description} onChange={(e) => set(i, "description", e.target.value)} className={`${input} flex-[2]`} />
					<input aria-label="Amount in pounds" type="number" min="0" step="0.01" placeholder="£" value={r.amount} onChange={(e) => set(i, "amount", e.target.value)} className={`${input} w-28`} />
				</div>
			))}
			<span className={`text-[12.5px] ${total > depositTotal ? "text-sk-warn" : "text-sk-text2"}`}>
				Total {gbp(total)} of {gbp(depositTotal)} held. Each tenant can accept or dispute.
			</span>
			{save.isError && <span role="alert" className="text-[12.5px] text-sk-warn">{errMessage(save.error)}</span>}
			<div className="flex gap-2">
				<button type="button" className={btnSmGhost} onClick={() => setRows((cur) => [...cur, { description: "", amount: "" }])}>Add line</button>
				<button type="submit" className={btnSmPrimary} disabled={save.isPending || !items.length || total > depositTotal}>{save.isPending ? "Sending…" : "Propose deductions"}</button>
				<button type="button" className={btnSmGhost} onClick={onDone}>Cancel</button>
			</div>
		</form>
	);
}

const DEDUCTION_TONE = { PROPOSED: "warn", ACCEPTED: "ok", DISPUTED: "warn" };

function ContractRow({ contract, depositTotal }) {
	const qc = useQueryClient();
	const [panel, setPanel] = useState(null); // "inventory" | "deductions"
	const send = useMutation({
		mutationFn: () => api.post(`/contracts/${contract._id}/send`),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["landlord-contracts"] })
	});
	const total = contract.tenancy?.tenants?.length ?? 0;
	return (
		<div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sk-border p-3">
			<div className="flex min-w-0 flex-col gap-0.5">
				<button type="button" onClick={() => openDocument(contract)} className="cursor-pointer border-none bg-transparent p-0 text-left text-sm font-semibold text-sk-text underline">
					{contract.title}
				</button>
				<span className="text-[12.5px] text-sk-muted">
					{contract.status === "SIGNED"
						? `Signed ${fmtDate(contract.signedAt)}`
						: contract.status === "SENT"
							? `Sent ${fmtDay(contract.sentAt)} · ${contract.signatures.length} of ${total} signed`
							: `Added ${fmtDay(contract.createdAt)}`}
				</span>
				{send.isError && <span role="alert" className="text-[12.5px] text-sk-warn">{errMessage(send.error)}</span>}
			</div>
			<div className="flex items-center gap-2">
				<Chip tone={CONTRACT_TONE[contract.status]}>{CONTRACT_LABEL[contract.status]}</Chip>
				{contract.status === "DRAFT" && (
					<button type="button" className={btnSmPrimary} disabled={send.isPending} onClick={() => send.mutate()}>
						{send.isPending ? "Sending…" : "Send for e-signature"}
					</button>
				)}
			</div>
			{contract.templateKind && (
				<span className="basis-full text-[12.5px] text-sk-muted">
					{contract.templateKind === "WALES_STANDARD_OCCUPATION" ? "Seek contract · standard occupation contract (Wales)" : "Seek contract · assured periodic tenancy (England)"}
					{contract.prescribedInformationUrl && (
						<> · <button type="button" onClick={() => window.open(contract.prescribedInformationUrl, "_blank", "noopener")} className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] text-sk-link underline">Deposit prescribed information</button></>
					)}
				</span>
			)}
			{contract.status === "SIGNED" && (
				<div className="flex basis-full flex-col gap-2">
					<div className="flex flex-wrap items-center gap-2 text-[12.5px] text-sk-text2">
						<span>{contract.inventory?.items?.length ? `Inventory: ${contract.inventory.items.length} items recorded` : "No check-in inventory yet"}</span>
						<button type="button" className={btnSmGhost} onClick={() => setPanel(panel === "inventory" ? null : "inventory")}>{contract.inventory?.items?.length ? "Edit inventory" : "Record inventory"}</button>
						{contract.deductions ? (
							<Chip tone={DEDUCTION_TONE[contract.deductions.status]}>
								Deductions {gbp(contract.deductions.total)} · {contract.deductions.status.toLowerCase()}
							</Chip>
						) : (
							<button type="button" className={btnSmGhost} onClick={() => setPanel(panel === "deductions" ? null : "deductions")}>Propose deductions</button>
						)}
					</div>
					{panel === "inventory" && <InventoryForm contract={contract} onDone={() => setPanel(null)} />}
					{panel === "deductions" && <DeductionsForm contract={contract} depositTotal={depositTotal} onDone={() => setPanel(null)} />}
				</div>
			)}
		</div>
	);
}

function AddContract({ tenancy, label = "Upload a contract" }) {
	const qc = useQueryClient();
	const fileRef = useRef(null);
	const [title, setTitle] = useState("");
	const [file, setFile] = useState(null);
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const [open, setOpen] = useState(false);

	const submit = async (e) => {
		e.preventDefault();
		if (!file || !title.trim()) return;
		setBusy(true);
		setError("");
		try {
			const { data } = await api.get("/upload/presign", {
				params: { filename: file.name, fileType: file.type, fileSize: file.size, folder: "private" }
			});
			await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } }).then((r) => {
				if (!r.ok) throw new Error("The upload didn't go through.");
			});
			if (tenancy) await api.post("/contracts", { tenancy: tenancy._id, title: title.trim(), url: data.fileUrl, key: data.key, source: "UPLOAD" });
			else await api.post("/contracts/templates", { title: title.trim(), url: data.fileUrl, key: data.key });
			setTitle("");
			setFile(null);
			setOpen(false);
			qc.invalidateQueries({ queryKey: [tenancy ? "landlord-contracts" : "contract-templates"] });
		} catch (err) {
			setError(errMessage(err, err.message));
		} finally {
			setBusy(false);
		}
	};

	if (!open)
		return (
			<button type="button" className={btnSmGhost} onClick={() => setOpen(true)}>{label}</button>
		);
	return (
		<form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-dashed border-sk-border2 p-3">
			<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
				Title
				<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tenancy agreement 2027-28" maxLength={120} required className="h-10 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text" />
			</label>
			<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
				PDF or image (up to 15 MB)
				<input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png" required onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-[13px] text-sk-text" />
			</label>
			{error && <span role="alert" className="text-[12.5px] text-sk-warn">{error}</span>}
			<div className="flex gap-2">
				<button type="submit" className={btnSmPrimary} disabled={busy || !file || !title.trim()}>{busy ? "Uploading…" : tenancy ? "Save as draft" : "Save template"}</button>
				<button type="button" className={btnSmGhost} onClick={() => setOpen(false)}>Cancel</button>
			</div>
		</form>
	);
}

function TenancyActions({ tenancy: t, contracts, templates }) {
	const qc = useQueryClient();
	const refresh = () => {
		qc.invalidateQueries({ queryKey: ["landlord-contracts"] });
		qc.invalidateQueries({ queryKey: ["landlord-tenancies"] });
	};
	const seek = useMutation({ mutationFn: () => api.post("/contracts/default", { tenancy: t._id }), onSuccess: refresh });
	const fromTemplate = useMutation({
		mutationFn: (tpl) => api.post("/contracts", { tenancy: t._id, title: tpl.title, url: tpl.url, key: tpl.key, source: "UPLOAD" }),
		onSuccess: refresh
	});
	const received = useMutation({ mutationFn: () => api.patch(`/tenancies/${t._id}/deposit-received`, {}), onSuccess: refresh });
	const prescribed = useMutation({ mutationFn: () => api.post(`/tenancies/${t._id}/prescribed-info`, {}), onSuccess: refresh });
	const err = [seek, fromTemplate, received, prescribed].find((m) => m.isError)?.error;
	const hasSeek = contracts.some((c) => c.source === "SEEK");
	return (
		<div className="flex flex-wrap items-center gap-2">
			{!hasSeek && <button type="button" className={btnSmPrimary} disabled={seek.isPending} onClick={() => seek.mutate()}>{seek.isPending ? "Drafting…" : "Create Seek contract"}</button>}
			{templates.map((tpl) => (
				<button key={tpl._id} type="button" className={btnSmGhost} disabled={fromTemplate.isPending} onClick={() => fromTemplate.mutate(tpl)}>Use “{tpl.title}”</button>
			))}
			{!t.depositReceivedAt && <button type="button" className={btnSmGhost} disabled={received.isPending} onClick={() => received.mutate()}>Deposit received</button>}
			{t.depositReceivedAt && !t.prescribedInfoSentAt && <button type="button" className={btnSmGhost} disabled={prescribed.isPending} onClick={() => prescribed.mutate()}>Prescribed info sent</button>}
			{err && <span role="alert" className="basis-full text-[12.5px] text-sk-warn">{errMessage(err)}</span>}
		</div>
	);
}

function Templates({ templates }) {
	const qc = useQueryClient();
	const del = useMutation({
		mutationFn: (id) => api.delete(`/contracts/templates/${id}`),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["contract-templates"] })
	});
	return (
		<Card title="Your contract templates">
			{templates.length === 0 && <Empty title="No template yet">Upload your usual agreement once, then reuse it on any tenancy.</Empty>}
			{templates.map((tpl) => (
				<div key={tpl._id} className="flex items-center justify-between gap-2 text-[13.5px]">
					<span className="min-w-0 truncate">{tpl.title}</span>
					<button type="button" className={btnSmGhost} disabled={del.isPending} onClick={() => del.mutate(tpl._id)}>Remove</button>
				</div>
			))}
			<AddContract label="Upload a template" />
		</Card>
	);
}

function TenancyCard({ tenancy: t, contracts, templates }) {
	const [editing, setEditing] = useState(false);
	// monthlyRent and depositAmount are per tenant (pence); show the tenancy total.
	const count = Math.max(1, t.tenants.length);
	const weeklyRent = (t.monthlyRent * 12) / 52;
	const weeks = weeklyRent ? t.depositAmount / weeklyRent : 0;
	const isProtected = !!t.depositProtectedAt;
	const rules = depositRules(t.listing?.nation, t.monthlyRent, t);
	const overCap = t.depositAmount > rules.capPence;
	const names = t.tenants.map((x) => x.name).join(", ");
	const facts = [
		["Deposit", gbp(t.depositAmount * count), `${count} × ${gbp(t.depositAmount)}${t.depositScheme ? ` · ${SCHEME_LABEL[t.depositScheme]}` : ""} · ${weeks.toFixed(1)} weeks each${overCap ? ` · over the ${rules.capShort} cap` : ""}`, overCap ? "warn" : ""],
		["Protected", isProtected ? fmtDay(t.depositProtectedAt) : "Not yet", isProtected ? `Ref ${t.depositReference || "-"}` : rules.protectBy ? `Protect within ${rules.window}: due ${fmtDay(rules.protectBy)}` : `Protect within ${rules.window}. The clock starts when it is received`, isProtected ? "ok" : "warn"],
		["Prescribed information", t.prescribedInfoSentAt ? "Sent" : "Not sent", t.prescribedInfoSentAt ? fmtDay(t.prescribedInfoSentAt) : t.depositReceivedAt ? "Give it to the tenants once the deposit is received" : "Sent after the deposit is received", t.prescribedInfoSentAt ? "ok" : ""],
		...(t.listing?.billsIncluded ? [["Energy allowance", t.energyAllowance != null ? `${gbp(t.energyAllowance)} / month` : "Not set", "Fair-use limit for the household", ""]] : []),
		["Rent", gbp(t.monthlyRent * count), `${count} × ${gbp(t.monthlyRent)} pcm · ${t.periodic ? "Periodic tenancy" : `Until ${fmtDate(t.endDate)}`}`, ""]
	];
	return (
		<Card as="article" className="!gap-3.5">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-col gap-0.5">
					<h2 className="font-display text-lg font-semibold">{t.listing?.propertyTitle || "Tenancy"}</h2>
					<span className="text-[13px] text-sk-muted">{names} · from {fmtDate(t.startDate)}</span>
				</div>
				<Chip tone={t.status === "ACTIVE" ? "ok" : "muted"}>{t.status === "ACTIVE" ? "Active" : "Ended"}</Chip>
			</div>

			<div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
				{facts.map(([label, value, sub, tone]) => (
					<div key={label} className="flex flex-col gap-1 rounded-xl bg-sk-card2 p-3">
						<span className="text-[12.5px] text-sk-muted">{label}</span>
						<span className={`text-[17px] font-semibold ${tone === "ok" ? "text-sk-ok" : tone === "warn" ? "text-sk-warn" : ""}`}>{value}</span>
						<span className="text-xs text-sk-text2">{sub}</span>
					</div>
				))}
			</div>

			{editing ? (
				<DepositForm tenancy={t} onDone={() => setEditing(false)} />
			) : (
				<div><button type="button" className={btnSmGhost} onClick={() => setEditing(true)}>Edit deposit details</button></div>
			)}

			{t.listing?.billsIncluded && <EnergyForm key={t.energyAllowance} tenancy={t} />}

			{(t.compliance ?? []).map((c, i) => (
				<div key={i} className={`rounded-xl bg-sk-warn-bg p-3 text-[13px] ${SEVERITY_TEXT[c.severity]}`}>
					{c.message} <span className="font-semibold">Due {fmtDay(c.dueDate)}.</span>
				</div>
			))}

			<div className="flex flex-col gap-2">
				<span className="text-[12.5px] font-semibold text-sk-muted">Contracts</span>
				{contracts.length === 0 && <Empty title="No contract yet">Upload the agreement, then send it to your tenants to sign.</Empty>}
				{contracts.map((c) => <ContractRow key={c._id} contract={c} depositTotal={t.depositAmount * count} />)}
				<TenancyActions tenancy={t} contracts={contracts} templates={templates} />
				<AddContract tenancy={t} />
			</div>

			{t.documents?.length > 0 && (
				<div className="flex flex-wrap gap-2 text-[13px]">
					{t.documents.map((d) => (
						<button key={d.key || d.url} type="button" onClick={() => openDocument(d)} className="cursor-pointer rounded-lg border-none bg-sk-hair px-2.5 py-1.5 text-sk-text">
							{d.title}
						</button>
					))}
				</div>
			)}
		</Card>
	);
}

export default function Contracts() {
	const tenancies = useQuery({
		queryKey: ["landlord-tenancies"],
		queryFn: async () => (await api.get("/tenancies/landlord")).data
	});
	const contracts = useQuery({
		queryKey: ["landlord-contracts"],
		queryFn: async () => (await api.get("/contracts/landlord")).data
	});
	const templates = useQuery({
		queryKey: ["contract-templates"],
		queryFn: async () => (await api.get("/contracts/templates")).data
	});
	const overview = useQuery({
		queryKey: ["landlord-overview"],
		queryFn: async () => (await api.get("/landlord/overview")).data
	});

	const list = tenancies.data ?? [];
	const protectedTotal = list.filter((t) => t.depositProtectedAt).reduce((n, t) => n + t.depositAmount * Math.max(1, t.tenants.length), 0);
	const calendar = [...(overview.data?.compliance ?? [])].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

	return (
		<Page className="!gap-[22px]">
			<PageHeader
				eyebrow={tenancies.data ? `${list.length} ${list.length === 1 ? "tenancy" : "tenancies"} · ${gbp(protectedTotal)} in protected deposits` : "Tenancies and deposits"}
				title="Contracts and deposits"
			/>

			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[1.6_1_560px] flex-col gap-4">
					{(tenancies.isLoading || contracts.isLoading) && <Loading label="Loading tenancies" />}
					{tenancies.isError && <ErrorState error={tenancies.error} onRetry={() => tenancies.refetch()} />}
					{contracts.isError && <ErrorState error={contracts.error} onRetry={() => contracts.refetch()} />}
					{tenancies.data && list.length === 0 && (
						<Empty title="No tenancies yet">Once a household moves in, its contract and deposit appear here.</Empty>
					)}
					{tenancies.data && contracts.data &&
						list.map((t) => (
							<TenancyCard key={t._id} tenancy={t} contracts={contracts.data.filter((c) => c.tenancy?._id === t._id)} templates={templates.data ?? []} />
						))}
				</div>

				<aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
					<Templates templates={templates.data ?? []} />
					<Card title="Compliance calendar">
						{overview.isLoading && <Loading />}
						{overview.isError && <ErrorState error={overview.error} onRetry={() => overview.refetch()} />}
						{overview.data && calendar.length === 0 && <Empty title="Nothing due">Certificates and licences are up to date.</Empty>}
						{calendar.map((c, i) => {
							const book = engineerLink(c.kind);
							return (
								<div key={i} className="flex justify-between gap-2.5 text-[13.5px]">
									<span>
										{c.listingTitle}<br /><span className="text-[12.5px] text-sk-muted">{c.message}</span>
										{book && (
											<>
												<br />
												<a href={book.href} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-sk-link">{book.label} →</a>
											</>
										)}
									</span>
									<span className={`shrink-0 font-semibold ${SEVERITY_TEXT[c.severity]}`}>{fmtDay(c.dueDate)}</span>
								</div>
							);
						})}
					</Card>
					<section className="flex flex-col gap-2 rounded-2xl bg-sk-card2 p-5">
						<span className="text-xs font-bold text-sk-link">Deposit rules</span>
						<span className="text-[13.5px] leading-normal text-sk-text2">
							Deposits are capped at 5 weeks of rent (two months in Scotland) and must be protected in a government-approved scheme within 30 days of receiving the deposit (30 working days of the tenancy starting in Scotland).
						</span>
					</section>
				</aside>
			</div>
		</Page>
	);
}
