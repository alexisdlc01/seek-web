import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./StudentBits.jsx";
import { ErrorState, Loading, btnPrimary, btnGhost } from "./sk.jsx";
import { api, errMessage, fmtDate } from "../lib/landlord.js";
import { perPerson, photoBackground, pounds, useMyApplications, usePassport } from "../lib/student.js";

const AMENITY = (a) => a.replace(/_/g, " ");

const STAGE_TEXT = {
	NOT_SENT: "Draft · not sent yet",
	SENT: "Application sent",
	VIEWED: "Viewing booked",
	OFFERED: "Offer received · accept it in My home",
	SIGNED: "Signed",
	ACCEPTED: "Accepted",
	REJECTED: "Not successful this time"
};

const useListing = (id) =>
	useQuery({
		queryKey: ["listing", id],
		enabled: !!id,
		queryFn: async () => (await api.get(`/listings/${id}`)).data
	});

/** Listing detail: photos, key facts, description; Save and Apply from here. */
export function ListingDetailModal({ id, saved, onToggleSave, onApply, onClose }) {
	const q = useListing(id);
	const l = q.data;
	const each = perPerson(l);
	const shared = (l?.numOfPeople ?? 1) > 1;

	return (
		<Modal title={l?.propertyTitle ?? "Home"} onClose={onClose} wide>
			{q.isLoading && <Loading label="Loading home" />}
			{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
			{l && (
				<>
					<div className="grid gap-2" style={{ gridTemplateColumns: (l.photos?.length ?? 0) > 1 ? "2fr 1fr" : "1fr" }}>
						<div className="h-[220px] rounded-xl" style={{ background: photoBackground(l.photos?.[0]) }} role="img" aria-label={`Photo of ${l.propertyTitle}`} />
						{(l.photos?.length ?? 0) > 1 && (
							<div className="h-[220px] rounded-xl" style={{ background: photoBackground(l.photos[1], 1) }} role="img" aria-label={`Second photo of ${l.propertyTitle}`} />
						)}
					</div>
					<div className="flex flex-wrap items-end justify-between gap-3">
						<div className="flex flex-col gap-0.5">
							<span className="text-[13.5px] text-sk-muted">{l.formatted_address || [l.streetAddress, l.cityTown, l.postcodeZIP].filter(Boolean).join(", ")}</span>
							<span className="font-display text-[26px] font-semibold">
								{pounds(each)} <span className="text-base font-normal text-sk-text2">pcm{shared ? " each" : ""}</span>
							</span>
							<span className="text-[13px] text-sk-text2">
								{l.billsIncluded ? "Bills included" : "Bills extra"}
								{shared ? ` · ${pounds(l.monthlyRent)} pcm for the whole home` : ""}
							</span>
						</div>
						<div className="flex gap-2">
							<button type="button" aria-pressed={saved} onClick={onToggleSave} className={btnGhost}>{saved ? "Saved" : "Save"}</button>
							<button type="button" onClick={onApply} className={btnPrimary}>Apply with Passport</button>
						</div>
					</div>
					<dl className="m-0 grid gap-3 text-sm" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
						{[
							["Bedrooms", l.bedroomsCount],
							["Bathrooms", l.bathrooms],
							["Sharers", l.numOfPeople],
							["Available", l.availableFrom ? `from ${fmtDate(l.availableFrom)}` : "Now"],
							["Furnishing", l.furnishingStatus],
							["EPC", l.epcRating],
							["Holding deposit", l.holdingDeposit ? `${pounds(l.holdingDeposit)} each` : null],
							["Viewings", l.viewingSlots?.length ? `${l.viewingSlots.length} times offered` : null],
							["Deposit", l.securityDeposit ? `${pounds(l.securityDeposit)} total` : null]
						]
							.filter(([, v]) => v != null && v !== "")
							.map(([k, v]) => (
								<div key={k} className="flex flex-col gap-0.5 rounded-xl bg-sk-card p-3">
									<dt className="text-xs text-sk-muted">{k}</dt>
									<dd className="m-0 font-semibold">{v}</dd>
								</div>
							))}
					</dl>
					{l.propertyDesc && <p className="text-[14px] leading-normal text-sk-text2">{l.propertyDesc}</p>}
					{l.amenities?.length > 0 && (
						<div className="flex flex-wrap gap-2 text-[13px]">
							{l.amenities.map((a) => <span key={a} className="rounded-lg bg-sk-hair px-2.5 py-1.5">{AMENITY(a)}</span>)}
						</div>
					)}
				</>
			)}
		</Modal>
	);
}

/**
 * One-tap apply with the Seek Passport: shows readiness, the landlord's
 * criteria and what is shared (14 days), then creates and sends the application.
 */
export function ApplyModal({ id, onClose }) {
	const qc = useQueryClient();
	const listingQ = useListing(id);
	const passportQ = usePassport();
	const appsQ = useMyApplications();
	const [error, setError] = useState("");

	const l = listingQ.data;
	const p = passportQ.data;
	const existing = (appsQ.data ?? []).find((a) => (a.listing?._id ?? a.listing) === id);
	const alreadySent = existing && existing.stage !== "NOT_SENT";

	const send = useMutation({
		mutationFn: async () => {
			const app = existing ?? (await api.post("/application/create", { listingId: id })).data;
			if (app.stage === "NOT_SENT") await api.patch(`/application/${app._id}/send`);
			return app;
		},
		onSuccess: () => {
			setError("");
			qc.invalidateQueries({ queryKey: ["my-applications"] });
			qc.invalidateQueries({ queryKey: ["shares"] });
		},
		onError: (e) => setError(errMessage(e, "We couldn't send your application."))
	});

	const each = perPerson(l);
	// The listing's holding deposit is per room, in pounds; else the one-week cap.
	const holding = l?.holdingDeposit ?? (each ? Math.floor((each * 12) / 52) : null);
	const GUARANTOR = { UK_ONLY: "UK guarantor needed", UK_OR_SERVICE: "UK guarantor or guarantor service", NONE: "No guarantor needed" };
	const rules = [
		l?.criteria?.guarantor && GUARANTOR[l.criteria.guarantor],
		l?.criteria?.referencesRequired && "References required",
		l?.criteria?.maxHousehold && `Up to ${l.criteria.maxHousehold} people`
	].filter(Boolean);
	const sharedItems = (p?.sections ?? []).flatMap((s) => s.items).filter((i) => i.status !== "MISSING");
	const missing = (p?.sections ?? []).flatMap((s) => s.items).filter((i) => i.required && i.status !== "VERIFIED" && i.status !== "PROVIDED");
	// Documents the landlord requires (backend rule); any one of a document's types satisfies it.
	const haveTypes = new Set((p?.sections ?? []).flatMap((s) => s.items).filter((i) => i.status !== "MISSING").map((i) => i.type));
	const missingDocs = (l?.requiredDocuments ?? []).filter((d) => !d.types.some((t) => haveTypes.has(t))).map((d) => d.label);
	// Backend criteria exist once an application does; before that, mirror the household-size rule only.
	// shortcut: mirrors backend household-size rule, use API criteria when exposed
	const failed = existing?.criteria
		? existing.criteria.filter((c) => !c.passed)
		: (l?.numOfPeople ?? 1) > 1
			? [{ label: "Household fills the property", detail: `1 of ${l.numOfPeople} people` }]
			: [];
	const loading = listingQ.isLoading || passportQ.isLoading || appsQ.isLoading;
	const done = send.isSuccess || alreadySent;

	return (
		<Modal title="Apply as a household" onClose={onClose}>
			{loading && <Loading label="Checking your Seek Passport" />}
			{listingQ.isError && <ErrorState error={listingQ.error} onRetry={() => listingQ.refetch()} />}
			{passportQ.isError && <ErrorState error={passportQ.error} onRetry={() => passportQ.refetch()} />}
			{l && p && !appsQ.isLoading && (
				<>
					<span className="-mt-2 text-[13.5px] text-sk-text2">
						{l.propertyTitle} · {pounds(each)} pcm{(l.numOfPeople ?? 1) > 1 ? " each" : ""}
					</span>

					<section className="flex flex-col gap-2 rounded-2xl bg-sk-card2 p-4">
						<div className="flex justify-between text-[13.5px]">
							<span className="font-semibold">Seek Passport</span>
							<span className="text-sk-text2">{p.completed} of {p.total} ready</span>
						</div>
						<div className="h-2 rounded bg-sk-border" aria-hidden="true">
							<div className="h-2 rounded bg-sk-accent" style={{ width: `${p.percent}%` }} />
						</div>
						{missingDocs.length > 0 ? (
							<span className="text-[13px] text-sk-warn">
								Missing documents: {missingDocs.join(", ")}. Add them to your Seek Passport, then apply.{" "}
								<Link to="/student/profile" className="font-semibold text-sk-link">Complete passport</Link>
							</span>
						) : p.ready && failed.length > 0 ? (
							<span className="text-[13px] text-sk-warn">
								Not in the queue yet: {failed.map((c) => `${c.label} — ${c.detail}`).join("; ")}
							</span>
						) : p.ready ? (
							<span className="text-[13px] font-semibold text-sk-ok">Ready · you qualify for the landlord's queue</span>
						) : (
							<span className="text-[13px] text-sk-warn">
								Missing: {missing.map((m) => m.label).join(", ") || p.missingRequired.join(", ")}. You can send now, but your household joins the qualified queue only once every required document is provided.{" "}
								<Link to="/student/profile" className="font-semibold text-sk-link">Complete passport</Link>
							</span>
						)}
					</section>

					{((l.requiredDocuments ?? []).length > 0 || rules.length > 0) && (
						<section className="flex flex-col gap-2">
							<h3 className="text-[15px] font-semibold">Landlord's criteria</h3>
							{rules.map((r) => <div key={r} className="border-b border-sk-hair pb-2 text-sm">{r}</div>)}
							{/* documents requis = source de vérité du backend (déjà sans garant si critère NONE) */}
							{(l.requiredDocuments ?? []).map((d) => (
								<div key={d.label} className="flex justify-between gap-3 border-b border-sk-hair pb-2 text-sm">
									<span>{d.label}</span>
									<span className="shrink-0 text-[13px] font-semibold text-sk-text">Required</span>
								</div>
							))}
						</section>
					)}

					<section className="flex flex-col gap-2 rounded-2xl border border-sk-border bg-sk-card p-4">
						<h3 className="text-[15px] font-semibold">Shared with the landlord for 14 days</h3>
						<ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-[13px]">
							{sharedItems.map((i) => (
								<li key={i.type} className="rounded-lg bg-sk-hair px-2.5 py-1.5">{i.label}</li>
							))}
						</ul>
						<span className="text-[12.5px] text-sk-muted">
							Access ends 14 days after you send. Stop sharing any time in Profile and documents. No rent bidding: homes go to the first qualified household.
						</span>
					</section>

					{holding != null && (
						<p className="text-[13px] leading-snug text-sk-text2">
							If you're offered the house, the holding deposit is <strong className="text-sk-text">{pounds(holding)}{(l.numOfPeople ?? 1) > 1 ? " each" : ""}</strong> (never more than one week's rent). It goes towards your first rent, and the landlord must decide within 15 days.
						</p>
					)}

					{error && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{error}</div>}

					{done ? (
						<div role="status" className="flex flex-col gap-1 rounded-xl bg-sk-ok-bg p-3 text-sm text-sk-ok">
							<strong>{send.isSuccess ? "Application sent." : STAGE_TEXT[existing.stage] ?? existing.stage}</strong>
							<span>Track it under Next year in My home. Messages from the landlord arrive in your inbox.</span>
						</div>
					) : (
						<button type="button" onClick={() => send.mutate()} disabled={send.isPending || missingDocs.length > 0} className={`${btnPrimary} h-12 disabled:opacity-60`}>
							{send.isPending ? "Sending…" : "Send application"}
						</button>
					)}
				</>
			)}
		</Modal>
	);
}
