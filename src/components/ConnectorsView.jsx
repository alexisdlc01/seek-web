import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, ErrorState, Loading, Page, btnSmGhost } from "./sk.jsx";
import { api, errMessage, timeAgo } from "../lib/landlord.js";

// Shared by the landlord (/connectors) and student (/student/connectors) pages.
// Live: mailbox connections, import settings and IMAP from /connectors.

const PROVIDER_STYLE = {
	GMAIL: { badge: "G", cls: "bg-white text-[#EA4335]" },
	OUTLOOK: { badge: "O", cls: "bg-[#0A64C8] text-white" },
	DEMO: { badge: "D", cls: "bg-sk-card2 text-sk-link" }
};

const RETURN_MESSAGES = {
	unavailable: "That provider isn't set up on this server.",
	denied: "Access was declined, so nothing was connected.",
	missing_code: "The provider didn't send back a code. Please try again.",
	invalid_state: "That sign-in expired. Please try again.",
	exchange_failed: "We couldn't finish connecting. Please try again."
};

function Matches({ id }) {
	const [open, setOpen] = useState(false);
	const q = useQuery({ queryKey: ["connector-matches", id], enabled: open, queryFn: async () => (await api.get(`/connectors/${id}/matches`)).data });
	return (
		<div className="flex flex-col gap-1.5">
			<button type="button" aria-expanded={open} className={`${btnSmGhost} self-start`} onClick={() => setOpen(!open)}>{open ? "Hide matched so far" : "Matched so far"}</button>
			{open && q.isLoading && <span className="text-[12.5px] text-sk-muted">Loading…</span>}
			{open && q.isError && <span role="alert" className="text-[12.5px] text-sk-warn">{errMessage(q.error)}</span>}
			{open && q.data && (q.data.length ? (
				<ul className="m-0 flex list-none flex-col gap-1 p-0 text-[12.5px]">
					{q.data.map((m) => <li key={m.email} className="truncate"><span className="font-semibold">{m.name}</span> <span className="text-sk-muted">{m.email}</span></li>)}
				</ul>
			) : <span className="text-[12.5px] text-sk-muted">No contacts matched yet.</span>)}
		</div>
	);
}

