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

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function SignUpLandlord() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const {signup} = useContext(UserContext);

	const toast = useRef(null);

	const showError = detail => {
		toast.current.show({
			severity: "error",
			summary: "Error",
			detail,
			life: 3000
		});
	};

	const validateName = () => {
		const nameParts = name.trim().split(/\s+/);

		if (nameParts.length !== 2) {
			showError(
				"Please enter exactly your first and last name, eg: Tom Flag"
			);
			return false;
		} else {
			return true;
		}
	};

	const validateEmail = () => {
		const regex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!email.trim()) {
			showError("Email is required.");
			return false;
		}

		if (!regex.test(email)) {
			showError(
				"Please a valid email address."
			);
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
			showError("Passwords do not match.");
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
			className="min-h-screen bg-[var(--surface-a)] flex items-center justify-center px-4"
			onSubmit={handleSubmit}
		>
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6 border border-[var(--surface-border)]"
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
					<label htmlFor="email" className="ml-2">
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
				<Toast ref={toast} />

				<motion.div whileHover={{ scale: 1.02 }}>
					<Button
						label="Create Account"
						className="w-full bg-[var(--primary-color)] text-[var(--primary-color-text)] font-medium"
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
						/>
					</motion.div>
				</div>

				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="text-sm text-center text-[var(--text-color-secondary)]"
				>
					Already have an account?{" "}
					<Link
						to="/signin/landlord"
						className="text-[var(--primary-color)] font-medium"
					>
						Login
					</Link>
				</motion.p>
			</motion.div>
		</form>
	);
}
