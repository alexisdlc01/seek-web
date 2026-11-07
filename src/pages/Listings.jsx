import React, { useContext, useRef, useState } from "react";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios from "axios";
import ListingsContext from "../context/ListingsContext.jsx";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { Chip } from "../components/sk.jsx";
import { API_BASE, api, currentMonth, daysUntil, fmtDate } from "../lib/landlord.js";

// Steps in the Add property wizard (Basics to Review).
const WIZARD_STEPS = 5;

const NATION = { WALES: "Wales", SCOTLAND: "Scotland", NORTHERN_IRELAND: "Northern Ireland" };

// Gas safety, EICR and EPC: a warning chip when due within 60 days or overdue.
function certChip(label, expiry) {
	if (!expiry) return null;
	const days = daysUntil(expiry);
	if (days <= 60) {
		return (
			<Chip key={label} tone="warn">
				{days < 0 ? `${label} expired` : `${label} due in ${days} ${days === 1 ? "day" : "days"}`}
			</Chip>
		);
	}
	return (
		<Chip key={label} tone="muted">
			{label} to {fmtDate(expiry, { month: "short", year: "numeric" })}
		</Chip>
	);
}

// Everything a landlord wants to see on a property at a glance, from the
// listing plus its applications, tenancies and this month's rent.
function usePropertyFacts(prop, tenancies, payRows) {
	const live = !prop.isDraft && prop.isVerified;
	const apps = useQuery({
		queryKey: ["listing-applications", prop._id],
		enabled: live,
		queryFn: async () => (await api.get(`/application/listing/${prop._id}`)).data
	});
	const sent = (apps.data ?? []).filter(a => a.stage === "SENT");
	const qualified = sent.filter(a => a.qualified).length;
	const rows = payRows.filter(r => r.property && (r.property === prop.propertyTitle || r.property === prop.streetAddress));
	const paidPct = rows.length ? Math.round((rows.filter(r => r.status === "PAID").length / rows.length) * 100) : null;
	const ends = tenancies
		.filter(t => t.listing?._id === prop._id && t.status === "ACTIVE" && t.endDate)
		.map(t => t.endDate)
		.sort()[0];
	const letNow = tenancies
		.filter(t => t.listing?._id === prop._id && t.status === "ACTIVE")
		.reduce((n, t) => n + (t.tenants?.length ?? 0), 0);
	const isLet = live && prop.numOfPeople > 0 && letNow >= prop.numOfPeople;

	return { isLet, letNow, applied: sent.length, qualified, paidPct, ends };
}

