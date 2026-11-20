import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserContext from "../context/UserContext.jsx";
import AppShell from "./AppShell.jsx";
import { NavBadgeProvider, useNavBadges } from "./NavBadgeContext.jsx";
import { api } from "../lib/landlord.js";

const Inner = () => {
	const { badges } = useNavBadges();
	const { user } = useContext(UserContext);
	const { pathname } = useLocation();
	// A team member acts as the owner: /landlord/overview and /payments/* answer 403 for them.
	const member = !!user?.teamOf;
	// Applicants badge comes from the overview so it is right on every page,
	// not only after the Applicants page has been opened.
	const overview = useQuery({
		queryKey: ["landlord-overview"],
		queryFn: async () => (await api.get("/landlord/overview")).data,
		enabled: !!user && !member
	});
	const waiting = overview.data?.applicants?.total;
	const scopes = user?.teamOf?.scopes ?? [];
	const ownerOnly = (item) => !member || (item.to === "/repairs" ? scopes.includes("REPAIRS") : !["/dashboard", "/rent", "/connectors"].includes(item.to));
	const items = [
		{ to: "/dashboard", label: "Overview" },
		{ to: "/applicants", label: "Applicants", badge: waiting ?? badges.applicants, match: ["/application"] },
		{ to: "/listings", label: "Properties", match: ["/add-listing", "/view-listing"] },
		{ to: "/tenancies", label: "Tenancies" },
		{ to: "/rent", label: "Rent" },
		{ to: "/contracts", label: "Contracts and deposits" },
		{ to: "/repairs", label: "Repairs" },
		{ to: "/inbox", label: "Inbox", match: ["/chat"] },
		{ to: "/connectors", label: "Connectors" },
		{ to: "/edit-profile", label: "Account" }
	].filter(ownerOnly);
	if (member && pathname === "/dashboard") {
		const home = scopes.includes("APPLICATIONS") ? "/applicants" : scopes.includes("LISTINGS") ? "/listings" : scopes.includes("TENANCIES") ? "/tenancies" : scopes.includes("REPAIRS") && !scopes.includes("VIEWINGS_INBOX") ? "/repairs" : "/inbox";
		return <Navigate to={home} replace />;
	}
	return <AppShell role="landlord" label="Landlord" items={items} />;
};

export default function LandlordLayout() {
	return (
		<NavBadgeProvider>
			<Inner />
		</NavBadgeProvider>
	);
}
