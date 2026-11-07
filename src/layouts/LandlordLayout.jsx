import { useQuery } from "@tanstack/react-query";
import AppShell from "./AppShell.jsx";
import { NavBadgeProvider, useNavBadges } from "./NavBadgeContext.jsx";
import { api } from "../lib/landlord.js";

const Inner = () => {
	const { badges } = useNavBadges();
	// Applicants badge comes from the overview so it is right on every page,
	// not only after the Applicants page has been opened.
	const overview = useQuery({
		queryKey: ["landlord-overview"],
		queryFn: async () => (await api.get("/landlord/overview")).data
	});
	const waiting = overview.data?.applicants?.total;
	const items = [
		{ to: "/dashboard", label: "Overview" },
		{ to: "/applicants", label: "Applicants", badge: waiting ?? badges.applicants, match: ["/application"] },
		{ to: "/listings", label: "Properties", match: ["/add-listing", "/view-listing"] },
		{ to: "/rent", label: "Rent" },
		{ to: "/contracts", label: "Contracts and deposits" },
		{ to: "/inbox", label: "Inbox", match: ["/chat"] },
		{ to: "/connectors", label: "Connectors" },
		{ to: "/edit-profile", label: "Account" }
	];
	return <AppShell role="landlord" label="Landlord" items={items} />;
};

export default function LandlordLayout() {
	return (
		<NavBadgeProvider>
			<Inner />
		</NavBadgeProvider>
	);
}
