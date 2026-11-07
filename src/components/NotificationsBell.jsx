import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./StudentBits.jsx";
import { api, timeAgo } from "../lib/landlord.js";

/** Sidebar entry + dialog for GET /notifications. Each row opens its `link` (the web route the backend picked for this user). */
export default function NotificationsBell() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const q = useQuery({
		queryKey: ["notifications"],
		refetchInterval: 60_000,
		queryFn: async () => (await api.get("/notifications")).data
	});
	const read = useMutation({
		mutationFn: (id) => api.patch(`/notifications/${id}/read`),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] })
	});
	const list = q.data ?? [];
	const unread = list.filter((n) => !n.readAt).length;

	const go = (n) => {
		if (!n.readAt) read.mutate(n._id);
		setOpen(false);
		if (n.link?.startsWith("/")) navigate(n.link);
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex h-11 cursor-pointer items-center justify-between rounded-[10px] border border-sk-border bg-transparent px-3 text-sm text-sk-text2"
			>
				<span>Notifications</span>
				{unread > 0 && <span className="rounded-full bg-sk-accent px-2 py-0.5 text-xs font-bold text-sk-on-accent">{unread}</span>}
			</button>
			{open && (
				<Modal title="Notifications" onClose={() => setOpen(false)}>
					{list.length === 0 && <span className="text-sm text-sk-text2">Nothing new.</span>}
					<div className="flex flex-col">
						{list.map((n) => (
							<button
								key={n._id}
								type="button"
								onClick={() => go(n)}
								className="flex cursor-pointer flex-col gap-0.5 border-0 border-b border-solid border-sk-hair bg-transparent px-0 py-3 text-left text-sk-text"
							>
								<span className="flex items-center gap-2 text-sm font-semibold">
									{!n.readAt && <span aria-label="Unread" className="h-2 w-2 shrink-0 rounded-full bg-sk-accent" />}
									{n.title}
								</span>
								{n.body && <span className="text-[13px] text-sk-text2">{n.body}</span>}
								<span className="text-[12px] text-sk-muted">{timeAgo(n.createdAt)}</span>
							</button>
						))}
					</div>
				</Modal>
			)}
		</>
	);
}
