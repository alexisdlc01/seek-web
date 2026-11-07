import AppShell from "./AppShell.jsx";

const ITEMS = [
	{ to: "/student/find", label: "Find a home" },
	{ to: "/student/home", label: "My home" },
	{ to: "/student/inbox", label: "Inbox" },
	{ to: "/student/profile", label: "Profile and documents" },
	{ to: "/student/connectors", label: "Connected email" }
];

export default function StudentLayout() {
	return <AppShell role="student" label="Student" items={ITEMS} />;
}
