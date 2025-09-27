// MailingCTA.tsx
import React, { useState } from "react";

export default function MailingCTA() {
	const [email, setEmail] = useState("");

	const handleSubmit = async e => {
		e.preventDefault();

		const formData = new FormData();
		formData.append("entry.1674415312", email);

		await fetch(
			"https://docs.google.com/forms/d/e/1FAIpQLSd4wfud28ggpa0aKqOmG2omVx7t24a5wwqB7jmZueHwiBcs-w/formResponse",
			{
				method: "POST",
				mode: "no-cors",
				body: formData
			}
		);

		setEmail("");
		alert("Thanks for subscribing!");
	};

	return (
		<section className="bg-[#49BBC4] text-[#0B0D17] py-8">
			<div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
				{/* Left copy */}
				<div className="text-center sm:text-left">
					<h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
						Join Our Mailing List
					</h3>
					<p className="text-white/80 mt-1">
						Stay updated when the app goes live.
					</p>
				</div>

				{/* Right input + button */}
<form
	onSubmit={handleSubmit}
	className="flex items-center w-full sm:w-[400px] bg-white rounded-full shadow overflow-hidden"
>
	<input
		type="email"
		value={email}
		onChange={e => setEmail(e.target.value)}
		placeholder="Enter your email"
		required
		className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-500 focus:outline-none"
	/>
	<button
		type="submit"
		className="px-6 py-3 bg-[#0B0D17] text-white font-semibold hover:bg-[#22263a] transition"
	>
		Subscribe
	</button>
</form>

			</div>
		</section>
	);
}
