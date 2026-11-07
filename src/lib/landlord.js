// Shared helpers for the landlord pages: axios instance, formatters and the
// route a backend activity link maps to.
import axios from "axios";

// Single source of truth for the API root (VITE_BASE_URL, else dev/prod default).
export const API_BASE =
	import.meta.env.VITE_BASE_URL ??
	(import.meta.env.MODE === "development"
		? "http://localhost:3000"
		: "https://api.seekapp.uk");

export const api = axios.create({ baseURL: API_BASE, withCredentials: true });

// The access token lasts 15 minutes: on the first 401 refresh it once (shared
// across parallel requests) and replay the request.
let refreshing = null;
const refreshOn401 = async error => {
	const { config, response } = error;
	if (response?.status !== 401 || !config || config._retry || config.url?.includes("/auth/")) throw error;
	config._retry = true;
	refreshing ??= axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true }).finally(() => (refreshing = null));
	try {
		await refreshing;
	} catch {
		throw error;
	}
	return api(config);
};
// Also cover the pages that still call axios directly (absolute URLs keep working on replay).
api.interceptors.response.use(undefined, refreshOn401);
axios.interceptors.response.use(undefined, refreshOn401);

// Money is stored in integer pence.
export const gbp = pence => {
	const value = (pence ?? 0) / 100;
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: "GBP",
		minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
		maximumFractionDigits: 2
	}).format(value);
};

export const fmtDate = (iso, opts = { day: "numeric", month: "short", year: "numeric" }) =>
	iso ? new Date(iso).toLocaleDateString("en-GB", opts) : "";

export const fmtDay = (iso) => fmtDate(iso, { day: "numeric", month: "short" });

export const fmtDateTime = (iso) =>
	iso
		? new Date(iso).toLocaleString("en-GB", {
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit"
			})
		: "";

export const monthLabel = (ym) => {
	const [y, m] = ym.split("-").map(Number);
	return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

export const shiftMonth = (ym, delta) => {
	const [y, m] = ym.split("-").map(Number);
	const d = new Date(y, m - 1 + delta, 1);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const currentMonth = () => {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const errMessage = (err, fallback = "Something went wrong. Please try again.") => {
	const m = err?.response?.data?.message;
	if (Array.isArray(m)) return m.join(", ");
	return m || HTTP_MESSAGES[err?.response?.status] || fallback;
};
const HTTP_MESSAGES = {
	400: "That request wasn't valid. Check the details and try again.",
	403: "You don't have permission to do that (is your email verified?).",
	404: "We couldn't find that. It may have been withdrawn or already handled.",
	409: "That conflicts with your current state (for example, you're already on a team)."
};

export const daysUntil = (iso) =>
	iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000) : null;

export const timeAgo = (iso) => {
	const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins} min ago`;
	const h = Math.round(mins / 60);
	if (h < 24) return `${h} h ago`;
	return fmtDay(iso);
};

// Backend activity links look like /landlord/applications/:id. Map them to
// the routes that exist in this app.
export const activityRoute = (kind, link = "") => {
	if (kind === "REPAIR") return "/inbox";
	// The backend already links to routes of this app (e.g. /application?listing=..&id=..).
	if (/^\/(application|applicants|rent|contracts|inbox)(\?|\/|$)/.test(link)) return link;
	if (kind === "APPLICATION") return "/applicants";
	if (kind === "PAYMENT") return "/rent";
	if (link.includes("contract") || link.includes("tenanc")) return "/contracts";
	return "/dashboard";
};

export const DEPOSIT_SCHEMES = [
	{ label: "DPS", value: "DPS" },
	{ label: "TDS", value: "TDS" },
	{ label: "mydeposits", value: "MYDEPOSITS" }
];

export const greeting = () => {
	const h = new Date().getHours();
	return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

// Starts an empty draft listing and returns its id (the wizard opens on it).
export const createDraftListing = async () => (await api.post("/listings/draft", {})).data;

// Reminds late tenants (POST /payments/landlord/remind-late). `rows` are
// /payments/landlord rows. Resolves to how many were reminded and skipped
// (reminded in the last 24 hours, or no Seek thread).
export const remindLate = async rows => {
	const { data } = await api.post("/payments/landlord/remind-late", { payments: rows.map(r => r.payment) });
	return { sent: data.reminded, skipped: data.skipped };
};

// Compliance items that need a tradesperson: where to find one (external).
export const engineerLink = kind =>
	kind === "EICR"
		? { label: "Book EICR engineer", href: "https://www.niceic.com/find-a-contractor" }
		: kind === "GAS_SAFETY"
			? { label: "Book Gas Safe engineer", href: "https://www.gassaferegister.co.uk/find-an-engineer/" }
			: null;

// Private files are opened through a short-lived signed URL (GET /upload/access).
// The tab is opened inside the click (Safari blocks pop-ups opened after an
// await), then pointed at the URL. Rejects on failure: callers show the error.
export const openAttachment = async file => {
	if (!file.key) {
		if (file.url) window.open(file.url, "_blank", "noopener");
		return;
	}
	const w = window.open("", "_blank");
	try {
		const { data } = await api.get("/upload/access", { params: { key: file.key } });
		if (w) {
			w.opener = null;
			w.location.href = data;
		}
	} catch (err) {
		w?.close();
		throw err;
	}
};
