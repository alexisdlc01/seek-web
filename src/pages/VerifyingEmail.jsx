import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import UserContext from "../context/UserContext.jsx";
import { API_BASE_URL } from "../config/api.js";

export default function VerifyingEmail() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setUser } = useContext(UserContext);
	const [status, setStatus] = useState("loading");

	useEffect(() => {
		let active = true;
		const token = searchParams.get("token");
		const userId = searchParams.get("userId");

		if (!token || !userId) {
			setStatus("error");
			return () => {
				active = false;
			};
		}

		void axios
			.post(
				`${API_BASE_URL}/auth/verify-email`,
				{ token, userId },
				{ withCredentials: true }
			)
			.then(() =>
				axios.get(`${API_BASE_URL}/auth/currentUser`, {
					withCredentials: true
				})
			)
			.then((response) => {
				if (!active) return;
				setUser(response.data);
				setStatus("success");
			})
			.catch(() => {
				if (active) setStatus("error");
			});

		return () => {
			active = false;
		};
	}, [searchParams, setUser]);

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<ProgressSpinner />
			</div>
		);
	}

	const verified = status === "success";
	return (
		<div className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4">
			<div className="w-full max-w-md rounded-xl border border-[var(--surface-border)] bg-white p-8 text-center shadow-md">
				<h1 className="text-2xl font-bold text-[var(--primary-color)]">
					{verified ? "Email verified" : "Verification link unavailable"}
				</h1>
				<p className="mt-4 text-[var(--text-color-secondary)]">
					{verified
						? "Your account is ready to use."
						: "This link is invalid or expired. Sign in if you have already verified, or contact us for help."}
				</p>
				<div className="mt-7 flex flex-col gap-3">
					<Button
						label={verified ? "Continue" : "Go to sign in"}
						onClick={() =>
							navigate(verified ? "/" : "/signin/student")
						}
					/>
					{!verified ? (
						<Button
							label="Contact Seek"
							outlined
							onClick={() => navigate("/contact")}
						/>
					) : null}
				</div>
			</div>
		</div>
	);
}
