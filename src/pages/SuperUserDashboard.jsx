import React, { useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import ListingsDataTable from "../components/ListingsDataTable.jsx";
import { Card, Empty, ErrorState, Loading, Table, Tr, btnSmGhost } from "../components/sk.jsx";
import { errMessage, fmtDate } from "../lib/landlord.js";
import { flagsControllerGetAllOptions, flagsControllerLiftSuspensionMutation, usersControllerListPendingDocumentsOptions } from "../client/@tanstack/react-query.gen";

// Identity documents are never checked by Seek: the landlord checks them.
const LANDLORD_CHECKED = ["PASSPORT", "IDENTIFICATION", "VISA", "RIGHT_TO_RENT"];

// Monitoring only: documents are checked automatically, nobody verifies or rejects them here.
const DocumentsLog = () => {
	const q = useQuery(usersControllerListPendingDocumentsOptions());

	return (
		<Card title="Automatic checks - documents" className="m-4 md:m-8">
			{q.isLoading && <Loading label="Loading documents" />}
			{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
			{q.data && (q.data.length === 0 ? (
				<Empty title="No recent documents" />
			) : (
				<Table head={["Name", "Email", "Type", "Uploaded", "Status", "File"]} minWidth={760}>
					{q.data.map(d => (
						<Tr key={`${d.userId}-${d.type}`}>
							<td>{d.name ?? "-"}</td>
							<td>{d.email}</td>
							<td>{d.type}</td>
							<td>{fmtDate(d.uploadedAt)}</td>
							<td>{LANDLORD_CHECKED.includes(d.type) ? "Provided — landlord checks" : "Waiting for the automatic check"}</td>
							<td>
								{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className={btnSmGhost}>Open</a> : "No file"}
							</td>
						</Tr>
					))}
				</Table>
			))}
		</Card>
	);
};

const FlagsLog = () => {
	const toast = useRef(null);
	const q = useQuery(flagsControllerGetAllOptions());
	const rows = Array.isArray(q.data) ? q.data : [];
	// Upholding an appeal is the one decision left to a person; listings still need a new automatic check.
	const lift = useMutation({
		...flagsControllerLiftSuspensionMutation(),
		onSuccess: () => toast.current?.show({ severity: "success", summary: "Suspension lifted", life: 4000 }),
		onError: err => toast.current?.show({ severity: "error", summary: "Could not lift", detail: errMessage(err), life: 5000 })
	});
	return (
		<Card title="Automatic checks - flags" className="m-4 md:m-8">
			<Toast ref={toast} />
			{q.isLoading && <Loading label="Loading flags" />}
			{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
			{q.data && (rows.length === 0 ? (
				<Empty title="No flags" />
			) : (
				<Table head={["Category", "Status", "Triage", "Summary", "Created", "Appeal"]} minWidth={760}>
					{rows.map(f => (
						<Tr key={f._id}>
							<td>{f.category ?? "-"}</td>
							<td>{f.status}</td>
							<td>{f.triage ? `${f.triage.category} / ${f.triage.severity}` : "-"}</td>
							<td>{f.triage?.summary || f.supportResponse || "-"}</td>
							<td>{fmtDate(f.createdAt)}</td>
							<td>
								{f.status === "ACCOUNT_SUSPENDED" && (
									<button type="button" className={btnSmGhost} disabled={lift.isPending} onClick={() => lift.mutate({ path: { userId: String(f.reportedUser) } })}>Lift suspension</button>
								)}
							</td>
						</Tr>
					))}
				</Table>
			))}
		</Card>
	);
};

const SuperUserDashboard = () => {
	return (
		<>
		<DocumentsLog />
		<FlagsLog />
		<ListingsDataTable />
		</>
	)
};

export default SuperUserDashboard;
