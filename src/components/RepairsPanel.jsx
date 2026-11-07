import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, btnSmGhost, btnSmPrimary } from "./sk.jsx";
import { api, errMessage, fmtDateTime } from "../lib/landlord.js";

export const useLandlordRepairs = () =>
	useQuery({
		queryKey: ["landlord-repairs"],
		queryFn: async () => (await api.get("/repairs/landlord")).data
	});

const STATUS = {
	OPEN: { tone: "warn", label: "Open" },
	SCHEDULED: { tone: "accent", label: "Booked" },
	FIXED: { tone: "ok", label: "Fixed" }
};

// Repairs the tenants reported for one tenancy: book an engineer or close them.
export default function RepairsPanel({ tenancyId }) {
	const qc = useQueryClient();
	const repairs = useLandlordRepairs();
	const [when, setWhen] = useState({});
	const [error, setError] = useState("");

	const update = useMutation({
		mutationFn: async ({ id, status, scheduledFor }) =>
			(await api.patch(`/repairs/${id}`, { status, ...(scheduledFor ? { scheduledFor } : {}) })).data,
		onSuccess: () => {
			setError("");
			qc.invalidateQueries({ queryKey: ["landlord-repairs"] });
			qc.invalidateQueries({ queryKey: ["landlord-overview"] });
		},
		onError: (e) => setError(errMessage(e, "We couldn't update that repair."))
	});

	const [logging, setLogging] = useState(false);
	const [draft, setDraft] = useState({ title: "", description: "" });
	const log = useMutation({
		mutationFn: async () =>
			(await api.post("/repairs", { tenancy: tenancyId, title: draft.title.trim(), ...(draft.description.trim() ? { description: draft.description.trim() } : {}) })).data,
		onSuccess: () => {
			setError("");
			setLogging(false);
			setDraft({ title: "", description: "" });
			qc.invalidateQueries({ queryKey: ["landlord-repairs"] });
			qc.invalidateQueries({ queryKey: ["landlord-overview"] });
		},
		onError: (e) => setError(errMessage(e, "We couldn't log that repair."))
	});

	const mine = (repairs.data ?? []).filter((r) => (r.tenancy?._id ?? r.tenancy) === tenancyId);

	return (
		<div className="flex flex-col gap-2 rounded-xl border border-sk-border bg-sk-card2 p-3" data-testid="repairs-panel">
			<div className="flex items-center justify-between gap-2">
				<span className="text-[13px] font-semibold">Repairs for this home</span>
				{!logging && <button type="button" className={btnSmGhost} onClick={() => setLogging(true)}>Log repair</button>}
			</div>
			{logging && (
				<form
					className="flex flex-col gap-2"
					onSubmit={(e) => { e.preventDefault(); log.mutate(); }}
				>
					<input
						aria-label="Repair title"
						value={draft.title}
						onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
						minLength={3}
						maxLength={120}
						required
						placeholder="e.g. Boiler not heating water"
						className="h-9 rounded-lg border border-sk-border2 bg-sk-bg px-2 text-[13px] text-sk-text"
					/>
					<textarea
						aria-label="Repair description"
						value={draft.description}
						onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
						maxLength={2000}
						rows={2}
						placeholder="Details (optional)"
						className="rounded-lg border border-sk-border2 bg-sk-bg p-2 text-[13px] text-sk-text"
					/>
					<div className="flex gap-2">
						<button type="submit" className={btnSmPrimary} disabled={draft.title.trim().length < 3 || log.isPending}>Log repair</button>
						<button type="button" className={btnSmGhost} onClick={() => setLogging(false)}>Cancel</button>
					</div>
				</form>
			)}
			{mine.length === 0 && !logging && <span className="text-[12.5px] text-sk-muted">No repairs logged for this home.</span>}
			{error && <span role="alert" className="text-[12.5px] text-sk-warn">{error}</span>}
			{mine.map((r) => {
				const st = STATUS[r.status] ?? STATUS.OPEN;
				const value = when[r._id] ?? "";
				return (
					<div key={r._id} className="flex flex-wrap items-center gap-2 border-t border-sk-hair pt-2 text-[13px]">
						<div className="flex min-w-0 flex-[1_1_200px] flex-col">
							<span className="font-semibold">{r.title}</span>
							<span className="text-[12px] text-sk-muted">
								{r.reportedBy?.name ? `${r.reportedBy.name} · ` : ""}
								{r.status === "SCHEDULED" && r.scheduledFor ? `Booked ${fmtDateTime(r.scheduledFor)}` : fmtDateTime(r.createdAt)}
							</span>
						</div>
						<Chip tone={st.tone}>{st.label}</Chip>
						{r.status !== "FIXED" && (
							<>
								<label className="sr-only" htmlFor={`rep-${r._id}`}>Visit date and time</label>
								<input
									id={`rep-${r._id}`}
									type="datetime-local"
									value={value}
									onChange={(e) => setWhen((w) => ({ ...w, [r._id]: e.target.value }))}
									className="h-9 rounded-lg border border-sk-border2 bg-sk-bg px-2 text-[12.5px] text-sk-text"
								/>
								<button
									type="button"
									className={btnSmGhost}
									disabled={!value || update.isPending}
									onClick={() => update.mutate({ id: r._id, status: "SCHEDULED", scheduledFor: new Date(value).toISOString() })}
								>
									Book in
								</button>
								<button
									type="button"
									className={btnSmPrimary}
									disabled={update.isPending}
									onClick={() => update.mutate({ id: r._id, status: "FIXED" })}
								>
									Mark fixed
								</button>
							</>
						)}
					</div>
				);
			})}
		</div>
	);
}
