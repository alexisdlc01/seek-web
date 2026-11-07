import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ListingsMap from "../components/ListingsMap.jsx";
import { ApplyModal, ListingDetailModal } from "../components/StudentListing.jsx";
import { ErrorState } from "../components/sk.jsx";
import { api, errMessage, fmtDate } from "../lib/landlord.js";
import { perPerson, photoBackground, pounds, usePassport } from "../lib/student.js";

const UNIVERSITY = { lat: 56.3417, lng: -2.7943, label: "Univ. of St Andrews" };
const SAMPLE_ASK = "4-bed near University of St Andrews, under £750, bills included";

// Chips map to server filters where the API has them, otherwise to a
// client-side check on the listings already loaded for the map area.
const CHIPS = [
	{ key: "Under £750", params: { maxRent: 750 } },
	{ key: "Bills included", params: { billsIncluded: true } },
	{ key: "4+ beds", params: { minBedrooms: 4 } },
	{
		key: "From Sept 2027",
		test: (l) =>
			(!l.availableFrom || new Date(l.availableFrom) <= new Date("2027-09-30")) &&
			(!l.availableUntil || new Date(l.availableUntil) >= new Date("2027-09-01"))
	},
	{
		key: "Accepts guarantor service",
		test: (l) => (l.criteria?.guarantor ?? "UK_OR_SERVICE") !== "UK_ONLY"
	}
];

const round = (n) => Math.round(n * 1000) / 1000;

const toggleIn = (set, key) => {
	const next = new Set(set);
	next.has(key) ? next.delete(key) : next.add(key);
	return next;
};

/** Normalise /listings/filter and /ai/search-chat rows to one card shape. */
const fromListing = (l) => ({
	id: l._id,
	lat: l.lat ?? l.location?.coordinates?.[1],
	lng: l.lng ?? l.location?.coordinates?.[0],
	title: l.propertyTitle,
	each: perPerson(l),
	shared: (l.numOfPeople ?? 1) > 1,
	bills: l.billsIncluded,
	beds: l.bedroomsCount,
	epc: l.epcRating,
	area: l.cityTown,
	availableFrom: l.availableFrom,
	photo: l.photos?.[0]
});
const fromAi = (l) => ({
	id: l.id,
	lat: l.lat,
	lng: l.lng,
	title: l.title,
	each: l.rentPerPerson,
	shared: l.rentPerPerson !== l.monthlyRent,
	bills: l.billsIncluded,
	beds: l.bedrooms,
	area: l.city,
	availableFrom: l.availableFrom,
	distanceKm: l.distanceKm,
	photo: l.photo,
	match: l.match,
	reasons: l.reasons ?? [],
	checks: l.checks ?? []
});

