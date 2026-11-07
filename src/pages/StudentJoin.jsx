import { useEffect, useRef } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Loading, Page, PageHeader, btnPrimary } from "../components/sk.jsx";
import { api, errMessage } from "../lib/landlord.js";

/** /student/join/:id?invite=… : joins a housemate's application, then goes to My home. */
export default function StudentJoin() {
	const { id } = useParams();
	const [params] = useSearchParams();
	const invite = params.get("invite");
	const qc = useQueryClient();
	const started = useRef(false);
	const join = useMutation({
		mutationFn: () => api.patch(`/application/${id}/join`, null, { params: { invite } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["my-applications"] })
	});
	useEffect(() => {
		if (invite && !started.current) {
			started.current = true;
			join.mutate();
		}
	}, [invite]); // eslint-disable-line react-hooks/exhaustive-deps

	if (join.isSuccess) return <Navigate to="/student/home" replace />;
	const failed = !invite || join.isError;
	return (
		<Page>
			<PageHeader title="Join your household" />
			<Card title={failed ? "This invite didn't work" : "Joining…"}>
				{failed ? (
					<>
						<p className="text-sm text-sk-text2">{invite ? errMessage(join.error, "The link may have expired. Ask your housemate for a new one.") : "This link is missing its invite code. Ask your housemate for a new one."}</p>
						<Link to="/student/home" className={`${btnPrimary} self-start`}>Go to My home</Link>
					</>
				) : (
					<Loading label="Joining the application" />
				)}
			</Card>
		</Page>
	);
}
