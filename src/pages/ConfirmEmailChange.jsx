import { ProgressSpinner } from "primereact/progressspinner";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import { API_BASE } from "../lib/landlord.js";

export default function ConfirmEmailChange() {
	const [searchParams] = useSearchParams();
	const [status, setStatus] = useState("loading");
	const sent = useRef(false);

	useEffect(() => {
		if (sent.current) return; // StrictMode runs effects twice; the token is single-use
		sent.current = true;
		const token = searchParams.get("token");
		const userId = searchParams.get("userId");
		if (!token || !userId) {
			setStatus("error");
			return;
		}
		axios
			.post(`${API_BASE}/auth/confirmEmailChange`, { token, userId }, { withCredentials: true })
			.then(() => setStatus("done"))
			.catch(() => setStatus("error"));
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-white px-4">
			{status === "loading" && <ProgressSpinner />}
			{status === "done" && (
				<div className="text-center space-y-3">
					<h1 className="text-2xl font-bold">Your email address is updated</h1>
					<p className="text-gray-600">Please sign in again with your new email address.</p>
					<p>
						<Link to="/signin/student" className="underline">Sign in as a student</Link>
						{" · "}
						<Link to="/signin/landlord" className="underline">Sign in as a landlord</Link>
					</p>
				</div>
			)}
			{status === "error" && (
				<div className="text-center space-y-3">
					<h1 className="text-2xl font-bold">We could not update your email address</h1>
					<p className="text-gray-600">This link is invalid, expired or already used. Request the change again from your profile.</p>
				</div>
			)}
		</div>
	);
}
