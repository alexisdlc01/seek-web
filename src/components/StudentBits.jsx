import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errMessage } from "../lib/landlord.js";
import { studentLink } from "../lib/student.js";

/**
 * Seek tips card (POST /ai/advice). topic: deposit | bills | contract |
 * guarantor | inbox | rent. Renders nothing until there is something to say.
 */
export function AdviceCard({ topic, tenancyId = undefined, applicationId = undefined, threadId = undefined, className = "", showActions = true, askable = false }) {
	const [draft, setDraft] = useState("");
	const [asked, setAsked] = useState(null);
	const [noAnswer, setNoAnswer] = useState(false);
	const q = useQuery({
		queryKey: ["ai-advice", topic, tenancyId ?? null, applicationId ?? null, threadId ?? null],
		staleTime: 5 * 60_000,
		retry: false,
		queryFn: async () => (await api.post("/ai/advice", { topic, tenancyId, applicationId, threadId }, { timeout: 15_000 })).data
	});

	const ask = useMutation({
		mutationFn: async (question) => (await api.post("/ai/advice", { topic, tenancyId, question }, { timeout: 30_000 })).data,
		onSuccess: (d) => {
			// Not an AI answer: the card is the generic one, so say so instead of showing it as the reply.
			if (d.source !== "ai") return setNoAnswer(true);
			setNoAnswer(false);
			setAsked(d);
			setDraft("");
		}
	});
	const send = (e) => {
		e.preventDefault();
		const question = draft.trim();
		if (question && !ask.isPending) ask.mutate(question);
	};

	if (q.isLoading)
		return (
			<div role="status" className={`flex items-center gap-2.5 rounded-xl bg-sk-card2 p-3 text-[13px] text-sk-muted ${className}`}>
				<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sk-border2 border-t-sk-accent" />
				Loading tips…
			</div>
		);
	if (!q.data) return null;
	const a = asked ?? q.data;
	return (
		<div className={`flex flex-col gap-2 rounded-xl bg-sk-card2 p-3 ${className}`} data-testid={`ai-advice-${topic}`}>
			<div className="flex items-start gap-2.5">
				<span className="shrink-0 pt-px text-xs font-bold text-sk-link">{a.source === "ai" ? "Seek AI" : "Seek tips"}</span>
				<span className="flex flex-col gap-1 text-[13.5px] leading-snug text-sk-text2">
					<strong className="text-sk-text">{a.title}</strong>
					<span className="whitespace-pre-line">{a.advice}</span>
				</span>
			</div>
			{askable && a.source === "ai" && (
				<form onSubmit={send} className="flex gap-2">
					<input
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						maxLength={500}
						disabled={ask.isPending}
						aria-label="Ask about your deposit"
						placeholder="e.g. Can my landlord keep part of it?"
						className="h-10 min-w-0 flex-1 rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] text-sk-text"
					/>
					<button type="submit" disabled={ask.isPending || !draft.trim()} className="h-10 cursor-pointer rounded-[10px] border border-sk-border2 bg-transparent px-3 text-[13px] font-semibold text-sk-text disabled:cursor-default disabled:opacity-60">
						{ask.isPending ? "Asking…" : "Ask"}
					</button>
				</form>
			)}
			{noAnswer && !ask.isPending && <span role="alert" className="text-[13px] text-sk-muted">Seek couldn't answer that from your tenancy details. Ask your landlord.</span>}
			{ask.isError && <span role="alert" className="text-[13px] text-sk-muted">{errMessage(ask.error)}</span>}
			{showActions && a.actions?.length > 0 && (
				<div className="flex flex-wrap gap-2 pl-[52px]">
					{a.actions.map((act) => {
						const to = studentLink(act.link);
						const cls = "text-[13px] font-semibold text-sk-link";
						return to.startsWith("/") ? (
							<Link key={act.label} to={to} className={cls}>{act.label} →</Link>
						) : (
							<a key={act.label} href={to} target="_blank" rel="noreferrer" className={cls}>{act.label} ↗</a>
						);
					})}
				</div>
			)}
		</div>
	);
}

/** Accessible modal: closes on Escape or backdrop click, focuses the dialog. */
export function Modal({ title, onClose, children, wide = false }) {
	const ref = useRef(null);
	useEffect(() => {
		const prev = document.activeElement;
		ref.current?.focus();
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			if (prev instanceof HTMLElement) prev.focus();
		};
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center sm:p-6">
			<button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-pointer border-none bg-black/55" />
			<div
				ref={ref}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				tabIndex={-1}
				className={`relative flex max-h-[92vh] w-full flex-col gap-4 overflow-y-auto rounded-t-2xl border border-sk-border bg-sk-bg p-5 text-sk-text shadow-[0_12px_40px_var(--sk-shadow)] outline-none sm:rounded-2xl ${wide ? "sm:max-w-[760px]" : "sm:max-w-[520px]"}`}
			>
				<div className="flex items-start justify-between gap-3">
					<h2 className="font-display text-xl font-semibold">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-sk-border2 bg-transparent text-sk-text"
					>
						<i className="pi pi-times text-xs" />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

/** Small inline status line used after an action (ok / warn). */
export const Notice = ({ notice }) =>
	notice ? (
		<div role="status" className={`rounded-xl p-3 text-sm ${notice.tone === "ok" ? "bg-sk-ok-bg text-sk-ok" : "bg-sk-warn-bg text-sk-warn"}`}>
			{notice.text}
		</div>
	) : null;

/**
 * "Pay now" for one rent payment: POST /payments/:id/checkout returns Stripe's
 * hosted Checkout url (or, in simulated mode, straight the success url).
 */
export function PayNowButton({ payment, className = "", label = "Pay now" }) {
	const qc = useQueryClient();
	const [notice, setNotice] = useState(null);
	const pay = useMutation({
		mutationFn: async () => {
			const back = `${window.location.origin}/student/home`;
			const { data } = await api.post(`/payments/${payment._id}/checkout`, null, {
				params: {
					successUrl: `${back}?checkout=success&payment=${payment._id}&session_id={CHECKOUT_SESSION_ID}`,
					cancelUrl: `${back}?checkout=cancelled&payment=${payment._id}`
				},
				headers: { platform: "web" }
			});
			return data;
		},
		onSuccess: (r) => {
			if (r.status === "PAID") {
				setNotice({ tone: "ok", text: "This payment has already been received." });
				qc.invalidateQueries({ queryKey: ["my-payments"] });
				qc.invalidateQueries({ queryKey: ["rent-plan"] });
			} else if (r.url) window.location.assign(r.url);
			else setNotice({ tone: "warn", text: "We couldn't open the payment page. Please try again." });
		},
		onError: (e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't take this payment.") })
	});

	if (payment.status === "PAID") return null;
	return (
		<>
			<button type="button" onClick={() => pay.mutate()} disabled={pay.isPending} className={`cursor-pointer disabled:opacity-60 ${className}`}>
				{pay.isPending ? "Opening payment…" : label}
			</button>
			<Notice notice={notice} />
		</>
	);
}

/**
 * Back from Stripe Checkout (?checkout=success&payment=&session_id=): confirms
 * the payment with the backend, refreshes the rent data and returns a notice.
 */
export function useCheckoutReturn() {
	const qc = useQueryClient();
	const [params, setParams] = useSearchParams();
	const [notice, setNotice] = useState(null);
	const state = params.get("checkout");
	const paymentId = params.get("payment");
	const sessionId = params.get("session_id");

	useEffect(() => {
		if (!state) return;
		setParams({}, { replace: true });
		if (state !== "success" || !paymentId || !sessionId) {
			setNotice({ tone: "warn", text: "Payment cancelled. Nothing was charged." });
			return;
		}
		api
			.get(`/payments/${paymentId}/checkout/confirm`, { params: { session_id: sessionId } })
			.then(({ data }) => {
				setNotice(
					data.status === "PAID"
						? { tone: "ok", text: "Paid. Your receipt is in your inbox." }
						: { tone: "warn", text: "We haven't received this payment yet. It shows as paid as soon as it clears." }
				);
			})
			.catch((e) => setNotice({ tone: "warn", text: errMessage(e, "We couldn't confirm this payment.") }))
			.finally(() => {
				qc.invalidateQueries({ queryKey: ["my-payments"] });
				qc.invalidateQueries({ queryKey: ["rent-plan"] });
			});
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return notice;
}
