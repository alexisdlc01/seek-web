import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { seekMapStyle } from "./map/seekMapStyle.js";
import { photoBackground } from "../lib/student.js";

// The bundler moves the library, so tell it where its worker file ended up.
maplibregl.setWorkerUrl(workerUrl);

/**
 * Reusable map of listings with Airbnb-style price pills and a floating card.
 *
 * Props
 *  - listings: [{ id, lat, lng, price: "£695", title, subtitle?, photo?, priceNote?, saved? }]
 *  - selectedId / onSelect(id | null): controlled selection; clicking a pill selects it and
 *    opens its card, closing the card calls onSelect(null)
 *  - onOpen(id): clicking the card (defaults to onSelect)
 *  - onToggleSave(id): shows a heart on the card
 *  - hoveredId: highlights that pill (e.g. while a list card is hovered)
 *  - landmark: optional { lat, lng, label } shown as a dark pin (e.g. the university)
 *  - center: [lat, lng] / zoom: initial view, in Leaflet zoom levels (256px tiles)
 *  - showList: render the overlay list panel over the map (collapsible)
 *  - onBoundsChange({ minLat, maxLat, minLng, maxLng }): called once the map is
 *    ready and after every pan/zoom, so the caller can load what is in view
 *  - highlightIds: when set, only these pills are drawn at full strength
 *    (e.g. Seek AI matches); the rest are dimmed
 *  - fitTo: [[lat, lng], ...]; the map zooms to fit these whenever the array changes
 *  - className: size/position classes for the wrapper (give it a height)
 *
 * Basemap colours live in ./map/seekMapStyle.js, pill styles in index.css (.sk-pin).
 */

// MapLibre tiles are 512px, so its zoom is one below Leaflet's for the same view.
const Z = (leafletZoom) => leafletZoom - 1;

const HOME_ICON =
	'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>';

const boundsOf = (map) => {
	const b = map.getBounds();
	return { minLat: b.getSouth(), maxLat: b.getNorth(), minLng: b.getWest(), maxLng: b.getEast() };
};

const amount = (price) => Number(String(price ?? "").replace(/[^\d.]/g, "")) || Infinity;

// Pill size on screen, close enough to detect overlaps without measuring the DOM.
const pillWidth = (price) => (price ? 22 + 8.2 * price.length : 30);
const PILL_H = 30;

const ZOOM_BTN = "flex h-9 w-9 cursor-pointer items-center justify-center border-none bg-white text-xl leading-none text-[#222] hover:bg-[#F7F7F7]";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));

