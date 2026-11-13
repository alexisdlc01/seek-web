import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserContext from "../context/UserContext.jsx";
import { Card, ErrorState, Loading, Page, PageHeader, btnPrimary } from "../components/sk.jsx";
import { AdviceCard, Modal, Notice } from "../components/StudentBits.jsx";
import { api, errMessage, fmtDate, openFile } from "../lib/landlord.js";
import { initials, usePassport } from "../lib/student.js";
import { StudentVerificationCard, VerifiedStudentBadge } from "../components/StudentVerification.jsx";

const DOC_TYPES = [
	["PASSPORT", "Passport"],
	["VISA", "Visa or eVisa"],
	["RIGHT_TO_RENT", "Right to Rent share code"],
	["IDENTIFICATION", "Other photo ID"],
	["STUDENT_STATUS", "Student status letter"],
	["CAS_LETTER", "CAS letter"],
	["PROOF_OF_FUNDS", "Proof of funds"],
	["PROOF_OF_INCOME", "Proof of income"],
	["GUARANTOR_AGREEMENT", "Guarantor agreement"],
	["LANDLORD_REFERENCE", "Previous landlord reference"],
	["AGENT_REFERENCE", "Letting agent reference"],
	["CHARACTER_REFERENCE", "Character reference"],
	["RECOMMENDATION", "Recommendation letter"]
];
const STATUS = {
	VERIFIED: ["Verified", "text-sk-ok"],
	PENDING: ["Checking", "text-sk-warn"],
	// Identity documents: Seek never checks them, the landlord does through the share.
	PROVIDED: ["Provided — landlord checks", "text-sk-text2"],
	EXPIRED: ["Expired", "text-sk-danger"],
	REJECTED: ["Rejected", "text-sk-danger"],
	MISSING: ["Missing", "text-sk-danger"]
};
const ASK = { GUARANTOR_AGREEMENT: "Invite guarantor", LANDLORD_REFERENCE: "Request reference", AGENT_REFERENCE: "Request reference", RECOMMENDATION: "Request reference" };
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 15 * 1024 * 1024;

