import React from "react";
import { Button } from "primereact/button";

export default function SignUpLandlord() {
	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]">
				{/* Heading */}
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Create Account
				</h1>

				{/* Email Field */}
				<div className="space-y-1">
					<label className="block font-medium text-[var(--text-color)]">
						Email Address
					</label>
					<input
						type="email"
						placeholder="your@email.com"
						className="w-full border border-[var(--surface-border)] rounded-md px-3 py-2 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
					/>
				</div>

				{/* Password Field */}
				<div className="space-y-1">
					<label className="block font-medium text-[var(--text-color)]">
						Password
					</label>
					<input
						type="password"
						placeholder="Minimum 8 characters"
						className="w-full border border-[var(--surface-border)] rounded-md px-3 py-2 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
					/>
					<p className="text-xs text-[var(--text-color-secondary)]">
						Must contain uppercase, lowercase, and a number
					</p>
				</div>

				<div className="space-y-1">
					<label className="block font-medium text-[var(--text-color)]">
						Confirm Password
					</label>
					<input
						type="password"
						className="w-full border border-[var(--surface-border)] rounded-md px-3 py-2 text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
					/>
				</div>

				{/* Create Account Button */}
				<Button
					label="Create Account"
					className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
				/>

				{/* Divider */}
				<div className="text-center text-sm text-[var(--text-color-secondary)] border-t pt-4">
					or sign up with
				</div>

				{/* Social Sign-in Buttons */}
				<div className="flex flex-col gap-2">
					<Button
						label="Sign up with Google"
						icon="pi pi-google"
						className="w-full border border-gray-300 text-gray-800 bg-white"
					/>
					<Button
						label="Sign up with Apple"
						icon="pi pi-apple"
						className="w-full border border-gray-300 text-gray-800 bg-white"
					/>
				</div>

				{/* Footer */}
				<p className="text-sm text-center text-[var(--text-color-secondary)] pt-4">
					Already have an account?{" "}
					<a
						href="#"
						className="text-[var(--primary-color)] font-medium"
					>
						Login
					</a>
				</p>
			</div>
		</div>
	);
}
