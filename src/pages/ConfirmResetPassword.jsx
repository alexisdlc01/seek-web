import React, { useRef, useState } from "react";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function ResetPasswordPassword() {
	const [searchParams] = useSearchParams();
	const userId = searchParams.get("id");
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const toast = useRef(null);
	const navigate = useNavigate();

	const showError = (summary, detail) => {
		toast.current?.show({
			severity: "error",
			summary,
			detail,
			life: 4000,
			style: {
				background: "#1E1E2F",
				color: "#fff",
				borderLeft: "5px solid #EF4444",
				borderRadius: "8px"
			}
		});
	};

	const validatePassword = () => {
		const strongPasswordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
		if (!strongPasswordRegex.test(password)) {
			showError(
				"Weak Password",
				"Password must be at least 8 characters, with uppercase, lowercase, number, and symbol."
			);
			return false;
		}
		if (password !== confirm) {
			showError("Mismatch", "Passwords do not match.");
			return false;
		}
		return true;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validatePassword()) return;

		try {
			await axios.post(`${BASE_URL}/auth/confirmPasswordReset`, {
				userId,
				token,
				newPassword: password
			});
			toast.current?.show({
				severity: "success",
				summary: "Password Reset",
				detail: "Your password has been updated successfully.",
				life: 3000
			});
			setTimeout(() => navigate("/signin/landlord"), 1000);
		} catch (err) {
			showError("Failed", "Password reset link invalid or expired.");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4"
		>
			<BackgroundBubbles count={20} color="#8B5CF6" />
			<Toast ref={toast} position="bottom-right" />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full bg-white max-w-md rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Reset Your Password
				</h1>

				<FloatLabel className="mt-5">
					<Password
						inputId="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						feedback={false}
						toggleMask
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="password">New Password</label>
				</FloatLabel>

				<FloatLabel>
					<Password
						inputId="confirm"
						value={confirm}
						onChange={e => setConfirm(e.target.value)}
						feedback={false}
						toggleMask
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
					/>
					<label htmlFor="confirm">Confirm Password</label>
				</FloatLabel>

				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						type="submit"
						label="Update Password"
						className="w-full font-semibold"
						style={{
							backgroundColor: "var(--primary-color)",
							color: "var(--primary-color-text)",
							border: "none"
						}}
					/>
				</motion.div>
			</motion.div>
		</form>
	);
}
