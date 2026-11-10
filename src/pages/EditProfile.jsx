import { useContext, useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserContext from "../context/UserContext.jsx";
import { Page, Card, btnPrimary, btnSmGhost } from "../components/sk.jsx";
import { Modal } from "../components/StudentBits.jsx";
import { api, currentMonth, errMessage, gbp } from "../lib/landlord.js";

import { API_BASE } from "../lib/landlord.js";

export default function EditProfile() {
	const fileRef = useRef(null);

	const [loading2, setLoading2] = useState(true);
	const [saving, setSaving] = useState(false);

	const [displayName, setDisplayName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [avatarKey, setAvatarKey] = useState("");

	const [initialName, setInitialName] = useState("");
	const [initialKey, setInitialKey] = useState("");
	const [removePicture, setRemovePicture] = useState(false);
	const { loading, user, setUser } = useContext(UserContext);

	useEffect(() => {
		(async () => {
			if (!loading) {
				try {
					setDisplayName(user.name);
					setAvatarUrl(user.profilePicUrl);
				} finally {
					setLoading2(false);
				}
			}
		})();
	}, [loading, user]);

	const pickFile = () => fileRef.current?.click();

	const onFile = async f => {
		if (!f?.type?.startsWith("image/")) return;
		const { data } = await axios.get(`${API_BASE}/upload/presign`, {
			params: {
				filename: f.name,
				fileType: f.type,
				fileSize: f.size,
				folder: "public"
			},
			withCredentials: true
		});
		await axios.put(data.uploadUrl, f, {
			headers: { "Content-Type": f.type }
		});
		setAvatarKey(data.key);
		setAvatarUrl(data.fileUrl || URL.createObjectURL(f)); // instant preview
	};

	const dirty = displayName !== initialName || avatarKey !== initialKey || removePicture;
	const canSave = displayName.trim().length > 0 && dirty && !saving;

	const save = async () => {
		if (!canSave) return;
		setSaving(true);
		try {
			if (avatarUrl !== "") {
				await axios.put(
					`${API_BASE}/users/setProfilePic`,
					{ url: avatarUrl },
					{ withCredentials: true }
				);
			}
			if (avatarUrl === "" && removePicture) {
				await axios.put(
					`${API_BASE}/users/setProfilePic`,
					{ url: avatarUrl },
					{ withCredentials: true }
				);
			}
			await axios.put(
				`${API_BASE}/users/setUsername`,
				{ name: displayName },
				{ withCredentials: true }
			);
			setInitialName(displayName);
			setInitialKey(avatarKey);
			setRemovePicture(false);
			setUser(prev => ({
				...prev,
				name: displayName,
				profilePicUrl: avatarUrl
			}));
		} finally {
			setSaving(false);
		}
	};

	if (loading2) {
		return (
			<Page>
				<div className="max-w-xl animate-pulse space-y-6">
					<div className="h-8 w-48 rounded-lg bg-sk-hair" />
					<div className="h-64 rounded-2xl bg-sk-hair" />
				</div>
			</Page>
		);
	}

	const isLandlord = user?.role !== "STUDENT";
	const initials = (user?.name ?? "")
		.split(" ")
		.map(n => n[0])
		.join("")
		.toUpperCase();

	return (
		<Page className="max-w-[1100px]">
			<h1 className="font-display text-2xl font-semibold md:text-[30px]">
				{isLandlord ? "Account" : "Edit Profile"}
			</h1>

			<div className="flex flex-wrap items-start gap-6">
				<div className="flex min-w-0 flex-[1.3_1_460px] flex-col gap-5">
					<Card>
						<div className="flex flex-wrap items-center gap-3.5">
							<Avatar
								image={avatarUrl}
								label={!avatarUrl ? initials : undefined}
								size="xlarge"
								shape="circle"
								className="font-bold"
								style={{
									backgroundColor: "var(--sk-card2)",
									color: "var(--sk-link)"
								}}
							/>
							<div className="flex min-w-0 flex-1 flex-col">
								<span className="truncate text-base font-semibold">{displayName}</span>
								<span className="text-[13px] text-sk-muted">
									{user?.companyName ? `${user.companyName} · ` : ""}{user?.email}
								</span>
								{isLandlord && user?.isVerified && (
									<span className="mt-1 w-fit rounded-md bg-sk-ok-bg px-2 py-[3px] text-xs font-semibold text-sk-ok">Identity verified</span>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								<button type="button" className={btnSmGhost} onClick={pickFile}>
									Change photo
								</button>
								{avatarUrl ? (
									<button
										type="button"
										className={`${btnSmGhost} !text-sk-danger`}
										onClick={() => {
											setRemovePicture(true);
											setAvatarUrl("");
											setAvatarKey("");
										}}
									>
										Remove
									</button>
								) : null}
							</div>
							<input
								ref={fileRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={e => onFile(e.target.files?.[0])}
							/>
						</div>

						<label className="flex flex-col gap-1.5 text-[13px] text-sk-muted">
							Display Name
							<input
								value={displayName}
								onChange={e => setDisplayName(e.target.value)}
								className="h-11 rounded-xl border border-sk-border2 bg-sk-card2 px-3 text-sm text-sk-text"
							/>
						</label>

						<div className="flex justify-end">
							<button
								type="button"
								className={`${btnPrimary} disabled:opacity-50`}
								disabled={!canSave}
								onClick={save}
							>
								{saving ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</Card>

					{isLandlord && (
						<>
							<BusinessCard user={user} setUser={setUser} />
							<RegistrationsCard user={user} setUser={setUser} />
							<TeamCard user={user} setUser={setUser} />
						</>
					)}
				</div>

				{isLandlord && (
					<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
						<PayoutsCard />

						<Card title="Seek fee">
							<span className="font-display text-[26px] font-semibold">
								1%
								<span className="font-sans text-sm font-normal text-sk-muted"> of rent collected</span>
							</span>
							<span className="text-[13px] leading-snug text-sk-text2">
								Listing, applications, inbox and connectors are free. No fee when rent isn't paid.
								Students never pay Seek fees.
							</span>
							<FeeThisMonth />
						</Card>

						<NotificationsCard user={user} setUser={setUser} />
						<CloseAccount />
					</div>
				)}
			</div>
		</Page>
	);
}

function FeeThisMonth() {
	const q = useQuery({
		queryKey: ["landlord-payments", currentMonth()],
		queryFn: async () => (await api.get("/payments/landlord", { params: { month: currentMonth() } })).data
	});
	if (!q.data) return null;
	return (
		<span className="text-[13px] font-semibold text-sk-text">
			This month: {gbp(q.data.seekFee ?? 0)} on {gbp(q.data.collected ?? 0)}
		</span>
	);
}

function PayoutsCard() {
	const status = useQuery({
		queryKey: ["connect-status"],
		queryFn: async () => (await api.get("/payments/connect/status")).data
	});
	const onboard = useMutation({
		mutationFn: async () => (await api.post("/payments/connect/onboard")).data,
		onSuccess: r => {
			if (r.url) window.location.assign(r.url);
			else status.refetch();
		}
	});
	const s = status.data;
	const ready = s?.connected && s.payoutsEnabled;
	return (
		<Card title="Payouts" className="!border-transparent !bg-sk-card2">
			{status.isLoading && <span className="text-[13px] text-sk-muted">Checking your payout account…</span>}
			{s && ready && (
				<>
					<div className="flex justify-between text-sm">
						<span>Stripe Connect account</span>
						<span className="font-semibold text-sk-ok">Connected</span>
					</div>
					{s.payoutBank && (
						<span className="text-sm">
							Paid out to {s.payoutBank.bankName ?? "your bank"} ····{s.payoutBank.last4}
							{s.payoutBank.verified === false ? " (not verified yet)" : ""}
						</span>
					)}
					<span className="text-[13px] text-sk-text2">Rent is paid out to this account after it's collected.</span>
					{s.mode !== "unavailable" && (
						<button type="button" className={btnSmGhost} disabled={onboard.isPending} onClick={() => onboard.mutate()}>
							{onboard.isPending ? "Opening Stripe…" : "Change bank account"}
						</button>
					)}
					{onboard.isError && <span role="alert" className="text-[13px] text-sk-warn">{errMessage(onboard.error)}</span>}
				</>
			)}
			{s && !ready && (
				<>
					<span className="text-sm font-semibold">{s.connected ? "Finish setting up payouts" : "Payouts not set up yet"}</span>
					<span className="text-[13px] text-sk-text2">
						Rent is collected and recorded, but can't be paid out until you connect a payout account with Stripe. It takes a few minutes.
					</span>
					{s.mode === "unavailable" ? (
						<span className="text-[13px] text-sk-warn">Payout setup isn't available right now.</span>
					) : (
						<button type="button" className={btnPrimary} disabled={onboard.isPending} onClick={() => onboard.mutate()}>
							{onboard.isPending ? "Opening Stripe…" : s.connected ? "Continue setup" : "Set up payouts"}
						</button>
					)}
					{onboard.isError && <span role="alert" className="text-[13px] text-sk-warn">{errMessage(onboard.error)}</span>}
				</>
			)}
			{status.isError && <span role="alert" className="text-[13px] text-sk-warn">{errMessage(status.error)}</span>}
		</Card>
	);
}

const TEAM_SCOPES = [
	["VIEWINGS_INBOX", "Viewings and inbox"],
	["APPLICATIONS", "Applications"],
	["LISTINGS", "Listings"],
	["REPAIRS", "Repairs"],
	["TENANCIES", "Tenancies"]
];
const scopeLabel = scope => TEAM_SCOPES.find(([k]) => k === scope)?.[1] ?? scope;

function TeamCard({ user, setUser }) {
	const qc = useQueryClient();
	const [email, setEmail] = useState("");
	const [scopes, setScopes] = useState(["VIEWINGS_INBOX"]);
	const team = useQuery({
		queryKey: ["team"],
		queryFn: async () => (await api.get("/users/me/team")).data
	});
	const invites = useQuery({
		queryKey: ["team-invites"],
		queryFn: async () => (await api.get("/users/me/team-invites")).data
	});
	const refresh = () => {
		qc.invalidateQueries({ queryKey: ["team"] });
		qc.invalidateQueries({ queryKey: ["team-invites"] });
		axios.get(`${API_BASE}/auth/currentUser`, { withCredentials: true }).then(r => setUser(r.data)).catch(() => {}); // teamOf changed
	};
	const accept = useMutation({
		mutationFn: async ownerId => api.post(`/users/me/team-invites/${ownerId}/accept`),
		onSuccess: refresh
	});
	const leave = useMutation({
		mutationFn: async () => api.post("/users/me/team/leave"),
		onSuccess: refresh
	});
	const invite = useMutation({
		mutationFn: async () => (await api.post("/users/me/team/invite", { email: email.trim(), scopes })).data,
		onSuccess: () => {
			setEmail("");
			refresh();
		}
	});
	const remove = useMutation({
		mutationFn: async id => api.delete(`/users/me/team/${id}`),
		onSuccess: refresh
	});
	const error = invite.error ?? remove.error ?? accept.error ?? leave.error;
	const toggle = k => setScopes(cur => (cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k]));
	return (
		<Card title="Team">
			<div className="flex items-center justify-between gap-3 text-sm">
				<span className="font-semibold">{user?.name}</span>
				<span className="text-[13px] text-sk-muted">You · full access</span>
			</div>
			{(invites.data ?? []).map(i => (
				<div key={i.ownerId} className="flex items-center justify-between gap-3 border-t border-sk-hair pt-2.5 text-sm">
					<span className="flex min-w-0 flex-col">
						<span className="truncate font-semibold">{i.ownerName} invited you to their team</span>
						<span className="text-[12.5px] text-sk-muted">{i.scopes.map(scopeLabel).join(", ")}</span>
					</span>
					<button type="button" className={btnSmGhost} disabled={accept.isPending} onClick={() => accept.mutate(i.ownerId)}>
						Accept
					</button>
				</div>
			))}
			{(team.data ?? []).map(m => (
				<div key={m.id} className="flex items-center justify-between gap-3 border-t border-sk-hair pt-2.5 text-sm">
					<span className="flex min-w-0 flex-col">
						<span className="truncate font-semibold">{m.name ?? m.email}</span>
						<span className="text-[12.5px] text-sk-muted">
							{m.hasAccount ? "Joined" : "Pending"} · {m.scopes.map(scopeLabel).join(", ")}
						</span>
					</span>
					<button type="button" className={`${btnSmGhost} !text-sk-danger`} disabled={remove.isPending} onClick={() => remove.mutate(m.id)}>
						Remove
					</button>
				</div>
			))}
			<form
				className="flex flex-col gap-2 border-t border-sk-hair pt-3"
				onSubmit={e => {
					e.preventDefault();
					if (email.trim() && scopes.length) invite.mutate();
				}}
			>
				<label className="flex flex-col gap-1 text-[12.5px] text-sk-muted">
					Invite an agent or co-landlord
					<input
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="name@agency.co.uk"
						className="h-10 rounded-[10px] border border-sk-border2 bg-sk-card2 px-3 text-sm text-sk-text"
					/>
				</label>
				<div className="flex flex-wrap gap-x-4">
					{TEAM_SCOPES.map(([k, l]) => (
						<label key={k} className="flex min-h-9 items-center gap-2 text-[13px]">
							<input type="checkbox" checked={scopes.includes(k)} onChange={() => toggle(k)} className="h-[18px] w-[18px] accent-[var(--sk-accent)]" />
							{l}
						</label>
					))}
				</div>
				<div className="flex items-center justify-between gap-3">
					<span className="text-[12.5px] text-sk-text2">Team members never see payouts or bank details.</span>
					<button type="submit" className={btnSmGhost} disabled={invite.isPending || !email.trim() || !scopes.length}>Invite</button>
				</div>
			</form>
			{user?.teamOf && (
				<button type="button" className={`${btnSmGhost} self-start`} disabled={leave.isPending} onClick={() => window.confirm("Leave the team you were invited to?") && leave.mutate()}>
					Leave team
				</button>
			)}
			{error && <span role="alert" className="text-[13px] text-sk-warn">{errMessage(error)}</span>}
		</Card>
	);
}

function CloseAccount() {
	const { logout, setUser } = useContext(UserContext);
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const close = useMutation({
		mutationFn: async () => (await api.delete("/users/me")).data,
		onSuccess: async () => {
			try {
				await logout();
			} finally {
				setUser(null);
				navigate("/");
			}
		}
	});
	return (
		<>
			<button type="button" onClick={() => setOpen(true)} className="cursor-pointer self-start border-none bg-transparent p-0 text-[13px] font-semibold text-sk-danger">
				Close account
			</button>
			{open && (
				<Modal title="Close your account?" onClose={() => setOpen(false)}>
					<span className="text-sm leading-snug text-sk-text2">
						You'll be signed out and won't be able to sign in again. We can't close it while rent is still to be collected on an active tenancy.
					</span>
					{close.isError && <span role="alert" className="text-[13px] text-sk-warn">{errMessage(close.error)}</span>}
					<div className="flex justify-end gap-2">
						<button type="button" className={btnSmGhost} onClick={() => setOpen(false)}>Keep my account</button>
						<button type="button" className={`${btnSmGhost} !text-sk-danger`} disabled={close.isPending} onClick={() => close.mutate()}>
							{close.isPending ? "Closing…" : "Close account"}
						</button>
					</div>
				</Modal>
			)}
		</>
	);
}

const REGISTRATION_KINDS = [
	["HMO_LICENCE", "HMO licence"],
	["SELECTIVE_LICENCE", "Selective licence"],
	["PRS_DATABASE", "Private Rented Sector Database (England)"],
	["RENT_SMART_WALES", "Rent Smart Wales"],
	["LANDLORD_REGISTRATION_SCOTLAND", "Landlord Registration Scotland"],
	["LANDLORD_REGISTRATION_NI", "Landlord Registration NI"],
	["OTHER", "Other"]
];
const kindLabel = kind => REGISTRATION_KINDS.find(([k]) => k === kind)?.[1] ?? kind;

const patchMe = async body => (await api.patch("/users/me", body)).data;

function BusinessCard({ user, setUser }) {
	const [company, setCompany] = useState(user?.companyName ?? "");
	const [phone, setPhone] = useState(user?.phone ?? "");
	const [state, setState] = useState({ saving: false, error: "", saved: false });
	const dirty = company !== (user?.companyName ?? "") || phone !== (user?.phone ?? "");

	const save = async () => {
		setState({ saving: true, error: "", saved: false });
		try {
			const body = { companyName: company.trim() };
			if (phone.trim()) body.phone = phone.trim();
			await patchMe(body);
			setUser(prev => ({ ...prev, companyName: body.companyName, ...(body.phone ? { phone: body.phone } : {}) }));
			setState({ saving: false, error: "", saved: true });
		} catch (e) {
			setState({ saving: false, error: errMessage(e), saved: false });
		}
	};

	const input = "h-11 rounded-xl border border-sk-border2 bg-sk-card2 px-3 text-sm text-sk-text";
	return (
		<Card title="Business details">
			<label className="flex flex-col gap-1.5 text-[13px] text-sk-muted">
				Company or agency name
				<input value={company} onChange={e => setCompany(e.target.value)} className={input} />
			</label>
			<label className="flex flex-col gap-1.5 text-[13px] text-sk-muted">
				Phone
				<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900123" className={input} />
			</label>
			{state.error && <span role="alert" className="text-[13px] text-sk-warn">{state.error}</span>}
			{state.saved && !dirty && <span role="status" className="text-[13px] text-sk-ok">Saved.</span>}
			<div className="flex justify-end">
				<button type="button" className={`${btnPrimary} disabled:opacity-50`} disabled={!dirty || state.saving} onClick={save}>
					{state.saving ? "Saving..." : "Save details"}
				</button>
			</div>
		</Card>
	);
}

function RegistrationsCard({ user, setUser }) {
	const regs = user?.registrations ?? [];
	const [kind, setKind] = useState("PRS_DATABASE");
	const [number, setNumber] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	const replace = async next => {
		setBusy(true);
		setError("");
		try {
			await patchMe({ registrations: next.map(({ kind: k, number: n }) => ({ kind: k, number: n })) });
			setUser(prev => ({
				...prev,
				registrations: next.map(r => ({ ...r, verified: r.verified ?? false }))
			}));
			setNumber("");
		} catch (e) {
			setError(errMessage(e));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Card title="Registrations">
			{regs.length === 0 && <span className="text-sm text-sk-muted">No licences or registrations added yet.</span>}
			{regs.map((r, i) => (
				<div key={`${r.kind}-${r.number}`} className="flex items-center justify-between gap-2.5 border-b border-sk-hair pb-2.5 text-sm">
					<span>{kindLabel(r.kind)}</span>
					<span className="flex items-center gap-2">
						<span className={`font-semibold ${r.verified ? "text-sk-ok" : "text-sk-text2"}`}>
							{r.number} {r.verified ? "✓" : "(not verified yet)"}
						</span>
						<button
							type="button"
							className={`${btnSmGhost} !text-sk-danger`}
							disabled={busy}
							onClick={() => replace(regs.filter((_, j) => j !== i))}
						>
							Remove
						</button>
					</span>
				</div>
			))}
			<form
				className="flex flex-wrap items-end gap-2"
				onSubmit={e => {
					e.preventDefault();
					if (number.trim().length >= 2) replace([...regs, { kind, number: number.trim() }]);
				}}
			>
				<label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[12.5px] text-sk-muted">
					Type
					<select value={kind} onChange={e => setKind(e.target.value)} className="h-10 rounded-[10px] border border-sk-border2 bg-sk-card2 px-2 text-sm text-sk-text">
						{REGISTRATION_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
					</select>
				</label>
				<label className="flex min-w-[140px] flex-1 flex-col gap-1 text-[12.5px] text-sk-muted">
					Number
					<input value={number} onChange={e => setNumber(e.target.value)} maxLength={60} className="h-10 rounded-[10px] border border-sk-border2 bg-sk-card2 px-3 text-sm text-sk-text" />
				</label>
				<button type="submit" className={btnSmGhost} disabled={busy || number.trim().length < 2}>Add number</button>
			</form>
			{error && <span role="alert" className="text-[13px] text-sk-warn">{error}</span>}
		</Card>
	);
}

const PREFS = [
	["landlordEveryPayment", "Every rent payment"],
	["newQualifiedHousehold", "New qualified household"],
	["complianceDue", "Compliance due in 30 days"],
	["weeklySummary", "Weekly summary email"]
];

function NotificationsCard({ user, setUser }) {
	const prefs = user?.notificationPrefs ?? {};
	const [error, setError] = useState("");
	const toggle = async (key, value) => {
		setError("");
		const before = prefs;
		setUser(prev => ({ ...prev, notificationPrefs: { ...prev.notificationPrefs, [key]: value } }));
		try {
			await patchMe({ notificationPrefs: { [key]: value } });
		} catch (e) {
			setUser(prev => ({ ...prev, notificationPrefs: before }));
			setError(errMessage(e));
		}
	};
	return (
		<Card title="Notifications">
			{PREFS.map(([key, label]) => (
				<label key={key} className="flex min-h-9 items-center gap-2.5 text-sm">
					<input
						type="checkbox"
						checked={!!prefs[key]}
						onChange={e => toggle(key, e.target.checked)}
						className="h-[18px] w-[18px] accent-[var(--sk-accent)]"
					/>
					{label}
				</label>
			))}
			{error && <span role="alert" className="text-[13px] text-sk-warn">{error}</span>}
		</Card>
	);
}