function AddDocumentModal({ initialType, onClose, onDone }) {
	const [type, setType] = useState(initialType ?? DOC_TYPES[0][0]);
	const [file, setFile] = useState(null);
	const [expiresAt, setExpiresAt] = useState("");
	const [error, setError] = useState("");

	const upload = useMutation({
		mutationFn: async () => {
			const { data } = await api.get("/upload/presign", {
				params: { filename: file.name, fileType: file.type, fileSize: file.size, folder: "private" }
			});
			let stored = true;
			try {
				const res = await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
				if (!res.ok) throw new Error(String(res.status));
			} catch (e) {
				// Local dev has no real bucket: keep the record so the flow can be tested.
				if (!import.meta.env.DEV) throw new Error("Your file couldn't be uploaded. Please try again.", { cause: e });
				stored = false;
			}
			await api.post("/users/addDocument", {
				documentType: type,
				url: data.fileUrl,
				key: data.key,
				label: DOC_TYPES.find(([v]) => v === type)?.[1],
				expiresAt: expiresAt || undefined
			});
			return stored;
		},
		onSuccess: (stored) =>
			onDone(
				stored
					? { tone: "ok", text: "Document added. Seek checks it, usually within a day." }
					: { tone: "warn", text: "Document recorded, but file storage isn't configured on this local server, so the file itself wasn't saved." }
			),
		onError: (e) => setError(errMessage(e, e.message || "We couldn't add this document."))
	});

	const pick = (f) => {
		setError("");
		if (f && f.size > MAX_BYTES) return setError("Files can be up to 15 MB.");
		if (f && !ACCEPT.split(",").includes(f.type)) return setError("Use a PDF or a photo (JPEG, PNG, WebP or HEIC).");
		setFile(f ?? null);
	};
	const field = "w-full rounded-[10px] border border-sk-border2 bg-sk-card px-3 py-2.5 text-sm text-sk-text outline-none focus:border-sk-accent";

	return (
		<Modal title="Add a document" onClose={onClose}>
			<form
				className="flex flex-col gap-3"
				onSubmit={(e) => {
					e.preventDefault();
					if (file) upload.mutate();
				}}
			>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					Document
					<select value={type} onChange={(e) => setType(e.target.value)} className={field}>
						{DOC_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
					</select>
				</label>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					File <span className="font-normal text-sk-muted">PDF or photo, up to 15 MB</span>
					<input type="file" accept={ACCEPT} onChange={(e) => pick(e.target.files?.[0])} className="text-sm font-normal" />
				</label>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					Expiry date <span className="font-normal text-sk-muted">(optional, e.g. visa or share code)</span>
					<input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={field} />
				</label>
				<span className="text-[12.5px] text-sk-muted">Stored privately. Landlords only see it when you apply, for 14 days.</span>
				{error && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{error}</div>}
				<button type="submit" disabled={!file || upload.isPending} className={`${btnPrimary} disabled:opacity-60`}>
					{upload.isPending ? "Uploading…" : "Add document"}
				</button>
			</form>
		</Modal>
	);
}

function RequestReferenceModal({ type, onClose, onDone }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const send = useMutation({
		mutationFn: () => api.post("/users/me/passport/references", { type, name: name.trim(), email: email.trim() }),
		onSuccess: () => onDone({ tone: "ok", text: `Email sent to ${name.trim()}. Replies come to you.` }),
		onError: (e) => setError(e?.response?.status === 503 ? "We couldn't send the email, so nothing was saved. Please try again." : errMessage(e, "We couldn't send this request."))
	});
	const field = "w-full rounded-[10px] border border-sk-border2 bg-sk-card px-3 py-2.5 text-sm text-sk-text outline-none focus:border-sk-accent";
	return (
		<Modal title={ASK[type]} onClose={onClose}>
			<form
				className="flex flex-col gap-3"
				onSubmit={(e) => {
					e.preventDefault();
					send.mutate();
				}}
			>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					Name
					<input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
				</label>
				<label className="flex flex-col gap-1.5 text-sm font-semibold">
					Email
					<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
				</label>
				{error && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{error}</div>}
				<button type="submit" disabled={send.isPending} className={`${btnPrimary} disabled:opacity-60`}>
					{send.isPending ? "Sending…" : "Send request"}
				</button>
			</form>
		</Modal>
	);
}

export default function StudentProfile() {
	const qc = useQueryClient();
	const { user } = useContext(UserContext);
	const passportQ = usePassport();
	const sharesQ = useQuery({ queryKey: ["shares"], queryFn: async () => (await api.get("/users/me/shares")).data });
	const [adding, setAdding] = useState(null); // null | { type? }
	const [asking, setAsking] = useState(null); // null | type
	const [notice, setNotice] = useState(null);

	const stop = useMutation({
		mutationFn: (id) => api.delete(`/users/me/shares/${id}`),
		onSuccess: () => {
			setNotice({ tone: "ok", text: "Sharing stopped. The landlord can no longer open your documents." });
			qc.invalidateQueries({ queryKey: ["shares"] });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't stop sharing.") })
	});

	const p = passportQ.data;
	const shares = (sharesQ.data ?? []).filter((s) => s.active);

	return (
		<Page className="!gap-[22px]">
			<PageHeader title="Profile and documents">
				<button type="button" onClick={() => setAdding({})} className={btnPrimary}>+ Add a document</button>
			</PageHeader>
			<Notice notice={notice} />

			<section className="flex flex-wrap items-center gap-5 rounded-2xl bg-sk-card2 p-5">
				{user?.profilePicUrl ? (
					<img src={user.profilePicUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
				) : (
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-sk-accent text-xl font-bold text-sk-on-accent">{initials(user?.name)}</div>
				)}
				<div className="flex flex-[1_1_220px] flex-col gap-0.5">
					<span className="text-lg font-semibold">{user?.name}</span>
					<span className="text-[13.5px] text-sk-text2">{user?.email}</span>
					{user?.studentVerified && <VerifiedStudentBadge university={user.university} className="mt-1 self-start" />}
				</div>
				{p && (
					<div className="flex flex-[1_1_280px] flex-col gap-2">
						<div className="flex justify-between text-[13.5px]"><span className="font-semibold">Seek Passport</span><span className="text-sk-text2">{p.completed} of {p.total} ready</span></div>
						<div className="h-2 rounded bg-sk-border" aria-hidden="true"><div className="h-2 rounded bg-sk-accent" style={{ width: `${p.percent}%` }} /></div>
						<span className={`text-[12.5px] ${p.ready ? "text-sk-text2" : "text-sk-warn"}`}>
							{p.ready ? "One tap to apply. Landlords see only what you share, for a limited time." : `Still needed to apply: ${p.missingRequired.join(", ")}`}
						</span>
					</div>
				)}
			</section>

			{passportQ.isLoading && <Loading label="Loading your Seek Passport" />}
			{passportQ.isError && <ErrorState error={passportQ.error} onRetry={() => passportQ.refetch()} />}
			{p && (
				<div className="grid items-start gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))" }}>
					{p.sections.map((s) => (
						<Card key={s.key} title={s.label}>
							{s.items.map((it) => {
								const [label, tone] = STATUS[it.status] ?? [it.status, "text-sk-muted"];
								return (
									<div key={it.type} className="flex items-center justify-between gap-2.5 border-b border-sk-hair pb-2.5 text-sm last:border-none last:pb-0">
										<span className="flex min-w-0 flex-col">
											<span>
												{it.label}
												{!it.required && <span className="text-sk-muted"> · optional</span>}
											</span>
											{it.source === "university email" && it.detail && <span className="text-[12.5px] text-sk-muted">{it.detail} confirmed</span>}
											{it.expiresAt && <span className="text-[12.5px] text-sk-muted">Valid to {fmtDate(it.expiresAt)}</span>}
											{it.status === "REJECTED" && it.reason && <span className="text-[12.5px] text-sk-danger">{it.reason}</span>}
										</span>
										<span className="flex shrink-0 items-center gap-2">
											{it.status === "MISSING" || it.status === "EXPIRED" || it.status === "REJECTED" ? (
												<>
												{ASK[it.type] && (
													<button
														type="button"
														onClick={() => setAsking(it.type)}
														className="h-9 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text"
													>
														{ASK[it.type]}
													</button>
												)}
												<button
													type="button"
													onClick={() => setAdding({ type: it.type })}
													className="h-9 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text"
												>
													{it.status === "MISSING" ? "Add" : "Replace"}
												</button>
												</>
											) : (
												<>
													{(it.url || it.key) && <button type="button" onClick={() => openFile(it)} className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-sk-link">Open</button>}
													<span className={`font-semibold ${tone}`}>{it.source === "request" ? `Pending · ${it.detail ?? ""}` : label}</span>
												</>
											)}
										</span>
									</div>
								);
							})}
							{s.key === "money" && <AdviceCard topic="guarantor" showActions={false} />}
						</Card>
					))}
				</div>
			)}

			<div className="flex flex-wrap gap-5">
				<StudentVerificationCard className="flex-[1_1_360px]" />
				<Card title="Who can see this" className="flex-[1_1_360px] !gap-2.5">
					{sharesQ.isLoading && <Loading label="Loading shares" />}
					{sharesQ.isError && <ErrorState error={sharesQ.error} onRetry={() => sharesQ.refetch()} />}
					{!sharesQ.isLoading && shares.length === 0 && <span className="text-sm text-sk-text2">Nobody right now. When you apply, the landlord can see your passport for 14 days.</span>}
					{shares.map((s) => (
						<div key={s._id} className="flex flex-wrap items-center justify-between gap-2.5 border-b border-sk-hair pb-2.5 text-sm last:border-none last:pb-0">
							<span className="flex flex-col">
								<span>
									{s.viewer?.name ?? s.viewer?.companyName ?? "Landlord"}
									{s.listing?.propertyTitle ? ` · ${s.listing.propertyTitle}` : ""}
								</span>
								<span className="text-[13px] text-sk-muted">until {fmtDate(s.expiresAt)}</span>
							</span>
							<button
								type="button"
								onClick={() => stop.mutate(s._id)}
								disabled={stop.isPending}
								className="h-9 cursor-pointer rounded-[10px] border border-sk-danger-border bg-transparent px-3 text-[13px] font-semibold text-sk-danger disabled:opacity-60"
							>
								Stop sharing
							</button>
						</div>
					))}
				</Card>
				<Link to="/student/connectors" className="flex flex-[1_1_360px] flex-col gap-1.5 rounded-2xl border border-sk-border bg-sk-card p-5 text-sk-text no-underline">
					<h2 className="font-display text-lg font-semibold">Connected email</h2>
					<span className="text-[13.5px] text-sk-text2">Connect Gmail or Outlook and Seek adds landlord and agent references to your profile automatically. Housing emails only.</span>
					<span className="text-[13px] font-semibold text-sk-link">Manage →</span>
				</Link>
			</div>

			{asking && (
				<RequestReferenceModal
					type={asking}
					onClose={() => setAsking(null)}
					onDone={(n) => {
						setAsking(null);
						setNotice(n);
						qc.invalidateQueries({ queryKey: ["passport"] });
					}}
				/>
			)}
			{adding && (
				<AddDocumentModal
					initialType={adding.type}
					onClose={() => setAdding(null)}
					onDone={(n) => {
						setAdding(null);
						setNotice(n);
						qc.invalidateQueries({ queryKey: ["passport"] });
					}}
				/>
			)}
		</Page>
	);
}
