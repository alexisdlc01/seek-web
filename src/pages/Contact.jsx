"use client";

import { useState } from "react";
import axios from "axios";


const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ContactPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(null);
	const [error, setError] = useState(null);

	const emailOk = /^\S+@\S+\.\S+$/.test(email);
	const isValid =
		name.trim().length > 1 && emailOk && message.trim().length > 3;

	async function onSubmit(e) {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		if (!isValid) {
			setError("Please complete all fields correctly.");
			return;
		}
		try {
			setSubmitting(true);
			try {
				const res = await axios.post(`${BASE_URL}/contact`, {
					name, email, message
				});
			} catch (err) {
				throw new Error("Failed to send");
			}
			setSuccess("Message sent! We’ll get back to you soon.");
			setName("");
			setEmail("");
			setMessage("");
		} catch {
			setError(
				"Something went wrong. Please try again or email kshitijverma197@gmail.com"
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex min-h-screen flex-col bg-[var(--surface-ground)] text-[var(--text-color)]">
			<main className="flex-1 pt-5">
				<section className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
					<div className="text-center mb-16">
						<h1 className="text-5xl font-bold tracking-tighter mb-4">
							Contact{" "}
							<span className="text-[var(--accent-color)]">
								Seek
							</span>
						</h1>
						<p className="text-[var(--text-color-secondary)]">
							Please reach out with any questions, feedback, or
							support needs.
						</p>
					</div>

					<form
						onSubmit={onSubmit}
						className="bg-[var(--surface-200)] w-full max-w-2xl rounded-lg p-8 shadow-lg border border-[var(--surface-400)]"
						noValidate
					>
						<div className="grid gap-6">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium mb-2 text-[var(--text-color)]"
								>
									Name
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={e => setName(e.target.value)}
									autoComplete="name"
									required
									className="w-full rounded-md border border-[var(--surface-500)] bg-[var(--surface-100)] px-4 py-3 text-[var(--text-color)] placeholder-[var(--gray-400)] focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] outline-none"
									placeholder="Jane Doe"
								/>
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium mb-2 text-[var(--text-color)]"
								>
									Email
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={e => setEmail(e.target.value)}
									autoComplete="email"
									required
									className="w-full rounded-md border border-[var(--surface-500)] bg-[var(--surface-100)] px-4 py-3 text-[var(--text-color)] placeholder-[var(--gray-400)] focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] outline-none"
									placeholder="you@example.com"
								/>
							</div>

							<div>
								<label
									htmlFor="message"
									className="block text-sm font-medium mb-2 text-[var(--text-color)]"
								>
									Message
								</label>
								<textarea
									id="message"
									value={message}
									onChange={e => setMessage(e.target.value)}
									required
									rows="6"
									className="w-full rounded-md border border-[var(--surface-500)] bg-[var(--surface-100)] px-4 py-3 text-[var(--text-color)] placeholder-[var(--gray-400)] focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] outline-none resize-y"
									placeholder="How can we help?"
								/>
							</div>

							{error && (
								<p
									className="rounded-md bg-red-900/50 text-red-300 px-4 py-3 text-sm"
									role="alert"
								>
									{error}
								</p>
							)}
							{success && (
								<p
									className="rounded-md bg-green-900/50 text-green-300 px-4 py-3 text-sm"
									role="status"
								>
									{success}
								</p>
							)}

							<div className="flex items-center justify-between gap-4">
								<button
									type="submit"
									disabled={!isValid || submitting}
									className="inline-flex items-center justify-center rounded-lg bg-[var(--accent-color)] px-6 py-3 font-semibold text-[var(--accent-color-text)] transition-colors hover:bg-[#1ed0dc] disabled:opacity-60"
								>
									{submitting ? "Sending..." : "Send Message"}
								</button>
							</div>
						</div>
					</form>
				</section>
			</main>
		</div>
	);
}
