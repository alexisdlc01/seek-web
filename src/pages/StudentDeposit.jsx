import { useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserContext from "../context/UserContext.jsx";
import { Card, ErrorState, Loading, Page, PageHeader } from "../components/sk.jsx";
import { AdviceCard, Notice } from "../components/StudentBits.jsx";
import { DEPOSIT_SCHEMES, api, depositRules, errMessage, fmtDate, gbp, openFile, safeUrl } from "../lib/landlord.js";
import { idOf, useMyTenancy } from "../lib/student.js";
import { tenanciesControllerAddDocumentMutation } from "../client/@tanstack/react-query.gen";

const linkCls = "flex h-9 items-center rounded-[10px] border border-sk-border2 px-3 text-[13px] font-semibold text-sk-text no-underline";

const Row = ({ label, children }) => (
	<div className="flex justify-between gap-3 border-b border-sk-hair pb-2.5 text-sm last:border-none last:pb-0">
		<span className="text-sk-muted">{label}</span>
		<span className="text-right font-semibold">{children}</span>
	</div>
);

function InventoryPhotos({ tenancyId, documents, stage, title }) {
	const qc = useQueryClient();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const addDocument = useMutation(tenanciesControllerAddDocumentMutation());
	const upload = async (file) => {
		if (!file) return;
		setBusy(true);
		setError("");
		try {
			const { data } = await api.get("/upload/presign", {
				params: { filename: file.name, fileType: file.type, fileSize: file.size, folder: "private" }
			});
			const response = await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
			if (!response.ok) throw new Error("The upload didn't go through.");
			await addDocument.mutateAsync({
				path: { id: tenancyId },
				body: { type: "INVENTORY", stage, title: file.name, url: data.fileUrl, key: data.key, source: "UPLOAD" }
			});
			await qc.invalidateQueries({ queryKey: ["student-tenancies"] });
		} catch (e) {
			setError(errMessage(e, e?.message || "We couldn't upload that photo."));
		} finally {
			setBusy(false);
		}
	};
	return (
		<Card title={title} className="!gap-2.5">
			{documents.length === 0 && <span className="text-sm text-sk-text2">No photos uploaded yet.</span>}
			{documents.map((document) => (
				<div key={document._id} className="flex items-center justify-between gap-3 border-b border-sk-hair pb-2.5 last:border-none last:pb-0">
					<span className="min-w-0 flex-1 truncate text-sm">{document.title}</span>
					<span className="shrink-0 text-[12.5px] text-sk-muted">{fmtDate(document.addedAt)}</span>
					<button type="button" onClick={() => openFile(document)} className={linkCls}>Open</button>
				</div>
			))}
			<label className={`${linkCls} w-fit cursor-pointer`}>
				{busy ? "Uploading…" : "Upload photo"}
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
					disabled={busy}
					className="sr-only"
					onChange={(e) => {
						void upload(e.target.files?.[0]);
						e.target.value = "";
					}}
				/>
			</label>
			{error && <span role="alert" className="text-[12.5px] text-sk-warn">{error}</span>}
		</Card>
	);
}

export default function StudentDeposit() {
	const qc = useQueryClient();
	const { user } = useContext(UserContext);
	const { tenancy: picked, data: tenancies, isLoading, isError, error, refetch } = useMyTenancy();
	// Deduction notifications link here with the tenancy the student may have left.
	const wanted = useSearchParams()[0].get("tenancy");
	const tenancy = tenancies?.find((t) => t._id === wanted) ?? picked;
	const tid = tenancy?._id;
	const [notice, setNotice] = useState(null);
	const contractsQ = useQuery({ queryKey: ["contracts", tid], enabled: !!tid, queryFn: async () => (await api.get(`/contracts/tenancy/${tid}`)).data });
	const respond = useMutation({
		mutationFn: ({ id, accept }) => api.post(`/contracts/${id}/deductions/respond`, { accept }),
		onSuccess: (_, v) => {
			setNotice({ tone: "ok", text: v.accept ? "You accepted the deductions." : "You disputed the deductions. Your landlord is told, and the scheme's free dispute service can step in." });
			qc.invalidateQueries({ queryKey: ["contracts", tid] });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't send your answer.") })
	});
	if (isLoading) return <Page><Loading label="Loading your deposit" /></Page>;
	if (isError) return <Page><ErrorState error={error} onRetry={refetch} /></Page>;

	const back = <Link to="/student/home" className="text-sk-link no-underline">← My home</Link>;
	if (!tenancy)
		return (
			<Page>
				<PageHeader eyebrow={back} title="Deposit" />
				<Card><span className="text-sm text-sk-text2">Your deposit shows here once you have a tenancy.</span></Card>
			</Page>
		);

	const people = tenancy.tenants?.length || tenancy.listing?.numOfPeople || 1;
	const rules = depositRules(tenancy.listing?.nation, tenancy.monthlyRent ?? 0, tenancy);
	const cap = rules.capPence;
	const overCap = (tenancy.depositAmount ?? 0) > cap;
	const scheme = DEPOSIT_SCHEMES.find((s) => s.value === tenancy.depositScheme);
	const certificate = (tenancy.documents ?? []).find((d) => d.type === "DEPOSIT_CERTIFICATE");
	const inventoryDocuments = (tenancy.documents ?? []).filter((d) => d.type === "INVENTORY");
	const protectBy = rules.protectBy;

	const contracts = contractsQ.data ?? [];
	const withDeductions = contracts.find((c) => c.deductions);
	const withInventory = contracts.find((c) => c.inventory?.items?.length);
	const prescribed = contracts.find((c) => c.prescribedInformationUrl);
	const ded = withDeductions?.deductions;
	const mine = ded?.responses?.find((r) => idOf(r.user) === user?._id);

	return (
		<Page className="!gap-[22px]">
			<PageHeader eyebrow={back} title="Deposit" />
			<Notice notice={notice} />

			<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
				<div className="flex flex-col gap-1.5 rounded-2xl bg-sk-card2 p-[18px]">
					<span className="text-[13px] text-sk-muted">Your share</span>
					<span className="font-display text-[28px] font-semibold">{gbp(tenancy.depositAmount)}</span>
					<span className={`text-[12.5px] ${tenancy.depositProtectedAt ? "text-sk-ok" : "text-sk-warn"}`}>
						{tenancy.depositProtectedAt ? `Protected ${fmtDate(tenancy.depositProtectedAt)}` : "Not protected yet"}
					</span>
				</div>
				<div className="flex flex-col gap-1.5 rounded-2xl border border-sk-border bg-sk-card p-[18px]">
					<span className="text-[13px] text-sk-muted">Household total</span>
					<span className="font-display text-[28px] font-semibold">{gbp((tenancy.depositAmount ?? 0) * people)}</span>
					<span className="text-[12.5px] text-sk-text2">{people} {people === 1 ? "tenant" : "tenants"}</span>
				</div>
			</div>

			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[1.4_1_480px] flex-col gap-4">
					<p className="m-0 text-sm text-sk-text2">Take dated photos of every room — they protect your deposit.</p>
					<InventoryPhotos tenancyId={tid} documents={inventoryDocuments.filter((d) => d.stage === "CHECK_IN")} stage="CHECK_IN" title="Move-in photos" />
					<InventoryPhotos tenancyId={tid} documents={inventoryDocuments.filter((d) => d.stage === "CHECK_OUT")} stage="CHECK_OUT" title="Move-out photos" />
					<Card title="Protection" className="!gap-2.5">
						<Row label="Scheme">{scheme?.label ?? tenancy.depositScheme ?? "Not given yet"}</Row>
						<Row label="Reference">{tenancy.depositReference ?? "—"}</Row>
						<Row label="Protected on">{tenancy.depositProtectedAt ? fmtDate(tenancy.depositProtectedAt) : protectBy ? `Due by ${fmtDate(protectBy)}` : "—"}</Row>
						<Row label={`Legal maximum (${rules.capName})`}>
							<span className={overCap ? "text-sk-warn" : "text-sk-ok"}>{gbp(cap)} {overCap ? "· yours is above it" : "· yours is within it"}</span>
						</Row>
						{!tenancy.depositProtectedAt && protectBy && protectBy < new Date() && (
							<div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-[13px] text-sk-warn">
								This deposit should have been protected by {fmtDate(protectBy)}. Ask your landlord for the certificate.
							</div>
						)}
						<span className="text-[12.5px] leading-snug text-sk-muted">
							Your landlord must protect the deposit in a government scheme within {rules.window} and send you the certificate. At the end of the tenancy, any deductions must be agreed or go to the scheme's free dispute service.
						</span>
					</Card>

					{ded && (
						<Card title="Deductions proposed" className="!gap-2.5">
							{ded.items.map((d) => (
								<Row key={d.description} label={d.description}>{gbp(d.amount)}</Row>
							))}
							<Row label="Total">{gbp(ded.total)} of {gbp((tenancy.depositAmount ?? 0) * people)}</Row>
							{ded.status === "PROPOSED" && !mine && (
								<div className="flex flex-wrap gap-2 pt-1">
									<button type="button" disabled={respond.isPending} onClick={() => respond.mutate({ id: withDeductions._id, accept: true })} className="h-9 cursor-pointer rounded-[10px] border-none bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent disabled:opacity-60">Accept</button>
									<button type="button" disabled={respond.isPending} onClick={() => respond.mutate({ id: withDeductions._id, accept: false })} className="h-9 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text disabled:opacity-60">Dispute</button>
								</div>
							)}
							<span className={`text-[13px] font-semibold ${ded.status === "ACCEPTED" ? "text-sk-ok" : ded.status === "DISPUTED" ? "text-sk-warn" : "text-sk-text2"}`}>
								{ded.status === "ACCEPTED" ? "Agreed by everyone" : ded.status === "DISPUTED" ? "Disputed · goes to the scheme's free dispute service if you can't agree" : mine ? `You ${mine.accepted ? "accepted" : "disputed"} · waiting for the others` : "Waiting for your answer"}
							</span>
						</Card>
					)}

					{withInventory && (
						<Card title="Check-in inventory" className="!gap-2.5">
							{withInventory.inventory.items.map((i) => (
								<Row key={`${i.room}-${i.item}`} label={`${i.room} · ${i.item}`}>{i.condition}</Row>
							))}
							<span className="text-[12.5px] text-sk-muted">Recorded {fmtDate(withInventory.inventory.recordedAt)}. Check it and tell your landlord about anything missing.</span>
						</Card>
					)}

					<Card title="Certificate" className="!gap-2.5">
						{certificate ? (
							<div className="flex items-center justify-between gap-3">
								<span className="flex flex-col">
									<span className="text-sm font-semibold">{certificate.title || "Deposit certificate"}</span>
									<span className="text-[12.5px] text-sk-muted">Saved {fmtDate(certificate.addedAt)}</span>
								</span>
								{(certificate.url || certificate.key) && (
									<button type="button" onClick={() => openFile(certificate)} className="flex h-9 cursor-pointer items-center rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text no-underline">
										Open
									</button>
								)}
							</div>
						) : (
							<span className="text-sm text-sk-text2">No certificate yet. Ask your landlord for it, or connect your email and Seek files it here when it arrives.</span>
						)}
						{prescribed && (
							<a href={safeUrl(prescribed.prescribedInformationUrl)} target="_blank" rel="noreferrer" className={`${linkCls} self-start`}>Open prescribed information</a>
						)}
					</Card>
				</div>
				<aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
					<AdviceCard topic="deposit" tenancyId={tenancy._id} askable />
				</aside>
			</div>
		</Page>
	);
}
