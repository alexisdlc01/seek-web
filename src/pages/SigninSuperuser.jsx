import React, { useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";

export default function SigninSuperuser() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { login } = useContext(UserContext);
	const toast = useRef(null);

	const showError = detail => {
		toast.current?.show({
			severity: "error",
			summary: "Sign-In Failed",
			detail: "Your email or password didn’t match our records. Please try again.",
			life: 4000,
			style: {
				background: "#1E1E2F",
				color: "#fff",
				borderLeft: "5px solid #EF4444", // red accent
				borderRadius: "8px",
				boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
			},
			content: (
				<div className="flex items-center space-x-3">
					<i className="pi pi-times-circle text-red-400 text-xl"></i>
					<div>
						<p className="font-semibold">Sign-In Failed</p>
						<p className="text-sm text-gray-200">
							{detail}
						</p>
					</div>
				</div>
			)
		});
	};

	const validateEmail = () => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim()) {
			showError("An Email account is required to sign into Seek.");
			return false;
		}
		if (!regex.test(email)) {
			showError("Please enter a valid email address. The format should be example@domain.com");
			return false;
		}
		return true;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateEmail()) return;
		if (!password) {
			showError("Enter your password.");
			return;
		}
		setIsSubmitting(true);
		const error = await login(
			email.trim().toLowerCase(),
			password,
			"SUPERUSER"
		);
		setIsSubmitting(false);
		if (error) {
			showError(error);
			return;
		}
		navigate("/superuser");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4"
		>
			{/* same frozen bubbles */}
			<BackgroundBubbles count={20} color="#8B5CF6" />

			<Toast ref={toast} position="bottom-right" />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 w-full bg-white max-w-md rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Welcome Back, Super user
				</h1>

				<FloatLabel className="mt-5">
					<InputText
						id="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						className="w-full p-3 text-lg"
					/>
					<label htmlFor="email" className="ml-2">
						Email
					</label>
				</FloatLabel>

				<FloatLabel>
					<Password
						inputId="confirm"
						value={password}
						onChange={e => setPassword(e.target.value)}
						feedback={false}
						className="w-full"
						inputClassName="w-full border border-[var(--surface-border)] rounded-md px-3 py-2"
						toggleMask
						pt={{
							showIcon: {
								className: "-translate-y-1/4 -translate-x-2/3"
							},
							hideIcon: {
								className: "-translate-y-1/4 -translate-x-2/3"
							}
						}}
					/>
					<label htmlFor="confirm">Password</label>
				</FloatLabel>


				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						type="submit"
						label={isSubmitting ? "Signing in..." : "Sign in"}
						disabled={isSubmitting}
						loading={isSubmitting}
						className="w-full font-medium"
						style={{
							backgroundColor: "var(--surface-300)",
							color: "white",
							border: "none"
						}}
					/>
				</motion.div>
			</motion.div>
		</form>
	);
}
