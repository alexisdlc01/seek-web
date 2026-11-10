// Shared data hooks and helpers for the student pages (/student/*).
// Same pattern as the landlord pages: the axios instance from lib/landlord.js
// plus react-query.
import { useQuery } from "@tanstack/react-query";
import { api } from "./landlord.js";

// Seek AI advice actions point at app routes written for the landlord app.
// Send students to their own pages instead.
const STUDENT_ROUTES = {
	"/connectors": "/student/connectors",
	"/contracts": "/student/home",
	"/inbox": "/student/inbox",
	"/rent": "/student/home/rent"
};
export const studentLink = (link = "") => STUDENT_ROUTES[link] ?? link;

/** Active tenancy running now or starting next (earliest start not yet ended). */
export const pickTenancy = (list = []) => {
	const now = Date.now();
	const active = list.filter((t) => t.status === "ACTIVE");
	const current = active
		.filter((t) => !t.endDate || new Date(t.endDate).getTime() >= now)
		.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
	return current ?? active[0] ?? list[0] ?? null;
};

/** The student's current tenancy, or null when they have none. */
export const useMyTenancy = () => {
	const q = useQuery({
		queryKey: ["student-tenancies"],
		queryFn: async () => (await api.get("/tenancies/mine")).data
	});
	return { ...q, tenancy: pickTenancy(q.data ?? []) };
};

/** Seek Passport: GET /users/me/passport (sections, completed/total, ready). */
export const usePassport = () =>
	useQuery({
		queryKey: ["passport"],
		queryFn: async () => (await api.get("/users/me/passport")).data
	});

export const useMyApplications = () =>
	useQuery({
		queryKey: ["my-applications"],
		queryFn: async () => (await api.get("/application/mine")).data
	});

/** Listings are priced per property in pounds; students compare per person. */
export const perPerson = (listing) => {
	if (listing?.rentPerPerson != null) return listing.rentPerPerson;
	const rent = listing?.monthlyRent;
	if (rent == null) return null;
	const people = listing.numOfPeople || 1;
	return Math.round(rent / people);
};

export const pounds = (n) =>
	n == null ? "" : `£${Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

const GRADIENTS = [
	"linear-gradient(135deg, #C9D6E2, #9FB3C8)",
	"linear-gradient(135deg, #D9D2C5, #B9AE9A)",
	"linear-gradient(135deg, #CFE0D2, #9DBBA3)",
	"linear-gradient(135deg, #E3D5D0, #C2A79E)",
	"linear-gradient(135deg, #D6D9E8, #A9AFCB)",
	"linear-gradient(135deg, #E6DDC6, #C8B78E)"
];

/** Card/hero background: the first photo, or a soft gradient placeholder. */
export const photoBackground = (photo, i = 0) =>
	photo
		? `center / cover no-repeat url("${photo}"), ${GRADIENTS[i % GRADIENTS.length]}`
		: GRADIENTS[i % GRADIENTS.length];

export const initials = (name = "") =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase())
		.join("");

export const idOf = (v) => (v && typeof v === "object" ? v._id : v);

export const PLAN_LABEL = { MONTHLY: "Monthly", SIX_MONTHS: "Half-year", YEARLY: "Full year" };
