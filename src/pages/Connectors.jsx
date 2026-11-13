import ConnectorsView from "../components/ConnectorsView.jsx";

export default function Connectors() {
	return (
		<ConnectorsView
			title="Connectors"
			intro="Connect your mailbox once. Every email with your tenants and applicants shows up in your Seek inbox, and replies go out from your own address. Students get the same page in the app."
			scopeLabel="Only my Seek contacts"
			scopeHint="Tenants, applicants, guarantors and deposit schemes linked to your properties."
			options={[
				["copySignedContracts", "Copy signed contracts to the tenant's app"]
			]}
			privacy={[
				"Other emails are never opened or stored.",
				"Tenants only see emails they were part of.",
				"Disconnect any time. Synced copies are deleted within 30 days."
			]}
			next={["Google / Outlook calendar (viewings)", "DocuSign (contracts)", "Accounting export (Xero)"]}
		/>
	);
}
