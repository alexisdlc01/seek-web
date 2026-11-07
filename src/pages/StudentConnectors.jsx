import ConnectorsView from "../components/ConnectorsView.jsx";

export default function StudentConnectors() {
	return (
		<ConnectorsView
			title="Connected email"
			intro="Connect your mailbox once. Every email with your landlord, agent, deposit scheme and suppliers shows up in your Seek inbox, and replies go out from your own address."
			scopeLabel="Only my housing contacts"
			scopeHint="Your landlord, letting agent, guarantor, deposit scheme, energy and broadband suppliers."
			options={[
				["addReferencesToProfile", "Add landlord and agent references to my profile"],
				["readUtilityBills", "Read bills so I can split them"]
			]}
			privacy={[
				"Other emails are never opened or stored.",
				"Your landlord never sees your mailbox, only replies you send.",
				"Disconnect any time. Synced copies are deleted within 30 days."
			]}
			next={["Google / Outlook calendar (viewings)", "Bank (rent and bills, read-only)", "University email (student status)"]}
		/>
	);
}
