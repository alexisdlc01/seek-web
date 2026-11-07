import { ProgressSpinner } from "primereact/progressspinner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import axios from "axios";
import UserContext from "../context/UserContext.jsx";

import { API_BASE } from "../lib/landlord.js";

export default function VerifyingEmail() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setUser } = useContext(UserContext);

	useEffect(() => {
		(async () => {
			const token = searchParams.get("token");
			const userId = searchParams.get("userId");
			if (token) {
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
				}
			}
		})();
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<ProgressSpinner />
		</div>
	);
}
