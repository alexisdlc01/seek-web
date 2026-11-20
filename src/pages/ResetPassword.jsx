import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import axios from "axios";

import { API_BASE } from "../lib/landlord.js";

export default function ResetPassword() {
	const [email, setEmail] = useState("");

	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState(null);
	const [error, setError] = useState(null);

	const handleSubmit = async e => {
		e.preventDefault();
		setPending(true);
		setMessage(null);
		setError(null);
		try {
			await axios.post(
				`${API_BASE}/auth/forgot-password`,
				{ email },
				{ withCredentials: true }
			);
			setMessage("If an account exists, we've sent a reset link.");
		} catch (err) {
			setError(
				err.response?.status === 429
					? "Too many attempts, try again in an hour."
					: err.response?.data?.message || "Something went wrong. Please try again."
			);
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
			>
				{/* Heading */}
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Reset Password
				</h1>
				<FloatLabel className="mt-5">
					<InputText
						id="reset-email"
						type="email"
						className="w-full p-3 text-lg"
						onChange={e => setEmail(e.target.value)}
					/>
					<label htmlFor="reset-email" className="ml-2">
						Email associated with your account
					</label>
				</FloatLabel>

				{message && <p className="text-center text-sm text-green-700">{message}</p>}
				{error && <p className="text-center text-sm text-red-600">{error}</p>}

				<Button
					label="Send Reset Link"
					disabled={pending}
					loading={pending}
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
					type="submit"
				/>
			</form>
		</div>
	);
}
