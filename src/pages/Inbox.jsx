import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Empty, ErrorState, Loading } from "../components/sk.jsx";
import RepairsPanel from "../components/RepairsPanel.jsx";
import { api, errMessage, openAttachment, timeAgo } from "../lib/landlord.js";

const FILTERS = [
	["All", null],
	["Tenants", "TENANT"],
	["Applicants", "APPLICANT"],
	["Bills", "BILLS"],
	["Deposits", "DEPOSIT"],
	["Unread", "UNREAD"]
];

const CHANNEL = { seek: "Seek", email: "Email" };

export default function Inbox() {
	const qc = useQueryClient();
	const [filter, setFilter] = useState("All");
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const [sendAs, setSendAs] = useState("seek");
	const [text, setText] = useState("");
	const [sendError, setSendError] = useState("");

	// /inbox?tenancy=<id> opens that tenancy's thread (Rent, Dashboard).
	const [params] = useSearchParams();
	const wantedTenancy = params.get("tenancy");

	const category = FILTERS.find(([l]) => l === filter)?.[1];
	const serverCategory = category && category !== "UNREAD" ? category : undefined;

	const threads = useQuery({
		queryKey: ["inbox-threads", serverCategory ?? "ALL"],
		queryFn: async () =>
			(await api.get("/inbox/threads", { params: serverCategory ? { category: serverCategory } : {} })).data
	});

	const visible = useMemo(() => {
		const needle = search.trim().toLowerCase();
		return (threads.data ?? []).filter((t) => {
			if (category === "UNREAD" && !t.unread) return false;
			if (!needle) return true;
			return `${t.name} ${t.sub} ${t.preview}`.toLowerCase().includes(needle);
		});
	}, [threads.data, category, search]);

	// Keep a valid selection as the list changes.
	useEffect(() => {
		if (!visible.length) return;
		if (!visible.some((t) => t.id === selectedId)) {
			const wanted = wantedTenancy && visible.find((t) => t.tenancyId === wantedTenancy);
			setSelectedId((wanted || visible[0]).id);
		}
	}, [visible, selectedId, wantedTenancy]);

	const thread = useQuery({
		queryKey: ["inbox-thread", selectedId],
		enabled: !!selectedId,
		queryFn: async () => (await api.get(`/inbox/threads/${selectedId}`)).data
	});
	const t = thread.data;

	const advice = useQuery({
		queryKey: ["inbox-advice", selectedId],
		enabled: !!selectedId,
		staleTime: 60_000,
		retry: false,
		queryFn: async () => (await api.post("/ai/advice", { topic: "inbox", threadId: selectedId })).data
	});

	const connectors = useQuery({
		queryKey: ["connectors"],
		queryFn: async () => (await api.get("/connectors")).data
	});
	const latestSync = (connectors.data?.connections ?? [])
		.map((c) => c.lastSyncAt)
		.filter(Boolean)
		.sort()
		.pop();
	const connected = (connectors.data?.connections ?? []).find((c) => c.status === "CONNECTED");

	// Default the "send as" choice to what the thread supports.
	useEffect(() => {
		if (!t) return;
		setSendAs(t.canReplyBySeek ? "seek" : "email");
		setSendError("");
	}, [t?.id, t?.canReplyBySeek]);

	const reply = useMutation({
		mutationFn: async () =>
			(await api.post(`/inbox/threads/${selectedId}/reply`, { text: text.trim(), via: sendAs })).data,
		onSuccess: (data) => {
			setText("");
			setSendError("");
			qc.setQueryData(["inbox-thread", selectedId], data);
			qc.invalidateQueries({ queryKey: ["inbox-threads"] });
		},
		onError: (e) => setSendError(errMessage(e, "We couldn't send that message."))
	});

	// Opening a thread marks it read; refresh the list badge once.
	useEffect(() => {
		if (t) qc.invalidateQueries({ queryKey: ["inbox-threads"] });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [t?.id]);

	const options = [];
	if (t?.canReplyBySeek) options.push(["seek", "Seek message"]);
	if (t?.canReplyByEmail) options.push(["email", t.replyFrom ? `Email from ${t.replyFrom}` : "Email"]);

	const receiveOnly = !!t?.canReplyBySeek && !t?.canReplyByEmail && connected?.canSend === false;

	return (
		<div className="flex flex-col gap-5 p-4 md:p-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col gap-1">
					<span className="text-sm text-sk-muted">Seek messages and email, in one place</span>
					<h1 className="font-display text-2xl font-semibold md:text-[30px]">Inbox</h1>
				</div>
				<Link to="/connectors" className="flex h-11 items-center gap-2 rounded-xl bg-sk-tint px-3.5 text-[13.5px] font-semibold text-sk-link no-underline">
					<span className={`h-2 w-2 rounded ${connected ? "bg-sk-ok" : "bg-sk-muted"}`} />
					{connected
						? `${connected.label} synced ${latestSync ? timeAgo(latestSync) : "never"}`
						: "Connect your email"}
				</Link>
			</div>

			<div className="flex flex-wrap items-stretch gap-5">
				<section aria-label="Conversations" className="flex min-w-0 flex-[1_1_300px] flex-col overflow-hidden rounded-2xl border border-sk-border bg-sk-card">
					<div className="flex gap-2 border-b border-sk-hair p-3.5">
						<label htmlFor="inbox-q" className="sr-only">Search conversations</label>
						<input
							id="inbox-q"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search tenants, properties, emails"
							className="h-10 min-w-0 flex-1 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text"
						/>
					</div>
					<div className="flex flex-wrap gap-1.5 px-3.5 py-2.5 text-[12.5px]" role="group" aria-label="Filter conversations">
						{FILTERS.map(([f]) => (
							<button
								key={f}
								type="button"
								aria-pressed={filter === f}
								onClick={() => setFilter(f)}
								className={`cursor-pointer rounded-full border-none px-3 py-1.5 ${filter === f ? "bg-sk-accent font-semibold text-sk-on-accent" : "bg-sk-hair text-sk-text2"}`}
							>
								{f}
							</button>
						))}
					</div>
					<div className="flex flex-col">
						{threads.isLoading && <div className="px-3.5"><Loading label="Loading conversations" /></div>}
						{threads.isError && <div className="p-3.5"><ErrorState error={threads.error} onRetry={() => threads.refetch()} /></div>}
						{threads.data && visible.length === 0 && (
							<div className="p-3.5">
								<Empty title="No conversations here">
									{search || filter !== "All" ? "Try another filter." : "Messages from tenants and applicants, and housing email, appear here."}
								</Empty>
							</div>
						)}
						{visible.map((c) => (
							<button
								key={c.id}
								type="button"
								onClick={() => setSelectedId(c.id)}
								aria-current={c.id === selectedId}
								className={`flex cursor-pointer flex-col gap-1 border-x-0 border-b-0 border-t border-solid border-sk-hair bg-transparent px-3.5 py-3 text-left text-sk-text first:border-t-0 ${c.id === selectedId ? "border-l-[3px] border-l-sk-accent bg-sk-card2" : ""}`}
							>
								<div className="flex justify-between gap-2 text-sm">
									<span className={c.unread ? "font-bold" : "font-semibold"}>{c.name}</span>
									<span className="shrink-0 text-xs text-sk-muted">{c.timeLabel}</span>
								</div>
								<span className="line-clamp-2 text-[13px] text-sk-text2">{c.preview}</span>
								<div className="flex flex-wrap gap-1.5 text-[11.5px]">
									{c.channels.map((ch) => (
										<span key={ch} className="rounded-md bg-sk-hair px-1.5 py-0.5 text-sk-muted">{CHANNEL[ch] ?? ch}</span>
									))}
									{c.unreadCount > 0 && (
										<span className="rounded-md bg-sk-warn-bg px-1.5 py-0.5 text-sk-warn">{c.unreadCount} unread</span>
									)}
								</div>
							</button>
						))}
					</div>
				</section>

				<section aria-label="Conversation" className="flex min-w-0 flex-[2_1_480px] flex-col overflow-hidden rounded-2xl border border-sk-border bg-sk-card">
					{!selectedId && (
						<div className="p-[18px]"><Empty title="Select a conversation">Pick a thread on the left to read and reply.</Empty></div>
					)}
					{selectedId && thread.isLoading && <div className="p-[18px]"><Loading label="Loading messages" /></div>}
					{selectedId && thread.isError && <div className="p-[18px]"><ErrorState error={thread.error} onRetry={() => thread.refetch()} /></div>}
					{t && (
						<>
							<div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-sk-hair px-[18px] py-3.5">
								<div className="flex flex-col gap-0.5">
									<h2 className="font-display text-[17px] font-semibold">{t.name}</h2>
									<span className="text-[12.5px] text-sk-muted">{t.sub}</span>
								</div>
								<div className="flex gap-2">
									{t.tenancyId && (
										<Link to={`/contracts?tenancy=${t.tenancyId}`} className="inline-flex h-10 items-center rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text no-underline">
											Open tenancy
										</Link>
									)}
								</div>
							</div>

							<div className="flex flex-1 flex-col gap-3.5 p-[18px]">
								{t.messages.length === 0 && <Empty title="No messages yet">Say hello below.</Empty>}
								{t.messages.map((m) => (
									<div
										key={m.id}
										className={`flex max-w-[460px] flex-col gap-2 p-3 ${m.me ? "self-end rounded-[14px_14px_4px_14px] border border-sk-border bg-sk-card2" : "self-start rounded-[14px_14px_14px_4px] bg-sk-bg"}`}
									>
										<div className="flex justify-between gap-3 text-[11.5px] text-sk-muted">
											<span className="font-semibold">{m.me ? "You" : m.from} · {m.via}{m.subject ? ` · ${m.subject}` : ""}</span>
											<span>{m.timeLabel}</span>
										</div>
										<p className="whitespace-pre-wrap text-[13.5px] leading-normal">{m.text}</p>
										{(m.attachments ?? []).map((a) => (
											<div key={a.name} className="flex items-center gap-2.5 rounded-[10px] bg-sk-bg px-2.5 py-2 text-[13px]">
												{a.key || a.url ? (
													<button type="button" onClick={() => openAttachment(a).catch((e) => setSendError(errMessage(e, "We couldn't open this file.")))} className="flex-1 cursor-pointer border-none bg-transparent p-0 text-left text-[13px] font-semibold text-sk-text">{a.name}</button>
												) : (
													<span className="flex-1 font-semibold text-sk-text">{a.name}</span>
												)}
												{a.filedAs && <span className="text-xs font-semibold text-sk-ok">Filed to {a.filedAs}</span>}
											</div>
										))}
									</div>
								))}

								{advice.isLoading && <Loading label="Loading tips" />}
								{t.tenancyId && <RepairsPanel tenancyId={t.tenancyId} />}

								{advice.data && (
									<div className="flex flex-wrap items-center gap-2.5 self-stretch rounded-xl border border-sk-accent/40 bg-sk-tint p-3" data-testid="ai-advice">
										<span className="flex-[1_1_260px] text-[13px] text-sk-text2">
											<strong className="text-sk-link">{advice.data.source === "ai" ? "Seek AI" : "Seek tips"} · {advice.data.title}</strong>
											<br />
											{advice.data.advice}
										</span>
										{advice.data.suggestedReply && (
											<button
												type="button"
												onClick={() => setText(advice.data.suggestedReply)}
												className="inline-flex h-10 cursor-pointer items-center rounded-[10px] border-none bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent"
											>
												Use reply
											</button>
										)}
										{(advice.data.actions ?? []).map((a) =>
											a.link.startsWith("/") ? (
												<Link key={a.label} to={a.link} className="inline-flex h-10 items-center rounded-[10px] bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent no-underline">{a.label}</Link>
											) : (
												<a key={a.label} href={a.link} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-[10px] bg-sk-accent px-3 text-[13px] font-semibold text-sk-on-accent no-underline">{a.label}</a>
											)
										)}
									</div>
								)}
							</div>

							<form
								className="flex flex-col gap-2.5 border-t border-sk-hair px-[18px] pb-[18px] pt-3"
								onSubmit={(e) => {
									e.preventDefault();
									if (text.trim() && !reply.isPending) reply.mutate();
								}}
							>
								{(options.length > 1 || receiveOnly) && (
									<div role="radiogroup" aria-label="Send as" className="flex flex-wrap gap-1.5 text-[12.5px]">
										{options.map(([v, l]) => (
											<button
												key={v}
												type="button"
												role="radio"
												aria-checked={sendAs === v}
												onClick={() => setSendAs(v)}
												className={`h-[34px] cursor-pointer rounded-full px-3 ${sendAs === v ? "border-none bg-sk-accent font-semibold text-sk-on-accent" : "border border-sk-border2 bg-transparent text-sk-text"}`}
											>
												{l}
											</button>
										))}
										{receiveOnly && (
											<button type="button" disabled title="This mailbox can receive only" className="h-[34px] cursor-not-allowed rounded-full border border-sk-border2 bg-transparent px-3 text-sk-muted opacity-60">
												Email
											</button>
										)}
									</div>
								)}
								{options.length === 0 && (
									<span className="text-[12.5px] text-sk-muted">{connected?.canSend === false ? "This mailbox can only receive. Reply from your mail app." : "You can't reply to this thread. Connect a mailbox to reply by email."}</span>
								)}
								{sendError && <span role="alert" className="text-[12.5px] text-sk-warn">{sendError}</span>}
								<div className="flex gap-2">
									<label htmlFor="inbox-reply" className="sr-only">Reply</label>
									<input
										id="inbox-reply"
										value={text}
										onChange={(e) => setText(e.target.value)}
										disabled={options.length === 0}
										placeholder={`Reply to ${t.name}…`}
										className="h-[46px] min-w-0 flex-1 rounded-xl border border-sk-border2 bg-sk-bg px-3.5 text-sm text-sk-text"
									/>
									<button
										type="submit"
										disabled={!text.trim() || reply.isPending || options.length === 0}
										className="h-[46px] cursor-pointer rounded-xl border-none bg-sk-accent px-[18px] text-sm font-bold text-sk-on-accent disabled:cursor-not-allowed disabled:opacity-50"
									>
										{reply.isPending ? "Sending…" : "Send"}
									</button>
								</div>
							</form>
						</>
					)}
				</section>
			</div>
		</div>
	);
}
