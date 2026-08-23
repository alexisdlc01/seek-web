import { Navigate, useNavigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
export default function ProtectedRoute({ children, allowedRoles }) {
	const { user, loading } = useContext(UserContext);
	const navigate = useNavigate();
	const landlordOnly =
		allowedRoles?.length === 1 && allowedRoles.includes("LANDLORD_AGENCY");
	const superuserOnly =
		allowedRoles?.length === 1 && allowedRoles.includes("SUPERUSER");
	const loginPath = superuserOnly
		? "/superuser/login"
		: landlordOnly
			? "/signin/landlord"
			: "/signin/student";
	const signupPath = landlordOnly ? "/signup/landlord" : "/signup/student";

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<ProgressSpinner
					style={{ width: "50px", height: "50px" }}
					strokeWidth="8"
					fill="var(--surface-ground)"
					animationDuration=".5s"
				/>
			</div>
		);
	}


	if (!user) {
		return (
			<div className="min-h-[calc(100vh-60px)] bg-[var(--surface-a)] flex items-center justify-center px-4">
				<div className="w-full max-w-md rounded-xl border border-[var(--surface-border)] bg-white p-8 text-center shadow-md">
					<h1 className="text-2xl font-bold text-[var(--primary-color)]">
						{superuserOnly
							? "Administrator access required"
							: landlordOnly
								? "Landlord account required"
								: "Create an account to continue"}
					</h1>
					<p className="mt-3 text-[var(--text-color-secondary)]">
						{landlordOnly
							? "Landlord and agency accounts are created by Seek administrators."
							: "Sign up or log in to use this part of Seek."}
					</p>
					<div className="mt-7 flex flex-col gap-3">
						{!superuserOnly ? (
							<Button
								label={landlordOnly ? "Landlord account access" : "Sign up"}
								onClick={() => navigate(signupPath)}
							/>
						) : null}
						<Button
							label="Log in"
							outlined
							onClick={() => navigate(loginPath)}
						/>
						<Button
							label="Continue browsing"
							text
							onClick={() => navigate("/")}
						/>
					</div>
				</div>
			</div>
		);
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return children;
}