export default function ConnectorsView({ title, intro, scopeLabel, scopeHint, options, privacy, next }) {
	const qc = useQueryClient();
	const [params, setParams] = useSearchParams();
	const [notice, setNotice] = useState(null);
	const [busy, setBusy] = useState("");
	const [imap, setImap] = useState(null); // null = closed, else form values

	const q = useQuery({
		queryKey: ["connectors"],
		queryFn: async () => (await api.get("/connectors")).data
	});

	// Back from Google / Microsoft: ?connector=gmail&status=connected|error
	useEffect(() => {
		const status = params.get("status");
		const connector = params.get("connector");
		if (!status || !connector) return;
		setNotice(
			status === "connected"
				? { tone: "ok", text: `${connector.charAt(0).toUpperCase()}${connector.slice(1)} connected. Your first sync is running.` }
				: { tone: "warn", text: RETURN_MESSAGES[params.get("reason")] || "We couldn't connect that mailbox." }
		);
		qc.invalidateQueries({ queryKey: ["connectors"] });
		setParams({}, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const run = async (key, fn, okText) => {
		setBusy(key);
		setNotice(null);
		try {
			const res = await fn();
			if (okText) setNotice({ tone: "ok", text: typeof okText === "function" ? okText(res) : okText });
			await qc.invalidateQueries({ queryKey: ["connectors"] });
			qc.invalidateQueries({ queryKey: ["inbox-threads"] });
		} catch (e) {
			setNotice({ tone: "warn", text: errMessage(e) });
		} finally {
			setBusy("");
		}
	};

	const connectOAuth = (provider) =>
		run(`connect-${provider}`, async () => {
			const { data } = await api.get(`/connectors/${provider.toLowerCase()}/auth-url`, {
				params: { client: "web", returnTo: window.location.pathname }
			});
			window.location.assign(data.url);
		});

	const settings = q.data?.settings ?? { scope: "housing", autoFileAttachments: true };
	const saveSettings = (patch) => run("settings", () => api.patch("/connectors/settings", patch), "Saved.");
	const connectImap = (e) => {
		e.preventDefault();
		run("imap", () => api.post("/connectors/imap", { ...imap, port: Number(imap.port) }).then((r) => r.data), (r) => {
			setImap(null);
			return r.notice || `Connected. ${r.imported ?? 0} housing emails stored.`;
		});
	};
	const providers = q.data?.providers ?? [];
	const connections = q.data?.connections ?? [];
	const demo = providers.find((p) => p.provider === "DEMO");
	const oauth = providers.filter((p) => p.provider !== "DEMO");

	return (
		<Page className="max-w-[1100px]">
			<div className="flex flex-col gap-1.5">
				<h1 className="font-display text-2xl font-semibold md:text-[30px]">{title}</h1>
				<p className="max-w-[640px] text-[14.5px] leading-normal text-sk-muted">{intro}</p>
			</div>

			{notice && (
				<div role="status" className={`rounded-xl p-3 text-sm ${notice.tone === "ok" ? "bg-sk-ok-bg text-sk-ok" : "bg-sk-warn-bg text-sk-warn"}`}>
					{notice.text}
				</div>
			)}

			<section className="flex flex-col gap-3">
				<h2 className="font-display text-lg font-semibold">Email</h2>
				{q.isLoading && <Loading label="Loading connectors" />}
				{q.isError && <ErrorState error={q.error} onRetry={() => q.refetch()} />}
				{q.data && (
					<div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
						{connections.map((c) => {
							const st = PROVIDER_STYLE[c.provider] || PROVIDER_STYLE.DEMO;
							return (
								<article key={c.id} className="flex flex-col gap-3 rounded-2xl border-2 border-sk-accent bg-sk-card p-[18px]">
									<div className="flex items-center gap-3">
										<div className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-lg font-extrabold ${st.cls}`}>{st.badge}</div>
										<div className="flex min-w-0 flex-1 flex-col">
											<span className="text-[15px] font-semibold">{c.label}</span>
											<span className="truncate text-[12.5px] text-sk-muted">{c.emailAddress}</span>
										</div>
										<span className={`rounded-md px-2 py-[3px] text-xs font-semibold ${c.status === "CONNECTED" ? "bg-sk-ok-bg text-sk-ok" : "bg-sk-warn-bg text-sk-warn"}`}>
											{c.status === "CONNECTED" ? "Connected" : "Needs attention"}
										</span>
									</div>
									<span className="text-[13px] text-sk-text2">
										{c.lastSyncAt ? `Last sync ${timeAgo(c.lastSyncAt)}` : "Not synced yet"} · {c.emailCount} {c.emailCount === 1 ? "email" : "emails"} matched to {c.contactCount} {c.contactCount === 1 ? "contact" : "contacts"}
									</span>
									{c.lastError && <span className="text-[12.5px] text-sk-warn">{c.lastError}</span>}
									<Matches id={c.id} />
									<div className="flex gap-2">
										<button
											type="button"
											className={btnSmGhost}
											disabled={!!busy}
											onClick={() =>
												run(`sync-${c.id}`, () => api.post(`/connectors/${c.id}/sync`).then((r) => r.data), (r) =>
													`Synced. ${r?.scanned ?? 0} emails checked, ${r?.imported ?? 0} housing emails stored.`
												)
											}
										>
											{busy === `sync-${c.id}` ? "Syncing…" : "Sync now"}
										</button>
										<button
											type="button"
											className={`${btnSmGhost} !border-sk-danger-border !bg-transparent !text-sk-danger`}
											disabled={!!busy}
											onClick={() => {
												if (window.confirm(`Disconnect ${c.label}? Synced copies are deleted.`))
													run(`del-${c.id}`, () => api.delete(`/connectors/${c.id}`), "Disconnected.");
											}}
										>
											Disconnect
										</button>
									</div>
								</article>
							);
						})}

						{oauth.map((p) => {
							const st = PROVIDER_STYLE[p.provider];
							const already = connections.some((c) => c.provider === p.provider);
							if (already) return null;
							return (
								<article key={p.provider} className="flex flex-col gap-3 rounded-2xl border border-sk-border bg-sk-card p-[18px]">
									<div className="flex items-center gap-3">
										<div className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-lg font-extrabold ${st.cls}`}>{st.badge}</div>
										<div className="flex flex-1 flex-col">
											<span className="text-[15px] font-semibold">{p.label}</span>
											<span className="text-[12.5px] text-sk-muted">Read and reply from your own address</span>
										</div>
									</div>
									<span className="text-[13px] text-sk-text2">
										{p.available ? "Sign in to connect. Nothing is stored until the first sync." : "Not available yet."}
									</span>
									<button
										type="button"
										disabled={!p.available || !!busy}
										onClick={() => connectOAuth(p.provider)}
										className="h-11 cursor-pointer rounded-[10px] border-none bg-sk-accent text-[13.5px] font-bold text-sk-on-accent disabled:cursor-not-allowed disabled:opacity-50"
									>
										{busy === `connect-${p.provider}` ? "Opening…" : `Connect ${p.label}`}
									</button>
								</article>
							);
						})}

						<article className="flex flex-col gap-3 rounded-2xl border border-sk-border bg-sk-card p-[18px]">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sk-card2 text-sk-link">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
								</div>
								<div className="flex flex-1 flex-col">
									<span className="text-[15px] font-semibold">Other email (IMAP)</span>
									<span className="text-[12.5px] text-sk-muted">iCloud, Yahoo, your own domain</span>
								</div>
							</div>
							{imap ? (
								<form onSubmit={connectImap} className="flex flex-col gap-2">
									{[["host", "IMAP server", "imap.mail.me.com", "text"], ["port", "Port", "993", "number"], ["username", "Username", "you@example.com", "text"], ["appPassword", "App password", "From your email provider", "password"]].map(([k, label, ph, type]) => (
										<input key={k} aria-label={label} type={type} placeholder={label === "App password" ? ph : `${label} (${ph})`} required value={imap[k]} onChange={(e) => setImap({ ...imap, [k]: e.target.value })} autoComplete="off" className="h-10 rounded-[10px] border border-sk-border2 bg-sk-bg px-3 text-[13.5px] text-sk-text" />
									))}
									<span className="text-[12.5px] text-sk-muted">Use an app password, not your normal one. It is stored encrypted.</span>
									<div className="flex gap-2">
										<button type="submit" disabled={!!busy} className={btnSmGhost}>{busy === "imap" ? "Connecting…" : "Connect"}</button>
										<button type="button" className={btnSmGhost} onClick={() => setImap(null)}>Cancel</button>
									</div>
								</form>
							) : (
								<>
									<span className="text-[13px] text-sk-text2">Use an app password from your provider.</span>
									<button type="button" disabled={!!busy} onClick={() => setImap({ host: "", port: "993", username: "", appPassword: "" })} className="h-11 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent text-[13.5px] font-semibold text-sk-text disabled:opacity-50">
										Set up IMAP
									</button>
								</>
							)}
						</article>

						{demo?.available && !connections.some((c) => c.provider === "DEMO") && (
							<article className="flex flex-col gap-3 rounded-2xl border border-dashed border-sk-border2 bg-sk-card p-[18px]">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sk-card2 text-sk-link">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
									</div>
									<div className="flex flex-1 flex-col">
										<span className="text-[15px] font-semibold">Demo mailbox</span>
										<span className="text-[12.5px] text-sk-muted">Development only</span>
									</div>
								</div>
								<span className="text-[13px] text-sk-text2">Adds sample housing emails so you can try the inbox without a real account.</span>
								<button
									type="button"
									disabled={!!busy}
									onClick={() => run("demo", () => api.post("/connectors/demo"), "Demo mailbox connected.")}
									className="h-11 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent text-[13.5px] font-semibold text-sk-text disabled:opacity-50"
								>
									{busy === "demo" ? "Connecting…" : "Connect demo mailbox"}
								</button>
							</article>
						)}
					</div>
				)}
			</section>

			<div className="flex flex-wrap items-start gap-5">
				<Card title="What Seek reads" className="flex-[1.3_1_420px] !gap-3.5">
					<div role="radiogroup" aria-label="What Seek reads" className="flex flex-col gap-2">
						{[
							["housing", scopeLabel, scopeHint]
						].map(([v, label, hint]) => (
							<label
								key={v}
								className="flex flex-col gap-1 rounded-xl border-2 border-sk-accent bg-sk-card2 p-3"
							>
								<span className="flex items-center gap-2 text-sm font-semibold">
									<input type="radio" name="connector-scope" checked readOnly className="accent-[var(--sk-accent)]" />
									{label}
								</span>
								<span className="pl-6 text-[12.5px] text-sk-muted">{hint}</span>
							</label>
						))}
						<label className="flex cursor-pointer items-center gap-2 text-sm">
							<input type="checkbox" checked={settings.autoFileAttachments} disabled={!!busy} onChange={(e) => saveSettings({ autoFileAttachments: e.target.checked })} className="accent-[var(--sk-accent)]" />
							File leases, certificates and bills from attachments automatically
						</label>
						{options.map(([key, label]) => (
							<label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
								<input type="checkbox" checked={settings[key] ?? true} disabled={!!busy} onChange={(e) => saveSettings({ [key]: e.target.checked })} className="accent-[var(--sk-accent)]" />
								{label}
							</label>
						))}
					</div>
				</Card>

				<div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
					<Card title="Privacy" className="!gap-2.5">
						<ul className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] text-[13px] leading-snug text-sk-text2">
							{privacy.map((p) => <li key={p}>{p}</li>)}
						</ul>
					</Card>
					<Card title="Coming next">
						{next.map((n) => (
							<div key={n} className="flex items-center justify-between text-sm">
								<span>{n}</span>
								<span className="text-xs text-sk-muted">Soon</span>
							</div>
						))}
					</Card>
				</div>
			</div>
		</Page>
	);
}
