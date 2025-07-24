import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";

export default function SignUpLandlord() {
	const [email, setEmail] = useState("");
	const [pwd, setPwd] = useState("");
	const [confirmPwd, setConfirmPwd] = useState("");
	const [confirm, setConfirm] = useState("");
	const [name, setName] = useState("");

	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]">
				{/* Heading */}
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Create Student Account
				</h1>
				<FloatLabel className="p-float-label mt-5">
					<div className="p-inputgroup w-full">
						<InputText
							id="name"
							value={name}
							onChange={e => setName(e.target.value)}
							className="flex-1"
						/>
					</div>
					<label htmlFor="name">Name</label>
				</FloatLabel>
				<FloatLabel className="p-float-label mt-5">
					<div className="p-inputgroup w-full">
						<InputText
							id="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="flex-1"
						/>
						<span className="p-inputgroup-addon">
							@st-andrews.ac.uk
						</span>
					</div>
					<label htmlFor="email">St Andrews Email</label>
				</FloatLabel>
				<FloatLabel>
					<Password
						inputId="confirm"
						value={confirm}
						onChange={e => setConfirm(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="confirm"> Password</label>
				</FloatLabel>
				{/* Confirm Password */}
				<FloatLabel>
					<Password
						inputId="confirm"
						value={confirmPwd}
						onChange={e => setConfirmPwd(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="confirm">Confirm Password</label>
				</FloatLabel>
				{/* Create Account Button */}
				<Button
					label="Sent Activation Email"
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
				/>

				{/* Footer */}
				<p className="text-sm text-center text-[var(--text-color-secondary)] pt-6">
					Already have an account?{" "}
					<Link
						to="/signin/student"
						className="text-[var(--primary-color)] font-medium"
					>
						Login
					</Link>
				</p>
			</div>
		</div>
	);
}