// One property card.
function PropertyCard({ prop, index, tenancies, payRows, onOpen, onDelete, navigate }) {
	const f = usePropertyFacts(prop, tenancies, payRows);
	const perRoom = prop.monthlyRent && prop.numOfPeople ? Math.round(prop.monthlyRent / prop.numOfPeople) : null;
	const place = [prop.cityTown, (prop.postcodeZIP || "").split(" ")[0]].filter(Boolean).join(" ");
	const sub = [place, prop.bedroomsCount ? `${prop.bedroomsCount} bed` : null, NATION[prop.nation]].filter(Boolean).join(" · ");
	const plans = prop.paymentPlans ?? [];
	const status = prop.isDraft
		? { tone: "warning", label: `Draft · step ${Math.min((prop.draftStep ?? 0) + 1, WIZARD_STEPS)} of ${WIZARD_STEPS}` }
		: !prop.isVerified
			? { tone: "warning", label: "Awaiting verification" }
			: f.isLet
				? { tone: "info", label: `Let · ${f.letNow} of ${prop.numOfPeople}` }
				: { tone: "success", label: "Taking applications" };
	const btnPrimary =
		"flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[10px] border-none bg-sk-accent px-3.5 text-[13px] font-semibold text-sk-on-accent";
	const btnGhost =
		"flex h-10 cursor-pointer items-center justify-center rounded-[10px] border border-sk-border2 bg-transparent px-3.5 text-[13px] font-semibold text-sk-text";
	const edit = () => {
		onOpen(prop);
		navigate(`/add-listing/${prop._id}`);
	};

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
			className="flex flex-col overflow-hidden rounded-2xl border border-sk-border bg-sk-card"
		>
			<div className="relative h-[150px] bg-sk-card2">
				{prop.photos?.[0] ? (
					<img src={prop.photos[0]} alt="" className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full items-center justify-center text-[13px] text-sk-muted">No photos yet</div>
				)}
				<div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
					<Tag value={status.label} severity={status.tone} className="rounded-full px-3 py-1 text-xs font-medium" />
				</div>
			</div>
			<div className="flex flex-1 flex-col gap-2.5 p-4">
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="font-display text-[17px] font-semibold">
						{prop.propertyTitle || <i>No listing title</i>}
					</h2>
					<span className="whitespace-nowrap text-sm font-semibold">
						{perRoom ? `£${perRoom.toLocaleString("en-GB")}` : "—"}
						{perRoom ? <span className="text-xs font-normal text-sk-muted"> pcm/room</span> : null}
					</span>
				</div>
				<span className="text-[13px] text-sk-muted">
					{sub || prop.streetAddress || <i>No street address</i>}
				</span>
				{prop.isDraft ? (
					<span className="text-[13px] text-sk-text2">
						Add photos and requirements to publish. Seek AI can write the description from your photos.
					</span>
				) : (
					<>
						<div className="flex flex-wrap gap-1.5">
							{certChip("Gas safety", prop.gasSafetyExpiry)}
							{certChip("EICR", prop.eicrExpiry)}
							{prop.epcRating && <Chip tone="muted">EPC {prop.epcRating}</Chip>}
							{(prop.hmoLicenceExpiry || prop.licenceNumber) && <Chip tone="muted">HMO licence</Chip>}
							{prop.nation === "WALES" && <Chip tone="muted">Rent Smart Wales</Chip>}
							{plans.includes("SIX_MONTHS") && plans.includes("YEARLY") && <Chip tone="accent">Half-year and full year on</Chip>}
						</div>
						{f.isLet ? (
							<span className="text-[13px] text-sk-text2">
								{f.ends ? `Contract ends ${fmtDate(f.ends)}` : "Periodic contract"}
								{f.paidPct != null ? ` · Rent ${f.paidPct}% paid` : ""}
							</span>
						) : (
							<span className="text-[13px] text-sk-text2">
								{f.applied} {f.applied === 1 ? "household" : "households"} applied
								{f.applied ? ` · ${f.qualified} qualified` : ""}
								{prop.views ? ` · ${prop.views} views` : ""}
							</span>
						)}
					</>
				)}
				<div className="mt-auto flex gap-2 pt-2">
					{prop.isDraft ? (
						<>
							<button type="button" className={btnPrimary} onClick={edit}>Continue listing</button>
							<button
								type="button"
								aria-label="Delete draft"
								className={`${btnGhost} !border-sk-danger-border !text-sk-danger`}
								onClick={() => onDelete(prop)}
							>
								<i className="pi pi-trash" />
							</button>
						</>
					) : !prop.isVerified ? (
						<button
							type="button"
							className={btnPrimary}
							onClick={() => {
								onOpen(prop);
								navigate(`/view-listing/${prop._id}`);
							}}
						>
							View listing
						</button>
					) : (
						<>
							<button
								type="button"
								className={btnPrimary}
								onClick={() => navigate(f.isLet ? "/contracts" : `/applicants/${prop._id}`)}
							>
								{f.isLet ? "Contract and deposit" : "View applicants"}
							</button>
							<button type="button" className={btnGhost} onClick={edit}>Edit</button>
						</>
					)}
				</div>
			</div>
		</motion.article>
	);
}

