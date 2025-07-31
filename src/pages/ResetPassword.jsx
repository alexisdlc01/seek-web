import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Link } from "react-router-dom";

export default function ResetPassword() {
	const [email, setEmail] = useState("");

	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]">
				{/* Heading */}
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Reset Password
				</h1>
				<FloatLabel className="mt-5">
					<InputText id="reset-email" className={`w-full p-3 text-lg}`} />
					<label htmlFor="reset-email" className="ml-2">
						Email associated with your account
					</label>
				</FloatLabel>
				
				<Button
					label="Send Reset Link"
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
				/>
				
			</div>
		</div>
	);
}
