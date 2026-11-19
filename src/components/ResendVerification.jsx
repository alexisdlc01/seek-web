import { useContext, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import UserContext from "../context/UserContext.jsx";
import { API_BASE } from "../lib/landlord.js";

/** Shown after a sign-in refused for an unverified email: mails a fresh verification link. */
export default function ResendVerification() {
	const { unverifiedUserId } = useContext(UserContext);
	const [status, setStatus] = useState(null);
	const [sending, setSending] = useState(false);
	if (!unverifiedUserId) return null;

	const resend = async () => {
		setSending(true);
		try {
			await axios.patch(`${API_BASE}/auth/resend-otp`, { userId: unverifiedUserId }, { withCredentials: true });
			setStatus("A new verification link is on its way. Check your inbox.");
		} catch (err) {
			// The backend enforces a cooldown and an hourly cap; show its message.
			setStatus(err.response?.data?.message || "Could not send the email. Please try again later.");
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="text-center space-y-2">
			<Button type="button" label="Resend email" icon="pi pi-envelope" outlined loading={sending} onClick={resend} />
			{status && <p className="text-sm text-[var(--text-color-secondary)]" role="status">{status}</p>}
		</div>
	);
}