export default function StudentFind() {
	const qc = useQueryClient();
	const [bounds, setBounds] = useState(null);
	const [chips, setChips] = useState(() => new Set(["Under £750"]));
	const [selected, setSelected] = useState(null);
	const [detailId, setDetailId] = useState(null);
	const [applyId, setApplyId] = useState(null);
	const [ask, setAsk] = useState(SAMPLE_ASK);
	const [chat, setChat] = useState([]); // [{role, content}]
	const [ai, setAi] = useState(null); // last /ai/search-chat result
	const [notice, setNotice] = useState("");
	const passportQ = usePassport();

	const onBoundsChange = useCallback((b) => {
		const r = { minLat: round(b.minLat), maxLat: round(b.maxLat), minLng: round(b.minLng), maxLng: round(b.maxLng) };
		setBounds((prev) => (prev && JSON.stringify(prev) === JSON.stringify(r) ? prev : r));
	}, []);

	const active = CHIPS.filter((c) => chips.has(c.key));
	const params = Object.assign({ limit: 50 }, bounds, ...active.map((c) => c.params ?? {}));

	const listingsQ = useQuery({
		queryKey: ["listings-bbox", params],
		enabled: !!bounds,
		placeholderData: keepPreviousData,
		queryFn: async () => (await api.get("/listings/filter", { params })).data
	});

	const likedQ = useQuery({
		queryKey: ["liked-listings"],
		queryFn: async () => (await api.get("/listings/like")).data
	});
	const liked = useMemo(() => new Set((likedQ.data?.data ?? []).map((l) => l._id)), [likedQ.data]);

	const like = useMutation({
		mutationFn: ({ id, on }) => api.patch(`/listings/${on ? "like" : "unlike"}/${id}`),
		onMutate: async ({ id, on }) => {
			await qc.cancelQueries({ queryKey: ["liked-listings"] });
			const prev = qc.getQueryData(["liked-listings"]);
			qc.setQueryData(["liked-listings"], (old) => {
				const data = (old?.data ?? []).filter((l) => l._id !== id);
				return { ...old, data: on ? [...data, { _id: id }] : data };
			});
			return { prev };
		},
		onError: (e, _v, ctx) => {
			qc.setQueryData(["liked-listings"], ctx?.prev);
			setNotice(errMessage(e, "We couldn't save that home."));
		},
		onSettled: () => qc.invalidateQueries({ queryKey: ["liked-listings"] })
	});
	const toggleSave = (id) => like.mutate({ id, on: !liked.has(id) });

	const searchChat = useMutation({
		mutationFn: async (messages) => (await api.post("/ai/search-chat", { messages })).data,
		onSuccess: (data, messages) => {
			setAi(data);
			setChat([...messages, { role: "assistant", content: data.reply }]);
			setSelected(data.listings?.[0]?.id ?? null);
		},
		onError: (e) => setNotice(errMessage(e, "Seek AI couldn't search right now."))
	});
	const send = (raw) => {
		const text = raw.trim().slice(0, 2000);
		if (!text) return;
		setNotice("");
		const messages = [...chat, { role: "user", content: text }].slice(-20);
		setChat(messages);
		setAsk("");
		searchChat.mutate(messages);
	};
	const sendAsk = (e) => {
		e.preventDefault();
		send(ask);
	};
	const clearAi = () => {
		setAi(null);
		setChat([]);
		setAsk(SAMPLE_ASK);
	};

	// Map area listings, with the client-side chips applied.
	const areaHomes = useMemo(
		() =>
			(listingsQ.data ?? [])
				.filter((l) => active.every((c) => !c.test || c.test(l)))
				.map(fromListing)
				.filter((h) => h.lat != null && h.lng != null),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[listingsQ.data, chips]
	);
	const aiHomes = useMemo(() => (ai?.listings ?? []).map(fromAi), [ai]);
	const homes = ai ? aiHomes : areaHomes;
	const highlightIds = useMemo(() => (ai ? new Set(aiHomes.map((h) => h.id)) : null), [ai, aiHomes]);
	const fitTo = useMemo(() => (aiHomes.length ? aiHomes.filter((h) => h.lat != null).map((h) => [h.lat, h.lng]) : null), [aiHomes]);
	const mapHomes = useMemo(() => {
		const byId = new Map(areaHomes.map((h) => [h.id, h]));
		aiHomes.forEach((h) => h.lat != null && byId.set(h.id, h));
		return [...byId.values()].map((h) => ({ id: h.id, lat: h.lat, lng: h.lng, price: pounds(h.each), title: h.title }));
	}, [areaHomes, aiHomes]);

	const p = passportQ.data;

	return (
		<div className="flex flex-col md:h-screen">
			<div className="flex flex-col gap-3 border-b border-sk-border px-4 pb-3.5 pt-5 md:px-6">
				<form onSubmit={sendAsk} className="flex items-center gap-2.5">
					<div className="flex h-[52px] flex-1 items-center gap-2.5 rounded-[14px] border border-sk-accent bg-sk-card pl-4 pr-2">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sk-link)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /></svg>
						<label htmlFor="ask" className="sr-only">Ask Seek AI</label>
						<input
							id="ask"
							value={ask}
							onChange={(e) => setAsk(e.target.value)}
							maxLength={2000}
							placeholder={chat.length ? "Refine: closer to campus, cheaper, garden…" : SAMPLE_ASK}
							className="min-w-0 flex-1 border-none bg-transparent text-[15px] text-sk-text outline-none"
						/>
						<button type="submit" disabled={searchChat.isPending} className="h-[38px] cursor-pointer rounded-[10px] border-none bg-sk-accent px-3.5 text-[13.5px] font-semibold text-sk-on-accent disabled:opacity-60">
							{searchChat.isPending ? "Asking…" : chat.length ? "Send" : "Ask Seek AI"}
						</button>
					</div>
				</form>
				<div className="flex flex-wrap gap-2 text-[13px]" role="group" aria-label="Filters">
					{CHIPS.map(({ key }) => (
						<button
							key={key}
							type="button"
							aria-pressed={chips.has(key)}
							onClick={() => setChips((s) => toggleIn(s, key))}
							className={`h-[34px] cursor-pointer rounded-full px-3.5 ${chips.has(key) ? "border-none bg-sk-accent font-semibold text-sk-on-accent" : "border border-sk-border2 bg-transparent text-sk-text"}`}
						>
							{key}
						</button>
					))}
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col md:flex-row">
				<section aria-label="Homes" className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-[18px] md:px-6">
					{chat.length > 0 && (
						<section aria-label="Seek AI conversation" className="flex flex-col gap-2 rounded-2xl bg-sk-card2 p-3.5">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-sk-link">Seek AI</span>
								<button type="button" onClick={clearAi} className="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-sk-link">
									Clear
								</button>
							</div>
							<ol className="m-0 flex list-none flex-col gap-2 p-0" aria-live="polite">
								{chat.map((m, i) => (
									<li
										key={i}
										className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[13.5px] leading-snug ${m.role === "user" ? "self-end bg-sk-accent text-sk-on-accent" : "self-start bg-sk-card text-sk-text2"}`}
									>
										{m.content}
									</li>
								))}
								{searchChat.isPending && <li className="self-start text-[13px] text-sk-muted">Seek AI is searching…</li>}
							</ol>
							{!searchChat.isPending && ai?.suggestions?.length > 0 && (
								<div className="flex flex-wrap gap-2" aria-label="Suggested replies">
									{ai.suggestions.map((sg) => (
										<button
											key={sg}
											type="button"
											onClick={() => send(sg)}
											className="h-[30px] cursor-pointer rounded-full border border-sk-border2 bg-transparent px-3 text-[12.5px] text-sk-text"
										>
											{sg}
										</button>
									))}
								</div>
							)}
							{ai?.relaxed?.length > 0 && (
								<span className="text-[12.5px] text-sk-muted">
									Nothing matched everything, so Seek AI relaxed: {ai.relaxed.map((r) => (r === "billsIncluded" ? "bills included" : r === "minBedrooms" ? "bedrooms" : r)).join(", ")}.
								</span>
							)}
						</section>
					)}

					{notice && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{notice}</div>}

					<div className="flex flex-wrap items-center justify-between gap-2">
						<h1 className="font-display text-xl font-semibold">
							{ai ? `${homes.length} homes match · sorted by AI match` : listingsQ.isLoading || !bounds ? "Finding homes on the map…" : `${homes.length} homes in this map area`}
						</h1>
						{p && (
							<Link to="/student/profile" className="rounded-[10px] bg-sk-tint px-3 py-2 text-[13px] font-semibold text-sk-link no-underline">
								Seek Passport {p.completed} of {p.total} · apply in one click
							</Link>
						)}
					</div>

					{listingsQ.isError && !ai && <ErrorState error={listingsQ.error} onRetry={() => listingsQ.refetch()} />}
					{!listingsQ.isLoading && bounds && homes.length === 0 && !listingsQ.isError && (
						<div className="rounded-2xl border border-dashed border-sk-border2 p-6 text-center text-sm text-sk-text2">
							No homes here with these filters. Move the map, remove a filter or ask Seek AI.
						</div>
					)}

					<div className="grid gap-4 sm:grid-cols-2">
						{homes.map((h, i) => (
							<article
								key={h.id}
								className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-sk-card ${h.id === selected ? "border-sk-accent" : "border-transparent"}`}
							>
								<button
									type="button"
									onClick={() => {
										setSelected(h.id);
										setDetailId(h.id);
									}}
									aria-label={`Open ${h.title}`}
									className="flex w-full cursor-pointer flex-col border-none bg-transparent p-0 text-left text-inherit"
								>
									<div className="relative h-[150px] w-full p-2.5" style={{ background: photoBackground(h.photo, i) }}>
										{ai && <span className="rounded-md bg-sk-accent px-2 py-1 text-[11.5px] font-bold text-sk-on-accent">{h.match}% match</span>}
									</div>
									<div className="flex flex-col gap-1 px-3.5 pb-1 pt-3">
										<span className="text-[15px] font-semibold">{h.title}</span>
										<span className="text-[13px] text-sk-text2">
											{pounds(h.each)} pcm{h.shared ? " each" : ""} · {h.bills ? "bills incl." : "bills extra"}
											{h.epc ? ` · EPC ${h.epc}` : ""}
										</span>
										{ai && h.reasons?.length > 0 && <span className="text-[12.5px] text-sk-text2">{h.reasons.join(" · ")}</span>}
										{ai && h.checks?.map((c) => (
											<span key={c.text} className={`text-[12.5px] ${c.kind === "pass" ? "text-sk-ok" : "text-sk-warn"}`}>
												{c.kind === "pass" ? "✓" : "!"} {c.text}
											</span>
										))}
										<span className="text-[12.5px] text-sk-link">
											{[h.beds ? `${h.beds} bed` : null, h.distanceKm != null ? `${h.distanceKm.toFixed(1)} km to campus` : h.area, h.availableFrom ? `free ${fmtDate(h.availableFrom)}` : null]
												.filter(Boolean)
												.join(" · ")}
										</span>
									</div>
								</button>
								<div className="flex gap-2 px-3.5 pb-3.5 pt-2">
									<button
										type="button"
										onClick={() => setApplyId(h.id)}
										className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-[10px] border-none bg-sk-accent text-[13px] font-semibold text-sk-on-accent"
									>
										Apply with Passport
									</button>
									<button
										type="button"
										aria-pressed={liked.has(h.id)}
										onClick={() => toggleSave(h.id)}
										className="h-10 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text"
									>
										{liked.has(h.id) ? "Saved" : "Save"}
									</button>
								</div>
							</article>
						))}
					</div>
				</section>

				<section aria-label="Map" className="h-[380px] shrink-0 border-t border-sk-border md:h-auto md:w-[470px] md:border-l md:border-t-0">
					<ListingsMap
						listings={mapHomes}
						selectedId={selected}
						onSelect={(id) => {
							setSelected(id);
							setDetailId(id);
						}}
						landmark={UNIVERSITY}
						center={[56.3398, -2.7967]}
						zoom={13}
						onBoundsChange={onBoundsChange}
						highlightIds={highlightIds}
						fitTo={fitTo}
						className="h-full w-full"
					/>
				</section>
			</div>

			{detailId && (
				<ListingDetailModal
					id={detailId}
					saved={liked.has(detailId)}
					onToggleSave={() => toggleSave(detailId)}
					onApply={() => {
						setApplyId(detailId);
						setDetailId(null);
					}}
					onClose={() => setDetailId(null)}
				/>
			)}
			{applyId && <ApplyModal id={applyId} onClose={() => setApplyId(null)} />}
		</div>
	);
}
