import React, { useContext, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import UserContext from "../context/UserContext.jsx";
import { Toast } from "primereact/toast";
import BackgroundBubbles from "../components/BackgroundBubbles.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function SignUpLandlord() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const { signup } = useContext(UserContext);
	const toast = useRef(null);

	const showError = detail => {
		toast.current?.show({
			severity: "error",
			summary: "Sign-Up Failed",
			detail: { detail },
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
						<p className="font-semibold">Sign-Up Failed</p>
						<p className="text-sm text-gray-200">{detail}</p>
					</div>
				</div>
			)
		});
	};
	const validateName = () => {
		if (name.length === 0) {
			showError("Please enter your name");
			return false;
		}
		return true;
	};

	const validateEmail = () => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim()) {
			showError("A valid email address is required.");
			return false;
		}
		if (!regex.test(email)) {
			showError("Please enter a valid email address.");
			return false;
		}
		return true;
	};

	const validatePasswords = () => {
		if (!password || !confirmPassword) {
			showError("Please enter both password fields.");
			return false;
		}
		if (password !== confirmPassword) {
			showError("Passwords do not match one another.");
			return false;
		}
		const strongPasswordRegex =
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
		if (!strongPasswordRegex.test(password)) {
			showError(
				"Password must be at least 8 characters, with uppercase, lowercase, number, and symbol."
			);
			return false;
		}
		return true;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateName()) return;
		if (!validateEmail()) return;
		if (!validatePasswords()) return;
		await signup(name, email, password, "LANDLORD_AGENCY");
		navigate("/activationSent");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="relative overflow-hidden min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4"
		>
			{/* same frozen bubbles as other auth pages */}
			<BackgroundBubbles count={20} color="#8B5CF6" />

			<Toast ref={toast} position="bottom-right" />

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative bg-white z-10 w-full max-w-md rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
			>
				<h1 className="text-center text-2xl font-bold text-[var(--primary-color)]">
					Create Landlord Account
				</h1>

				<FloatLabel className="mt-5">
					<InputText
						id="name"
						value={name}
						onChange={e => setName(e.target.value)}
						className="w-full p-3 text-lg"
					/>
					<label htmlFor="name" className="ml-2">
						Name
					</label>
				</FloatLabel>

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
						inputId="password"
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
					<label htmlFor="password">Password</label>
				</FloatLabel>

				<FloatLabel>
					<Password
						inputId="confirmPwd"
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
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
					<label htmlFor="confirmPwd">Confirm Password</label>
				</FloatLabel>

				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						type="submit"
						label="Create Account"
						className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-semibold"
						style={{
							backgroundColor: "var(--primary-color)",
							color: "var(--primary-color-text)",
							border: "none"
						}}
					/>
				</motion.div>

				<Divider layout="horizontal">
					<span className="text-sm text-[var(--text-color-secondary)]">
						or sign up with
					</span>
				</Divider>

				<div className="flex flex-col gap-2">
					<motion.div whileHover={{ scale: 1.02 }}>
						<Button
							label="Sign up with Google"
							icon="pi pi-google"
							className="w-full border border-gray-300 text-gray-800 bg-white"
							style={{
								backgroundColor: "var(--surface-0)",
								color: "var(--text-color)",
								border: "1px solid var(--surface-border)"
							}}
							type="button"
							onClick={() => {
								window.location.href = `${BASE_URL}/auth/google`;
							}}
						/>
					</motion.div>
					<motion.div whileHover={{ scale: 1.02 }}>
						<Button
							label="Sign up with Apple"
							icon="pi pi-apple"
							className="w-full border border-gray-300 text-gray-800 bg-white"
							style={{
								backgroundColor: "var(--surface-0)",
								color: "var(--text-color)",
								border: "1px solid var(--surface-border)"
							}}
							type="button"
						/>
					</motion.div>
				</div>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="text-sm text-[var(--text-color-secondary)] text-center"
				>
					Already have an account?{" "}
					<Link
						to="/signin/landlord"
						className="text-[var(--primary-color)] font-semibold underline-offset-2 hover:underline"
					>
						Login
					</Link>
				</motion.p>
			</motion.div>
		</form>
	);
}