export default function ListingsMap({
	listings,
	selectedId,
	onSelect,
	onOpen,
	onToggleSave,
	hoveredId,
	landmark,
	center,
	zoom = 13,
	showList = true,
	className = "h-[420px]",
	onBoundsChange,
	highlightIds,
	fitTo
}) {
	const boxRef = useRef(null);
	const mapRef = useRef(null);
	const cardRef = useRef(null);
	const pins = useRef(new Map()); // id -> { el, btn, marker, listing, label }
	const seen = useRef(new Set()); // ids whose card was opened this visit
	const [cardId, setCardId] = useState(null);
	const [compact, setCompact] = useState(false);
	const [listOpen, setListOpen] = useState(false);

	// Clicking a pill (or the overlay list) selects the home and opens its card.
	const pick = (id) => {
		seen.current.add(id);
		pins.current.get(id)?.el.classList.add("is-seen");
		setCardId(id);
		onSelect?.(id);
	};

	const card = cardId != null && cardId === selectedId ? listings.find((l) => l.id === cardId) : null;

	// Latest props for map event handlers, which are bound once.
	const live = useRef({});
	live.current = { listings, selectedId, onSelect, pick, onBoundsChange, highlightIds, center, zoom, card, compact };

	// Pills that would overlap a cheaper (or selected) one become dots until zoomed in.
	const layoutPills = () => {
		const map = mapRef.current;
		if (!map) return;
		const { selectedId: sel, highlightIds: hi } = live.current;
		const rank = (l) => (l.id === sel ? 0 : hi && !hi.has(l.id) ? 2 : 1);
		const items = [...pins.current.values()].sort(
			(a, b) => rank(a.listing) - rank(b.listing) || amount(a.listing.price) - amount(b.listing.price)
		);
		const kept = [];
		for (const pin of items) {
			const p = map.project([pin.listing.lng, pin.listing.lat]);
			const w = pillWidth(pin.listing.price) / 2;
			const r = { x1: p.x - w, x2: p.x + w, y1: p.y - PILL_H / 2, y2: p.y + PILL_H / 2 };
			const hit = pin.listing.id !== sel && kept.some((k) => r.x1 < k.x2 && r.x2 > k.x1 && r.y1 < k.y2 && r.y2 > k.y1);
			pin.el.classList.toggle("is-dot", hit);
			if (!hit) kept.push(r);
		}
	};

	// Wide maps float the card next to its pill; compact ones dock it bottom-centre (CSS).
	const placeCard = () => {
		const el = cardRef.current;
		const map = mapRef.current;
		const { card: l, compact: dock } = live.current;
		if (!el || !map || !l) return;
		if (dock) {
			el.style.transform = "";
			return;
		}
		const box = boxRef.current;
		const p = map.project([l.lng, l.lat]);
		const w = el.offsetWidth;
		const h = el.offsetHeight;
		const x = clamp(p.x - w / 2, 12, box.clientWidth - w - 12);
		const above = p.y - h - 24;
		const y = clamp(above >= 12 ? above : p.y + 24, 12, box.clientHeight - h - 12);
		el.style.transform = `translate(${x}px, ${y}px)`;
	};

	// Create the map once.
	useEffect(() => {
		const { listings: ls, center: c, zoom: z } = live.current;
		const start = c ?? (ls.length ? [ls.reduce((s, l) => s + l.lat, 0) / ls.length, ls.reduce((s, l) => s + l.lng, 0) / ls.length] : [56.3398, -2.7967]);
		const map = new maplibregl.Map({
			container: boxRef.current,
			style: seekMapStyle,
			center: [start[1], start[0]],
			zoom: Z(z),
			attributionControl: { compact: true },
			dragRotate: false,
			pitchWithRotate: false,
			touchPitch: false,
			maxPitch: 0
		});
		map.touchZoomRotate.disableRotation();
		map.keyboard.disableRotation();
		mapRef.current = map;

		map.on("move", placeCard);
		map.on("moveend", () => {
			live.current.onBoundsChange?.(boundsOf(map));
			layoutPills();
		});
		map.on("click", (e) => {
			if (e.originalEvent.target.closest?.(".sk-pin")) return;
			if (live.current.card) live.current.onSelect?.(null);
			setCardId(null);
		});
		live.current.onBoundsChange?.(boundsOf(map));

		const ro = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			setCompact(width < 400 || height < 520);
		});
		ro.observe(boxRef.current);
		const pinMap = pins.current;
		return () => {
			ro.disconnect();
			map.remove();
			mapRef.current = null;
			pinMap.clear();
		};
	}, []);

	// Diff markers against the listings, then restyle them (no re-create per render).
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const ids = new Set(listings.map((l) => l.id));
		for (const [id, pin] of pins.current) {
			if (!ids.has(id)) {
				pin.marker.remove();
				pins.current.delete(id);
			}
		}
		for (const l of listings) {
			let pin = pins.current.get(l.id);
			if (!pin) {
				const el = document.createElement("div");
				el.className = "sk-pin";
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = "sk-pill";
				el.append(btn);
				btn.addEventListener("click", (e) => {
					e.stopPropagation();
					live.current.pick(l.id);
				});
				pin = { el, btn, marker: new maplibregl.Marker({ element: el }).setLngLat([l.lng, l.lat]).addTo(map) };
				pins.current.set(l.id, pin);
			} else if (pin.listing.lat !== l.lat || pin.listing.lng !== l.lng) {
				pin.marker.setLngLat([l.lng, l.lat]);
			}
			if (pin.label !== l.price) {
				pin.label = l.price;
				if (l.price) pin.btn.textContent = l.price;
				else pin.btn.innerHTML = HOME_ICON;
				pin.btn.classList.toggle("sk-pill--home", !l.price);
			}
			pin.btn.setAttribute("aria-label", l.price ? `${l.title}, ${l.price} per month` : l.title);
			pin.listing = l;
			pin.el.classList.toggle("is-on", l.id === selectedId);
			pin.el.classList.toggle("is-hover", l.id === hoveredId);
			pin.el.classList.toggle("is-dim", !!highlightIds && !highlightIds.has(l.id));
			pin.el.classList.toggle("is-seen", seen.current.has(l.id));
		}
		layoutPills();
	}, [listings, selectedId, hoveredId, highlightIds]);

	// Keep the selected home in view (e.g. picked from the list).
	useEffect(() => {
		const map = mapRef.current;
		const sel = live.current.listings.find((l) => l.id === selectedId);
		if (!map || !sel) return;
		const p = map.project([sel.lng, sel.lat]);
		const { clientWidth: w, clientHeight: h } = map.getContainer();
		if (p.x < 60 || p.y < 60 || p.x > w - 60 || p.y > h - 60) map.easeTo({ center: [sel.lng, sel.lat], duration: 600 });
	}, [selectedId]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !fitTo?.length) return;
		if (fitTo.length === 1) map.flyTo({ center: [fitTo[0][1], fitTo[0][0]], zoom: Math.max(map.getZoom(), Z(14)), duration: 900 });
		else {
			const b = new maplibregl.LngLatBounds();
			fitTo.forEach(([lat, lng]) => b.extend([lng, lat]));
			map.fitBounds(b, { padding: 48, maxZoom: Z(15), duration: 900 });
		}
	}, [fitTo]);

	const { lat: lmLat, lng: lmLng, label: lmLabel } = landmark ?? {};
	useEffect(() => {
		const map = mapRef.current;
		if (!map || lmLat == null) return;
		const el = document.createElement("div");
		el.className = "sk-landmark";
		el.append(document.createElement("i"), lmLabel ?? "");
		const marker = new maplibregl.Marker({ element: el, anchor: "left", offset: [-12, 0] }).setLngLat([lmLng, lmLat]).addTo(map);
		return () => marker.remove();
	}, [lmLat, lmLng, lmLabel]);

	useLayoutEffect(placeCard);

	const closeCard = () => {
		setCardId(null);
		onSelect?.(null);
	};

	return (
		<div className={`relative isolate overflow-hidden bg-[#F7F6F3] ${className}`}>
			<div ref={boxRef} style={{ position: "absolute", inset: 0 }} aria-label="Map of homes" role="region" />

			<div className="absolute right-3 top-3 z-[2] flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,.18),0_0_0_1px_rgba(0,0,0,.06)]">
				<button type="button" aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()} className={ZOOM_BTN}>
					+
				</button>
				<span aria-hidden="true" className="mx-1.5 h-px bg-[#EBEBEB]" />
				<button type="button" aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()} className={ZOOM_BTN}>
					−
				</button>
			</div>

			{card && (
				<article
					ref={cardRef}
					className={`absolute z-[3] overflow-hidden rounded-2xl bg-white text-[#222] shadow-[0_6px_20px_rgba(0,0,0,.2)] ${
						compact ? "inset-x-3 bottom-8 mx-auto max-w-[380px]" : "left-0 top-0 w-[260px]"
					}`}
				>
					<button
						type="button"
						onClick={() => (onOpen ?? onSelect)?.(card.id)}
						aria-label={`Open ${card.title}`}
						className={`flex w-full cursor-pointer border-none bg-transparent p-0 text-left text-inherit ${compact ? "flex-row" : "flex-col"}`}
					>
						<div
							className={compact ? "h-[104px] w-[112px] shrink-0" : "aspect-[20/19] w-full rounded-t-2xl"}
							style={{ background: photoBackground(card.photo) }}
						/>
						<div className={`flex min-w-0 flex-col gap-0.5 ${compact ? "justify-center px-3 py-2 pr-16" : "px-3.5 pb-3.5 pt-3"}`}>
							<span className="truncate text-[15px] font-semibold">{card.title}</span>
							{card.subtitle && <span className="truncate text-[13px] text-[#717171]">{card.subtitle}</span>}
							{card.price && (
								<span className="mt-1 text-[14px]">
									<b>{card.price}</b> {card.priceNote ?? "pcm"}
								</span>
							)}
						</div>
					</button>
					<div className="absolute right-2.5 top-2.5 flex gap-1.5">
						{onToggleSave && (
							<button
								type="button"
								aria-pressed={!!card.saved}
								aria-label={card.saved ? "Remove from saved" : "Save home"}
								onClick={() => onToggleSave(card.id)}
								className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-white/90 text-[#222] shadow-[0_1px_3px_rgba(0,0,0,.2)]"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill={card.saved ? "#FF385C" : "none"} stroke={card.saved ? "#FF385C" : "currentColor"} strokeWidth="2.2" aria-hidden="true">
									<path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.4 5 7 5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.6 0 5.8 3.6 4.5 6.8C19.5 16.4 12 21 12 21z" />
								</svg>
							</button>
						)}
						<button
							type="button"
							aria-label="Close"
							onClick={closeCard}
							className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-white/90 text-[15px] leading-none text-[#222] shadow-[0_1px_3px_rgba(0,0,0,.2)]"
						>
							✕
						</button>
					</div>
				</article>
			)}

			{showList && (
				<div className="pointer-events-none absolute left-3 top-3 z-[2] flex max-h-[calc(100%-24px)] w-[min(260px,calc(100%-72px))] flex-col gap-2">
					<button
						type="button"
						aria-expanded={listOpen}
						onClick={() => setListOpen((o) => !o)}
						className="pointer-events-auto flex h-9 cursor-pointer items-center justify-between rounded-[10px] border border-sk-border bg-sk-card px-3 text-[13px] font-semibold text-sk-text shadow-[0_4px_14px_var(--sk-shadow)]"
					>
						<span>{listings.length} homes on this map</span>
						<i className={`pi ${listOpen ? "pi-chevron-up" : "pi-chevron-down"} text-xs`} />
					</button>
					{listOpen && (
						<ul className="pointer-events-auto m-0 flex list-none flex-col overflow-y-auto rounded-xl border border-sk-border bg-sk-card p-1 shadow-[0_4px_14px_var(--sk-shadow)]">
							{listings.map((l) => (
								<li key={l.id}>
									<button
										type="button"
										aria-pressed={l.id === selectedId}
										onClick={() => pick(l.id)}
										className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-none px-2.5 py-2 text-left text-[13px] text-sk-text ${
											l.id === selectedId ? "bg-sk-tint" : "bg-transparent hover:bg-sk-hair"
										}`}
									>
										<span className="min-w-0 truncate">{l.title}</span>
										<span className="font-bold">{l.price}</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</div>
	);
}