export default function Listings() {
	const navigate = useNavigate();
	const { listings, setCurrentListing } = useContext(ListingsContext);
	const toast = useRef(null);
	const tenanciesQ = useQuery({
		queryKey: ["landlord-tenancies"],
		queryFn: async () => (await api.get("/tenancies/landlord")).data
	});
	const paymentsQ = useQuery({
		queryKey: ["landlord-payments", currentMonth()],
		queryFn: async () => (await api.get("/payments/landlord", { params: { month: currentMonth() } })).data
	});
	const tenancies = tenanciesQ.data ?? [];
	const payRows = paymentsQ.data?.rows ?? [];
	// A property is let when its tenants fill every room.
	const isLetNow = p =>
		!p.isDraft &&
		p.isVerified &&
		p.numOfPeople > 0 &&
		tenancies
			.filter(t => t.listing?._id === p._id && t.status === "ACTIVE")
			.reduce((n, t) => n + (t.tenants?.length ?? 0), 0) >= p.numOfPeople;

	const handleDelete = async id => {
		try {
			await axios.delete(`${API_BASE}/listings/${id}`, {
				withCredentials: true
			});
			toast.current?.show({
				severity: "success",
				summary: "Listing Deleted",
				detail: "Your listing has been successfully removed.",
				life: 4000
			});
		} catch (err) {
			console.error("Delete failed:", err);
			toast.current?.show({
				severity: "error",
				summary: "Deletion Failed",
				detail: "Unable to delete your listing. Please try again.",
				life: 4000
			});
		}
	};

	const confirmDelete = prop => {
		confirmDialog({
			message: `Are you sure you want to delete?`,
			header: "Confirm Deletion",
			icon: "pi pi-exclamation-triangle",
			acceptLabel: "Yes, Delete",
			rejectLabel: "Cancel",
			acceptClassName: "p-button-danger",
			draggable: false,
			accept: () => handleDelete(prop._id)
		});
	};

	const addListing = async () => {
		const res = await axios.post(
			`${API_BASE}/listings/draft`,
			{},
			{ withCredentials: true }
		);
		navigate(`/add-listing/${res.data}`);
	};

	const FILTERS = [
		["all", "All", () => true],
		["live", "Taking applications", p => p.isVerified && !isLetNow(p)],
		["let", "Let", p => isLetNow(p)],
		["review", "Awaiting verification", p => !p.isDraft && !p.isVerified],
		["draft", "Drafts", p => p.isDraft]
	];
	const [filter, setFilter] = useState("all");
	const [query, setQuery] = useState("");
	const shown = listings.filter(p => {
		const f = FILTERS.find(x => x[0] === filter)[2];
		const q = query.trim().toLowerCase();
		const hay = `${p.propertyTitle ?? ""} ${p.streetAddress ?? ""} ${p.postcodeZIP ?? ""}`.toLowerCase();
		return f(p) && (!q || hay.includes(q));
	});

	return (
		<div className="flex flex-col gap-6 p-4 md:p-8">
			<Toast ref={toast} position="bottom-right" />
			<ConfirmDialog />
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col gap-1">
					<span className="text-sm text-sk-muted">
						{listings.length} {listings.length === 1 ? "property" : "properties"} ·{" "}
						{listings.reduce((n, p) => n + (p.numOfPeople || 0), 0)} rooms
					</span>
					<h1 className="font-display text-2xl font-semibold md:text-[30px]">Properties</h1>
				</div>
				<div className="flex flex-wrap gap-2.5">
					<label htmlFor="property-search" className="sr-only">Search properties</label>
					<input
						id="property-search"
						value={query}
						onChange={e => setQuery(e.target.value)}
						placeholder="Search address or postcode"
						className="h-11 w-full rounded-xl border border-sk-border2 bg-sk-card px-3.5 text-sm text-sk-text sm:w-[260px]"
					/>
					<button
						type="button"
						onClick={addListing}
						className="inline-flex h-11 cursor-pointer items-center rounded-xl border-none bg-sk-accent px-4 text-sm font-semibold text-sk-on-accent"
					>
						+ Add property
					</button>
				</div>
			</div>

			<div role="tablist" aria-label="Filter" className="flex flex-wrap gap-2 text-[13px]">
				{FILTERS.map(([key, label, fn]) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={filter === key}
						onClick={() => setFilter(key)}
						className={`h-9 cursor-pointer rounded-full px-3.5 ${
							filter === key
								? "border-none bg-sk-accent font-semibold text-sk-on-accent"
								: "border border-sk-border2 bg-transparent text-sk-text"
						}`}
					>
						{label} {listings.filter(fn).length}
					</button>
				))}
			</div>

			<div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
				{shown.map((prop, i) => (
					<PropertyCard
						key={prop._id ?? i}
						prop={prop}
						index={i}
						tenancies={tenancies}
						payRows={payRows}
						onOpen={setCurrentListing}
						onDelete={confirmDelete}
						navigate={navigate}
					/>
				))}
				<button
					type="button"
					onClick={addListing}
					className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-sk-border2 bg-sk-card p-5 text-sk-text"
				>
					<span className="font-display text-[17px] font-semibold">Add a property</span>
					<span className="text-[13px] text-sk-muted">Start a draft, finish it later.</span>
				</button>
			</div>
		</div>
	);
}
