import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ResetPassword() {
	const [email, setEmail] = useState("");

	const handleSubmit = async e => {
		e.preventDefault();
		await axios.post(
			`${BASE_URL}/auth/forgot-password`,
			{ email },
			{ withCredentials: true }
		);
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

				<Button
					label="Send Reset Link"
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
					type="submit"
				/>
			</form>
		</div>
	);
}
