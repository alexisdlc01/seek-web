import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorState, Loading } from "../components/sk.jsx";
import { AdviceCard } from "../components/StudentBits.jsx";
import { api, errMessage } from "../lib/landlord.js";

const FILTERS = [
	["All", undefined],
	["Landlord", "LANDLORD"],
	["Bills", "BILLS"],
	["Household", "HOUSEHOLD"]
];

export default function StudentInbox() {
	const qc = useQueryClient();
	const [filter, setFilter] = useState("All");
	const [sel, setSel] = useState(null);
	const [text, setText] = useState("");
	const [via, setVia] = useState("seek");
	const [sendError, setSendError] = useState("");
	const category = FILTERS.find(([l]) => l === filter)?.[1];

	const threadsQ = useQuery({
		queryKey: ["inbox-threads", category ?? "ALL"],
		queryFn: async () => (await api.get("/inbox/threads", { params: category ? { category } : {} })).data
	});
	const threads = threadsQ.data ?? [];

	useEffect(() => {
		if (threads.length && !threads.some((t) => t.id === sel)) setSel(threads[0].id);
	}, [threads, sel]);

	const threadQ = useQuery({
		queryKey: ["inbox-thread", sel],
		enabled: !!sel,
		queryFn: async () => (await api.get(`/inbox/threads/${sel}`)).data
	});
	const cur = threadQ.data;
	const head = threads.find((t) => t.id === sel);

	const connectorsQ = useQuery({ queryKey: ["connectors"], queryFn: async () => (await api.get("/connectors")).data });
	const connected = (connectorsQ.data?.connections ?? []).find((c) => c.status === "CONNECTED");

	// Default the reply channel to what the thread supports; opening marks it read.
	useEffect(() => {
		if (!cur) return;
		setVia(cur.canReplyBySeek ? "seek" : "email");
		setSendError("");
		qc.invalidateQueries({ queryKey: ["inbox-threads"] });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cur?.id]);

	const reply = useMutation({
		mutationFn: async () => (await api.post(`/inbox/threads/${sel}/reply`, { text: text.trim(), via })).data,
		onSuccess: (data) => {
			setText("");
			setSendError("");
			qc.setQueryData(["inbox-thread", sel], data);
			qc.invalidateQueries({ queryKey: ["inbox-threads"] });
		},
		onError: (e) => setSendError(errMessage(e, "We couldn't send that message."))
	});

	const canReply = cur && (cur.canReplyBySeek || cur.canReplyByEmail);
	const replyFrom = cur?.replyFrom ?? connected?.emailAddress;

	return (
		<div className="flex min-h-full flex-wrap">
			<section aria-label="Conversations" className="flex flex-[1_1_340px] flex-col gap-3 border-sk-hair p-4 py-6 md:max-w-[380px] md:border-r">
				<h1 className="px-2 font-display text-2xl font-semibold">Inbox</h1>
				<Link to="/student/connectors" className="flex items-center justify-between rounded-xl bg-sk-tint px-3 py-2.5 text-[13px] text-sk-text2 no-underline">
					<span>{connected ? `${connected.label} connected · housing emails only` : "Connect your email · housing emails only"}</span>
					<span className="font-semibold text-sk-link">{connected ? "Manage" : "Connect"}</span>
				</Link>
				<div className="flex flex-wrap gap-1.5 px-1" role="group" aria-label="Filter conversations">
					{FILTERS.map(([f]) => (
						<button
							key={f}
							type="button"
							aria-pressed={filter === f}
							onClick={() => setFilter(f)}
							className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] ${
								filter === f ? "border-none bg-sk-accent font-semibold text-sk-on-accent" : "border border-sk-border2 bg-transparent text-sk-text"
							}`}
						>
							{f}
						</button>
					))}
				</div>
				{threadsQ.isLoading && <Loading label="Loading conversations" />}
				{threadsQ.isError && <ErrorState error={threadsQ.error} onRetry={() => threadsQ.refetch()} />}
				{!threadsQ.isLoading && !threadsQ.isError && threads.length === 0 && (
					<span className="px-2 text-sm text-sk-text2">No conversations here yet.</span>
				)}
				{threads.map((t) => (
					<button
						key={t.id}
						type="button"
						onClick={() => setSel(t.id)}
						aria-current={t.id === sel}
						className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border-none p-3 ${t.id === sel ? "bg-sk-card shadow-[inset_3px_0_0_var(--sk-accent)]" : "bg-transparent"}`}
					>
						<span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sk-card2 text-[13px] font-bold text-sk-link">{t.initials}</span>
						<span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
							<span className="flex justify-between gap-2">
								<span className={`text-sm text-sk-text ${t.unread ? "font-bold" : "font-semibold"}`}>{t.name}</span>
								<span className="shrink-0 text-xs text-sk-muted">{t.timeLabel}</span>
							</span>
							<span className="text-xs text-sk-link">{t.via}</span>
							<span className="truncate text-[13px] text-sk-muted">{t.preview}</span>
						</span>
						{t.unreadCount > 0 && <span className="mt-1 rounded-full bg-sk-accent px-1.5 text-[11px] font-bold text-sk-on-accent">{t.unreadCount}</span>}
					</button>
				))}
			</section>

			<div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4 p-4 md:px-8 md:py-6">
				{!sel && !threadsQ.isLoading && <span className="text-sm text-sk-text2">Pick a conversation.</span>}
				{sel && (
					<>
						<div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-sk-hair pb-3.5">
							<div className="flex flex-col gap-0.5">
								<h2 className="font-display text-xl font-semibold">{cur?.name ?? head?.name}</h2>
								<span className="text-[13px] text-sk-muted">{cur?.sub ?? head?.sub}</span>
							</div>
							{replyFrom && <span className="rounded-lg bg-sk-hair px-2.5 py-1.5 text-[12.5px] text-sk-text2">Replies go out from {replyFrom}</span>}
						</div>

						{threadQ.isLoading && <Loading label="Loading conversation" />}
						{threadQ.isError && <ErrorState error={threadQ.error} onRetry={() => threadQ.refetch()} />}
						<div className="flex flex-1 flex-col gap-3.5">
							{(cur?.messages ?? []).map((m) => (
								<div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
									<div className={`flex max-w-[560px] flex-col gap-1.5 rounded-2xl px-3.5 py-3 ${m.me ? "bg-sk-accent text-sk-on-accent" : "border border-sk-border bg-sk-card text-sk-text"}`}>
										<span className={`text-xs ${m.me ? "" : "text-sk-muted"}`}>
											{m.me ? "You" : m.from} · {m.via} · {m.timeLabel}
										</span>
										{m.subject && <span className="text-[13px] font-semibold">{m.subject}</span>}
										<span className="whitespace-pre-line text-sm leading-normal">{m.text}</span>
										{(m.attachments ?? []).map((a) =>
											a.url ? (
												<a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="self-start rounded-lg bg-sk-tint px-2.5 py-1.5 text-[12.5px] font-semibold text-sk-link no-underline">
													{a.name}{a.filedAs ? ` · saved to ${a.filedAs}` : ""}
												</a>
											) : (
												<span key={a.name} className="self-start rounded-lg bg-sk-tint px-2.5 py-1.5 text-[12.5px] font-semibold text-sk-link">
													{a.name}{a.filedAs ? ` · saved to ${a.filedAs}` : ""}
												</span>
											)
										)}
									</div>
								</div>
							))}
						</div>

						<AdviceCard key={sel} topic="inbox" threadId={sel} />

						{cur && !canReply && <span className="text-[13px] text-sk-muted">This conversation is read-only.</span>}
						{canReply && (
							<form
								className="flex flex-col gap-2"
								onSubmit={(e) => {
									e.preventDefault();
									if (text.trim()) reply.mutate();
								}}
							>
								{cur.canReplyBySeek && cur.canReplyByEmail && (
									<div className="flex flex-wrap gap-1.5 text-[13px]" role="radiogroup" aria-label="Send as">
										{[
											["seek", "Seek message"],
											["email", replyFrom ? `Email from ${replyFrom}` : "Email"]
										].map(([v, label]) => (
											<button
												key={v}
												type="button"
												role="radio"
												aria-checked={via === v}
												onClick={() => setVia(v)}
												className={`cursor-pointer rounded-full px-3 py-1.5 ${via === v ? "border-none bg-sk-accent font-semibold text-sk-on-accent" : "border border-sk-border2 bg-transparent text-sk-text"}`}
											>
												{label}
											</button>
										))}
									</div>
								)}
								<div className="flex gap-2.5">
									<label htmlFor="student-reply" className="sr-only">Write a reply</label>
									<input
										id="student-reply"
										value={text}
										onChange={(e) => setText(e.target.value)}
										placeholder="Write a reply…"
										className="h-12 min-w-0 flex-1 rounded-xl border border-sk-border2 bg-sk-card px-3.5 text-sm text-sk-text"
									/>
									<button type="submit" disabled={reply.isPending || !text.trim()} className="h-12 cursor-pointer rounded-xl border-none bg-sk-accent px-[18px] text-sm font-semibold text-sk-on-accent disabled:opacity-60">
										{reply.isPending ? "Sending…" : "Send"}
									</button>
								</div>
								{sendError && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{sendError}</div>}
							</form>
						)}
					</>
				)}
			</div>
		</div>
	);
}
