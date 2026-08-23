import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async e => {
		e.preventDefault();
		setIsSubmitting(true);
		setMessage("");
		setError("");

		try {
			const response = await axios.post(
				`${API_BASE_URL}/auth/forgot-password`,
				{ email: email.trim().toLowerCase() },
				{ withCredentials: true }
			);
			setMessage(
				response.data?.message ||
					"If an account exists, a password reset link has been sent."
			);
		} catch {
			setError("Unable to request a reset link. Please try again.");
		} finally {
			setIsSubmitting(false);
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
						value={email}
						onChange={e => setEmail(e.target.value)}
						required
					/>
					<label htmlFor="reset-email" className="ml-2">
						Email associated with your account
					</label>
				</FloatLabel>

				<Button
					label={isSubmitting ? "Sending..." : "Send Reset Link"}
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
					type="submit"
					disabled={isSubmitting}
					loading={isSubmitting}
				/>
				{message ? (
					<p className="text-sm text-green-700" role="status">
						{message}
					</p>
				) : null}
				{error ? (
					<p className="text-sm text-red-600" role="alert">
						{error}
					</p>
				) : null}
			</form>
		</div>
	);
}
