import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Reusable map of listings with price-pill markers.
 *
 * Props
 *  - listings: [{ id, lat, lng, price: "£695", title, subtitle? }]
 *  - selectedId / onSelect(id): controlled selection (selected pill is enlarged and white)
 *  - landmark: optional { lat, lng, label } shown as a dark pin (e.g. the university)
 *  - center / zoom: initial view (defaults to the listings' bounds)
 *  - showList: render the overlay list panel over the map (collapsible)
 *  - onBoundsChange({ minLat, maxLat, minLng, maxLng }): called once the map is
 *    ready and after every pan/zoom, so the caller can load what is in view
 *  - highlightIds: when set, only these pills are drawn at full strength
 *    (e.g. Seek AI matches); the rest are dimmed
 *  - fitTo: [[lat, lng], ...]; the map zooms to fit these whenever the array changes
 *  - className: size/position classes for the wrapper (give it a height)
 *
 * Pill colours come from the --sk-* tokens (see .sk-pill in index.css).
 */

const pillIcon = (price, selected, dim) =>
	L.divIcon({
		className: "sk-pill-wrap",
		html: `<span class="sk-pill${selected ? " sk-pill--on" : ""}${dim ? " sk-pill--dim" : ""}">${price}</span>`,
		iconSize: [64, 36],
		iconAnchor: [32, 18]
	});

const landmarkIcon = (label) =>
	L.divIcon({
		className: "sk-pill-wrap",
		html: `<span class="sk-landmark"><i></i>${label}</span>`,
		iconSize: [150, 24],
		iconAnchor: [12, 12]
	});

const boundsOf = (map) => {
	const b = map.getBounds();
	return { minLat: b.getSouth(), maxLat: b.getNorth(), minLng: b.getWest(), maxLng: b.getEast() };
};

// Pans to the selected listing and keeps the map sized to its container.
function MapEffects({ listings, selectedId, onBoundsChange, fitTo }) {
	const map = useMapEvents({
		moveend: () => onBoundsChange?.(boundsOf(map))
	});

	useEffect(() => {
		onBoundsChange?.(boundsOf(map));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	useEffect(() => {
		if (!fitTo?.length) return;
		if (fitTo.length === 1) map.setView(fitTo[0], Math.max(map.getZoom(), 14), { animate: true });
		else map.fitBounds(fitTo, { padding: [48, 48], maxZoom: 15 });
	}, [fitTo, map]);

	useEffect(() => {
		const sel = listings.find((l) => l.id === selectedId);
		if (sel) map.panTo([sel.lat, sel.lng], { animate: true });
	}, [selectedId]);

	useEffect(() => {
		const el = map.getContainer();
		if (typeof ResizeObserver === "undefined") return;
		const ro = new ResizeObserver(() => map.invalidateSize());
		ro.observe(el);
		return () => ro.disconnect();
	}, [map]);

	return null;
}

export default function ListingsMap({
	listings,
	selectedId,
	onSelect,
	landmark,
	center,
	zoom = 13,
	showList = true,
	className = "h-[420px]",
	onBoundsChange,
	highlightIds,
	fitTo
}) {
	const [listOpen, setListOpen] = useState(false);

	const initialCenter = useMemo(() => {
		if (center) return center;
		if (!listings.length) return [56.3398, -2.7967];
		const lat = listings.reduce((s, l) => s + l.lat, 0) / listings.length;
		const lng = listings.reduce((s, l) => s + l.lng, 0) / listings.length;
		return [lat, lng];
	}, [center, listings]);

	return (
		<div className={`relative isolate overflow-hidden ${className}`}>
			<MapContainer
				center={initialCenter}
				zoom={zoom}
				scrollWheelZoom
				className="h-full w-full"
				aria-label="Map of homes"
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{landmark && (
					<Marker
						position={[landmark.lat, landmark.lng]}
						icon={landmarkIcon(landmark.label)}
						interactive={false}
						keyboard={false}
					/>
				)}
				{listings.map((l) => (
					<Marker
						key={l.id}
						position={[l.lat, l.lng]}
						icon={pillIcon(l.price, l.id === selectedId, !!highlightIds && !highlightIds.has(l.id))}
						zIndexOffset={l.id === selectedId ? 1000 : 0}
						title={`${l.title}, ${l.price} per month`}
						eventHandlers={{ click: () => onSelect?.(l.id) }}
					/>
				))}
				<MapEffects listings={listings} selectedId={selectedId} onBoundsChange={onBoundsChange} fitTo={fitTo} />
			</MapContainer>

			{showList && (
				<div className="pointer-events-none absolute left-3 top-3 z-[1000] flex max-h-[calc(100%-24px)] w-[min(260px,calc(100%-24px))] flex-col gap-2">
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
										onClick={() => onSelect?.(l.id)}
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
