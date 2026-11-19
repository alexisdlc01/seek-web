import { ProgressSpinner } from "primereact/progressspinner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import UserContext from "../context/UserContext.jsx";

import { API_BASE } from "../lib/landlord.js";

export default function VerifyingEmail() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setUser } = useContext(UserContext);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		(async () => {
			const token = searchParams.get("token");
			const userId = searchParams.get("userId");
			if (!token) {
				setFailed(true);
				return;
			}
			{
				try {
					const res = await axios.post(
						`${API_BASE}/auth/verify-email`,
						{ token, userId },
						{
							withCredentials: true
						}
					);
					if (res.status !== 400) {
						try {
							const res = await axios.get(
								`${API_BASE}/auth/currentUser`,
								{ withCredentials: true }
							);
							setUser(res.data);
						} catch (err) {
							console.log(
								"error getting current user after verifying email",
								err
							);
						}
						navigate("/");
					}
				} catch (err) {
					console.log(
						"email verification with the backend failed",
						err
					);
					setFailed(true);
				}
			}
		})();
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			{failed ? (
				<div className="text-center space-y-3 px-4">
					<h1 className="text-2xl font-bold">We could not verify your email</h1>
					<p className="text-gray-600">This link is invalid, expired or already used.</p>
					<p>
						<Link to="/signin/student" className="underline">Sign in as a student</Link>
						{" · "}
						<Link to="/signin/landlord" className="underline">Sign in as a landlord</Link>
					</p>
				</div>
			) : (
				<ProgressSpinner />
			)}
		</div>
	);
}
