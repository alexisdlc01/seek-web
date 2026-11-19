import AppShell from "./AppShell.jsx";

const ITEMS = [
	// Two spaces: Search (find homes, applications) and My home (lease, rent, deposit, bills, photos).
	// Inbox and Profile stay visible in both, under "Shared".
	{ to: "/student/find", label: "Search", section: "Search" },
	{ to: "/student/home", label: "My home", section: "My home" },
	{ to: "/student/inbox", label: "Inbox", section: "Shared" },
	{ to: "/student/profile", label: "Profile", section: "Shared" },
	{ to: "/student/connectors", label: "Connected email", section: "Shared" }
];

export default function StudentLayout() {
	return <AppShell role="student" label="Student" items={ITEMS} />;
}
