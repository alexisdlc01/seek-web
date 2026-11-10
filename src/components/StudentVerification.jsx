import { useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import UserContext from "../context/UserContext.jsx";
import { Card, Chip, btnSmPrimary, btnSmGhost } from "./sk.jsx";
import { api, errMessage } from "../lib/landlord.js";

export const VerifiedStudentBadge = ({ university, className = "" }) => (
	<Chip tone="ok" className={className}>
		Verified student{university ? ` · ${university}` : ""}
	</Chip>
);

const field =
	"h-10 min-w-0 flex-[1_1_200px] rounded-[10px] border border-sk-border2 bg-sk-card px-3 text-sm text-sk-text outline-none focus:border-sk-accent";

/** Student proves a university address with a 6-digit code to earn the badge. */
export function StudentVerificationCard({ className = "" }) {
	const { user, setUser } = useContext(UserContext);
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [sentTo, setSentTo] = useState("");
	const [error, setError] = useState("");

	const send = useMutation({
		mutationFn: () => api.post("/users/me/student-email", { email: email.trim() }),
		onSuccess: () => {
			setError("");
			setCode("");
			setSentTo(email.trim());
		},
		onError: (e) => setError(errMessage(e, "We couldn't send the code."))
	});
	const verify = useMutation({
		mutationFn: async () => (await api.post("/users/me/student-email/verify", { code: code.trim() })).data,
		onSuccess: (data) => {
			setError("");
			setUser((u) => ({ ...u, studentVerified: data.studentVerified, university: data.university }));
		},
		onError: (e) => setError(errMessage(e, "We couldn't check the code."))
	});

	if (user?.studentVerified) {
		return (
			<Card title="Student status" className={className}>
				<VerifiedStudentBadge university={user.university} className="self-start" />
				<span className="text-[13.5px] text-sk-text2">Landlords see this badge next to your name when you apply.</span>
			</Card>
		);
	}

	return (
		<Card title="Verify your student status" className={className}>
			<span className="text-[13.5px] text-sk-text2">
				Get a verified student badge that landlords see when you apply. For now only University of St Andrews emails (@st-andrews.ac.uk) can be verified.
			</span>
			{!sentTo ? (
				<form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); if (email.trim()) send.mutate(); }}>
					<label htmlFor="student-email" className="sr-only">University email</label>
					<input
						id="student-email"
						type="email"
						autoComplete="email"
						placeholder="you@st-andrews.ac.uk"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={field}
					/>
					<button type="submit" disabled={!email.trim() || send.isPending} className={`${btnSmPrimary} disabled:opacity-60`}>
						{send.isPending ? "Sending…" : "Send code"}
					</button>
				</form>
			) : (
				<form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (code.trim().length === 6) verify.mutate(); }}>
					<span className="text-[13.5px] text-sk-text2">We sent a 6-digit code to {sentTo}. It expires in 15 minutes.</span>
					<div className="flex flex-wrap gap-2">
						<label htmlFor="student-code" className="sr-only">Verification code</label>
						<input
							id="student-code"
							inputMode="numeric"
							autoComplete="one-time-code"
							maxLength={6}
							placeholder="123456"
							value={code}
							onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
							className={field}
						/>
						<button type="submit" disabled={code.length !== 6 || verify.isPending} className={`${btnSmPrimary} disabled:opacity-60`}>
							{verify.isPending ? "Checking…" : "Verify"}
						</button>
						<button type="button" onClick={() => { setSentTo(""); setError(""); }} className={btnSmGhost}>
							Change email
						</button>
					</div>
				</form>
			)}
			{error && <div role="alert" className="rounded-xl bg-sk-warn-bg p-3 text-sm text-sk-warn">{error}</div>}
		</Card>
	);
}
