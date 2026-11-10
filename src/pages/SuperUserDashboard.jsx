import React, { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toast } from "primereact/toast";
import ListingsDataTable from "../components/ListingsDataTable.jsx";
import { Card, Empty, ErrorState, Loading, Table, Tr, btnSmGhost, btnSmPrimary } from "../components/sk.jsx";
import { errMessage, fmtDate } from "../lib/landlord.js";
import { usersControllerListPendingDocumentsOptions, usersControllerListPendingDocumentsQueryKey, usersControllerSetDocumentStatusMutation } from "../client/@tanstack/react-query.gen";

const DocumentsToVerify = () => {
	const toast = useRef(null);
	const qc = useQueryClient();
	const q = useQuery(usersControllerListPendingDocumentsOptions());
	const review = useMutation({
		...usersControllerSetDocumentStatusMutation(),
		onSuccess: () => qc.invalidateQueries({ queryKey: usersControllerListPendingDocumentsQueryKey() }),
		onError: err => toast.current?.show({ severity: "error", summary: "Could not save", detail: errMessage(err), life: 5000 })
	});
	const decide = (d, status) => review.mutate({ path: { id: d.userId, type: d.type }, body: { status } });

	return (
		<Card title="Documents to verify" className="m-4 md:m-8">
			<Toast ref={toast} />
			{q.isLoading && <Loading label="Loading documents" />}
			{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
			{q.data && (q.data.length === 0 ? (
				<Empty title="Nothing to verify" />
			) : (
				<Table head={["Name", "Email", "Type", "Uploaded", "File", "Action"]} minWidth={760}>
					{q.data.map(d => (
						<Tr key={`${d.userId}-${d.type}`}>
							<td>{d.name ?? "-"}</td>
							<td>{d.email}</td>
							<td>{d.type}</td>
							<td>{fmtDate(d.uploadedAt)}</td>
							<td>
								{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className={btnSmGhost}>Open</a> : "No file"}
							</td>
							<td>
								<div className="flex gap-2">
									<button type="button" className={btnSmPrimary} disabled={review.isPending} onClick={() => decide(d, "VERIFIED")}>Verify</button>
									<button type="button" className={btnSmGhost} disabled={review.isPending} onClick={() => decide(d, "REJECTED")}>Reject</button>
								</div>
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
		<DocumentsToVerify />
		<ListingsDataTable />
		</>
	)
};

export default SuperUserDashboard;
